// 家庭管理API
// Family management API endpoints

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { FAMILY_CONFIG } from '@/lib/auth/config'

// 创建家庭请求验证模式
const createFamilySchema = z.object({
  name: z.string().min(1, '家庭名称不能为空').max(100, '家庭名称不能超过100个字符'),
  timezone: z.string().optional().default(FAMILY_CONFIG.defaultTimezone)
})

/**
 * GET /api/families
 * 获取家庭列表
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

    // 构建查询条件
    let where = {}
    
    if (currentUser.role === 'ADMIN') {
      // 管理员可以查看所有家庭
    } else if (currentUser.role === 'PARENT') {
      // 家长只能查看自己的家庭
      if (currentUser.familyId) {
        where = { id: currentUser.familyId }
      } else {
        // 如果家长没有家庭，返回空列表
        return NextResponse.json({
          success: true,
          data: { families: [] }
        })
      }
    } else {
      // 学生只能查看自己的家庭
      if (currentUser.familyId) {
        where = { id: currentUser.familyId }
      } else {
        return NextResponse.json({
          success: true,
          data: { families: [] }
        })
      }
    }

    // 查询家庭信息
    const families = await prisma.family.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            isActive: true,
            yearLevel: true,
            lastLoginAt: true
          },
          orderBy: [
            { role: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: { families }
    })

  } catch (error) {
    console.error('Get families error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取家庭列表失败'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/families
 * 创建新家庭（仅管理员）
 */
export async function POST(request: NextRequest) {
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
    if (!permissionChecker.canManageUsers()) {
      return NextResponse.json(
        { success: false, message: '权限不足，只有管理员可以创建家庭' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 验证请求数据
    const validation = createFamilySchema.safeParse(body)
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

    const { name, timezone } = validation.data

    // 检查家庭名称唯一性
    const existingFamily = await prisma.family.findFirst({
      where: { name }
    })

    if (existingFamily) {
      return NextResponse.json(
        { success: false, message: '家庭名称已存在' },
        { status: 400 }
      )
    }

    // 验证时区
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
    } catch (error) {
      return NextResponse.json(
        { success: false, message: '无效的时区设置' },
        { status: 400 }
      )
    }

    // 创建家庭
    const newFamily = await prisma.family.create({
      data: {
        name,
        timezone
      }
    })

    // 记录创建活动
    try {
      await prisma.activityLog.create({
        data: {
          userId: currentUser.id,
          action: 'CREATE_CONTENT',
          details: JSON.stringify({
            action: 'create_family',
            familyId: newFamily.id,
            familyName: name,
            timestamp: new Date().toISOString()
          }),
          resourceType: 'Family',
          resourceId: newFamily.id,
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
    } catch (logError) {
      console.error('Failed to log family creation:', logError)
    }

    return NextResponse.json({
      success: true,
      message: '家庭创建成功',
      data: { family: newFamily }
    })

  } catch (error) {
    console.error('Create family error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '创建家庭失败'
      },
      { status: 500 }
    )
  }
}