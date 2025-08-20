'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tablet,
  Clock,
  Trophy,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
  Gift,
  Lock,
  Unlock,
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { IpadUnlockStatus, IpadUnlockRecord } from '@/types'

interface IpadUnlockDashboardProps {
  userId?: string
  isParentView?: boolean
}

export default function IpadUnlockDashboard({
  userId,
  isParentView = false,
}: IpadUnlockDashboardProps) {
  const { user } = useAuth()
  const [unlockStatus, setUnlockStatus] = useState<IpadUnlockStatus | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (targetUserId) {
      fetchUnlockStatus()
    }
  }, [targetUserId])

  const fetchUnlockStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/ipad-unlock?action=status&userId=${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUnlockStatus(data.data)
      }
    } catch (error) {
      console.error('获取iPad解锁状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 使用iPad时间
  const handleUseTime = async (minutes: number) => {
    try {
      const response = await fetch('/api/ipad-unlock/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: targetUserId,
          minutes,
        }),
      })

      if (response.ok) {
        fetchUnlockStatus() // 刷新状态
        alert(`已使用${minutes}分钟iPad时间`)
      }
    } catch (error) {
      console.error('使用iPad时间失败:', error)
    }
  }

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return '已过期'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}小时${minutes}分钟后过期`
    }
    return `${minutes}分钟后过期`
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      ENGLISH: 'bg-blue-100 text-blue-800',
      MATHS: 'bg-green-100 text-green-800',
      HASS: 'bg-purple-100 text-purple-800',
      VOCABULARY: 'bg-orange-100 text-orange-800',
    }
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!unlockStatus) {
    return (
      <Card className="p-8 text-center">
        <Tablet size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          无法加载iPad解锁状态
        </h3>
        <p className="text-gray-600">请稍后重试或联系管理员。</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 当前可用时间 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Unlock className="h-6 w-6 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-800">可用</Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {unlockStatus.currentUnlockedMinutes}
            </p>
            <p className="text-sm text-gray-600">分钟可用</p>
          </div>
        </Card>

        {/* 本周获得 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-800">本周</Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {unlockStatus.totalEarnedMinutes}
            </p>
            <p className="text-sm text-gray-600">分钟获得</p>
          </div>
        </Card>

        {/* 本周已用 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {unlockStatus.totalUsedMinutes}
            </p>
            <p className="text-sm text-gray-600">分钟已用</p>
          </div>
        </Card>

        {/* 使用率 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {unlockStatus.totalEarnedMinutes > 0
                ? Math.round(
                    (unlockStatus.totalUsedMinutes /
                      unlockStatus.totalEarnedMinutes) *
                      100
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600">使用率</p>
          </div>
        </Card>
      </div>

      {/* 活跃解锁记录 */}
      {unlockStatus.activeUnlocks.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift size={20} />
            当前可用的iPad时间
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockStatus.activeUnlocks.map(unlock => (
              <Card
                key={unlock.id}
                className="p-4 bg-green-50 border-green-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-green-900">
                      {unlock.unlockedMinutes} 分钟
                    </p>
                    <p className="text-sm text-green-700">
                      获得分数: {unlock.achievedScore}%
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {Object.keys(JSON.parse(unlock.subjectScores as any))[0]}
                  </Badge>
                </div>

                <p className="text-xs text-green-600 mb-3">
                  {formatTimeRemaining(unlock.expiresAt.toString())}
                </p>

                {!isParentView && (
                  <Button
                    size="sm"
                    onClick={() => handleUseTime(unlock.unlockedMinutes)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Tablet size={14} className="mr-2" />
                    使用这{unlock.unlockedMinutes}分钟
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* 下次解锁目标 */}
      {unlockStatus.nextUnlockRequirements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            下次解锁目标
          </h3>

          <div className="space-y-4">
            {unlockStatus.nextUnlockRequirements.map((requirement, index) => (
              <Card key={index} className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getSubjectColor(requirement.subject)}>
                      {requirement.subject}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      可获得 {requirement.potentialMinutes} 分钟
                    </span>
                  </div>
                  <Lock size={16} className="text-gray-400" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>当前分数: {requirement.currentScore}%</span>
                    <span>目标分数: {requirement.requiredScore}%</span>
                  </div>

                  <Progress
                    value={
                      (requirement.currentScore / requirement.requiredScore) *
                      100
                    }
                    className="h-2"
                  />

                  <p className="text-xs text-gray-500">
                    还需要{' '}
                    {requirement.requiredScore - requirement.currentScore}%
                    就可以解锁 {requirement.potentialMinutes} 分钟iPad时间
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* 最近成就 */}
      {unlockStatus.recentAchievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} />
            最近成就
          </h3>

          <div className="space-y-3">
            {unlockStatus.recentAchievements.slice(0, 5).map(achievement => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      获得 {achievement.unlockedMinutes} 分钟iPad时间
                    </p>
                    <p className="text-sm text-yellow-700">
                      {Object.entries(
                        JSON.parse(achievement.subjectScores as any)
                      )
                        .map(([subject, score]) => `${subject}: ${score}%`)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-yellow-600">
                    {new Date(achievement.unlockedAt).toLocaleDateString(
                      'zh-CN'
                    )}
                  </p>
                  <Badge
                    className={
                      achievement.used
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-600'
                    }
                  >
                    {achievement.used ? '已使用' : '未使用'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 空状态 */}
      {unlockStatus.currentUnlockedMinutes === 0 &&
        unlockStatus.recentAchievements.length === 0 && (
          <Card className="p-8 text-center">
            <Tablet size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有iPad时间
            </h3>
            <p className="text-gray-600 mb-4">
              完成作业和练习，获得好成绩来解锁iPad使用时间！
            </p>
            <Button onClick={fetchUnlockStatus}>刷新状态</Button>
          </Card>
        )}
    </div>
  )
}
