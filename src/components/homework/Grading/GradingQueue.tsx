'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen,
  AlertTriangle,
  Eye,
  Bot,
  UserCheck,
  Filter
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { HomeworkSubmissionSummary } from '@/types'

interface GradingQueueProps {
  onSelectSubmission?: (submission: HomeworkSubmissionSummary) => void
}

export default function GradingQueue({ onSelectSubmission }: GradingQueueProps) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<HomeworkSubmissionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'pending',
    subject: '',
    yearLevel: ''
  })
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])

  useEffect(() => {
    fetchGradingQueue()
  }, [filters])

  const fetchGradingQueue = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type: 'queue',
        status: filters.status,
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.yearLevel && { yearLevel: filters.yearLevel })
      })

      const response = await fetch(`/api/homework/grading?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.data)
      }
    } catch (error) {
      console.error('获取批改队列失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 执行自动批改
  const performAutoGrading = async (submissionIds: string[]) => {
    try {
      const promises = submissionIds.map(submissionId =>
        fetch('/api/homework/grading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action: 'auto-grade',
            submissionId
          })
        })
      )

      await Promise.all(promises)
      fetchGradingQueue() // 刷新队列
      setSelectedSubmissions([])
      alert(`已完成 ${submissionIds.length} 个提交的自动批改`)
    } catch (error) {
      console.error('自动批改失败:', error)
      alert('自动批改失败，请重试')
    }
  }

  // 切换选择
  const toggleSelection = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    )
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([])
    } else {
      setSelectedSubmissions(submissions.map(s => s.id))
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'GRADED':
        return 'bg-green-100 text-green-800'
      case 'NEEDS_REVIEW':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取优先级颜色
  const getPriorityColor = (timeRemaining: number) => {
    if (timeRemaining < 0) return 'text-red-600' // 已逾期
    if (timeRemaining < 24) return 'text-orange-600' // 24小时内
    if (timeRemaining < 72) return 'text-yellow-600' // 3天内
    return 'text-green-600'
  }

  // 计算剩余时间
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60)) // 小时
  }

  const renderSubmissionCard = (submission: HomeworkSubmissionSummary) => {
    const timeRemaining = submission.homework?.dueDate 
      ? getTimeRemaining(submission.homework.dueDate) 
      : null
    const isSelected = selectedSubmissions.includes(submission.id)

    return (
      <Card 
        key={submission.id}
        className={`p-4 cursor-pointer transition-all ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:shadow-md'
        }`}
        onClick={() => toggleSelection(submission.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelection(submission.id)}
              className="rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {submission.homework?.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <User size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {submission.userName}
                </span>
                {submission.user?.yearLevel && (
                  <Badge variant="outline" className="text-xs">
                    Year {submission.user.yearLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(submission.status)}>
              {submission.status === 'SUBMITTED' ? '待批改' : submission.status}
            </Badge>
            {timeRemaining !== null && (
              <span className={`text-xs ${getPriorityColor(timeRemaining)}`}>
                {timeRemaining < 0 
                  ? `逾期 ${Math.abs(timeRemaining)} 小时`
                  : `${timeRemaining} 小时到期`
                }
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <BookOpen size={14} className="text-gray-500" />
            <span>{submission.completedExercises}/{submission.totalExercises} 练习</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span>{Math.round(submission.timeSpent / 60)} 分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={14} className="text-gray-500" />
            <span>{submission.score || 0}/{submission.homework?.totalPoints || 100} 分</span>
          </div>
          <div className="text-gray-600">
            {submission.submittedAt 
              ? new Date(submission.submittedAt).toLocaleDateString('zh-CN')
              : '未提交'
            }
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {submission.homework?.exercises?.map((exercise: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {exercise.subject}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSelectSubmission?.(submission)
              }}
            >
              <Eye size={14} className="mr-1" />
              查看
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                performAutoGrading([submission.id])
              }}
            >
              <Bot size={14} className="mr-1" />
              自动批改
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // 跳转到手动批改页面
                window.location.href = `/homework/grading/${submission.id}`
              }}
            >
              <UserCheck size={14} className="mr-1" />
              手动批改
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
      {/* 头部和统计 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">批改队列</h2>
          <p className="text-gray-600">共 {submissions.length} 个待批改提交</p>
        </div>
        
        {selectedSubmissions.length > 0 && (
          <div className="flex gap-2">
            <span className="px-3 py-2 text-sm text-gray-600">
              已选择 {selectedSubmissions.length} 个
            </span>
            <Button
              onClick={() => performAutoGrading(selectedSubmissions)}
              disabled={selectedSubmissions.length === 0}
            >
              <Bot size={16} className="mr-2" />
              批量自动批改
            </Button>
          </div>
        )}
      </div>

      {/* 过滤器 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">过滤:</span>
          </div>
          
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="pending">待批改</option>
            <option value="auto-graded">自动批改完成</option>
            <option value="needs-review">需要复查</option>
            <option value="completed">已完成</option>
          </select>

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
            value={filters.yearLevel}
            onChange={(e) => setFilters(prev => ({ ...prev, yearLevel: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有年级</option>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(year => (
              <option key={year} value={year.toString()}>Year {year}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="ml-auto"
          >
            {selectedSubmissions.length === submissions.length ? '取消全选' : '全选'}
          </Button>
        </div>
      </Card>

      {/* 提交列表 */}
      {submissions.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有待批改的提交</h3>
          <p className="text-gray-600">
            当前没有符合条件的提交需要批改。
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map(renderSubmissionCard)}
        </div>
      )}
    </div>
  )
}