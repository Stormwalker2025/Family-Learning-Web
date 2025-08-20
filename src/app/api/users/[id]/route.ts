// 单个用户管理API
// Individual user management API

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { UserRole } from '@/types'

// 用户更新数据验证模式
const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['STUDENT', 'PARENT', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  yearLevel: z.number().min(1).max(12).optional(),
  birthYear: z.number().min(1990).max(new Date().getFullYear()).optional(),
  familyId: z.string().cuid().optional(),
  timezone: z.string().optional(),
})

/**
 * 记录用户操作活动
 */
async function logUserOperation(
  operatorId: string,
  targetUserId: string,
  action: string,
  details: any,
  request: NextRequest
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: operatorId,
        action: action as any,
        details: JSON.stringify({
          action,
          targetUserId,
          ...details,
          timestamp: new Date().toISOString(),
        }),
        resourceType: 'User',
        resourceId: targetUserId,
        ipAddress:
          request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      },
    })
  } catch (error) {
    console.error('Failed to log user operation:', error)
  }
}

/**
 * GET /api/users/[id]
 * 获取特定用户信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const { user: currentUser, error } = await extractUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const targetUserId = params.id
    const permissionChecker = createPermissionChecker(currentUser)

    // 权限检查
    if (!permissionChecker.canAccessUserData(targetUserId)) {
      return NextResponse.json(
        { success: false, message: '权限不足，无法访问该用户信息' },
        { status: 403 }
      )
    }

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        family: {
          include: {
            members: {
              select: {
                id: true,
                username: true,
                displayName: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取用户统计信息
    let stats = {}

    if (user.role === 'STUDENT') {
      const [submissionCount, progressCount, vocabularyCount] =
        await Promise.all([
          prisma.submission.count({
            where: { userId: user.id },
          }),
          prisma.learningProgress.count({
            where: { userId: user.id },
          }),
          prisma.vocabularyProgress.count({
            where: { userId: user.id },
          }),
        ])

      stats = {
        totalSubmissions: submissionCount,
        learningProgress: progressCount,
        vocabularyWords: vocabularyCount,
      }
    }

    // 移除敏感信息
    const { password, ...userInfo } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo,
        stats,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取用户信息失败',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]
 * 更新用户信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const { user: currentUser, error } = await extractUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const targetUserId = params.id
    const permissionChecker = createPermissionChecker(currentUser)

    // 获取目标用户信息
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 权限检查
    if (
      !permissionChecker.canModifyUserData(
        targetUserId,
        targetUser.role as UserRole
      )
    ) {
      return NextResponse.json(
        { success: false, message: '权限不足，无法修改该用户信息' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 验证请求数据
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: '请求数据格式错误',
          errors: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // 特殊权限检查
    if (
      updateData.role &&
      !permissionChecker.canChangeUserRole(targetUserId, updateData.role)
    ) {
      return NextResponse.json(
        { success: false, message: '权限不足，无法更改用户角色' },
        { status: 403 }
      )
    }

    // 验证邮箱唯一性
    if (updateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id: { not: targetUserId },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: '邮箱已被其他用户使用' },
          { status: 400 }
        )
      }
    }

    // 验证家庭ID
    if (updateData.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: updateData.familyId },
        include: { members: true },
      })

      if (!family) {
        return NextResponse.json(
          { success: false, message: '家庭ID无效' },
          { status: 400 }
        )
      }

      // 检查家庭成员数量限制（如果用户不在该家庭中）
      if (
        targetUser.familyId !== updateData.familyId &&
        family.members.length >= 10
      ) {
        return NextResponse.json(
          { success: false, message: '目标家庭成员已满' },
          { status: 400 }
        )
      }
    }

    // 验证时区
    if (updateData.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: updateData.timezone })
      } catch (error) {
        return NextResponse.json(
          { success: false, message: '无效的时区设置' },
          { status: 400 }
        )
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        family: true,
      },
    })

    // 记录操作日志
    await logUserOperation(
      currentUser.id,
      targetUserId,
      'EDIT_CONTENT',
      {
        action: 'update_user',
        updatedFields: Object.keys(updateData),
      },
      request
    )

    // 移除密码字段
    const { password, ...userResponse } = updatedUser

    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      data: { user: userResponse },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新用户信息失败',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * 删除用户（软删除）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const { user: currentUser, error } = await extractUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const targetUserId = params.id
    const permissionChecker = createPermissionChecker(currentUser)

    // 获取目标用户信息
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 权限检查
    if (!permissionChecker.canDeleteUser(targetUser.role as UserRole)) {
      return NextResponse.json(
        { success: false, message: '权限不足，无法删除该用户' },
        { status: 403 }
      )
    }

    // 不能删除自己
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { success: false, message: '不能删除自己的账户' },
        { status: 400 }
      )
    }

    // 软删除：设置为不活跃状态
    const deletedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // 记录删除操作
    await logUserOperation(
      currentUser.id,
      targetUserId,
      'DELETE_CONTENT',
      {
        action: 'delete_user',
        targetUsername: targetUser.username,
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: `用户 ${targetUser.displayName} 已被删除`,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '删除用户失败',
      },
      { status: 500 }
    )
  }
}
