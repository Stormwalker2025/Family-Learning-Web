// 权限检查工具函数
// Permission checking utilities

import { User, UserRole } from '@/types'
import { ROLE_PERMISSIONS } from './config'

/**
 * 权限检查器类
 */
export class PermissionChecker {
  constructor(private user: User) {}

  /**
   * 检查是否有特定权限
   */
  can(permission: keyof typeof ROLE_PERMISSIONS.ADMIN): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.user.role]
    return rolePermissions?.[permission] === true
  }

  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    return this.user.role === 'ADMIN'
  }

  /**
   * 检查是否为家长
   */
  isParent(): boolean {
    return this.user.role === 'PARENT'
  }

  /**
   * 检查是否为学生
   */
  isStudent(): boolean {
    return this.user.role === 'STUDENT'
  }

  /**
   * 检查是否为家长或管理员
   */
  isParentOrAdmin(): boolean {
    return this.isParent() || this.isAdmin()
  }

  /**
   * 检查是否可以管理用户
   */
  canManageUsers(): boolean {
    return this.can('canManageUsers')
  }

  /**
   * 检查是否可以创建内容
   */
  canCreateContent(): boolean {
    return this.can('canCreateContent')
  }

  /**
   * 检查是否可以编辑内容
   */
  canEditContent(): boolean {
    return this.can('canEditContent')
  }

  /**
   * 检查是否可以删除内容
   */
  canDeleteContent(): boolean {
    return this.can('canDeleteContent')
  }

  /**
   * 检查是否可以查看其他用户的进度
   */
  canViewChildrenProgress(): boolean {
    return this.can('canViewChildrenProgress')
  }

  /**
   * 检查是否可以分配作业
   */
  canAssignHomework(): boolean {
    return this.can('canAssignHomework')
  }

  /**
   * 检查是否可以管理解锁规则
   */
  canManageUnlockRules(): boolean {
    return this.can('canManageUnlockRules')
  }

  /**
   * 检查是否可以查看系统日志
   */
  canViewSystemLogs(): boolean {
    return this.can('canViewSystemLogs')
  }

  /**
   * 检查是否可以访问特定用户的数据
   */
  canAccessUserData(targetUserId: string, targetUserFamilyId?: string): boolean {
    // 用户总是可以访问自己的数据
    if (this.user.id === targetUserId) {
      return true
    }

    // 管理员可以访问所有用户数据
    if (this.isAdmin()) {
      return true
    }

    // 家长可以访问同一家庭成员的数据
    if (this.isParent() && this.user.familyId && targetUserFamilyId) {
      return this.user.familyId === targetUserFamilyId
    }

    return false
  }

  /**
   * 检查是否可以修改特定用户的数据
   */
  canModifyUserData(targetUserId: string, targetUserRole: UserRole): boolean {
    // 用户可以修改自己的基本信息
    if (this.user.id === targetUserId) {
      return true
    }

    // 管理员可以修改所有用户
    if (this.isAdmin()) {
      return true
    }

    // 家长可以修改同一家庭学生的某些信息
    if (this.isParent() && targetUserRole === 'STUDENT') {
      return this.canAccessUserData(targetUserId)
    }

    return false
  }

  /**
   * 检查是否可以删除用户
   */
  canDeleteUser(targetUserRole: UserRole): boolean {
    // 只有管理员可以删除用户
    if (!this.isAdmin()) {
      return false
    }

    // 管理员不能删除其他管理员（防止误操作）
    if (targetUserRole === 'ADMIN') {
      return false
    }

    return true
  }

  /**
   * 检查是否可以更改用户角色
   */
  canChangeUserRole(targetUserId: string, newRole: UserRole): boolean {
    // 只有管理员可以更改角色
    if (!this.isAdmin()) {
      return false
    }

    // 不能更改自己的角色（防止锁定）
    if (this.user.id === targetUserId) {
      return false
    }

    return true
  }

  /**
   * 检查是否可以重置密码
   */
  canResetPassword(targetUserId: string): boolean {
    // 用户可以重置自己的密码
    if (this.user.id === targetUserId) {
      return true
    }

    // 管理员可以重置任何用户的密码
    if (this.isAdmin()) {
      return true
    }

    // 家长可以重置同一家庭学生的密码
    if (this.isParent()) {
      return this.canAccessUserData(targetUserId)
    }

    return false
  }
}

/**
 * 创建权限检查器实例
 */
export function createPermissionChecker(user: User): PermissionChecker {
  return new PermissionChecker(user)
}

/**
 * 快速权限检查函数
 */
export function hasPermission(
  user: User,
  permission: keyof typeof ROLE_PERMISSIONS.ADMIN
): boolean {
  return createPermissionChecker(user).can(permission)
}

/**
 * 年级权限检查
 */
export function canAccessYearLevel(user: User, yearLevel: number): boolean {
  // 管理员可以访问所有年级
  if (user.role === 'ADMIN') {
    return true
  }

  // 家长可以访问家庭中学生的年级
  if (user.role === 'PARENT') {
    return true // 需要在具体实现中检查家庭成员的年级
  }

  // 学生只能访问自己的年级内容
  if (user.role === 'STUDENT') {
    return user.yearLevel === yearLevel
  }

  return false
}

/**
 * 时间限制权限检查
 */
export function canAccessAtTime(user: User, currentTime: Date): boolean {
  // 管理员和家长没有时间限制
  if (user.role === 'ADMIN' || user.role === 'PARENT') {
    return true
  }

  // 学生的时间限制可以在这里实现
  // 例如：学习时间段限制、iPad使用时间等
  const hour = currentTime.getHours()
  
  // 假设学生只能在 6:00-22:00 之间使用系统
  if (user.role === 'STUDENT') {
    return hour >= 6 && hour < 22
  }

  return true
}

/**
 * 内容类型权限检查
 */
export function canAccessContentType(
  user: User,
  contentType: 'exercise' | 'homework' | 'vocabulary' | 'admin'
): boolean {
  const checker = createPermissionChecker(user)

  switch (contentType) {
    case 'exercise':
      return true // 所有认证用户都可以访问练习
    case 'homework':
      return checker.can('canAccessHomework')
    case 'vocabulary':
      return checker.can('canViewVocabulary')
    case 'admin':
      return checker.isAdmin()
    default:
      return false
  }
}

/**
 * API端点权限映射
 */
export const API_PERMISSIONS = {
  '/api/auth/login': null, // 公开端点
  '/api/auth/register': 'canManageUsers',
  '/api/auth/logout': null, // 已认证用户都可以
  '/api/users': 'canManageUsers',
  '/api/users/[id]': null, // 需要特殊检查
  '/api/exercises': null, // 已认证用户都可以查看
  '/api/exercises/create': 'canCreateContent',
  '/api/homework': 'canAccessHomework',
  '/api/homework/assign': 'canAssignHomework',
  '/api/admin': 'canManageSystem',
  '/api/vocabulary': 'canViewVocabulary'
} as const

/**
 * 检查API端点权限
 */
export function checkApiPermission(
  user: User,
  endpoint: string,
  method: string = 'GET'
): boolean {
  const checker = createPermissionChecker(user)
  
  // 特殊处理某些端点
  if (endpoint.startsWith('/api/users/') && method === 'GET') {
    const userId = endpoint.split('/').pop()
    return userId ? checker.canAccessUserData(userId) : false
  }

  // 检查通用权限
  const permission = API_PERMISSIONS[endpoint as keyof typeof API_PERMISSIONS]
  
  if (permission === null) {
    return true // 公开或需要特殊检查的端点
  }

  if (permission === undefined) {
    return false // 未定义的端点，拒绝访问
  }

  return checker.can(permission as keyof typeof ROLE_PERMISSIONS.ADMIN)
}