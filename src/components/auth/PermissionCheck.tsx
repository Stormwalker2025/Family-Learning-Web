'use client'

// 权限检查组件
// Permission check component

import { ReactNode } from 'react'
import { User, UserRole } from '@/types'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { ROLE_PERMISSIONS } from '@/lib/auth/config'

interface PermissionCheckProps {
  user: User | null
  children: ReactNode
  fallback?: ReactNode

  // 权限检查选项
  requireAuth?: boolean
  requireRole?: UserRole
  requirePermission?: keyof typeof ROLE_PERMISSIONS.ADMIN
  requireAnyRole?: UserRole[]
  requireAnyPermission?: Array<keyof typeof ROLE_PERMISSIONS.ADMIN>

  // 自定义检查函数
  customCheck?: (user: User) => boolean

  // 显示选项
  showFallback?: boolean
  hideWhenNoAccess?: boolean
}

export default function PermissionCheck({
  user,
  children,
  fallback,
  requireAuth = true,
  requireRole,
  requirePermission,
  requireAnyRole,
  requireAnyPermission,
  customCheck,
  showFallback = true,
  hideWhenNoAccess = false,
}: PermissionCheckProps) {
  // 如果需要认证但用户未登录
  if (requireAuth && !user) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        请先登录以查看此内容
      </div>
    )
  }

  // 如果用户未登录但不需要认证，直接显示内容
  if (!user && !requireAuth) {
    return <>{children}</>
  }

  // 确保用户存在（TypeScript 类型保护）
  if (!user) return null

  const permissionChecker = createPermissionChecker(user)

  // 检查特定角色
  if (requireRole && user.role !== requireRole) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        权限不足：需要 {requireRole} 角色
      </div>
    )
  }

  // 检查任意角色匹配
  if (requireAnyRole && !requireAnyRole.includes(user.role)) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        权限不足：需要以下角色之一：{requireAnyRole.join(', ')}
      </div>
    )
  }

  // 检查特定权限
  if (requirePermission && !permissionChecker.can(requirePermission)) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        权限不足：缺少 {requirePermission} 权限
      </div>
    )
  }

  // 检查任意权限匹配
  if (requireAnyPermission) {
    const hasAnyPermission = requireAnyPermission.some(permission =>
      permissionChecker.can(permission)
    )

    if (!hasAnyPermission) {
      if (hideWhenNoAccess) return null
      if (showFallback && fallback) return <>{fallback}</>
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          权限不足：需要以下权限之一：{requireAnyPermission.join(', ')}
        </div>
      )
    }
  }

  // 自定义检查
  if (customCheck && !customCheck(user)) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        权限不足：未通过自定义权限检查
      </div>
    )
  }

  // 检查用户是否激活
  if (!user.isActive) {
    if (hideWhenNoAccess) return null
    if (showFallback && fallback) return <>{fallback}</>
    return (
      <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-md">
        账户未激活，请联系管理员
      </div>
    )
  }

  // 所有检查通过，显示内容
  return <>{children}</>
}

// 便捷组件：仅管理员可见
export function AdminOnly({
  user,
  children,
  fallback,
  hideWhenNoAccess = false,
}: {
  user: User | null
  children: ReactNode
  fallback?: ReactNode
  hideWhenNoAccess?: boolean
}) {
  return (
    <PermissionCheck
      user={user}
      requireRole="ADMIN"
      hideWhenNoAccess={hideWhenNoAccess}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  )
}

// 便捷组件：家长和管理员可见
export function ParentOrAdminOnly({
  user,
  children,
  fallback,
  hideWhenNoAccess = false,
}: {
  user: User | null
  children: ReactNode
  fallback?: ReactNode
  hideWhenNoAccess?: boolean
}) {
  return (
    <PermissionCheck
      user={user}
      requireAnyRole={['PARENT', 'ADMIN']}
      hideWhenNoAccess={hideWhenNoAccess}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  )
}

// 便捷组件：学生专用
export function StudentOnly({
  user,
  children,
  fallback,
  hideWhenNoAccess = false,
}: {
  user: User | null
  children: ReactNode
  fallback?: ReactNode
  hideWhenNoAccess?: boolean
}) {
  return (
    <PermissionCheck
      user={user}
      requireRole="STUDENT"
      hideWhenNoAccess={hideWhenNoAccess}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  )
}

// 便捷组件：需要特定权限
export function RequirePermission({
  user,
  permission,
  children,
  fallback,
  hideWhenNoAccess = false,
}: {
  user: User | null
  permission: keyof typeof ROLE_PERMISSIONS.ADMIN
  children: ReactNode
  fallback?: ReactNode
  hideWhenNoAccess?: boolean
}) {
  return (
    <PermissionCheck
      user={user}
      requirePermission={permission}
      hideWhenNoAccess={hideWhenNoAccess}
      fallback={fallback}
    >
      {children}
    </PermissionCheck>
  )
}
