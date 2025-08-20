import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 作业更新模式
const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  estimatedTime: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'REVIEWED'])
    .optional(),
  isVisible: z.boolean().optional(),
  totalPoints: z.number().optional(),
  passingScore: z.number().optional(),
  allowMultipleAttempts: z.boolean().optional(),
  lateSubmissionAllowed: z.boolean().optional(),
  latePenalty: z.number().optional(),
})

interface RouteParams {
  params: { id: string }
}

// GET - 获取特定作业详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const assignmentId = params.id

    // 获取作业详情
    const assignment = await prisma.homeworkAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        assignedByUser: {
          select: { id: true, displayName: true, username: true },
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            username: true,
            yearLevel: true,
          },
        },
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                title: true,
                description: true,
                subject: true,
                yearLevel: true,
                difficulty: true,
                timeLimit: true,
                content: true,
                instructions: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                yearLevel: true,
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 })
    }

    // 权限检查
    const hasAccess =
      payload.role === 'ADMIN' ||
      assignment.assignedBy === payload.userId ||
      assignment.assignedTo.some(student => student.id === payload.userId) ||
      (payload.role === 'PARENT' &&
        (await checkParentAccess(
          payload.userId,
          assignment.assignedTo.map(s => s.id)
        )))

    if (!hasAccess) {
      return NextResponse.json({ error: '无权访问此作业' }, { status: 403 })
    }

    // 计算统计信息
    const statistics = {
      totalStudents: assignment.assignedTo.length,
      submittedCount: assignment.submissions.filter(
        s => s.status === 'SUBMITTED' || s.status === 'COMPLETED'
      ).length,
      completedCount: assignment.submissions.filter(
        s => s.status === 'COMPLETED'
      ).length,
      overdueCount: assignment.submissions.filter(s => s.isLate).length,
      inProgressCount: assignment.submissions.filter(
        s => s.status === 'IN_PROGRESS'
      ).length,
      notStartedCount: assignment.submissions.filter(
        s => s.status === 'NOT_STARTED'
      ).length,
    }

    // 计算平均分
    const scoresSubmissions = assignment.submissions.filter(
      s => s.totalScore !== null
    )
    const averageScore =
      scoresSubmissions.length > 0
        ? scoresSubmissions.reduce((sum, s) => sum + (s.totalScore || 0), 0) /
          scoresSubmissions.length
        : null

    return NextResponse.json({
      success: true,
      data: {
        ...assignment,
        statistics: {
          ...statistics,
          averageScore,
          completionRate:
            statistics.totalStudents > 0
              ? (statistics.completedCount / statistics.totalStudents) * 100
              : 0,
        },
      },
    })
  } catch (error) {
    console.error('获取作业详情失败:', error)
    return NextResponse.json({ error: '获取作业详情失败' }, { status: 500 })
  }
}

// PUT - 更新作业
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const assignmentId = params.id

    // 检查作业是否存在
    const existingAssignment = await prisma.homeworkAssignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, assignedBy: true, status: true },
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 })
    }

    // 权限检查：只有创建者或管理员可以修改
    if (
      payload.role !== 'ADMIN' &&
      existingAssignment.assignedBy !== payload.userId
    ) {
      return NextResponse.json({ error: '无权修改此作业' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateAssignmentSchema.parse(body)

    // 更新作业
    const updatedAssignment = await prisma.homeworkAssignment.update({
      where: { id: assignmentId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        assignedByUser: {
          select: { id: true, displayName: true, username: true },
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            username: true,
            yearLevel: true,
          },
        },
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                title: true,
                subject: true,
                difficulty: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: '作业更新成功',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('更新作业失败:', error)
    return NextResponse.json({ error: '更新作业失败' }, { status: 500 })
  }
}

// DELETE - 删除作业
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const assignmentId = params.id

    // 检查作业是否存在
    const existingAssignment = await prisma.homeworkAssignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        assignedBy: true,
        status: true,
        submissions: { select: { id: true, status: true } },
      },
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: '作业不存在' }, { status: 404 })
    }

    // 权限检查：只有创建者或管理员可以删除
    if (
      payload.role !== 'ADMIN' &&
      existingAssignment.assignedBy !== payload.userId
    ) {
      return NextResponse.json({ error: '无权删除此作业' }, { status: 403 })
    }

    // 检查是否有学生已经开始作业
    const hasActiveSubmissions = existingAssignment.submissions.some(
      s =>
        s.status === 'IN_PROGRESS' ||
        s.status === 'COMPLETED' ||
        s.status === 'SUBMITTED'
    )

    if (hasActiveSubmissions) {
      return NextResponse.json(
        { error: '无法删除已有学生开始的作业，请考虑将其标记为已完成' },
        { status: 400 }
      )
    }

    // 删除作业（会级联删除相关的exercises和submissions）
    await prisma.homeworkAssignment.delete({
      where: { id: assignmentId },
    })

    return NextResponse.json({
      success: true,
      message: '作业删除成功',
    })
  } catch (error) {
    console.error('删除作业失败:', error)
    return NextResponse.json({ error: '删除作业失败' }, { status: 500 })
  }
}

// 辅助函数：检查家长是否有权访问学生作业
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
