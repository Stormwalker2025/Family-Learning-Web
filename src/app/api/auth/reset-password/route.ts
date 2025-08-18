// 密码重置API
// Password reset API endpoint

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, validatePasswordStrength, verifyPassword } from '@/lib/auth/password'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'

// 密码重置请求验证模式
const resetPasswordSchema = z.object({
  userId: z.string().cuid('无效的用户ID').optional(),
  currentPassword: z.string().min(1, '当前密码不能为空').optional(),
  newPassword: z.string().min(6, '新密码至少需要6个字符'),
  confirmPassword: z.string().min(1, '确认密码不能为空')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '新密码和确认密码不匹配',
  path: ['confirmPassword']
})

/**
 * 记录密码重置活动
 */
async function logPasswordReset(
  operatorId: string,
  targetUserId: string,
  isOwnPassword: boolean,
  request: NextRequest
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: operatorId,
        action: 'EDIT_CONTENT',
        details: JSON.stringify({
          action: 'password_reset',
          targetUserId,
          isOwnPassword,
          timestamp: new Date().toISOString()
        }),
        resourceType: 'User',
        resourceId: targetUserId,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Failed to log password reset:', error)
  }
}

/**
 * POST /api/auth/reset-password
 * 重置密码
 */
export async function POST(request: NextRequest) {
  try {
    // 提取当前用户信息
    const { user: currentUser, error } = await extractUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 验证请求数据
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: '请求数据格式错误',
          errors: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { userId, currentPassword, newPassword } = validation.data

    // 确定目标用户ID
    const targetUserId = userId || currentUser.id
    const isOwnPassword = targetUserId === currentUser.id

    // 权限检查
    const permissionChecker = createPermissionChecker(currentUser)
    
    if (!isOwnPassword && !permissionChecker.canResetPassword(targetUserId)) {
      return NextResponse.json(
        { success: false, message: '权限不足，无法重置该用户的密码' },
        { status: 403 }
      )
    }

    // 获取目标用户信息
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 如果是修改自己的密码，需要验证当前密码
    if (isOwnPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: '修改自己的密码需要提供当前密码' },
          { status: 400 }
        )
      }

      const currentPasswordValid = await verifyPassword(currentPassword, targetUser.password)
      if (!currentPasswordValid) {
        return NextResponse.json(
          { success: false, message: '当前密码错误' },
          { status: 400 }
        )
      }
    }

    // 验证新密码强度
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: '新密码不符合要求',
          errors: passwordValidation.errors,
          score: passwordValidation.score
        },
        { status: 400 }
      )
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await verifyPassword(newPassword, targetUser.password)
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: '新密码不能与当前密码相同' },
        { status: 400 }
      )
    }

    // 哈希新密码
    const hashedNewPassword = await hashPassword(newPassword)

    // 更新密码
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // 记录密码重置活动
    await logPasswordReset(currentUser.id, targetUserId, isOwnPassword, request)

    return NextResponse.json({
      success: true,
      message: isOwnPassword ? '密码修改成功' : '用户密码重置成功'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '密码重置失败，请稍后重试'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/auth/reset-password
 * 管理员强制重置用户密码（无需当前密码）
 */
export async function PUT(request: NextRequest) {
  try {
    // 提取当前用户信息
    const { user: currentUser, error } = await extractUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    // 只有管理员可以强制重置密码
    const permissionChecker = createPermissionChecker(currentUser)
    if (!permissionChecker.isAdmin()) {
      return NextResponse.json(
        { success: false, message: '权限不足，只有管理员可以强制重置密码' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 简化的验证模式（管理员强制重置不需要当前密码）
    const forceResetSchema = z.object({
      userId: z.string().cuid('无效的用户ID'),
      newPassword: z.string().min(6, '新密码至少需要6个字符'),
      confirmPassword: z.string().min(1, '确认密码不能为空')
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: '新密码和确认密码不匹配',
      path: ['confirmPassword']
    })

    const validation = forceResetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: '请求数据格式错误',
          errors: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { userId, newPassword } = validation.data

    // 不能重置自己的密码（防止管理员意外锁定自己）
    if (userId === currentUser.id) {
      return NextResponse.json(
        { success: false, message: '不能强制重置自己的密码，请使用普通密码修改功能' },
        { status: 400 }
      )
    }

    // 获取目标用户信息
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证新密码强度
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: '新密码不符合要求',
          errors: passwordValidation.errors,
          score: passwordValidation.score
        },
        { status: 400 }
      )
    }

    // 哈希新密码
    const hashedNewPassword = await hashPassword(newPassword)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // 记录强制密码重置活动
    await logPasswordReset(currentUser.id, userId, false, request)

    return NextResponse.json({
      success: true,
      message: `用户 ${targetUser.displayName} 的密码已强制重置成功`
    })

  } catch (error) {
    console.error('Force password reset error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '强制密码重置失败，请稍后重试'
      },
      { status: 500 }
    )
  }
}