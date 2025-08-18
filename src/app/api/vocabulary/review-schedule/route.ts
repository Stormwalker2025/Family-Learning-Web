/**
 * Vocabulary Review Schedule API
 * 词汇复习计划API - 基于遗忘曲线的科学复习安排
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/auth/jwt';

const prisma = new PrismaClient();

// GET - 获取复习计划
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: '只有学生可以查看复习计划' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD格式
    const days = parseInt(searchParams.get('days') || '7'); // 获取几天的计划
    const includeOverdue = searchParams.get('includeOverdue') === 'true';

    const targetDate = date ? new Date(date) : new Date();
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + days);

    // 构建查询条件
    const whereConditions: any = {
      userId: user.id,
      nextReviewDate: {
        lte: endDate
      }
    };

    if (!includeOverdue) {
      whereConditions.nextReviewDate.gte = targetDate;
    }

    // 获取复习词汇
    const reviewWords = await prisma.vocabularyProgress.findMany({
      where: whereConditions,
      orderBy: [
        { nextReviewDate: 'asc' },
        { masteryLevel: 'asc' }, // 掌握度低的优先
        { streakCount: 'asc' }    // 连续正确次数少的优先
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
            category: true,
            partOfSpeech: true
          }
        }
      }
    });

    // 按日期分组
    const scheduleByDate: Record<string, any[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    reviewWords.forEach(progress => {
      if (!progress.nextReviewDate) return;

      const reviewDate = new Date(progress.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      const dateKey = reviewDate.toISOString().split('T')[0];

      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = [];
      }

      // 判断复习状态
      let status = 'pending';
      if (reviewDate < today) {
        status = 'overdue';
      } else if (reviewDate.getTime() === today.getTime()) {
        status = 'today';
      }

      scheduleByDate[dateKey].push({
        ...progress,
        status,
        priority: calculatePriority(progress, reviewDate)
      });
    });

    // 排序每日复习词汇（按优先级）
    Object.keys(scheduleByDate).forEach(dateKey => {
      scheduleByDate[dateKey].sort((a, b) => b.priority - a.priority);
    });

    // 生成统计信息
    const statistics = {
      totalReviewWords: reviewWords.length,
      overdueWords: reviewWords.filter(p => p.nextReviewDate && p.nextReviewDate < today).length,
      todayWords: reviewWords.filter(p => {
        if (!p.nextReviewDate) return false;
        const reviewDate = new Date(p.nextReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      }).length,
      upcomingWords: reviewWords.filter(p => p.nextReviewDate && p.nextReviewDate > today).length,
      difficultyDistribution: {},
      phaseDistribution: {},
      masteryDistribution: {
        low: reviewWords.filter(p => p.masteryLevel < 30).length,
        medium: reviewWords.filter(p => p.masteryLevel >= 30 && p.masteryLevel < 70).length,
        high: reviewWords.filter(p => p.masteryLevel >= 70).length
      }
    };

    // 按难度统计
    const difficultyStats: Record<number, number> = {};
    const phaseStats: Record<string, number> = {};

    reviewWords.forEach(progress => {
      const difficulty = progress.word.difficulty;
      difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
      
      phaseStats[progress.phase] = (phaseStats[progress.phase] || 0) + 1;
    });

    statistics.difficultyDistribution = difficultyStats;
    statistics.phaseDistribution = phaseStats;

    // 生成学习建议
    const recommendations = generateRecommendations(reviewWords, statistics);

    return NextResponse.json({
      schedule: scheduleByDate,
      statistics,
      recommendations,
      dateRange: {
        start: targetDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: days
      }
    });

  } catch (error) {
    console.error('获取复习计划失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// 计算复习优先级
function calculatePriority(progress: any, reviewDate: Date): number {
  let priority = 0;
  
  // 过期天数影响（过期越久优先级越高）
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 0) {
    priority += daysDiff * 10; // 每过期一天增加10分
  }
  
  // 掌握度影响（掌握度越低优先级越高）
  priority += (100 - progress.masteryLevel) * 0.5;
  
  // 连续错误影响
  if (progress.streakCount === 0 && progress.attempts > 0) {
    priority += 20; // 上次答错的词汇增加优先级
  }
  
  // 词汇难度影响
  priority += progress.word.difficulty * 3;
  
  // 学习阶段影响（早期阶段优先级更高）
  const phaseWeights = {
    RECOGNITION: 15,
    UNDERSTANDING: 10,
    APPLICATION: 5,
    MASTERY: 0
  };
  priority += phaseWeights[progress.phase as keyof typeof phaseWeights] || 0;
  
  return Math.round(priority);
}

// 生成学习建议
function generateRecommendations(reviewWords: any[], statistics: any): string[] {
  const recommendations: string[] = [];
  
  if (statistics.overdueWords > 10) {
    recommendations.push(`您有 ${statistics.overdueWords} 个词汇已过期复习，建议优先复习这些词汇`);
  }
  
  if (statistics.todayWords > 20) {
    recommendations.push('今日复习任务较重，建议分批完成，每次复习10-15个词汇');
  }
  
  const lowMasteryWords = statistics.masteryDistribution.low;
  if (lowMasteryWords > 5) {
    recommendations.push(`有 ${lowMasteryWords} 个词汇掌握度较低，建议增加练习频率`);
  }
  
  const recognitionPhase = statistics.phaseDistribution.RECOGNITION || 0;
  if (recognitionPhase > 10) {
    recommendations.push('有较多词汇处于认识阶段，建议多做英译中练习来提高理解');
  }
  
  if (statistics.totalReviewWords < 5) {
    recommendations.push('复习词汇较少，建议学习更多新词汇来扩展词汇量');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('您的复习计划安排合理，继续保持良好的学习节奏！');
  }
  
  return recommendations;
}

// POST - 批量更新复习状态
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: '只有学生可以更新复习状态' }, { status: 403 });
    }

    const body = await request.json();
    const { wordIds, action } = body;

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({ error: '请提供要操作的词汇ID列表' }, { status: 400 });
    }

    if (!['mark_completed', 'postpone', 'reset'].includes(action)) {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }

    // 验证词汇是否属于当前用户
    const userProgress = await prisma.vocabularyProgress.findMany({
      where: {
        userId: user.id,
        wordId: { in: wordIds }
      }
    });

    if (userProgress.length !== wordIds.length) {
      return NextResponse.json({ error: '部分词汇不属于您的学习列表' }, { status: 400 });
    }

    let updateData: any = {};
    const now = new Date();

    switch (action) {
      case 'mark_completed':
        // 标记为已完成（推迟到下次复习时间）
        updateData = {
          lastSeen: now,
          needsReview: false
        };
        break;
        
      case 'postpone':
        // 推迟复习（延迟1天）
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        updateData = {
          nextReviewDate: tomorrow,
          needsReview: true
        };
        break;
        
      case 'reset':
        // 重置复习进度
        updateData = {
          nextReviewDate: now,
          ebbinghausLevel: 0,
          reviewInterval: 1,
          needsReview: true,
          streakCount: 0
        };
        break;
    }

    // 批量更新
    const result = await prisma.vocabularyProgress.updateMany({
      where: {
        userId: user.id,
        wordId: { in: wordIds }
      },
      data: updateData
    });

    // 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'VOCABULARY_STUDY',
        details: JSON.stringify({
          action: 'batch_review_update',
          operation: action,
          wordCount: wordIds.length,
          wordIds: wordIds
        })
      }
    });

    return NextResponse.json({
      message: '复习状态更新成功',
      updatedCount: result.count,
      action: action
    });

  } catch (error) {
    console.error('批量更新复习状态失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}