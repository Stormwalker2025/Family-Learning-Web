// 用户注册API（管理员创建用户）
// User registration API (Admin creates users)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { RegisterRequest, UserRole } from '@/types'
import { FAMILY_CONFIG } from '@/lib/auth/config'

// 注册请求验证模式
const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少需要3个字符')
    .max(50, '用户名不能超过50个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线'),
  email: z.string().email('邮箱格式无效').optional(),
  password: z.string().min(6, '密码至少需要6个字符'),
  displayName: z.string()
    .min(1, '显示名称不能为空')
    .max(100, '显示名称不能超过100个字符'),
  role: z.enum(['STUDENT', 'PARENT', 'ADMIN'] as const),
  yearLevel: z.number().min(1).max(12).optional(),
  birthYear: z.number()
    .min(1990)
    .max(new Date().getFullYear())
    .optional(),
  familyId: z.string().cuid().optional()
})

/**
 * 验证用户名唯一性
 */
async function checkUsernameAvailability(username: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { username }
  })
  return !existingUser
}

/**
 * 验证邮箱唯一性
 */
async function checkEmailAvailability(email: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  return !existingUser
}

/**
 * 验证家庭ID有效性
 */
async function validateFamilyId(familyId: string): Promise<boolean> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: { members: true }
  })

  if (!family) return false

  // 检查家庭成员数量限制
  return family.members.length < FAMILY_CONFIG.maxMembersPerFamily
}

/**
 * 生成家长监督码
 */
function generateParentalCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 记录用户创建活动
 */
async function logUserCreation(
  creatorId: string,
  newUserId: string,
  request: NextRequest
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: creatorId,
        action: 'CREATE_CONTENT',
        details: JSON.stringify({
          action: 'create_user',
          targetUserId: newUserId,
          timestamp: new Date().toISOString()
        }),
        resourceType: 'User',
        resourceId: newUserId,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Failed to log user creation:', error)
  }
}

/**
 * POST /api/auth/register
 * 创建新用户（仅管理员）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const { user: currentUser, error: authError } = await extractUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: authError || '未授权访问' },
        { status: 401 }
      )
    }

    const permissionChecker = createPermissionChecker(currentUser)
    if (!permissionChecker.canManageUsers()) {
      return NextResponse.json(
        { success: false, message: '权限不足，只有管理员可以创建用户' },
        { status: 403 }
      )
    }

    // 解析请求数据
    const body = await request.json()
    
    // 验证请求数据
    const validation = registerSchema.safeParse(body)
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

    const {
      username,
      email,
      password,
      displayName,
      role,
      yearLevel,
      birthYear,
      familyId
    } = validation.data

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: '密码不符合要求',
          errors: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // 检查用户名唯一性
    const usernameAvailable = await checkUsernameAvailability(username)
    if (!usernameAvailable) {
      return NextResponse.json(
        { success: false, message: '用户名已存在' },
        { status: 400 }
      )
    }

    // 检查邮箱唯一性（如果提供）
    if (email) {
      const emailAvailable = await checkEmailAvailability(email)
      if (!emailAvailable) {
        return NextResponse.json(
          { success: false, message: '邮箱已被使用' },
          { status: 400 }
        )
      }
    }

    // 验证家庭ID（如果提供）
    if (familyId) {
      const familyValid = await validateFamilyId(familyId)
      if (!familyValid) {
        return NextResponse.json(
          { success: false, message: '家庭ID无效或家庭成员已满' },
          { status: 400 }
        )
      }
    }

    // 验证角色特定规则
    if (role === 'STUDENT') {
      if (!yearLevel) {
        return NextResponse.json(
          { success: false, message: '学生用户必须指定年级' },
          { status: 400 }
        )
      }
      if (!birthYear) {
        return NextResponse.json(
          { success: false, message: '学生用户必须指定出生年份' },
          { status: 400 }
        )
      }
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 生成家长监督码（为学生用户）
    const parentalCode = role === 'STUDENT' ? generateParentalCode() : undefined

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        displayName,
        role,
        yearLevel,
        birthYear,
        familyId,
        parentalCode,
        timezone: FAMILY_CONFIG.defaultTimezone,
        isActive: true
      },
      include: {
        family: true
      }
    })

    // 记录创建活动
    await logUserCreation(currentUser.id, newUser.id, request)

    // 返回用户信息（不包含密码）
    const responseUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      isActive: newUser.isActive,
      timezone: newUser.timezone,
      yearLevel: newUser.yearLevel,
      birthYear: newUser.birthYear,
      parentalCode: newUser.parentalCode,
      familyId: newUser.familyId,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: responseUser
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '服务器内部错误，请稍后重试'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/register
 * 获取注册相关信息（家庭列表等）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const { user: currentUser, error: authError } = await extractUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: authError || '未授权访问' },
        { status: 401 }
      )
    }

    const permissionChecker = createPermissionChecker(currentUser)
    if (!permissionChecker.canManageUsers()) {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }

    // 获取家庭列表
    const families = await prisma.family.findMany({
      include: {
        members: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true
          }
        }
      }
    })

    // 获取用户统计信息
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        families,
        userStats,
        config: {
          maxFamilyMembers: FAMILY_CONFIG.maxMembersPerFamily,
          supportedRoles: ['STUDENT', 'PARENT', 'ADMIN'],
          yearLevels: Array.from({ length: 12 }, (_, i) => i + 1)
        }
      }
    })

  } catch (error) {
    console.error('Get registration info error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '服务器内部错误'
      },
      { status: 500 }
    )
  }
}