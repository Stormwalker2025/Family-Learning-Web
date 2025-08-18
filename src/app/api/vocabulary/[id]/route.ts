/**
 * Vocabulary Word Detail API
 * 单个词汇详情API - 支持获取、更新、删除
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

// 词汇更新Schema
const UpdateVocabularyWordSchema = z.object({
  word: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  partOfSpeech: z.enum([
    'NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 
    'CONJUNCTION', 'PRONOUN', 'INTERJECTION', 'ARTICLE', 'PHRASE'
  ]).optional(),
  pronunciation: z.string().optional(),
  example: z.string().optional(),
  chineseDefinition: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  frequency: z.number().min(1).optional(),
  yearLevel: z.number().min(1).max(12).optional(),
  category: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional()
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - 获取单个词汇详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = params;

    const word = await prisma.vocabularyWord.findUnique({
      where: { id },
      include: {
        progress: user.role === 'STUDENT' ? {
          where: { userId: user.id }
        } : {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!word) {
      return NextResponse.json({ error: '词汇不存在' }, { status: 404 });
    }

    // 处理JSON字段
    const processedWord = {
      ...word,
      synonyms: word.synonyms ? JSON.parse(word.synonyms) : [],
      antonyms: word.antonyms ? JSON.parse(word.antonyms) : [],
      tags: word.tags ? JSON.parse(word.tags) : [],
      progress: word.progress
    };

    return NextResponse.json({ word: processedWord });
  } catch (error) {
    console.error('获取词汇详情失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT - 更新词汇
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateToken(request);
    if (!user || !['ADMIN', 'PARENT'].includes(user.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = UpdateVocabularyWordSchema.parse(body);

    // 检查词汇是否存在
    const existingWord = await prisma.vocabularyWord.findUnique({
      where: { id }
    });

    if (!existingWord) {
      return NextResponse.json({ error: '词汇不存在' }, { status: 404 });
    }

    // 如果更新单词，检查是否与其他单词冲突
    if (validatedData.word && validatedData.word !== existingWord.word) {
      const conflictWord = await prisma.vocabularyWord.findUnique({
        where: { word: validatedData.word.toLowerCase() }
      });

      if (conflictWord && conflictWord.id !== id) {
        return NextResponse.json({ error: '该单词已存在' }, { status: 400 });
      }
    }

    // 更新词汇
    const updatedWord = await prisma.vocabularyWord.update({
      where: { id },
      data: {
        word: validatedData.word?.toLowerCase(),
        definition: validatedData.definition,
        partOfSpeech: validatedData.partOfSpeech,
        pronunciation: validatedData.pronunciation,
        example: validatedData.example,
        chineseDefinition: validatedData.chineseDefinition,
        difficulty: validatedData.difficulty,
        frequency: validatedData.frequency,
        yearLevel: validatedData.yearLevel,
        category: validatedData.category,
        synonyms: validatedData.synonyms ? JSON.stringify(validatedData.synonyms) : undefined,
        antonyms: validatedData.antonyms ? JSON.stringify(validatedData.antonyms) : undefined,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        source: validatedData.source
      }
    });

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'EDIT_CONTENT',
        details: JSON.stringify({
          type: 'vocabulary',
          word: updatedWord.word,
          action: 'update',
          changes: validatedData
        }),
        resourceType: 'VocabularyWord',
        resourceId: updatedWord.id
      }
    });

    return NextResponse.json({
      message: '词汇更新成功',
      word: {
        ...updatedWord,
        synonyms: updatedWord.synonyms ? JSON.parse(updatedWord.synonyms) : [],
        antonyms: updatedWord.antonyms ? JSON.parse(updatedWord.antonyms) : [],
        tags: updatedWord.tags ? JSON.parse(updatedWord.tags) : []
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '数据验证失败', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('更新词汇失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE - 删除词汇
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateToken(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足，只有管理员可以删除词汇' }, { status: 403 });
    }

    const { id } = params;

    // 检查词汇是否存在
    const existingWord = await prisma.vocabularyWord.findUnique({
      where: { id },
      include: {
        progress: {
          select: { id: true }
        }
      }
    });

    if (!existingWord) {
      return NextResponse.json({ error: '词汇不存在' }, { status: 404 });
    }

    // 检查是否有学习进度记录
    if (existingWord.progress.length > 0) {
      return NextResponse.json({ 
        error: '该词汇已有学习记录，不能删除。建议标记为不活跃状态。' 
      }, { status: 400 });
    }

    // 删除词汇
    await prisma.vocabularyWord.delete({
      where: { id }
    });

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_CONTENT',
        details: JSON.stringify({
          type: 'vocabulary',
          word: existingWord.word,
          action: 'delete'
        }),
        resourceType: 'VocabularyWord',
        resourceId: id
      }
    });

    return NextResponse.json({ message: '词汇删除成功' });

  } catch (error) {
    console.error('删除词汇失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}