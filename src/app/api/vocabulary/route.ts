/**
 * Vocabulary Management API
 * 词汇管理API - 支持CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

// 词汇数据验证Schema
const VocabularyWordSchema = z.object({
  word: z.string().min(1, '单词不能为空'),
  definition: z.string().min(1, '英文释义不能为空'),
  partOfSpeech: z.enum([
    'NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 
    'CONJUNCTION', 'PRONOUN', 'INTERJECTION', 'ARTICLE', 'PHRASE'
  ]),
  pronunciation: z.string().optional(),
  example: z.string().optional(),
  chineseDefinition: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(1),
  frequency: z.number().min(1).default(1),
  yearLevel: z.number().min(1).max(12).optional(),
  category: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional()
});

// GET - 获取词汇列表
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const yearLevel = searchParams.get('yearLevel');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const source = searchParams.get('source');

    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    
    if (yearLevel) where.yearLevel = parseInt(yearLevel);
    if (category) where.category = category;
    if (difficulty) where.difficulty = parseInt(difficulty);
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { definition: { contains: search, mode: 'insensitive' } },
        { chineseDefinition: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 获取词汇列表和总数
    const [words, total] = await Promise.all([
      prisma.vocabularyWord.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { frequency: 'desc' },
          { word: 'asc' }
        ],
        include: {
          progress: user.role === 'STUDENT' ? {
            where: { userId: user.id },
            select: {
              phase: true,
              masteryLevel: true,
              nextReviewDate: true,
              isMemorized: true,
              needsReview: true
            }
          } : false
        }
      }),
      prisma.vocabularyWord.count({ where })
    ]);

    // 处理同义词和反义词JSON字段
    const processedWords = words.map(word => ({
      ...word,
      synonyms: word.synonyms ? JSON.parse(word.synonyms) : [],
      antonyms: word.antonyms ? JSON.parse(word.antonyms) : [],
      tags: word.tags ? JSON.parse(word.tags) : [],
      userProgress: word.progress?.[0] || null
    }));

    return NextResponse.json({
      words: processedWords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取词汇列表失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - 添加新词汇
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user || !['ADMIN', 'PARENT'].includes(user.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = VocabularyWordSchema.parse(body);

    // 检查词汇是否已存在
    const existingWord = await prisma.vocabularyWord.findUnique({
      where: { word: validatedData.word.toLowerCase() }
    });

    if (existingWord) {
      return NextResponse.json({ error: '该单词已存在' }, { status: 400 });
    }

    // 创建新词汇
    const newWord = await prisma.vocabularyWord.create({
      data: {
        word: validatedData.word.toLowerCase(),
        definition: validatedData.definition,
        partOfSpeech: validatedData.partOfSpeech,
        pronunciation: validatedData.pronunciation,
        example: validatedData.example,
        chineseDefinition: validatedData.chineseDefinition,
        difficulty: validatedData.difficulty,
        frequency: validatedData.frequency,
        yearLevel: validatedData.yearLevel,
        category: validatedData.category,
        synonyms: validatedData.synonyms ? JSON.stringify(validatedData.synonyms) : null,
        antonyms: validatedData.antonyms ? JSON.stringify(validatedData.antonyms) : null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        source: validatedData.source || 'manual'
      }
    });

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_CONTENT',
        details: JSON.stringify({
          type: 'vocabulary',
          word: newWord.word,
          action: 'create'
        }),
        resourceType: 'VocabularyWord',
        resourceId: newWord.id
      }
    });

    return NextResponse.json({
      message: '词汇添加成功',
      word: {
        ...newWord,
        synonyms: newWord.synonyms ? JSON.parse(newWord.synonyms) : [],
        antonyms: newWord.antonyms ? JSON.parse(newWord.antonyms) : [],
        tags: newWord.tags ? JSON.parse(newWord.tags) : []
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '数据验证失败', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('添加词汇失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// 获取词汇统计信息
export async function HEAD(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const stats = await prisma.vocabularyWord.groupBy({
      by: ['yearLevel', 'difficulty'],
      _count: {
        id: true
      }
    });

    const headers = new Headers();
    headers.set('X-Total-Words', (await prisma.vocabularyWord.count()).toString());
    headers.set('X-Stats', JSON.stringify(stats));

    return new NextResponse(null, { status: 200, headers });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}