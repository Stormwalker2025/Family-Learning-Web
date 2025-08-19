'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Send
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { HomeworkAssignmentFull, HomeworkSubmissionFull, Exercise } from '@/types'
import AnswerInput from './AnswerInput'

interface HomeworkViewerProps {
  homeworkId: string
  onSubmit?: (submission: HomeworkSubmissionFull) => void
  onSave?: (submission: Partial<HomeworkSubmissionFull>) => void
}

export default function HomeworkViewer({ 
  homeworkId, 
  onSubmit, 
  onSave 
}: HomeworkViewerProps) {
  const { user } = useAuth()
  const [homework, setHomework] = useState<HomeworkAssignmentFull | null>(null)
  const [submission, setSubmission] = useState<HomeworkSubmissionFull | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (!isPaused && submission?.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPaused, submission?.status])

  // 获取作业数据
  useEffect(() => {
    fetchHomeworkData()
  }, [homeworkId])

  const fetchHomeworkData = async () => {
    try {
      setLoading(true)
      
      // 获取作业详情
      const homeworkResponse = await fetch(`/api/homework/assignments/${homeworkId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (homeworkResponse.ok) {
        const homeworkData = await homeworkResponse.json()
        setHomework(homeworkData.data)

        // 获取用户提交记录
        const submissionResponse = await fetch(`/api/homework/submissions?homeworkId=${homeworkId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (submissionResponse.ok) {
          const submissionData = await submissionResponse.json()
          const userSubmission = submissionData.data[0]
          
          if (userSubmission) {
            setSubmission(userSubmission)
            setTimeSpent(userSubmission.totalTimeSpent || 0)
          } else {
            // 如果没有提交记录，先开始作业
            await startHomework()
          }
        }
      }
    } catch (error) {
      console.error('获取作业数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 开始作业
  const startHomework = async () => {
    try {
      const response = await fetch('/api/homework/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'start',
          homeworkId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSubmission(data.data)
      }
    } catch (error) {
      console.error('开始作业失败:', error)
    }
  }

  // 获取当前练习
  useEffect(() => {
    if (homework?.exercises && homework.exercises[currentExerciseIndex]) {
      const exerciseConfig = homework.exercises[currentExerciseIndex]
      // 这里需要根据exerciseId获取完整的练习数据
      fetchExerciseData(exerciseConfig.exerciseId)
    }
  }, [homework, currentExerciseIndex])

  const fetchExerciseData = async (exerciseId: string) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentExercise(data.data)
      }
    } catch (error) {
      console.error('获取练习数据失败:', error)
    }
  }

  // 保存答案
  const saveAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)
    
    // 自动保存到服务器
    if (onSave && submission) {
      onSave({
        ...submission,
        answers: newAnswers
      })
    }
  }

  // 下一个练习
  const nextExercise = () => {
    if (homework && currentExerciseIndex < homework.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  // 上一个练习
  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    }
  }

  // 提交作业
  const submitHomework = async () => {
    if (!homework || !submission) return

    setSubmitting(true)
    try {
      const exerciseSubmissions = homework.exercises.map(exerciseConfig => ({
        exerciseId: exerciseConfig.exerciseId,
        submissionId: submission.id,
        timeSpent: Math.floor(timeSpent)
      }))

      const response = await fetch('/api/homework/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'submit',
          homeworkId,
          exerciseSubmissions
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSubmission(data.data)
        onSubmit?.(data.data)
      }
    } catch (error) {
      console.error('提交作业失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // 计算完成进度
  const getProgress = (): number => {
    if (!homework) return 0
    const totalExercises = homework.exercises.length
    return totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0
  }

  // 检查是否超时
  const isOverdue = (): boolean => {
    if (!homework?.dueDate) return false
    return new Date() > new Date(homework.dueDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!homework || !submission) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">作业不可用</h3>
        <p className="text-gray-600">无法加载作业内容，请稍后重试。</p>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 作业头部信息 */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {homework.title}
            </h1>
            <p className="text-gray-600">
              {homework.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={isOverdue() ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
              {submission.status}
            </Badge>
            {isOverdue() && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle size={12} className="mr-1" />
                已逾期
              </Badge>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {homework.exercises.length} 个练习
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              预估 {homework.estimatedTime || 0} 分钟
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              总分 {homework.totalPoints} 分
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {homework.dueDate 
                ? new Date(homework.dueDate).toLocaleDateString('zh-CN')
                : '无截止日期'
              }
            </span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              进度: {currentExerciseIndex + 1}/{homework.exercises.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                用时: {formatTime(timeSpent)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                disabled={submission.status !== 'IN_PROGRESS'}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? '继续' : '暂停'}
              </Button>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </div>
      </Card>

      {/* 练习内容 */}
      {currentExercise && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              练习 {currentExerciseIndex + 1}: {currentExercise.title}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
              >
                上一个
              </Button>
              <Button
                variant="outline"
                onClick={nextExercise}
                disabled={currentExerciseIndex >= homework.exercises.length - 1}
              >
                下一个
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">{currentExercise.description}</p>
            {homework.instructions && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">作业说明</h3>
                <p className="text-blue-800 text-sm">{homework.instructions}</p>
              </Card>
            )}
          </div>

          <AnswerInput
            exercise={currentExercise}
            answers={answers}
            onAnswerChange={saveAnswer}
            disabled={submission.status === 'SUBMITTED' || submission.status === 'COMPLETED'}
          />
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          返回
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={submitting}
          >
            <RotateCcw size={16} className="mr-2" />
            重新加载
          </Button>
          
          {submission.status === 'IN_PROGRESS' && (
            <Button
              onClick={submitHomework}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send size={16} className="mr-2" />
              {submitting ? '提交中...' : '提交作业'}
            </Button>
          )}
          
          {(submission.status === 'SUBMITTED' || submission.status === 'COMPLETED') && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle size={16} />
              <span>已提交</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}