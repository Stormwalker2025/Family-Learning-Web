import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// iPad解锁规则配置模式
const unlockConfigSchema = z.object({
  name: z.string().min(1, '配置名称不能为空'),
  description: z.string().optional(),
  rules: z.array(
    z.object({
      subject: z.enum(['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY']),
      scoreThresholds: z.array(
        z.object({
          minScore: z.number().min(0).max(100),
          maxScore: z.number().min(0).max(100),
          baseMinutes: z.number().min(0),
          bonusMinutes: z.number().min(0),
        })
      ),
      dailyLimit: z.number().min(0).optional(),
      consecutiveDaysBonus: z
        .array(
          z.object({
            days: z.number().min(1),
            bonusMultiplier: z.number().min(1),
          })
        )
        .optional(),
    })
  ),
  isActive: z.boolean().default(true),
})

// GET - 获取iPad解锁状态和配置
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'status', 'config', 'history'
    const userId = searchParams.get('userId') || payload.userId

    // 权限检查：学生只能查看自己的，家长可以查看孩子的
    if (payload.role === 'STUDENT' && userId !== payload.userId) {
      return NextResponse.json(
        { error: '无权查看其他用户的数据' },
        { status: 403 }
      )
    }

    if (payload.role === 'PARENT') {
      const hasAccess = await checkParentAccess(payload.userId, [userId])
      if (!hasAccess) {
        return NextResponse.json(
          { error: '无权查看此用户的数据' },
          { status: 403 }
        )
      }
    }

    switch (action) {
      case 'status':
        return await getUnlockStatus(userId)

      case 'config':
        if (payload.role !== 'ADMIN' && payload.role !== 'PARENT') {
          return NextResponse.json({ error: '无权查看配置' }, { status: 403 })
        }
        return await getUnlockConfiguration(userId)

      case 'history':
        return await getUnlockHistory(userId)

      default:
        return await getUnlockStatus(userId)
    }
  } catch (error) {
    console.error('获取iPad解锁信息失败:', error)
    return NextResponse.json({ error: '获取iPad解锁信息失败' }, { status: 500 })
  }
}

// POST - 创建或更新iPad解锁配置
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 只有管理员和家长可以配置规则
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { error: '学生无权配置解锁规则' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = unlockConfigSchema.parse(body)

    // 创建解锁配置
    const configuration = await prisma.ipadUnlockConfiguration.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        rules: JSON.stringify(validatedData.rules),
        isActive: validatedData.isActive,
        createdBy: payload.userId,
      },
    })

    return NextResponse.json({
      success: true,
      data: configuration,
      message: 'iPad解锁规则配置成功',
    })
  } catch (error) {
    console.error('配置iPad解锁规则失败:', error)
    return NextResponse.json({ error: '配置iPad解锁规则失败' }, { status: 500 })
  }
}

// PUT - 触发解锁检查（当完成作业或练习时调用）
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, subject, score, triggeredBy } = body

    // 权限检查
    if (payload.role === 'STUDENT' && userId !== payload.userId) {
      return NextResponse.json(
        { error: '无权为其他用户触发解锁' },
        { status: 403 }
      )
    }

    const unlockResult = await processUnlockTrigger(
      userId,
      subject,
      score,
      triggeredBy
    )

    return NextResponse.json({
      success: true,
      data: unlockResult,
      message:
        unlockResult.unlockedMinutes > 0
          ? `恭喜！你获得了${unlockResult.unlockedMinutes}分钟的iPad时间！`
          : '继续努力，争取更好的成绩解锁iPad时间！',
    })
  } catch (error) {
    console.error('处理解锁触发失败:', error)
    return NextResponse.json({ error: '处理解锁触发失败' }, { status: 500 })
  }
}

// 获取用户的解锁状态
async function getUnlockStatus(userId: string) {
  const now = new Date()

  // 获取活跃的解锁记录（未过期且未使用）
  const activeUnlocks = await prisma.ipadUnlockRecord.findMany({
    where: {
      userId,
      expiresAt: { gt: now },
      used: false,
    },
    orderBy: { unlockedAt: 'desc' },
  })

  // 获取最近的成就记录
  const recentAchievements = await prisma.ipadUnlockRecord.findMany({
    where: {
      userId,
      unlockedAt: {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 最近7天
      },
    },
    orderBy: { unlockedAt: 'desc' },
    take: 10,
  })

  // 计算当前可用分钟数
  const currentUnlockedMinutes = activeUnlocks.reduce(
    (total, unlock) => total + unlock.unlockedMinutes,
    0
  )

  // 计算总共获得的分钟数
  const totalEarnedMinutes = recentAchievements.reduce(
    (total, unlock) => total + unlock.unlockedMinutes,
    0
  )

  // 计算已使用的分钟数
  const usedRecords = await prisma.ipadUnlockRecord.findMany({
    where: {
      userId,
      used: true,
      usedAt: {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  })
  const totalUsedMinutes = usedRecords.reduce(
    (total, unlock) => total + unlock.unlockedMinutes,
    0
  )

  // 获取下次解锁要求
  const nextUnlockRequirements = await calculateNextUnlockRequirements(userId)

  const status = {
    userId,
    currentUnlockedMinutes,
    totalEarnedMinutes,
    totalUsedMinutes,
    activeUnlocks,
    recentAchievements,
    nextUnlockRequirements,
  }

  return NextResponse.json({
    success: true,
    data: status,
  })
}

// 获取解锁配置
async function getUnlockConfiguration(userId: string) {
  const configurations = await prisma.ipadUnlockConfiguration.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    success: true,
    data: configurations,
  })
}

// 获取解锁历史
async function getUnlockHistory(userId: string) {
  const history = await prisma.ipadUnlockRecord.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    success: true,
    data: history,
  })
}

// 处理解锁触发
async function processUnlockTrigger(
  userId: string,
  subject: string,
  score: number,
  triggeredBy: string
) {
  // 获取活跃的解锁配置
  const configurations = await prisma.ipadUnlockConfiguration.findMany({
    where: { isActive: true },
  })

  if (configurations.length === 0) {
    return { unlockedMinutes: 0, message: '暂无活跃的解锁规则' }
  }

  let totalUnlockedMinutes = 0
  const unlockRecords = []

  for (const config of configurations) {
    const rules = JSON.parse(config.rules)
    const subjectRule = rules.find((r: any) => r.subject === subject)

    if (!subjectRule) continue

    // 找到匹配的分数阈值
    const matchedThreshold = subjectRule.scoreThresholds.find(
      (threshold: any) =>
        score >= threshold.minScore && score <= threshold.maxScore
    )

    if (!matchedThreshold) continue

    // 计算解锁分钟数
    let unlockedMinutes = matchedThreshold.baseMinutes

    // 如果是满分，添加奖励分钟
    if (score >= matchedThreshold.maxScore) {
      unlockedMinutes += matchedThreshold.bonusMinutes
    }

    // 检查每日限制
    if (subjectRule.dailyLimit) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todaysUnlocks = await prisma.ipadUnlockRecord.findMany({
        where: {
          userId,
          unlockedAt: { gte: today },
        },
      })

      const todayTotal = todaysUnlocks.reduce(
        (total, unlock) => total + unlock.unlockedMinutes,
        0
      )

      if (todayTotal + unlockedMinutes > subjectRule.dailyLimit) {
        unlockedMinutes = Math.max(0, subjectRule.dailyLimit - todayTotal)
      }
    }

    if (unlockedMinutes > 0) {
      // 创建解锁记录
      const unlockRecord = await prisma.ipadUnlockRecord.create({
        data: {
          userId,
          ruleId: config.id,
          achievedScore: score,
          subjectScores: JSON.stringify({ [subject]: score }),
          unlockedMinutes,
          unlockedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时过期
          used: false,
          triggeredBy,
        },
      })

      unlockRecords.push(unlockRecord)
      totalUnlockedMinutes += unlockedMinutes
    }
  }

  return {
    unlockedMinutes: totalUnlockedMinutes,
    records: unlockRecords,
    message:
      totalUnlockedMinutes > 0
        ? `获得${totalUnlockedMinutes}分钟iPad时间`
        : '未达到解锁要求',
  }
}

// 计算下次解锁要求
async function calculateNextUnlockRequirements(userId: string) {
  const configurations = await prisma.ipadUnlockConfiguration.findMany({
    where: { isActive: true },
  })

  const requirements = []

  for (const config of configurations) {
    const rules = JSON.parse(config.rules)

    for (const rule of rules) {
      // 获取该学科的最近成绩
      const recentScore = await getRecentSubjectScore(userId, rule.subject)

      // 找到下一个可达成的阈值
      const nextThreshold = rule.scoreThresholds.find(
        (threshold: any) => threshold.minScore > recentScore
      )

      if (nextThreshold) {
        requirements.push({
          subject: rule.subject,
          currentScore: recentScore,
          requiredScore: nextThreshold.minScore,
          potentialMinutes:
            nextThreshold.baseMinutes + (nextThreshold.bonusMinutes || 0),
        })
      }
    }
  }

  return requirements
}

// 获取用户在某学科的最近成绩
async function getRecentSubjectScore(
  userId: string,
  subject: string
): Promise<number> {
  // 这里需要查询最近的作业或练习成绩
  // 暂时返回0，实际实现需要根据具体的成绩存储结构
  return 0
}

// 检查家长权限
async function checkParentAccess(
  parentId: string,
  studentIds: string[]
): Promise<boolean> {
  const parent = await prisma.user.findUnique({
    where: { id: parentId },
    include: {
      family: {
        include: {
          members: {
            where: { role: 'STUDENT' },
            select: { id: true },
          },
        },
      },
    },
  })

  if (!parent?.family?.members) {
    return false
  }

  const familyStudentIds = parent.family.members.map(member => member.id)
  return studentIds.some(studentId => familyStudentIds.includes(studentId))
}
