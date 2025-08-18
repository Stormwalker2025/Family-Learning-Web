/**
 * Vocabulary Learning Progress API
 * 词汇学习进度API - 支持进度跟踪和复习计划
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

// 学习进度更新Schema
const ProgressUpdateSchema = z.object({
  wordId: z.string().cuid(),
  phase: z.enum(['RECOGNITION', 'UNDERSTANDING', 'APPLICATION', 'MASTERY']).optional(),
  isCorrect: z.boolean(),
  timeSpent: z.number().min(0).optional(), // 秒
  practiceType: z.enum(['recognition', 'translation', 'spelling', 'listening', 'context']).optional()
});

// Ebbinghaus遗忘曲线间隔（天）
const EBBINGHAUS_INTERVALS = [1, 3, 7, 15, 30, 60, 120];

// 计算下次复习时间
function calculateNextReview(currentLevel: number, isCorrect: boolean): { nextDate: Date, interval: number, newLevel: number } {
  let newLevel = currentLevel;
  
  if (isCorrect) {
    // 答对了，升级到下一个间隔
    newLevel = Math.min(currentLevel + 1, EBBINGHAUS_INTERVALS.length - 1);
  } else {
    // 答错了，降级
    newLevel = Math.max(0, currentLevel - 1);
  }
  
  const interval = EBBINGHAUS_INTERVALS[newLevel];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  
  return { nextDate, interval, newLevel };
}

// 计算掌握度
function calculateMasteryLevel(correctAttempts: number, totalAttempts: number, streakCount: number): number {
  if (totalAttempts === 0) return 0;
  
  const accuracy = correctAttempts / totalAttempts;
  const streakBonus = Math.min(streakCount * 5, 30); // 连续正确有奖励，最高30分
  
  return Math.min(Math.round(accuracy * 70 + streakBonus), 100);
}

// POST - 更新学习进度
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: '只有学生可以更新学习进度' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ProgressUpdateSchema.parse(body);

    // 检查词汇是否存在
    const word = await prisma.vocabularyWord.findUnique({
      where: { id: validatedData.wordId }
    });

    if (!word) {
      return NextResponse.json({ error: '词汇不存在' }, { status: 404 });
    }

    // 获取或创建学习进度
    let progress = await prisma.vocabularyProgress.findUnique({
      where: {
        userId_wordId: {
          userId: user.id,
          wordId: validatedData.wordId
        }
      }
    });

    if (!progress) {
      progress = await prisma.vocabularyProgress.create({
        data: {
          userId: user.id,
          wordId: validatedData.wordId,
          phase: 'RECOGNITION',
          masteryLevel: 0,
          attempts: 0,
          correctAttempts: 0,
          streakCount: 0,
          ebbinghausLevel: 0,
          reviewInterval: 1
        }
      });
    }

    // 更新进度数据
    const newAttempts = progress.attempts + 1;
    const newCorrectAttempts = validatedData.isCorrect ? progress.correctAttempts + 1 : progress.correctAttempts;
    const newStreakCount = validatedData.isCorrect ? progress.streakCount + 1 : 0;
    const newTotalStudyTime = progress.totalStudyTime + (validatedData.timeSpent || 0);

    // 计算下次复习时间
    const { nextDate, interval, newLevel } = calculateNextReview(progress.ebbinghausLevel, validatedData.isCorrect);
    
    // 计算掌握度
    const masteryLevel = calculateMasteryLevel(newCorrectAttempts, newAttempts, newStreakCount);
    
    // 判断是否需要升级学习阶段
    let newPhase = progress.phase;
    if (validatedData.phase) {
      newPhase = validatedData.phase;
    } else if (masteryLevel >= 80 && newStreakCount >= 3) {
      // 自动升级逻辑
      switch (progress.phase) {
        case 'RECOGNITION':
          newPhase = 'UNDERSTANDING';
          break;
        case 'UNDERSTANDING':
          newPhase = 'APPLICATION';
          break;
        case 'APPLICATION':
          newPhase = 'MASTERY';
          break;
      }
    }

    // 更新进度记录
    const updatedProgress = await prisma.vocabularyProgress.update({
      where: { id: progress.id },
      data: {
        phase: newPhase,
        attempts: newAttempts,
        correctAttempts: newCorrectAttempts,
        streakCount: newStreakCount,
        masteryLevel: masteryLevel,
        lastSeen: new Date(),
        lastCorrect: validatedData.isCorrect ? new Date() : progress.lastCorrect,
        totalStudyTime: newTotalStudyTime,
        nextReviewDate: nextDate,
        reviewInterval: interval,
        ebbinghausLevel: newLevel,
        isMemorized: masteryLevel >= 90 && newPhase === 'MASTERY',
        needsReview: !validatedData.isCorrect || masteryLevel < 60
      }
    });

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'VOCABULARY_STUDY',
        details: JSON.stringify({
          wordId: validatedData.wordId,
          word: word.word,
          isCorrect: validatedData.isCorrect,
          phase: newPhase,
          masteryLevel: masteryLevel,
          practiceType: validatedData.practiceType
        }),
        resourceType: 'VocabularyProgress',
        resourceId: updatedProgress.id
      }
    });

    return NextResponse.json({
      message: '学习进度更新成功',
      progress: {
        ...updatedProgress,
        word: {
          id: word.id,
          word: word.word,
          definition: word.definition,
          chineseDefinition: word.chineseDefinition
        },
        phaseAdvanced: newPhase !== progress.phase,
        masteryImproved: masteryLevel > progress.masteryLevel
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '数据验证失败', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('更新学习进度失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// GET - 获取学习进度
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || (user.role === 'STUDENT' ? user.id : undefined);
    const phase = searchParams.get('phase');
    const needsReview = searchParams.get('needsReview') === 'true';
    const isMemorized = searchParams.get('isMemorized') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 权限检查
    if (user.role === 'STUDENT' && userId !== user.id) {
      return NextResponse.json({ error: '只能查看自己的学习进度' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: '请指定用户ID' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };
    if (phase) where.phase = phase;
    if (needsReview !== undefined) where.needsReview = needsReview;
    if (isMemorized !== undefined) where.isMemorized = isMemorized;

    // 获取进度列表
    const [progressList, total] = await Promise.all([
      prisma.vocabularyProgress.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { nextReviewDate: 'asc' },
          { lastSeen: 'desc' }
        ],
        include: {
          word: {
            select: {
              id: true,
              word: true,
              definition: true,
              chineseDefinition: true,
              pronunciation: true,
              example: true,
              difficulty: true,
              yearLevel: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      }),
      prisma.vocabularyProgress.count({ where })
    ]);

    // 获取统计数据
    const stats = await prisma.vocabularyProgress.groupBy({
      where: { userId },
      by: ['phase', 'isMemorized'],
      _count: {
        id: true
      },
      _avg: {
        masteryLevel: true
      }
    });

    // 获取复习统计
    const reviewStats = await prisma.vocabularyProgress.findMany({
      where: {
        userId,
        nextReviewDate: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // 未来24小时内
        }
      },
      select: { id: true, nextReviewDate: true, needsReview: true }
    });

    const todayReviews = reviewStats.filter(r => 
      r.nextReviewDate && r.nextReviewDate <= new Date()
    ).length;

    const tomorrowReviews = reviewStats.filter(r => 
      r.nextReviewDate && 
      r.nextReviewDate > new Date() && 
      r.nextReviewDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ).length;

    return NextResponse.json({
      progress: progressList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        phaseDistribution: stats,
        reviewSchedule: {
          todayReviews,
          tomorrowReviews,
          totalPending: reviewStats.length
        }
      }
    });

  } catch (error) {
    console.error('获取学习进度失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}