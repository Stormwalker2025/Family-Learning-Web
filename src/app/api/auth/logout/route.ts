// 用户登出API
// User logout API endpoint

import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createTokenBlacklistEntry } from '@/lib/auth/jwt'
import { SESSION_CONFIG } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

/**
 * 记录登出活动
 */
async function logLogoutActivity(userId: string, request: NextRequest) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        details: JSON.stringify({
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        }),
        ipAddress:
          request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      },
    })
  } catch (error) {
    console.error('Failed to log logout activity:', error)
  }
}

/**
 * POST /api/auth/logout
 * 用户登出
 */
export async function POST(request: NextRequest) {
  try {
    // 提取用户信息
    const { user } = await extractUserFromRequest(request)

    // 即使用户信息无效，也要清除Cookie
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    })

    // 清除认证Cookie
    const cookieOptions = {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      maxAge: 0, // 立即过期
      path: '/',
    }

    response.cookies.set(SESSION_CONFIG.cookieName, '', cookieOptions)
    response.cookies.set(
      `${SESSION_CONFIG.cookieName}_refresh`,
      '',
      cookieOptions
    )

    // 如果用户有效，记录登出活动
    if (user) {
      await logLogoutActivity(user.id, request)

      // TODO: 将JWT令牌加入黑名单（生产环境中应使用Redis等存储）
      // 这里可以实现JWT黑名单逻辑
      const token =
        request.cookies.get(SESSION_CONFIG.cookieName)?.value ||
        request.headers.get('Authorization')?.replace('Bearer ', '')

      if (token) {
        const blacklistEntry = createTokenBlacklistEntry(token)
        if (blacklistEntry) {
          // 在生产环境中，这里应该将blacklistEntry存储到Redis或数据库中
          console.log('Token blacklisted:', blacklistEntry.jti)
        }
      }
    }

    return response
  } catch (error) {
    console.error('Logout error:', error)

    // 即使出错，也要尝试清除Cookie
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    })

    const cookieOptions = {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      maxAge: 0,
      path: '/',
    }

    response.cookies.set(SESSION_CONFIG.cookieName, '', cookieOptions)
    response.cookies.set(
      `${SESSION_CONFIG.cookieName}_refresh`,
      '',
      cookieOptions
    )

    return response
  }
}

/**
 * GET /api/auth/logout
 * 同样支持GET请求登出（用于简化前端实现）
 */
export async function GET(request: NextRequest) {
  return POST(request)
}
