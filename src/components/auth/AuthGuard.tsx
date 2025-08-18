'use client'

// 认证保护组件
// Authentication guard component

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, UserRole } from '@/types'
import { createPermissionChecker } from '@/lib/auth/permissions'
import { ROLE_PERMISSIONS } from '@/lib/auth/config'

interface AuthGuardProps {
  children: ReactNode
  
  // 认证要求
  requireAuth?: boolean
  requireRole?: UserRole
  requirePermission?: keyof typeof ROLE_PERMISSIONS.ADMIN
  requireAnyRole?: UserRole[]
  
  // 重定向选项
  loginRedirect?: string
  accessDeniedRedirect?: string
  
  // 加载和错误状态
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  
  // 自定义检查
  customCheck?: (user: User) => boolean
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireRole,
  requirePermission,
  requireAnyRole,
  loginRedirect = '/auth/login',
  accessDeniedRedirect = '/dashboard',
  loadingComponent,
  errorComponent,
  customCheck
}: AuthGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // 获取当前用户信息
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(data.data.user)
          } else {
            setError(data.message || '获取用户信息失败')
          }
        } else if (response.status === 401) {
          // 未登录
          setUser(null)
        } else {
          setError('认证服务异常')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setError('网络连接异常')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // 权限检查
  useEffect(() => {
    if (loading) return

    // 如果需要认证但用户未登录
    if (requireAuth && !user) {
      router.push(loginRedirect)
      return
    }

    // 如果不需要认证，直接通过
    if (!requireAuth) return

    // 确保用户存在
    if (!user) return

    const permissionChecker = createPermissionChecker(user)

    // 检查用户是否激活
    if (!user.isActive) {
      setError('账户未激活，请联系管理员')
      return
    }

    // 检查特定角色
    if (requireRole && user.role !== requireRole) {
      router.push(accessDeniedRedirect)
      return
    }

    // 检查任意角色匹配
    if (requireAnyRole && !requireAnyRole.includes(user.role)) {
      router.push(accessDeniedRedirect)
      return
    }

    // 检查特定权限
    if (requirePermission && !permissionChecker.can(requirePermission)) {
      router.push(accessDeniedRedirect)
      return
    }

    // 自定义检查
    if (customCheck && !customCheck(user)) {
      router.push(accessDeniedRedirect)
      return
    }

  }, [
    user, 
    loading, 
    requireAuth, 
    requireRole, 
    requirePermission, 
    requireAnyRole, 
    customCheck,
    router,
    loginRedirect,
    accessDeniedRedirect
  ])

  // 加载状态
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">认证失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 如果需要认证但用户未登录，不渲染内容（会重定向）
  if (requireAuth && !user) {
    return null
  }

  // 权限检查通过，渲染子组件
  return <>{children}</>
}

// 便捷保护组件

// 管理员专用页面保护
export function AdminGuard({ 
  children, 
  loadingComponent, 
  errorComponent 
}: {
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
}) {
  return (
    <AuthGuard
      requireRole="ADMIN"
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
    >
      {children}
    </AuthGuard>
  )
}

// 家长或管理员页面保护
export function ParentOrAdminGuard({ 
  children, 
  loadingComponent, 
  errorComponent 
}: {
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
}) {
  return (
    <AuthGuard
      requireAnyRole={['PARENT', 'ADMIN']}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
    >
      {children}
    </AuthGuard>
  )
}

// 学生专用页面保护
export function StudentGuard({ 
  children, 
  loadingComponent, 
  errorComponent 
}: {
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
}) {
  return (
    <AuthGuard
      requireRole="STUDENT"
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
    >
      {children}
    </AuthGuard>
  )
}

// 基本认证保护（任何登录用户）
export function BasicAuthGuard({ 
  children, 
  loadingComponent, 
  errorComponent 
}: {
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
}) {
  return (
    <AuthGuard
      requireAuth={true}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
    >
      {children}
    </AuthGuard>
  )
}