'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  BookOpen,
  Clock,
  Target,
  Settings2,
} from 'lucide-react'
import { Exercise, HomeworkExerciseConfig, SubjectType } from '@/types'

interface QuestionSelectorProps {
  exercises: Exercise[]
  selectedExercises: HomeworkExerciseConfig[]
  onAddExercise: (exercise: Exercise) => void
  onRemoveExercise: (exerciseId: string) => void
  onMoveExercise: (exerciseId: string, direction: 'up' | 'down') => void
  onUpdateConfig: (
    exerciseId: string,
    updates: Partial<HomeworkExerciseConfig>
  ) => void
}

export default function QuestionSelector({
  exercises,
  selectedExercises,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise,
  onUpdateConfig,
}: QuestionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    yearLevel: '',
  })
  const [showConfigModal, setShowConfigModal] = useState<string | null>(null)

  // 过滤可用练习
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch =
      !searchTerm ||
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject =
      !filters.subject || exercise.subject === filters.subject
    const matchesDifficulty =
      !filters.difficulty || exercise.difficulty === filters.difficulty
    const matchesYearLevel =
      !filters.yearLevel || exercise.yearLevel.toString() === filters.yearLevel
    const notSelected = !selectedExercises.some(
      selected => selected.exerciseId === exercise.id
    )

    return (
      matchesSearch &&
      matchesSubject &&
      matchesDifficulty &&
      matchesYearLevel &&
      notSelected
    )
  })

  // 获取已选练习的详细信息
  const getSelectedExerciseDetails = (exerciseId: string) => {
    return exercises.find(exercise => exercise.id === exerciseId)
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取学科颜色
  const getSubjectColor = (subject: SubjectType) => {
    switch (subject) {
      case 'english':
        return 'bg-blue-100 text-blue-800'
      case 'maths':
        return 'bg-purple-100 text-purple-800'
      case 'hass':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 渲染练习卡片
  const renderExerciseCard = (exercise: Exercise) => (
    <Card key={exercise.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{exercise.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {exercise.description}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onAddExercise(exercise)}
          className="ml-3"
        >
          <Plus size={16} className="mr-1" />
          添加
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={getSubjectColor(exercise.subject)}>
          {exercise.subject}
        </Badge>
        <Badge className={getDifficultyColor(exercise.difficulty)}>
          {exercise.difficulty}
        </Badge>
        <Badge variant="outline">Year {exercise.yearLevel}</Badge>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {exercise.timeLimit || 30} 分钟
        </span>
        <span className="flex items-center gap-1">
          <Target size={12} />
          创建于 {new Date(exercise.createdAt).toLocaleDateString('zh-CN')}
        </span>
      </div>
    </Card>
  )

  // 渲染已选练习列表
  const renderSelectedExercise = (
    config: HomeworkExerciseConfig,
    index: number
  ) => {
    const exercise = getSelectedExerciseDetails(config.exerciseId)
    if (!exercise) return null

    return (
      <Card key={config.exerciseId} className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveExercise(config.exerciseId, 'up')}
                disabled={index === 0}
                className="h-6 w-6 p-0"
              >
                <ArrowUp size={12} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveExercise(config.exerciseId, 'down')}
                disabled={index === selectedExercises.length - 1}
                className="h-6 w-6 p-0"
              >
                <ArrowDown size={12} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  #{config.order}
                </span>
                <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                {config.isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    必做
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 mb-2">
                <Badge className={getSubjectColor(exercise.subject)}>
                  {exercise.subject}
                </Badge>
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">权重:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.weight}
                    onChange={e =>
                      onUpdateConfig(config.exerciseId, {
                        weight: parseInt(e.target.value) || 1,
                      })
                    }
                    className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded"
                  />
                </div>

                {config.minScore !== undefined && (
                  <div>
                    <span className="text-gray-500">最低分:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.minScore}
                      onChange={e =>
                        onUpdateConfig(config.exerciseId, {
                          minScore: parseInt(e.target.value) || 0,
                        })
                      }
                      className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                )}

                {config.maxAttempts !== undefined && (
                  <div>
                    <span className="text-gray-500">最大尝试:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={config.maxAttempts}
                      onChange={e =>
                        onUpdateConfig(config.exerciseId, {
                          maxAttempts: parseInt(e.target.value) || 1,
                        })
                      }
                      className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigModal(config.exerciseId)}
              >
                <Settings2 size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveExercise(config.exerciseId)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // 练习配置模态框
  const renderConfigModal = () => {
    const exerciseId = showConfigModal
    if (!exerciseId) return null

    const config = selectedExercises.find(e => e.exerciseId === exerciseId)
    const exercise = getSelectedExerciseDetails(exerciseId)
    if (!config || !exercise) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            配置练习: {exercise.title}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.isRequired}
                  onChange={e =>
                    onUpdateConfig(exerciseId, {
                      isRequired: e.target.checked,
                    })
                  }
                />
                <span>必做练习</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                权重 (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.weight}
                onChange={e =>
                  onUpdateConfig(exerciseId, {
                    weight: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                最低得分要求 (可选)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={config.minScore || ''}
                placeholder="不限制"
                onChange={e =>
                  onUpdateConfig(exerciseId, {
                    minScore: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                最大尝试次数 (可选)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.maxAttempts || ''}
                placeholder="不限制"
                onChange={e =>
                  onUpdateConfig(exerciseId, {
                    maxAttempts: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                时间限制 (分钟, 可选)
              </label>
              <Input
                type="number"
                min="1"
                max="300"
                value={config.timeLimit || ''}
                placeholder="使用练习默认时间"
                onChange={e =>
                  onUpdateConfig(exerciseId, {
                    timeLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfigModal(null)}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={() => setShowConfigModal(null)} className="flex-1">
              确定
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 已选练习列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          已选练习 ({selectedExercises.length})
        </h3>

        {selectedExercises.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">还没有选择任何练习</p>
            <p className="text-sm text-gray-500">
              从下方的练习库中选择合适的练习
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedExercises
              .sort((a, b) => a.order - b.order)
              .map((config, index) => renderSelectedExercise(config, index))}
          </div>
        )}
      </div>

      {/* 练习库 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">练习库</h3>

        {/* 搜索和过滤 */}
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-500" />
              <Input
                placeholder="搜索练习..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filters.subject}
                onChange={e =>
                  setFilters(prev => ({ ...prev, subject: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">所有学科</option>
                <option value="ENGLISH">英语</option>
                <option value="MATHS">数学</option>
                <option value="HASS">HASS</option>
                <option value="VOCABULARY">词汇</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={e =>
                  setFilters(prev => ({ ...prev, difficulty: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">所有难度</option>
                <option value="BEGINNER">初级</option>
                <option value="EASY">简单</option>
                <option value="MEDIUM">中等</option>
                <option value="HARD">困难</option>
                <option value="ADVANCED">高级</option>
              </select>

              <select
                value={filters.yearLevel}
                onChange={e =>
                  setFilters(prev => ({ ...prev, yearLevel: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">所有年级</option>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(year => (
                  <option key={year} value={year.toString()}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* 练习列表 */}
        {filteredExercises.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm || Object.values(filters).some(f => f)
                ? '没有找到符合条件的练习'
                : '暂无可用练习'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map(renderExerciseCard)}
          </div>
        )}
      </div>

      {/* 配置模态框 */}
      {renderConfigModal()}
    </div>
  )
}
