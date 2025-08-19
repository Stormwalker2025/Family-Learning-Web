import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 提交作业模式
const submitHomeworkSchema = z.object({
  homeworkId: z.string(),
  exerciseSubmissions: z.array(z.object({
    exerciseId: z.string(),
    submissionId: z.string(),
    score: z.number().optional(),
    timeSpent: z.number() // 秒
  }))
})

// 开始作业模式
const startHomeworkSchema = z.object({
  homeworkId: z.string()
})

// GET - 获取用户的作业提交记录
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
    const homeworkId = searchParams.get('homeworkId')
    const userId = searchParams.get('userId') // 可选，管理员和家长可以查看其他人的提交
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 确定查询的用户ID
    let targetUserId = payload.userId
    if (userId && userId !== payload.userId) {
      // 检查权限：只有管理员或家长可以查看其他人的提交
      if (payload.role === 'ADMIN') {
        targetUserId = userId
      } else if (payload.role === 'PARENT') {
        // 检查是否是家庭成员
        const hasAccess = await checkParentAccess(payload.userId, [userId])
        if (hasAccess) {
          targetUserId = userId
        } else {
          return NextResponse.json({ error: '无权查看此用户的提交记录' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: '无权查看其他用户的提交记录' }, { status: 403 })
      }
    }

    // 构建查询条件
    const where: any = { userId: targetUserId }
    
    if (homeworkId) {
      where.homeworkId = homeworkId
    }
    
    if (status) {
      where.status = status.toUpperCase()
    }

    // 计算分页
    const skip = (page - 1) * limit

    const [submissions, total] = await Promise.all([
      prisma.homeworkSubmission.findMany({
        where,
        include: {
          homework: {
            select: {
              id: true,
              title: true,
              description: true,
              dueDate: true,
              priority: true,
              totalPoints: true,
              passingScore: true,
              assignedByUser: {
                select: { id: true, displayName: true }
              }
            }
          },
          user: {
            select: { id: true, displayName: true, username: true, yearLevel: true }
          }
        },
        orderBy: [
          { lastWorkedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.homeworkSubmission.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('获取作业提交记录失败:', error)
    return NextResponse.json(
      { error: '获取作业提交记录失败' },
      { status: 500 }
    )
  }
}

// POST - 开始或提交作业
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
    const action = body.action // 'start' 或 'submit'

    if (action === 'start') {
      return await startHomework(body, payload)
    } else if (action === 'submit') {
      return await submitHomework(body, payload)
    } else {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('处理作业操作失败:', error)
    return NextResponse.json(
      { error: '处理作业操作失败' },
      { status: 500 }
    )
  }
}

// 开始作业
async function startHomework(body: any, payload: any) {
  const validatedData = startHomeworkSchema.parse(body)

  // 检查作业是否存在且用户有权访问
  const homework = await prisma.homeworkAssignment.findUnique({
    where: { id: validatedData.homeworkId },
    include: {
      assignedTo: { select: { id: true } }
    }
  })

  if (!homework) {
    return NextResponse.json({ error: '作业不存在' }, { status: 404 })
  }

  if (!homework.assignedTo.some(student => student.id === payload.userId)) {
    return NextResponse.json({ error: '您无权访问此作业' }, { status: 403 })
  }

  // 检查作业是否可见
  if (!homework.isVisible) {
    return NextResponse.json({ error: '作业尚未发布' }, { status: 400 })
  }

  // 查找或创建提交记录
  let submission = await prisma.homeworkSubmission.findUnique({
    where: {
      homeworkId_userId: {
        homeworkId: validatedData.homeworkId,
        userId: payload.userId
      }
    }
  })

  if (!submission) {
    // 创建新的提交记录
    submission = await prisma.homeworkSubmission.create({
      data: {
        homeworkId: validatedData.homeworkId,
        userId: payload.userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        lastWorkedAt: new Date(),
        totalExercises: homework.exercises?.length || 0,
        maxPossibleScore: homework.totalPoints
      }
    })
  } else if (submission.status === 'NOT_STARTED') {
    // 更新状态为进行中
    submission = await prisma.homeworkSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: submission.startedAt || new Date(),
        lastWorkedAt: new Date()
      }
    })
  }

  return NextResponse.json({
    success: true,
    data: submission,
    message: '作业已开始'
  })
}

// 提交作业
async function submitHomework(body: any, payload: any) {
  const validatedData = submitHomeworkSchema.parse(body)

  // 检查提交记录是否存在
  const submission = await prisma.homeworkSubmission.findUnique({
    where: {
      homeworkId_userId: {
        homeworkId: validatedData.homeworkId,
        userId: payload.userId
      }
    },
    include: {
      homework: {
        include: {
          exercises: {
            include: {
              exercise: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!submission) {
    return NextResponse.json({ error: '作业提交记录不存在' }, { status: 404 })
  }

  if (submission.status === 'SUBMITTED' || submission.status === 'COMPLETED') {
    return NextResponse.json({ error: '作业已经提交' }, { status: 400 })
  }

  // 验证练习提交
  const exerciseIds = submission.homework.exercises.map(e => e.exerciseId)
  const submittedExerciseIds = validatedData.exerciseSubmissions.map(s => s.exerciseId)
  
  // 检查必需的练习是否都已提交
  const requiredExercises = submission.homework.exercises.filter(e => e.isRequired)
  const missingRequired = requiredExercises.filter(
    e => !submittedExerciseIds.includes(e.exerciseId)
  )

  if (missingRequired.length > 0) {
    return NextResponse.json(
      { 
        error: '必需的练习尚未完成',
        missingExercises: missingRequired.map(e => e.exercise.title)
      },
      { status: 400 }
    )
  }

  // 计算总分和统计
  let totalScore = 0
  let totalTimeSpent = 0
  const completedExercises = validatedData.exerciseSubmissions.length

  for (const exerciseSubmission of validatedData.exerciseSubmissions) {
    if (exerciseSubmission.score) {
      totalScore += exerciseSubmission.score
    }
    totalTimeSpent += exerciseSubmission.timeSpent
  }

  const percentage = submission.maxPossibleScore > 0 
    ? (totalScore / submission.maxPossibleScore) * 100 
    : 0

  // 检查是否迟交
  const now = new Date()
  const isLate = submission.homework.dueDate ? now > submission.homework.dueDate : false

  // 应用迟交扣分
  let finalScore = totalScore
  if (isLate && submission.homework.latePenalty) {
    finalScore = totalScore * (1 - submission.homework.latePenalty / 100)
  }

  // 更新提交记录
  const updatedSubmission = await prisma.homeworkSubmission.update({
    where: { id: submission.id },
    data: {
      status: 'SUBMITTED',
      totalScore: finalScore,
      percentage: (finalScore / submission.maxPossibleScore) * 100,
      completedExercises,
      submittedAt: now,
      lastWorkedAt: now,
      totalTimeSpent: totalTimeSpent,
      isLate
    },
    include: {
      homework: {
        select: {
          id: true,
          title: true,
          totalPoints: true,
          passingScore: true
        }
      }
    }
  })

  // TODO: 触发自动批改流程
  // await triggerAutoGrading(updatedSubmission.id)

  return NextResponse.json({
    success: true,
    data: updatedSubmission,
    message: '作业提交成功'
  })
}

// 辅助函数：检查家长权限
async function checkParentAccess(parentId: string, studentIds: string[]): Promise<boolean> {
  const parent = await prisma.user.findUnique({
    where: { id: parentId },
    include: {
      family: {
        include: {
          members: {
            where: { role: 'STUDENT' },
            select: { id: true }
          }
        }
      }
    }
  })

  if (!parent?.family?.members) {
    return false
  }

  const familyStudentIds = parent.family.members.map(member => member.id)
  return studentIds.some(studentId => familyStudentIds.includes(studentId))
}