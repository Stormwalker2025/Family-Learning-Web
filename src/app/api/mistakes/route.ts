import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 错题记录创建模式
const createMistakeSchema = z.object({
  exerciseId: z.string(),
  questionId: z.string(),
  submissionId: z.string(),
  incorrectAnswer: z.string(),
  correctAnswer: z.string(),
  questionContent: z.string(),
  explanation: z.string().optional(),
  mistakeType: z.enum([
    'CARELESS_ERROR',
    'CONCEPT_ERROR',
    'METHOD_ERROR',
    'TIME_PRESSURE',
    'UNKNOWN',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  subject: z.enum(['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY']),
  tags: z.array(z.string()).optional(),
})

// 错题复习记录模式
const reviewMistakeSchema = z.object({
  mistakeId: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number().optional(),
  notes: z.string().optional(),
})

// GET - 获取错题本
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
    const userId = searchParams.get('userId') || payload.userId
    const subject = searchParams.get('subject')
    const mistakeType = searchParams.get('mistakeType')
    const status = searchParams.get('status') // 'active', 'mastered', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 权限检查
    if (payload.role === 'STUDENT' && userId !== payload.userId) {
      return NextResponse.json(
        { error: '无权查看其他学生的错题本' },
        { status: 403 }
      )
    }

    if (payload.role === 'PARENT') {
      const hasAccess = await checkParentAccess(payload.userId, [userId])
      if (!hasAccess) {
        return NextResponse.json(
          { error: '无权查看此学生的错题本' },
          { status: 403 }
        )
      }
    }

    // 构建查询条件
    const where: any = { userId }

    if (subject) {
      where.subject = subject
    }

    if (mistakeType) {
      where.mistakeType = mistakeType
    }

    if (status === 'active') {
      where.isMastered = false
    } else if (status === 'mastered') {
      where.isMastered = true
    }

    const skip = (page - 1) * limit

    // 获取错题记录
    const [mistakes, total] = await Promise.all([
      prisma.mistakeBook.findMany({
        where,
        include: {
          exercise: {
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
              yearLevel: true,
            },
          },
          user: {
            select: { id: true, displayName: true },
          },
          reviews: {
            orderBy: { reviewedAt: 'desc' },
            take: 5,
          },
        },
        orderBy: [
          { isMastered: 'asc' }, // 未掌握的在前
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.mistakeBook.count({ where }),
    ])

    // 统计信息
    const stats = await getMistakeBookStats(userId, subject)

    return NextResponse.json({
      success: true,
      data: {
        mistakes,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取错题本失败:', error)
    return NextResponse.json({ error: '获取错题本失败' }, { status: 500 })
  }
}

// POST - 添加错题记录
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

    const body = await request.json()
    const validatedData = createMistakeSchema.parse(body)

    // 检查是否已存在相同的错题记录
    const existingMistake = await prisma.mistakeBook.findFirst({
      where: {
        userId: payload.userId,
        questionId: validatedData.questionId,
        exerciseId: validatedData.exerciseId,
      },
    })

    let mistake
    if (existingMistake) {
      // 更新现有记录
      mistake = await prisma.mistakeBook.update({
        where: { id: existingMistake.id },
        data: {
          incorrectAnswer: validatedData.incorrectAnswer,
          correctAnswer: validatedData.correctAnswer,
          mistakeType: validatedData.mistakeType,
          repeatCount: existingMistake.repeatCount + 1,
          isMastered: false, // 重新出错，标记为未掌握
          lastMistakeAt: new Date(),
        },
      })
    } else {
      // 创建新的错题记录
      mistake = await prisma.mistakeBook.create({
        data: {
          userId: payload.userId,
          exerciseId: validatedData.exerciseId,
          questionId: validatedData.questionId,
          submissionId: validatedData.submissionId,
          questionContent: validatedData.questionContent,
          incorrectAnswer: validatedData.incorrectAnswer,
          correctAnswer: validatedData.correctAnswer,
          explanation: validatedData.explanation,
          mistakeType: validatedData.mistakeType,
          difficulty: validatedData.difficulty || 'medium',
          subject: validatedData.subject,
          tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
          repeatCount: 1,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: mistake,
      message: '错题记录已保存',
    })
  } catch (error) {
    console.error('添加错题记录失败:', error)
    return NextResponse.json({ error: '添加错题记录失败' }, { status: 500 })
  }
}

// PUT - 复习错题
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
    const validatedData = reviewMistakeSchema.parse(body)

    // 获取错题记录
    const mistake = await prisma.mistakeBook.findUnique({
      where: { id: validatedData.mistakeId },
    })

    if (!mistake) {
      return NextResponse.json({ error: '错题记录不存在' }, { status: 404 })
    }

    // 权限检查
    if (
      mistake.userId !== payload.userId &&
      payload.role !== 'ADMIN' &&
      payload.role !== 'PARENT'
    ) {
      return NextResponse.json({ error: '无权操作此错题记录' }, { status: 403 })
    }

    // 记录复习记录
    const review = await prisma.mistakeBookReview.create({
      data: {
        mistakeId: validatedData.mistakeId,
        isCorrect: validatedData.isCorrect,
        timeSpent: validatedData.timeSpent || 0,
        notes: validatedData.notes,
        reviewedAt: new Date(),
      },
    })

    // 更新错题的掌握状态
    const reviews = await prisma.mistakeBookReview.findMany({
      where: { mistakeId: validatedData.mistakeId },
      orderBy: { reviewedAt: 'desc' },
      take: 3, // 最近3次复习
    })

    // 如果最近3次复习都正确，标记为已掌握
    const recentCorrectCount = reviews.filter(r => r.isCorrect).length
    const isMastered = recentCorrectCount >= 3 && reviews.length >= 3

    const updatedMistake = await prisma.mistakeBook.update({
      where: { id: validatedData.mistakeId },
      data: {
        isMastered,
        masteredAt: isMastered ? new Date() : null,
        reviewCount: mistake.reviewCount + 1,
        lastReviewAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        mistake: updatedMistake,
        review,
        isMastered,
      },
      message: isMastered ? '恭喜！你已掌握这道题！' : '复习记录已保存',
    })
  } catch (error) {
    console.error('复习错题失败:', error)
    return NextResponse.json({ error: '复习错题失败' }, { status: 500 })
  }
}

// 获取错题本统计信息
async function getMistakeBookStats(userId: string, subject?: string) {
  const where: any = { userId }
  if (subject) {
    where.subject = subject
  }

  const [
    totalMistakes,
    activeMistakes,
    masteredMistakes,
    recentMistakes,
    subjectBreakdown,
  ] = await Promise.all([
    // 总错题数
    prisma.mistakeBook.count({ where }),

    // 活跃错题数（未掌握）
    prisma.mistakeBook.count({
      where: { ...where, isMastered: false },
    }),

    // 已掌握错题数
    prisma.mistakeBook.count({
      where: { ...where, isMastered: true },
    }),

    // 最近7天新增错题
    prisma.mistakeBook.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // 学科分布
    prisma.mistakeBook.groupBy({
      by: ['subject'],
      where,
      _count: { subject: true },
    }),
  ])

  const masteryRate =
    totalMistakes > 0 ? (masteredMistakes / totalMistakes) * 100 : 0

  return {
    totalMistakes,
    activeMistakes,
    masteredMistakes,
    recentMistakes,
    masteryRate: Math.round(masteryRate),
    subjectBreakdown: subjectBreakdown.map(item => ({
      subject: item.subject,
      count: item._count.subject,
    })),
  }
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
