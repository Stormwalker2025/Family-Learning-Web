'use client'

// 用户管理 Hook
// User management hook

import { useState, useEffect, useCallback } from 'react'
import { User, UserRole, RegisterRequest } from '@/types'

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface UseUsersOptions {
  page?: number
  limit?: number
  role?: UserRole
  familyId?: string
  isActive?: boolean
  search?: string
  autoLoad?: boolean
}

interface UseUsersReturn extends UsersState {
  loadUsers: () => Promise<void>
  createUser: (
    userData: RegisterRequest
  ) => Promise<{ success: boolean; message?: string; user?: User }>
  updateUser: (
    userId: string,
    userData: Partial<User>
  ) => Promise<{ success: boolean; message?: string }>
  deleteUser: (
    userId: string
  ) => Promise<{ success: boolean; message?: string }>
  resetPassword: (
    userId: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>
  clearError: () => void
  refresh: () => Promise<void>
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    page = 1,
    limit = 20,
    role,
    familyId,
    isActive,
    search,
    autoLoad = true,
  } = options

  const [state, setState] = useState<UsersState>({
    users: [],
    loading: false,
    error: null,
  })

  // 构建查询参数
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())

    if (role) params.set('role', role)
    if (familyId) params.set('familyId', familyId)
    if (isActive !== undefined) params.set('isActive', isActive.toString())
    if (search) params.set('search', search)

    return params.toString()
  }, [page, limit, role, familyId, isActive, search])

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const queryParams = buildQueryParams()
      const response = await fetch(`/api/users?${queryParams}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setState(prev => ({
            ...prev,
            users: data.data.users,
            pagination: data.data.pagination,
            loading: false,
            error: null,
          }))
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: data.message || '获取用户列表失败',
          }))
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `请求失败: ${response.status} ${response.statusText}`,
        }))
      }
    } catch (error) {
      console.error('Load users error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: '网络连接异常',
      }))
    }
  }, [buildQueryParams])

  // 创建用户
  const createUser = useCallback(
    async (userData: RegisterRequest) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        if (data.success) {
          // 刷新用户列表
          await loadUsers()
          return { success: true, message: data.message, user: data.user }
        } else {
          return { success: false, message: data.message || '创建用户失败' }
        }
      } catch (error) {
        console.error('Create user error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },
    [loadUsers]
  )

  // 更新用户
  const updateUser = useCallback(
    async (userId: string, userData: Partial<User>) => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        if (data.success) {
          // 更新本地状态
          setState(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user.id === userId ? { ...user, ...data.data.user } : user
            ),
          }))
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message || '更新用户失败' }
        }
      } catch (error) {
        console.error('Update user error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },
    []
  )

  // 删除用户
  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // 从本地状态中移除用户
        setState(prev => ({
          ...prev,
          users: prev.users.filter(user => user.id !== userId),
        }))
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || '删除用户失败' }
      }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    }
  }, [])

  // 重置密码
  const resetPassword = useCallback(
    async (userId: string, newPassword: string) => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            newPassword,
            confirmPassword: newPassword,
          }),
        })

        const data = await response.json()

        if (data.success) {
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message || '重置密码失败' }
        }
      } catch (error) {
        console.error('Reset password error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },
    []
  )

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 刷新（重新加载）
  const refresh = useCallback(async () => {
    await loadUsers()
  }, [loadUsers])

  // 自动加载
  useEffect(() => {
    if (autoLoad) {
      loadUsers()
    }
  }, [loadUsers, autoLoad])

  return {
    ...state,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    clearError,
    refresh,
  }
}

// 单个用户管理 Hook
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${userId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
        } else {
          setError(data.message || '获取用户信息失败')
        }
      } else {
        setError(`请求失败: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Load user error:', error)
      setError('网络连接异常')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!userId) return { success: false, message: '用户ID无效' }

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        if (data.success) {
          setUser(data.data.user)
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message || '更新用户失败' }
        }
      } catch (error) {
        console.error('Update user error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },
    [userId]
  )

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return {
    user,
    loading,
    error,
    loadUser,
    updateUser,
    clearError: () => setError(null),
  }
}

// 家庭成员管理 Hook
export function useFamilyMembers(familyId?: string) {
  return useUsers({
    familyId,
    autoLoad: !!familyId,
  })
}
