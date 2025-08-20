'use client'

// 用户信息展示组件
// User information display component

import { useState } from 'react'
import { User, UserRole } from '@/types'

interface UserInfoProps {
  user: User
  showDetails?: boolean
  showActions?: boolean
  onEdit?: () => void
  onResetPassword?: () => void
  className?: string
}

const roleColors: Record<UserRole, string> = {
  STUDENT: 'bg-blue-100 text-blue-800',
  PARENT: 'bg-green-100 text-green-800',
  ADMIN: 'bg-red-100 text-red-800',
}

const roleNames: Record<UserRole, string> = {
  STUDENT: '学生',
  PARENT: '家长',
  ADMIN: '管理员',
}

export default function UserInfo({
  user,
  showDetails = true,
  showActions = false,
  onEdit,
  onResetPassword,
  className = '',
}: UserInfoProps) {
  const [showFullInfo, setShowFullInfo] = useState(false)

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '从未'
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAge = (birthYear?: number) => {
    if (!birthYear) return null
    return new Date().getFullYear() - birthYear
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
    >
      {/* 基本信息 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {/* 头像 */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.displayName.charAt(0)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {user.displayName}
            </h3>
            <p className="text-gray-600 text-sm">@{user.username}</p>

            {/* 角色标签 */}
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}
              >
                {roleNames[user.role]}
              </span>

              {!user.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  未激活
                </span>
              )}

              {user.role === 'STUDENT' && user.yearLevel && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Year {user.yearLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                编辑
              </button>
            )}
            {onResetPassword && (
              <button
                onClick={onResetPassword}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                重置密码
              </button>
            )}
          </div>
        )}
      </div>

      {/* 详细信息 */}
      {showDetails && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {user.email && (
              <div>
                <span className="font-medium text-gray-700">邮箱:</span>
                <span className="ml-2 text-gray-600">{user.email}</span>
              </div>
            )}

            {user.birthYear && (
              <div>
                <span className="font-medium text-gray-700">年龄:</span>
                <span className="ml-2 text-gray-600">
                  {getAge(user.birthYear)} 岁
                </span>
              </div>
            )}

            <div>
              <span className="font-medium text-gray-700">创建时间:</span>
              <span className="ml-2 text-gray-600">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">最后登录:</span>
              <span className="ml-2 text-gray-600">
                {formatDate(user.lastLoginAt)}
              </span>
            </div>

            {user.timezone && (
              <div>
                <span className="font-medium text-gray-700">时区:</span>
                <span className="ml-2 text-gray-600">{user.timezone}</span>
              </div>
            )}

            {user.parentalCode && (
              <div>
                <span className="font-medium text-gray-700">家长监督码:</span>
                <span className="ml-2 text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {showFullInfo ? user.parentalCode : '••••••'}
                </span>
                <button
                  onClick={() => setShowFullInfo(!showFullInfo)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                >
                  {showFullInfo ? '隐藏' : '显示'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 状态指示器 */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
            ></div>
            <span className="text-xs text-gray-600">
              {user.isActive ? '活跃' : '未激活'}
            </span>
          </div>

          {user.lastLoginAt && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">
                最近活动: {formatDate(user.lastLoginAt)}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">ID: {user.id.slice(-8)}</div>
      </div>
    </div>
  )
}
