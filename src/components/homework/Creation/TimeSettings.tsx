'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  HomeworkAssignmentConfig,
  NotificationConfig,
  NotificationType,
} from '@/types'

interface TimeSettingsProps {
  assignment: Partial<HomeworkAssignmentConfig>
  onUpdate: (updates: Partial<HomeworkAssignmentConfig>) => void
}

export default function TimeSettings({
  assignment,
  onUpdate,
}: TimeSettingsProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [newNotification, setNewNotification] = useState<
    Partial<NotificationConfig>
  >({
    type: 'homework-assigned',
    enabled: true,
    timing: 24,
    recipients: ['STUDENT'],
    message: '',
  })

  // 格式化日期时间输入
  const formatDateTimeLocal = (date?: Date): string => {
    if (!date) return ''
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  const parseDateTimeLocal = (value: string): Date | undefined => {
    if (!value) return undefined
    return new Date(value)
  }

  // 添加通知配置
  const addNotification = () => {
    if (!newNotification.type) return

    const notifications = [...(assignment.notifications || [])]
    notifications.push({
      type: newNotification.type,
      enabled: newNotification.enabled || true,
      timing: newNotification.timing,
      recipients: newNotification.recipients || ['STUDENT'],
      message: newNotification.message,
    })

    onUpdate({ notifications })
    setNewNotification({
      type: 'homework-assigned',
      enabled: true,
      timing: 24,
      recipients: ['STUDENT'],
      message: '',
    })
    setShowNotificationModal(false)
  }

  // 删除通知配置
  const removeNotification = (index: number) => {
    const notifications = [...(assignment.notifications || [])]
    notifications.splice(index, 1)
    onUpdate({ notifications })
  }

  // 更新通知配置
  const updateNotification = (
    index: number,
    updates: Partial<NotificationConfig>
  ) => {
    const notifications = [...(assignment.notifications || [])]
    notifications[index] = { ...notifications[index], ...updates }
    onUpdate({ notifications })
  }

  // 获取通知类型的显示名称
  const getNotificationTypeName = (type: NotificationType): string => {
    switch (type) {
      case 'homework-assigned':
        return '作业分配通知'
      case 'homework-due':
        return '截止日期提醒'
      case 'homework-completed':
        return '完成通知'
      case 'homework-graded':
        return '批改完成通知'
      case 'reminder':
        return '自定义提醒'
      default:
        return type
    }
  }

  // 获取通知类型的图标
  const getNotificationTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'homework-assigned':
        return <Bell size={16} />
      case 'homework-due':
        return <AlertTriangle size={16} />
      case 'homework-completed':
        return <CheckCircle size={16} />
      case 'homework-graded':
        return <CheckCircle size={16} />
      case 'reminder':
        return <Clock size={16} />
      default:
        return <Bell size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* 基本时间设置 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          时间设置
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="dueDate" className="text-base font-medium">
              截止日期
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formatDateTimeLocal(assignment.dueDate)}
              onChange={e =>
                onUpdate({
                  dueDate: parseDateTimeLocal(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">留空表示无截止时间限制</p>
          </div>

          <div>
            <Label htmlFor="releaseDate" className="text-base font-medium">
              发布时间
            </Label>
            <Input
              id="releaseDate"
              type="datetime-local"
              value={formatDateTimeLocal(assignment.releaseDate)}
              onChange={e =>
                onUpdate({
                  releaseDate: parseDateTimeLocal(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">留空表示立即发布</p>
          </div>

          <div>
            <Label htmlFor="estimatedTime" className="text-base font-medium">
              预估完成时间 (分钟)
            </Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              max="600"
              value={assignment.estimatedTime || ''}
              onChange={e =>
                onUpdate({
                  estimatedTime: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="60"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="passingScore" className="text-base font-medium">
              及格分数
            </Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max={assignment.totalPoints || 100}
              value={assignment.passingScore || ''}
              onChange={e =>
                onUpdate({
                  passingScore: e.target.value ? parseInt(e.target.value) : 70,
                })
              }
              placeholder="70"
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* 提交设置 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          提交设置
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoRelease"
              checked={assignment.autoRelease ?? true}
              onChange={e => onUpdate({ autoRelease: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="autoRelease" className="text-base">
              自动发布作业
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowMultipleAttempts"
              checked={assignment.allowMultipleAttempts ?? true}
              onChange={e =>
                onUpdate({ allowMultipleAttempts: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="allowMultipleAttempts" className="text-base">
              允许多次尝试
            </Label>
          </div>

          {assignment.allowMultipleAttempts && (
            <div className="ml-6">
              <Label htmlFor="maxAttempts" className="text-sm text-gray-600">
                最大尝试次数 (留空表示无限制)
              </Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                max="10"
                value={assignment.maxAttempts || ''}
                onChange={e =>
                  onUpdate({
                    maxAttempts: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="无限制"
                className="mt-1 w-48"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lateSubmissionAllowed"
              checked={assignment.lateSubmissionAllowed ?? true}
              onChange={e =>
                onUpdate({ lateSubmissionAllowed: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="lateSubmissionAllowed" className="text-base">
              允许逾期提交
            </Label>
          </div>

          {assignment.lateSubmissionAllowed && (
            <div className="ml-6">
              <Label htmlFor="latePenalty" className="text-sm text-gray-600">
                逾期扣分比例 (%)
              </Label>
              <Input
                id="latePenalty"
                type="number"
                min="0"
                max="100"
                value={assignment.latePenalty || ''}
                onChange={e =>
                  onUpdate({
                    latePenalty: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="0"
                className="mt-1 w-48"
              />
            </div>
          )}
        </div>
      </Card>

      {/* 通知设置 */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={20} />
            通知设置
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotificationModal(true)}
          >
            <Plus size={16} className="mr-2" />
            添加通知
          </Button>
        </div>

        {assignment.notifications && assignment.notifications.length > 0 ? (
          <div className="space-y-3">
            {assignment.notifications.map((notification, index) => (
              <Card key={index} className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getNotificationTypeIcon(notification.type)}
                      <span className="font-medium">
                        {getNotificationTypeName(notification.type)}
                      </span>
                      <Badge
                        variant={notification.enabled ? 'default' : 'secondary'}
                      >
                        {notification.enabled ? '启用' : '禁用'}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {notification.timing && (
                        <div>提前 {notification.timing} 小时通知</div>
                      )}
                      <div>通知对象: {notification.recipients.join(', ')}</div>
                      {notification.message && (
                        <div>自定义消息: {notification.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateNotification(index, {
                          enabled: !notification.enabled,
                        })
                      }
                    >
                      {notification.enabled ? '禁用' : '启用'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeNotification(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell size={48} className="mx-auto mb-2 opacity-50" />
            <p>还没有设置任何通知</p>
          </div>
        )}
      </Card>

      {/* 添加通知模态框 */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加通知</h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">通知类型</Label>
                <select
                  value={newNotification.type}
                  onChange={e =>
                    setNewNotification(prev => ({
                      ...prev,
                      type: e.target.value as NotificationType,
                    }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="homework-assigned">作业分配通知</option>
                  <option value="homework-due">截止日期提醒</option>
                  <option value="homework-completed">完成通知</option>
                  <option value="homework-graded">批改完成通知</option>
                  <option value="reminder">自定义提醒</option>
                </select>
              </div>

              {(newNotification.type === 'homework-due' ||
                newNotification.type === 'reminder') && (
                <div>
                  <Label className="text-sm font-medium">
                    提前通知时间 (小时)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={newNotification.timing || ''}
                    onChange={e =>
                      setNewNotification(prev => ({
                        ...prev,
                        timing: parseInt(e.target.value) || undefined,
                      }))
                    }
                    placeholder="24"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">通知对象</Label>
                <div className="mt-2 space-y-2">
                  {['STUDENT', 'PARENT', 'ADMIN'].map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          newNotification.recipients?.includes(role) || false
                        }
                        onChange={e => {
                          const recipients = [
                            ...(newNotification.recipients || []),
                          ]
                          if (e.target.checked) {
                            recipients.push(role)
                          } else {
                            const index = recipients.indexOf(role)
                            if (index > -1) recipients.splice(index, 1)
                          }
                          setNewNotification(prev => ({ ...prev, recipients }))
                        }}
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">自定义消息 (可选)</Label>
                <Textarea
                  value={newNotification.message || ''}
                  onChange={e =>
                    setNewNotification(prev => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="输入自定义通知消息..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNotificationModal(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={addNotification}
                disabled={
                  !newNotification.type || !newNotification.recipients?.length
                }
                className="flex-1"
              >
                添加
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
