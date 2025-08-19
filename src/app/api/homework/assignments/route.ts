import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 作业分配创建模式
const createAssignmentSchema = z.object({
  title: z.string().min(1, '作业标题不能为空'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  assignedTo: z.array(z.string()).min(1, '必须至少分配给一个学生'),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  estimatedTime: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  totalPoints: z.number().default(100),
  passingScore: z.number().default(70),
  allowMultipleAttempts: z.boolean().default(true),
  maxAttempts: z.number().optional(),
  autoRelease: z.boolean().default(true),
  releaseDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  lateSubmissionAllowed: z.boolean().default(true),
  latePenalty: z.number().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    order: z.number(),
    isRequired: z.boolean().default(true),
    minScore: z.number().optional(),
    maxAttempts: z.number().optional(),
    timeLimit: z.number().optional(),
    weight: z.number().default(1)
  })).min(1, '必须包含至少一个练习'),
  notifications: z.array(z.object({
    type: z.enum(['homework-assigned', 'homework-due', 'homework-completed', 'homework-graded', 'reminder']),
    enabled: z.boolean(),
    timing: z.number().optional(),
    recipients: z.array(z.string()),
    message: z.string().optional()
  })).default([])
})

// GET - 获取作业列表
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
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const subject = searchParams.get('subject')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 构建查询条件
    const where: any = {}
    
    // 根据用户角色过滤
    if (payload.role === 'STUDENT') {
      where.assignedTo = {
        some: { id: payload.userId }
      }
    } else if (payload.role === 'PARENT') {
      // 家长可以看到家庭成员的作业
      const family = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { family: { include: { members: true } } }
      })
      
      if (family?.family?.members) {
        const studentIds = family.family.members
          .filter(member => member.role === 'STUDENT')
          .map(student => student.id)
        
        if (studentIds.length > 0) {
          where.assignedTo = {
            some: { id: { in: studentIds } }
          }
        }
      }
    }
    // ADMIN可以看到所有作业，不需要额外过滤

    if (status) {
      where.status = status.toUpperCase()
    }

    if (assignedTo) {
      where.assignedTo = {
        some: { id: assignedTo }
      }
    }

    // 计算分页
    const skip = (page - 1) * limit

    const [assignments, total] = await Promise.all([
      prisma.homeworkAssignment.findMany({
        where,
        include: {
          assignedByUser: {
            select: { id: true, displayName: true, username: true }
          },
          assignedTo: {
            select: { id: true, displayName: true, username: true, yearLevel: true }
          },
          exercises: {
            include: {
              exercise: {
                select: { 
                  id: true, 
                  title: true, 
                  subject: true, 
                  difficulty: true, 
                  timeLimit: true 
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          submissions: {
            include: {
              user: {
                select: { id: true, displayName: true, username: true }
              }
            }
          }
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.homeworkAssignment.count({ where })
    ])

    // 计算统计信息
    const assignmentsWithStats = assignments.map(assignment => {
      const totalStudents = assignment.assignedTo.length
      const submissions = assignment.submissions
      const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED' || s.status === 'SUBMITTED')
      const overdueSubmissions = submissions.filter(s => s.isLate)
      
      return {
        ...assignment,
        statistics: {
          totalStudents,
          submittedCount: submissions.length,
          completedCount: completedSubmissions.length,
          overdueCount: overdueSubmissions.length,
          completionRate: totalStudents > 0 ? (completedSubmissions.length / totalStudents) * 100 : 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: assignmentsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('获取作业列表失败:', error)
    return NextResponse.json(
      { error: '获取作业列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新作业
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

    // 检查权限：只有ADMIN和PARENT可以创建作业
    if (payload.role === 'STUDENT') {
      return NextResponse.json({ error: '学生无权创建作业' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createAssignmentSchema.parse(body)

    // 验证练习是否存在
    const exerciseIds = validatedData.exercises.map(e => e.exerciseId)
    const existingExercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, title: true, subject: true }
    })

    if (existingExercises.length !== exerciseIds.length) {
      const missingIds = exerciseIds.filter(id => 
        !existingExercises.some(e => e.id === id)
      )
      return NextResponse.json(
        { error: `练习不存在: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证分配的学生是否存在
    const existingStudents = await prisma.user.findMany({
      where: { 
        id: { in: validatedData.assignedTo },
        role: 'STUDENT'
      },
      select: { id: true, displayName: true }
    })

    if (existingStudents.length !== validatedData.assignedTo.length) {
      const missingIds = validatedData.assignedTo.filter(id => 
        !existingStudents.some(s => s.id === id)
      )
      return NextResponse.json(
        { error: `学生不存在或角色不正确: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建作业分配
    const assignment = await prisma.homeworkAssignment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        instructions: validatedData.instructions,
        assignedBy: payload.userId,
        dueDate: validatedData.dueDate,
        estimatedTime: validatedData.estimatedTime,
        priority: validatedData.priority,
        status: validatedData.autoRelease ? 'ASSIGNED' : 'IN_PROGRESS',
        isVisible: validatedData.autoRelease || !validatedData.releaseDate,
        totalPoints: validatedData.totalPoints,
        passingScore: validatedData.passingScore,
        allowMultipleAttempts: validatedData.allowMultipleAttempts,
        assignedTo: {
          connect: validatedData.assignedTo.map(id => ({ id }))
        },
        exercises: {
          create: validatedData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            isRequired: exercise.isRequired,
            minScore: exercise.minScore,
            maxAttempts: exercise.maxAttempts
          }))
        }
      },
      include: {
        assignedByUser: {
          select: { id: true, displayName: true, username: true }
        },
        assignedTo: {
          select: { id: true, displayName: true, username: true, yearLevel: true }
        },
        exercises: {
          include: {
            exercise: {
              select: { 
                id: true, 
                title: true, 
                subject: true, 
                difficulty: true 
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // 为每个学生创建作业提交记录
    await Promise.all(
      validatedData.assignedTo.map(studentId =>
        prisma.homeworkSubmission.create({
          data: {
            homeworkId: assignment.id,
            userId: studentId,
            status: 'NOT_STARTED',
            totalExercises: validatedData.exercises.length,
            maxPossibleScore: validatedData.totalPoints
          }
        })
      )
    )

    // TODO: 发送通知
    // await sendHomeworkNotifications(assignment, validatedData.notifications)

    return NextResponse.json({
      success: true,
      data: assignment,
      message: '作业创建成功'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建作业失败:', error)
    return NextResponse.json(
      { error: '创建作业失败' },
      { status: 500 }
    )
  }
}