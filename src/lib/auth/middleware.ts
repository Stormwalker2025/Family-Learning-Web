// 认证和权限验证中间件
// Authentication and authorization middleware

import { NextRequest, NextResponse } from 'next/server'
import { JWTPayload, User, UserRole, PermissionCheck } from '@/types'
import { verifyToken, extractBearerToken } from './jwt'
import { ROLE_PERMISSIONS, PROTECTED_ROUTES } from './config'
import { prisma } from '@/lib/db'

/**
 * 从请求中提取并验证用户信息
 * @param request Next.js请求对象
 * @returns 用户信息或null
 */
export async function extractUserFromRequest(
  request: NextRequest
): Promise<{ user: User | null; error?: string }> {
  try {
    // 从Authorization头部或Cookie中获取令牌
    let token: string | null = null

    // 优先从Authorization头部获取
    const authHeader = request.headers.get('Authorization')
    token = extractBearerToken(authHeader)

    // 如果头部没有，尝试从Cookie获取
    if (!token) {
      token = request.cookies.get('family-learning-session')?.value || null
    }

    if (!token) {
      return { user: null, error: 'No authentication token found' }
    }

    // 验证令牌
    const payload = verifyToken(token)
    if (!payload) {
      return { user: null, error: 'Invalid or expired token' }
    }

    // 从数据库获取完整用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        family: true,
      },
    })

    if (!user || !user.isActive) {
      return { user: null, error: 'User not found or inactive' }
    }

    // 转换数据库用户对象为前端用户类型
    const frontendUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      isActive: user.isActive,
      timezone: user.timezone,
      yearLevel: user.yearLevel || undefined,
      birthYear: user.birthYear || undefined,
      parentalCode: user.parentalCode || undefined,
      familyId: user.familyId || undefined,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return { user: frontendUser }
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return { user: null, error: 'Authentication error' }
  }
}

/**
 * 验证用户权限
 * @param user 用户信息
 * @param permission 所需权限
 * @returns 权限检查结果
 */
export function checkPermission(
  user: User,
  permission: keyof typeof ROLE_PERMISSIONS.ADMIN
): PermissionCheck {
  const rolePermissions = ROLE_PERMISSIONS[user.role]

  if (!rolePermissions) {
    return {
      hasPermission: false,
      reason: `Invalid user role: ${user.role}`,
    }
  }

  const hasPermission = rolePermissions[permission] === true

  return {
    hasPermission,
    reason: hasPermission
      ? undefined
      : `Insufficient permissions for ${permission}`,
  }
}

/**
 * 检查用户是否可以访问特定路由
 * @param user 用户信息（可为null）
 * @param pathname 路由路径
 * @returns 是否有权限访问
 */
export function canAccessRoute(user: User | null, pathname: string): boolean {
  // 检查是否为公开路由
  if (
    PROTECTED_ROUTES.public.some(
      route => pathname === route || pathname.startsWith(route)
    )
  ) {
    return true
  }

  // 如果不是公开路由且用户未登录，拒绝访问
  if (!user) {
    return false
  }

  // 检查管理员专用路由
  if (
    PROTECTED_ROUTES.adminOnly.some(route =>
      pathname.startsWith(route.replace('/*', ''))
    )
  ) {
    return user.role === 'ADMIN'
  }

  // 检查家长和管理员路由
  if (
    PROTECTED_ROUTES.parentOrAdmin.some(route => pathname.startsWith(route))
  ) {
    return user.role === 'PARENT' || user.role === 'ADMIN'
  }

  // 检查需要认证的路由
  if (PROTECTED_ROUTES.requireAuth.some(route => pathname.startsWith(route))) {
    return user.isActive
  }

  // 默认允许访问
  return true
}

/**
 * 创建认证中间件
 * @param requireAuth 是否需要认证
 * @param requiredRole 所需角色
 * @param requiredPermission 所需权限
 * @returns 中间件函数
 */
export function createAuthMiddleware(
  requireAuth: boolean = true,
  requiredRole?: UserRole,
  requiredPermission?: keyof typeof ROLE_PERMISSIONS.ADMIN
) {
  return async (request: NextRequest) => {
    const { user, error } = await extractUserFromRequest(request)

    // 如果需要认证但用户未登录
    if (requireAuth && !user) {
      return NextResponse.json(
        { success: false, message: error || 'Authentication required' },
        { status: 401 }
      )
    }

    // 检查角色要求
    if (requiredRole && user?.role !== requiredRole) {
      return NextResponse.json(
        { success: false, message: `Required role: ${requiredRole}` },
        { status: 403 }
      )
    }

    // 检查权限要求
    if (requiredPermission && user) {
      const permissionCheck = checkPermission(user, requiredPermission)
      if (!permissionCheck.hasPermission) {
        return NextResponse.json(
          { success: false, message: permissionCheck.reason },
          { status: 403 }
        )
      }
    }

    // 检查路由访问权限
    if (!canAccessRoute(user, request.nextUrl.pathname)) {
      return NextResponse.json(
        { success: false, message: 'Access denied for this route' },
        { status: 403 }
      )
    }

    // 权限验证通过，继续处理请求
    return NextResponse.next()
  }
}

/**
 * 家庭成员权限检查
 * @param currentUser 当前用户
 * @param targetUserId 目标用户ID
 * @returns 是否有权限访问目标用户的信息
 */
export async function checkFamilyMemberAccess(
  currentUser: User,
  targetUserId: string
): Promise<boolean> {
  // 管理员可以访问所有用户
  if (currentUser.role === 'ADMIN') {
    return true
  }

  // 用户可以访问自己的信息
  if (currentUser.id === targetUserId) {
    return true
  }

  // 家长可以访问同一家庭的学生信息
  if (currentUser.role === 'PARENT' && currentUser.familyId) {
    try {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      })

      if (
        targetUser &&
        targetUser.familyId === currentUser.familyId &&
        targetUser.role === 'STUDENT'
      ) {
        return true
      }
    } catch (error) {
      console.error('Error checking family member access:', error)
    }
  }

  return false
}

/**
 * API限流中间件
 * @param maxRequests 最大请求次数
 * @param windowMs 时间窗口（毫秒）
 * @returns 中间件函数
 */
export function createRateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15分钟
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>()

  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const key = `${ip}_${request.nextUrl.pathname}`

    // 清理过期的记录
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k)
      }
    }

    const requestData = requestCounts.get(key)

    if (!requestData) {
      // 首次请求
      requestCounts.set(key, { count: 1, resetTime: now + windowMs })
      return NextResponse.next()
    }

    if (now > requestData.resetTime) {
      // 重置窗口
      requestCounts.set(key, { count: 1, resetTime: now + windowMs })
      return NextResponse.next()
    }

    if (requestData.count >= maxRequests) {
      // 超过限制
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      )
    }

    // 增加计数
    requestData.count++
    return NextResponse.next()
  }
}

/**
 * CORS中间件
 * @param allowedOrigins 允许的源
 * @returns 中间件函数
 */
export function createCorsMiddleware(
  allowedOrigins: string[] = ['http://localhost:3000']
) {
  return async (request: NextRequest) => {
    const origin = request.headers.get('origin')
    const isAllowed =
      !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, message: 'CORS policy violation' },
        { status: 403 }
      )
    }

    const response = NextResponse.next()

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')

    return response
  }
}
