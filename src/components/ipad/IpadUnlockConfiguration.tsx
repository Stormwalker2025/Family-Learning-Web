'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Plus,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  CheckCircle,
  Target,
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { IpadUnlockConfiguration, SubjectType } from '@/types'

export default function IpadUnlockConfigurationManager() {
  const { user } = useAuth()
  const [configurations, setConfigurations] = useState<
    IpadUnlockConfiguration[]
  >([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] =
    useState<Partial<IpadUnlockConfiguration> | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchConfigurations()
  }, [])

  const fetchConfigurations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ipad-unlock?action=config', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfigurations(data.data)
      }
    } catch (error) {
      console.error('获取iPad解锁配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async (
    config: Partial<IpadUnlockConfiguration>
  ) => {
    try {
      const response = await fetch('/api/ipad-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        fetchConfigurations()
        setEditingConfig(null)
        setShowCreateForm(false)
        alert('配置保存成功')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存配置失败')
    }
  }

  const defaultNewConfig: Partial<IpadUnlockConfiguration> = {
    name: '',
    description: '',
    rules: [
      {
        subject: 'MATHS' as SubjectType,
        scoreThresholds: [
          {
            minScore: 70,
            maxScore: 79,
            baseMinutes: 10,
            bonusMinutes: 0,
          },
          {
            minScore: 80,
            maxScore: 89,
            baseMinutes: 15,
            bonusMinutes: 0,
          },
          {
            minScore: 90,
            maxScore: 100,
            baseMinutes: 20,
            bonusMinutes: 10,
          },
        ],
        dailyLimit: 60,
      },
    ],
    isActive: true,
  }

  const renderConfigurationForm = (
    config: Partial<IpadUnlockConfiguration>,
    isEditing: boolean = false
  ) => {
    const updateConfig = (updates: Partial<IpadUnlockConfiguration>) => {
      if (isEditing) {
        setEditingConfig({ ...config, ...updates })
      } else {
        setEditingConfig({ ...config, ...updates })
      }
    }

    const addRule = () => {
      const newRule = {
        subject: 'ENGLISH' as SubjectType,
        scoreThresholds: [
          {
            minScore: 70,
            maxScore: 100,
            baseMinutes: 15,
            bonusMinutes: 5,
          },
        ],
        dailyLimit: 60,
      }

      updateConfig({
        rules: [...(config.rules || []), newRule],
      })
    }

    const updateRule = (index: number, updates: any) => {
      const newRules = [...(config.rules || [])]
      newRules[index] = { ...newRules[index], ...updates }
      updateConfig({ rules: newRules })
    }

    const removeRule = (index: number) => {
      const newRules = [...(config.rules || [])]
      newRules.splice(index, 1)
      updateConfig({ rules: newRules })
    }

    return (
      <Card className="p-6">
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置名称
              </label>
              <Input
                value={config.name || ''}
                onChange={e => updateConfig({ name: e.target.value })}
                placeholder="例如：标准解锁规则"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.isActive ?? true}
                  onChange={e => updateConfig({ isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">启用此配置</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <Textarea
              value={config.description || ''}
              onChange={e => updateConfig({ description: e.target.value })}
              placeholder="描述这个解锁规则的用途..."
              rows={3}
            />
          </div>

          {/* 规则配置 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">解锁规则</h4>
              <Button variant="outline" size="sm" onClick={addRule}>
                <Plus size={16} className="mr-2" />
                添加学科规则
              </Button>
            </div>

            <div className="space-y-4">
              {(config.rules || []).map((rule, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Badge>{rule.subject}</Badge>
                      <span className="text-sm text-gray-600">
                        每日限制: {rule.dailyLimit || '无限制'} 分钟
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        学科
                      </label>
                      <select
                        value={rule.subject}
                        onChange={e =>
                          updateRule(index, {
                            subject: e.target.value as SubjectType,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="ENGLISH">英语</option>
                        <option value="MATHS">数学</option>
                        <option value="HASS">HASS</option>
                        <option value="VOCABULARY">词汇</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        每日限制 (分钟)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={rule.dailyLimit || ''}
                        onChange={e =>
                          updateRule(index, {
                            dailyLimit: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="无限制"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">分数阈值</h5>
                    <div className="space-y-2">
                      {rule.scoreThresholds.map((threshold, thresholdIndex) => (
                        <div
                          key={thresholdIndex}
                          className="grid grid-cols-4 gap-2 items-center"
                        >
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={threshold.minScore}
                            onChange={e => {
                              const newThresholds = [...rule.scoreThresholds]
                              newThresholds[thresholdIndex] = {
                                ...newThresholds[thresholdIndex],
                                minScore: parseInt(e.target.value) || 0,
                              }
                              updateRule(index, {
                                scoreThresholds: newThresholds,
                              })
                            }}
                            placeholder="最低分"
                          />
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={threshold.maxScore}
                            onChange={e => {
                              const newThresholds = [...rule.scoreThresholds]
                              newThresholds[thresholdIndex] = {
                                ...newThresholds[thresholdIndex],
                                maxScore: parseInt(e.target.value) || 100,
                              }
                              updateRule(index, {
                                scoreThresholds: newThresholds,
                              })
                            }}
                            placeholder="最高分"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={threshold.baseMinutes}
                            onChange={e => {
                              const newThresholds = [...rule.scoreThresholds]
                              newThresholds[thresholdIndex] = {
                                ...newThresholds[thresholdIndex],
                                baseMinutes: parseInt(e.target.value) || 0,
                              }
                              updateRule(index, {
                                scoreThresholds: newThresholds,
                              })
                            }}
                            placeholder="基础分钟"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={threshold.bonusMinutes}
                            onChange={e => {
                              const newThresholds = [...rule.scoreThresholds]
                              newThresholds[thresholdIndex] = {
                                ...newThresholds[thresholdIndex],
                                bonusMinutes: parseInt(e.target.value) || 0,
                              }
                              updateRule(index, {
                                scoreThresholds: newThresholds,
                              })
                            }}
                            placeholder="奖励分钟"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={() => saveConfiguration(config)}
              disabled={!config.name || !config.rules?.length}
            >
              <Save size={16} className="mr-2" />
              保存配置
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingConfig(null)
                setShowCreateForm(false)
              }}
            >
              取消
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">iPad解锁规则配置</h2>
          <p className="text-gray-600">
            设置学生通过完成作业和练习解锁iPad使用时间的规则
          </p>
        </div>

        {!showCreateForm && !editingConfig && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus size={16} className="mr-2" />
            新建配置
          </Button>
        )}
      </div>

      {/* 创建表单 */}
      {showCreateForm && (
        <div>
          <h3 className="text-lg font-semibold mb-4">创建新的解锁规则</h3>
          {renderConfigurationForm(defaultNewConfig)}
        </div>
      )}

      {/* 编辑表单 */}
      {editingConfig && (
        <div>
          <h3 className="text-lg font-semibold mb-4">编辑解锁规则</h3>
          {renderConfigurationForm(editingConfig, true)}
        </div>
      )}

      {/* 现有配置列表 */}
      {!showCreateForm && !editingConfig && (
        <div className="space-y-4">
          {configurations.length === 0 ? (
            <Card className="p-8 text-center">
              <Settings size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                还没有配置
              </h3>
              <p className="text-gray-600 mb-4">
                创建第一个iPad解锁规则配置，让学生通过学习来获得iPad使用时间。
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus size={16} className="mr-2" />
                创建第一个配置
              </Button>
            </Card>
          ) : (
            configurations.map(config => (
              <Card key={config.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{config.name}</h3>
                      <Badge
                        className={
                          config.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {config.isActive ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    {config.description && (
                      <p className="text-gray-600">{config.description}</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingConfig(config)}
                  >
                    <Edit3 size={16} className="mr-2" />
                    编辑
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {JSON.parse(config.rules as any).map(
                    (rule: any, index: number) => (
                      <Card key={index} className="p-3 bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{rule.subject}</Badge>
                          {rule.dailyLimit && (
                            <span className="text-xs text-gray-500">
                              限制{rule.dailyLimit}分钟/天
                            </span>
                          )}
                        </div>

                        <div className="text-sm space-y-1">
                          {rule.scoreThresholds.map(
                            (threshold: any, thIndex: number) => (
                              <div
                                key={thIndex}
                                className="flex justify-between"
                              >
                                <span>
                                  {threshold.minScore}-{threshold.maxScore}%:
                                </span>
                                <span className="font-medium">
                                  {threshold.baseMinutes}
                                  {threshold.bonusMinutes > 0 &&
                                    `+${threshold.bonusMinutes}`}
                                  分钟
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </Card>
                    )
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
                  <span>
                    创建时间:{' '}
                    {new Date(config.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <span>
                    更新时间:{' '}
                    {new Date(config.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
