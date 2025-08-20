// 用户管理API
// User management API endpoints

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { UserRole } from '@/types'

// 用户查询参数验证
const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  role: z.enum(['STUDENT', 'PARENT', 'ADMIN']).optional(),
  familyId: z.string().cuid().optional(),
  isActive: z
    .string()
    .transform(v => v === 'true')
    .optional(),
  search: z.string().optional(),
})

/**
 * GET /api/users
 * 获取用户列表（管理员和家长可用）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const { user: currentUser, error } = await extractUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: error || '未授权访问' },
        { status: 401 }
      )
    }

    const permissionChecker = createPermissionChecker(currentUser)

    // 解析查询参数
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    const validation = getUsersQuerySchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: '查询参数格式错误',
          errors: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const {
      page = 1,
      limit = 20,
      role,
      familyId,
      isActive,
      search,
    } = validation.data

    // 构建查询条件
    const where: any = {}

    // 权限过滤
    if (currentUser.role === 'ADMIN') {
      // 管理员可以查看所有用户
    } else if (currentUser.role === 'PARENT') {
      // 家长只能查看同一家庭的用户
      if (!currentUser.familyId) {
        return NextResponse.json(
          { success: false, message: '家长用户必须属于一个家庭' },
          { status: 400 }
        )
      }
      where.familyId = currentUser.familyId
    } else {
      // 学生只能查看自己
      where.id = currentUser.id
    }

    // 添加过滤条件
    if (role) where.role = role
    if (familyId && currentUser.role === 'ADMIN') where.familyId = familyId
    if (isActive !== undefined) where.isActive = isActive

    // 搜索条件
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 分页计算
    const skip = (page - 1) * limit

    // 查询用户
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
          timezone: true,
          yearLevel: true,
          birthYear: true,
          familyId: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取用户列表失败',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * 创建新用户（重定向到注册API）
 */
export async function POST(request: NextRequest) {
  // 重定向到注册API
  return NextResponse.redirect(new URL('/api/auth/register', request.url))
}
