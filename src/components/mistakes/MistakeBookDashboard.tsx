'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookX, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Filter,
  BookOpen,
  Award
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'

interface MistakeBookStats {
  totalMistakes: number
  activeMistakes: number
  masteredMistakes: number
  recentMistakes: number
  masteryRate: number
  subjectBreakdown: {
    subject: string
    count: number
  }[]
}

interface MistakeRecord {
  id: string
  questionContent: string
  incorrectAnswer: string
  correctAnswer: string
  explanation?: string
  mistakeType: string
  subject: string
  difficulty: string
  isMastered: boolean
  repeatCount: number
  reviewCount: number
  createdAt: string
  lastReviewAt?: string
  exercise: {
    title: string
    subject: string
    difficulty: string
  }
  reviews: {
    id: string
    isCorrect: boolean
    reviewedAt: string
    notes?: string
  }[]
}

interface MistakeBookDashboardProps {
  userId?: string
  isParentView?: boolean
}

export default function MistakeBookDashboard({ 
  userId, 
  isParentView = false 
}: MistakeBookDashboardProps) {
  const { user } = useAuth()
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([])
  const [stats, setStats] = useState<MistakeBookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: '',
    status: 'active',
    mistakeType: ''
  })
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null)

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (targetUserId) {
      fetchMistakeBook()
    }
  }, [targetUserId, filters])

  const fetchMistakeBook = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        userId: targetUserId!,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      const response = await fetch(`/api/mistakes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMistakes(data.data.mistakes)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('获取错题本失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const reviewMistake = async (mistakeId: string, isCorrect: boolean, notes?: string) => {
    try {
      const response = await fetch('/api/mistakes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mistakeId,
          isCorrect,
          notes
        })
      })

      if (response.ok) {
        const data = await response.json()
        fetchMistakeBook() // 刷新数据
        
        if (data.data.isMastered) {
          alert('恭喜！你已掌握这道题！')
        }
      }
    } catch (error) {
      console.error('复习错题失败:', error)
    }
  }

  const getMistakeTypeLabel = (type: string) => {
    const labels = {
      'CARELESS_ERROR': '粗心错误',
      'CONCEPT_ERROR': '概念错误',
      'METHOD_ERROR': '方法错误',
      'TIME_PRESSURE': '时间压力',
      'UNKNOWN': '未知原因'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      'ENGLISH': 'bg-blue-100 text-blue-800',
      'MATHS': 'bg-green-100 text-green-800',
      'HASS': 'bg-purple-100 text-purple-800',
      'VOCABULARY': 'bg-orange-100 text-orange-800'
    }
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'easy': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'hard': 'bg-red-100 text-red-700'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700'
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
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <BookX className="h-6 w-6 text-red-600" />
              </div>
              <Badge className="bg-red-100 text-red-800">
                总计
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalMistakes}
              </p>
              <p className="text-sm text-gray-600">总错题数</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                待复习
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.activeMistakes}
              </p>
              <p className="text-sm text-gray-600">需要复习</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                已掌握
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.masteredMistakes}
              </p>
              <p className="text-sm text-gray-600">已掌握</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.masteryRate}%
              </p>
              <p className="text-sm text-gray-600">掌握率</p>
            </div>
          </Card>
        </div>
      )}

      {/* 过滤器 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">筛选:</span>
          </div>

          <select 
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有学科</option>
            <option value="ENGLISH">英语</option>
            <option value="MATHS">数学</option>
            <option value="HASS">HASS</option>
            <option value="VOCABULARY">词汇</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">全部状态</option>
            <option value="active">需要复习</option>
            <option value="mastered">已掌握</option>
          </select>

          <select 
            value={filters.mistakeType}
            onChange={(e) => setFilters(prev => ({ ...prev, mistakeType: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有错误类型</option>
            <option value="CARELESS_ERROR">粗心错误</option>
            <option value="CONCEPT_ERROR">概念错误</option>
            <option value="METHOD_ERROR">方法错误</option>
            <option value="TIME_PRESSURE">时间压力</option>
          </select>
        </div>
      </Card>

      {/* 错题列表 */}
      {mistakes.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.status === 'active' ? '没有需要复习的错题' : '没有找到错题'}
          </h3>
          <p className="text-gray-600">
            {filters.status === 'active' 
              ? '太棒了！所有错题都已掌握。'
              : '尝试调整筛选条件或完成更多练习。'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {mistakes.map((mistake) => (
            <Card key={mistake.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getSubjectColor(mistake.subject)}>
                      {mistake.subject}
                    </Badge>
                    <Badge className={getDifficultyColor(mistake.difficulty)}>
                      {mistake.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {getMistakeTypeLabel(mistake.mistakeType)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {mistake.isMastered ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      已掌握
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock size={12} className="mr-1" />
                      需复习
                    </Badge>
                  )}
                  
                  {mistake.repeatCount > 1 && (
                    <Badge className="bg-red-100 text-red-800">
                      重复错误 {mistake.repeatCount}次
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  来自: {mistake.exercise.title}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">题目:</h4>
                  <p className="text-gray-700 mb-3">{mistake.questionContent}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-1">你的答案:</h5>
                      <p className="text-red-600 bg-red-50 p-2 rounded">
                        {mistake.incorrectAnswer}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">正确答案:</h5>
                      <p className="text-green-600 bg-green-50 p-2 rounded">
                        {mistake.correctAnswer}
                      </p>
                    </div>
                  </div>
                  
                  {mistake.explanation && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-blue-700 mb-1">解析:</h5>
                      <p className="text-blue-600 bg-blue-50 p-2 rounded text-sm">
                        {mistake.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>复习 {mistake.reviewCount} 次</span>
                  <span>
                    错误时间: {new Date(mistake.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {mistake.lastReviewAt && (
                    <span>
                      最后复习: {new Date(mistake.lastReviewAt).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>

                {!mistake.isMastered && !isParentView && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reviewMistake(mistake.id, false)}
                    >
                      <AlertTriangle size={14} className="mr-1" />
                      仍然错误
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => reviewMistake(mistake.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      已经掌握
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 学科分布 */}
      {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">错题分布</h3>
          <div className="space-y-3">
            {stats.subjectBreakdown.map((item) => (
              <div key={item.subject} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getSubjectColor(item.subject)}>
                    {item.subject}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <Progress 
                      value={stats.totalMistakes > 0 ? (item.count / stats.totalMistakes) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}