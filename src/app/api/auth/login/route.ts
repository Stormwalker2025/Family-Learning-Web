// 用户登录API
// User login API endpoint

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { LoginRequest, LoginResponse, User, UserRole } from '@/types'
import { SESSION_CONFIG, LOGIN_SECURITY } from '@/lib/auth/config'

// 登录请求验证模式
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  rememberMe: z.boolean().optional().default(false)
})

// 登录失败计数器（生产环境应使用Redis等持久化存储）
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

/**
 * 检查登录限制
 */
function checkLoginLimits(username: string): { allowed: boolean; message?: string } {
  const now = Date.now()
  const attempts = loginAttempts.get(username)

  if (!attempts) {
    return { allowed: true }
  }

  // 如果锁定时间已过，重置计数
  if (now - attempts.lastAttempt > LOGIN_SECURITY.lockoutDuration) {
    loginAttempts.delete(username)
    return { allowed: true }
  }

  // 检查是否超过最大尝试次数
  if (attempts.count >= LOGIN_SECURITY.maxFailedAttempts) {
    const remainingTime = Math.ceil(
      (LOGIN_SECURITY.lockoutDuration - (now - attempts.lastAttempt)) / 1000 / 60
    )
    return {
      allowed: false,
      message: `账户已锁定，请在 ${remainingTime} 分钟后重试`
    }
  }

  return { allowed: true }
}

/**
 * 记录登录失败
 */
function recordLoginFailure(username: string) {
  const now = Date.now()
  const attempts = loginAttempts.get(username)

  if (!attempts) {
    loginAttempts.set(username, { count: 1, lastAttempt: now })
  } else {
    attempts.count++
    attempts.lastAttempt = now
  }
}

/**
 * 清除登录失败记录
 */
function clearLoginFailures(username: string) {
  loginAttempts.delete(username)
}

/**
 * 记录登录活动
 */
async function logLoginActivity(
  userId: string,
  success: boolean,
  request: NextRequest
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: success ? 'LOGIN' : 'LOGIN_FAILED',
        details: JSON.stringify({
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Failed to log login activity:', error)
  }
}

/**
 * POST /api/auth/login
 * 用户登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validation = loginSchema.safeParse(body)
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

    const { username, password, rememberMe } = validation.data

    // 检查登录限制
    const limitCheck = checkLoginLimits(username)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: limitCheck.message
        },
        { status: 429 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        family: true
      }
    })

    if (!user) {
      recordLoginFailure(username)
      return NextResponse.json(
        {
          success: false,
          message: '用户名或密码错误'
        },
        { status: 401 }
      )
    }

    // 检查用户状态
    if (!user.isActive) {
      recordLoginFailure(username)
      await logLoginActivity(user.id, false, request)
      return NextResponse.json(
        {
          success: false,
          message: '账户已被禁用，请联系管理员'
        },
        { status: 401 }
      )
    }

    // 验证密码
    const passwordValid = await verifyPassword(password, user.password)
    if (!passwordValid) {
      recordLoginFailure(username)
      await logLoginActivity(user.id, false, request)
      return NextResponse.json(
        {
          success: false,
          message: '用户名或密码错误'
        },
        { status: 401 }
      )
    }

    // 登录成功，清除失败记录
    clearLoginFailures(username)

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 记录成功登录
    await logLoginActivity(user.id, true, request)

    // 转换用户对象
    const frontendUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      isActive: user.isActive,
      timezone: user.timezone,
      yearLevel: user.yearLevel,
      birthYear: user.birthYear,
      parentalCode: user.parentalCode,
      familyId: user.familyId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    // 生成JWT令牌
    const accessToken = generateAccessToken(frontendUser)
    const refreshToken = generateRefreshToken(frontendUser)

    // 设置响应
    const response = NextResponse.json<LoginResponse>({
      success: true,
      user: frontendUser,
      accessToken,
      message: '登录成功'
    })

    // 设置Session Cookie
    const cookieOptions = {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      maxAge: rememberMe ? SESSION_CONFIG.maxAge * 7 : SESSION_CONFIG.maxAge, // 记住登录状态延长到7天
      path: '/'
    }

    response.cookies.set(SESSION_CONFIG.cookieName, accessToken, cookieOptions)

    if (refreshToken) {
      response.cookies.set(
        `${SESSION_CONFIG.cookieName}_refresh`,
        refreshToken,
        {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
        }
      )
    }

    return response

  } catch (error) {
    console.error('Login error:', error)
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
 * OPTIONS /api/auth/login
 * CORS预检请求处理
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}