// 获取当前用户信息API
// Get current user information API

import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { prisma } from '@/lib/db'

/**
 * GET /api/auth/me
 * 获取当前登录用户的完整信息
 */
export async function GET(request: NextRequest) {
  try {
    // 提取用户信息
    const { user, error } = await extractUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    // 获取用户的详细信息，包括家庭信息
    const userWithDetails = await prisma.user.findUnique({
      where: { id: user.id },
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

    if (!userWithDetails) {
      return NextResponse.json(
        { success: false, message: '用户信息不存在' },
        { status: 404 }
      )
    }

    // 获取用户权限信息
    const permissionChecker = createPermissionChecker(user)
    const permissions = {
      canCreateContent: permissionChecker.canCreateContent(),
      canEditContent: permissionChecker.canEditContent(),
      canDeleteContent: permissionChecker.canDeleteContent(),
      canManageUsers: permissionChecker.canManageUsers(),
      canViewChildrenProgress: permissionChecker.canViewChildrenProgress(),
      canAssignHomework: permissionChecker.canAssignHomework(),
      canManageUnlockRules: permissionChecker.canManageUnlockRules(),
      canViewSystemLogs: permissionChecker.canViewSystemLogs(),
      isAdmin: permissionChecker.isAdmin(),
      isParent: permissionChecker.isParent(),
      isStudent: permissionChecker.isStudent(),
    }

    // 获取用户统计信息
    let stats = {}

    if (user.role === 'STUDENT') {
      // 学生统计信息
      const [submissionCount, progressCount, homeworkCount] = await Promise.all(
        [
          prisma.submission.count({
            where: { userId: user.id },
          }),
          prisma.learningProgress.count({
            where: { userId: user.id },
          }),
          prisma.homeworkSubmission.count({
            where: { userId: user.id },
          }),
        ]
      )

      stats = {
        totalSubmissions: submissionCount,
        learningProgress: progressCount,
        homeworkAssignments: homeworkCount,
      }
    } else if (user.role === 'PARENT') {
      // 家长统计信息：查看子女的学习情况
      if (userWithDetails.familyId) {
        const childrenIds =
          userWithDetails.family?.members
            .filter(member => member.role === 'STUDENT')
            .map(child => child.id) || []

        if (childrenIds.length > 0) {
          const [childrenSubmissions, assignedHomework] = await Promise.all([
            prisma.submission.count({
              where: { userId: { in: childrenIds } },
            }),
            prisma.homeworkAssignment.count({
              where: { assignedBy: user.id },
            }),
          ])

          stats = {
            childrenSubmissions,
            assignedHomework,
            childrenCount: childrenIds.length,
          }
        }
      }
    } else if (user.role === 'ADMIN') {
      // 管理员统计信息：系统总览
      const [totalUsers, totalExercises, totalSubmissions] = await Promise.all([
        prisma.user.count(),
        prisma.exercise.count(),
        prisma.submission.count(),
      ])

      stats = {
        totalUsers,
        totalExercises,
        totalSubmissions,
      }
    }

    // 构建响应数据
    const responseData = {
      user: {
        id: userWithDetails.id,
        username: userWithDetails.username,
        email: userWithDetails.email,
        displayName: userWithDetails.displayName,
        role: userWithDetails.role,
        isActive: userWithDetails.isActive,
        timezone: userWithDetails.timezone,
        yearLevel: userWithDetails.yearLevel,
        birthYear: userWithDetails.birthYear,
        parentalCode: userWithDetails.parentalCode,
        familyId: userWithDetails.familyId,
        lastLoginAt: userWithDetails.lastLoginAt,
        createdAt: userWithDetails.createdAt,
        updatedAt: userWithDetails.updatedAt,
      },
      family: userWithDetails.family
        ? {
            id: userWithDetails.family.id,
            name: userWithDetails.family.name,
            timezone: userWithDetails.family.timezone,
            members: userWithDetails.family.members,
            createdAt: userWithDetails.family.createdAt,
            updatedAt: userWithDetails.family.updatedAt,
          }
        : null,
      permissions,
      stats,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Get current user error:', error)
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
 * PUT /api/auth/me
 * 更新当前用户信息
 */
export async function PUT(request: NextRequest) {
  try {
    // 提取用户信息
    const { user, error } = await extractUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 允许用户更新的字段
    const allowedFields = ['displayName', 'email', 'timezone']
    const updateData: any = {}

    // 过滤允许更新的字段
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // 验证邮箱格式（如果提供）
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { success: false, message: '邮箱格式无效' },
          { status: 400 }
        )
      }

      // 检查邮箱唯一性
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id: { not: user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: '邮箱已被其他用户使用' },
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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: '没有需要更新的字段' },
        { status: 400 }
      )
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    // 记录更新活动
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EDIT_CONTENT',
          details: JSON.stringify({
            action: 'update_profile',
            updatedFields: Object.keys(updateData),
            timestamp: new Date().toISOString(),
          }),
          resourceType: 'User',
          resourceId: user.id,
          ipAddress:
            request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        },
      })
    } catch (logError) {
      console.error('Failed to log profile update:', logError)
    }

    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        timezone: updatedUser.timezone,
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新用户信息失败',
      },
      { status: 500 }
    )
  }
}
