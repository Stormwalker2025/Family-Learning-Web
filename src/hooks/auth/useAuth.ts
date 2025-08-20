'use client'

// 认证状态管理 Hook
// Authentication state management hook

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginRequest, LoginResponse } from '@/types'
import { createPermissionChecker } from '@/lib/auth/permissions'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  login: (
    credentials: LoginRequest
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

interface UseAuthReturn extends AuthState, AuthActions {
  permissions: ReturnType<typeof createPermissionChecker> | null
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  })

  // 权限检查器
  const permissions = state.user ? createPermissionChecker(state.user) : null

  // 获取当前用户信息
  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/me')

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setState(prev => ({
            ...prev,
            user: data.data.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          }))
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            loading: false,
            error: data.message || '获取用户信息失败',
          }))
        }
      } else if (response.status === 401) {
        // 未登录
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }))
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: '认证服务异常',
        }))
      }
    } catch (error) {
      console.error('Auth refresh error:', error)
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: '网络连接异常',
      }))
    }
  }, [])

  // 登录
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data: LoginResponse = await response.json()

      if (data.success && data.user) {
        setState(prev => ({
          ...prev,
          user: data.user!,
          isAuthenticated: true,
          loading: false,
          error: null,
        }))

        return { success: true, message: data.message }
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: data.message || '登录失败',
        }))

        return { success: false, message: data.message || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = '网络错误，请稍后重试'

      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      }))

      return { success: false, message: errorMessage }
    }
  }, [])

  // 登出
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })

      // 重定向到登录页
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出错也清除本地状态
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })

      router.push('/auth/login')
    }
  }, [router])

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 初始化时获取用户信息
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // 监听存储变化（多标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_logout') {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 定期刷新用户信息（检查会话是否过期）
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(
      () => {
        refreshUser()
      },
      5 * 60 * 1000
    ) // 每5分钟检查一次

    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshUser])

  return {
    ...state,
    permissions,
    login,
    logout,
    refreshUser,
    clearError,
  }
}

// 权限检查 Hook
export function usePermissions(user: User | null) {
  return user ? createPermissionChecker(user) : null
}

// 角色检查 Hooks
export function useIsAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN' || false
}

export function useIsParent(user: User | null): boolean {
  return user?.role === 'PARENT' || false
}

export function useIsStudent(user: User | null): boolean {
  return user?.role === 'STUDENT' || false
}

export function useIsParentOrAdmin(user: User | null): boolean {
  return (user?.role === 'PARENT' || user?.role === 'ADMIN') ?? false
}

// 登录状态检查 Hook
export function useRequireAuth() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

  return { user, loading, isAuthenticated }
}

// 角色权限保护 Hook
export function useRequireRole(requiredRole: 'ADMIN' | 'PARENT' | 'STUDENT') {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user && user.role !== requiredRole) {
        router.push('/dashboard')
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router])

  return {
    user,
    loading,
    isAuthenticated,
    hasRole: user?.role === requiredRole,
  }
}
