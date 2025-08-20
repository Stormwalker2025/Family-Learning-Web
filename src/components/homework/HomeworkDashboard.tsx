'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Filter,
  Search,
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import {
  HomeworkAssignmentFull,
  HomeworkSubmissionSummary,
  HomeworkStatusType,
  PriorityType,
} from '@/types'

interface HomeworkDashboardProps {
  className?: string
}

export default function HomeworkDashboard({
  className,
}: HomeworkDashboardProps) {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<HomeworkAssignmentFull[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    status: '',
    subject: '',
    priority: '',
    search: '',
  })

  // 获取作业列表
  useEffect(() => {
    fetchAssignments()
  }, [filters])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (filters.status) queryParams.append('status', filters.status)
      if (filters.subject) queryParams.append('subject', filters.subject)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await fetch(`/api/homework/assignments?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssignments(data.data)
      }
    } catch (error) {
      console.error('获取作业列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计算统计数据
  const getStatistics = () => {
    const stats = {
      total: assignments.length,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    }

    assignments.forEach(assignment => {
      switch (assignment.status) {
        case 'assigned':
          stats.assigned++
          break
        case 'in-progress':
          stats.inProgress++
          break
        case 'completed':
          stats.completed++
          break
        case 'overdue':
          stats.overdue++
          break
      }
    })

    return stats
  }

  const stats = getStatistics()

  // 获取优先级颜色
  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: HomeworkStatusType) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 渲染作业卡片
  const renderAssignmentCard = (assignment: HomeworkAssignmentFull) => {
    const completionRate =
      assignment.statistics.totalStudents > 0
        ? (assignment.statistics.completedCount /
            assignment.statistics.totalStudents) *
          100
        : 0

    return (
      <Card
        key={assignment.id}
        className="p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {assignment.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {assignment.description}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Badge className={getPriorityColor(assignment.priority)}>
              {assignment.priority}
            </Badge>
            <Badge className={getStatusColor(assignment.status)}>
              {assignment.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {assignment.statistics.totalStudents} 学生
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {assignment.exercises.length} 练习
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {assignment.estimatedTime || 0} 分钟
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString('zh-CN')
                : '无截止日期'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">完成进度</span>
            <span className="text-sm font-medium">
              {assignment.statistics.completedCount}/
              {assignment.statistics.totalStudents}
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>已完成: {assignment.statistics.completedCount}</span>
            <span>
              进行中:{' '}
              {assignment.statistics.submittedCount -
                assignment.statistics.completedCount}
            </span>
            <span>逾期: {assignment.statistics.overdueCount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            创建于 {new Date(assignment.createdAt).toLocaleDateString('zh-CN')}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewAssignment(assignment.id)}
            >
              查看详情
            </Button>
            {(user?.role === 'ADMIN' || assignment.assignedBy === user?.id) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAssignment(assignment.id)}
                >
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAnalytics(assignment.id)}
                >
                  <BarChart3 size={16} />
                  分析
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // 事件处理函数
  const handleCreateAssignment = () => {
    // 导航到作业创建页面
    window.location.href = '/homework/create'
  }

  const handleViewAssignment = (assignmentId: string) => {
    window.location.href = `/homework/assignments/${assignmentId}`
  }

  const handleEditAssignment = (assignmentId: string) => {
    window.location.href = `/homework/assignments/${assignmentId}/edit`
  }

  const handleViewAnalytics = (assignmentId: string) => {
    window.location.href = `/homework/analytics/${assignmentId}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
          <p className="text-gray-600">管理和监控学生作业完成情况</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'PARENT') && (
          <Button
            onClick={handleCreateAssignment}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            创建作业
          </Button>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总作业数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">进行中</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">逾期</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdue}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 过滤器和搜索 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">过滤:</span>
          </div>

          <select
            value={filters.status}
            onChange={e =>
              setFilters(prev => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有状态</option>
            <option value="assigned">已分配</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="overdue">逾期</option>
          </select>

          <select
            value={filters.subject}
            onChange={e =>
              setFilters(prev => ({ ...prev, subject: e.target.value }))
            }
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有学科</option>
            <option value="ENGLISH">英语</option>
            <option value="MATHS">数学</option>
            <option value="HASS">HASS</option>
            <option value="VOCABULARY">词汇</option>
          </select>

          <select
            value={filters.priority}
            onChange={e =>
              setFilters(prev => ({ ...prev, priority: e.target.value }))
            }
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有优先级</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="搜索作业..."
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
            />
          </div>
        </div>
      </Card>

      {/* 作业列表 */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无作业</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'STUDENT'
                ? '目前没有分配给您的作业'
                : '开始创建第一个作业吧！'}
            </p>
            {(user?.role === 'ADMIN' || user?.role === 'PARENT') && (
              <Button onClick={handleCreateAssignment}>创建第一个作业</Button>
            )}
          </Card>
        ) : (
          assignments.map(renderAssignmentCard)
        )}
      </div>
    </div>
  )
}
