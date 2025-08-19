'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Save, 
  Send, 
  Clock, 
  Users, 
  BookOpen, 
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings,
  Calendar,
  Target
} from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { 
  HomeworkAssignmentConfig, 
  HomeworkExerciseConfig, 
  NotificationConfig,
  Exercise,
  User,
  SubjectType,
  PriorityType
} from '@/types'
import QuestionSelector from './QuestionSelector'
import TimeSettings from './TimeSettings'
import AssignmentManager from './AssignmentManager'

interface HomeworkBuilderProps {
  assignmentId?: string // 编辑模式时传入
  onSave?: (assignment: HomeworkAssignmentConfig) => void
  onCancel?: () => void
}

export default function HomeworkBuilder({ 
  assignmentId, 
  onSave, 
  onCancel 
}: HomeworkBuilderProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  
  // 作业配置状态
  const [assignment, setAssignment] = useState<Partial<HomeworkAssignmentConfig>>({
    title: '',
    description: '',
    instructions: '',
    assignedTo: [],
    dueDate: undefined,
    estimatedTime: 60,
    priority: 'medium',
    totalPoints: 100,
    passingScore: 70,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 10,
    exercises: [],
    notifications: []
  })

  const steps = [
    { id: 'basic', label: '基本信息', icon: BookOpen },
    { id: 'exercises', label: '选择练习', icon: Target },
    { id: 'students', label: '分配学生', icon: Users },
    { id: 'settings', label: '设置选项', icon: Settings },
    { id: 'review', label: '预览确认', icon: Send }
  ]

  // 初始化数据
  useEffect(() => {
    fetchInitialData()
    if (assignmentId) {
      fetchAssignmentData(assignmentId)
    }
  }, [assignmentId])

  const fetchInitialData = async () => {
    try {
      // 获取可分配的学生
      const studentsResponse = await fetch('/api/users?role=STUDENT', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setAvailableStudents(studentsData.data)
      }

      // 获取可用练习
      const exercisesResponse = await fetch('/api/exercises', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (exercisesResponse.ok) {
        const exercisesData = await exercisesResponse.json()
        setAvailableExercises(exercisesData.data)
      }
    } catch (error) {
      console.error('获取初始数据失败:', error)
    }
  }

  const fetchAssignmentData = async (id: string) => {
    try {
      const response = await fetch(`/api/homework/assignments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAssignment(data.data)
      }
    } catch (error) {
      console.error('获取作业数据失败:', error)
    }
  }

  // 验证当前步骤
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // 基本信息
        return !!(assignment.title && assignment.title.trim())
      case 1: // 练习选择
        return assignment.exercises && assignment.exercises.length > 0
      case 2: // 学生分配
        return assignment.assignedTo && assignment.assignedTo.length > 0
      case 3: // 设置选项
        return true // 设置都有默认值
      case 4: // 预览确认
        return true
      default:
        return false
    }
  }

  // 步骤导航
  const goToStep = (step: number) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 练习操作
  const addExercise = (exercise: Exercise) => {
    const newExerciseConfig: HomeworkExerciseConfig = {
      exerciseId: exercise.id,
      order: (assignment.exercises?.length || 0) + 1,
      isRequired: true,
      weight: 1
    }
    
    setAssignment(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), newExerciseConfig]
    }))
  }

  const removeExercise = (exerciseId: string) => {
    setAssignment(prev => ({
      ...prev,
      exercises: prev.exercises?.filter(e => e.exerciseId !== exerciseId) || []
    }))
  }

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const exercises = [...(assignment.exercises || [])]
    const index = exercises.findIndex(e => e.exerciseId === exerciseId)
    
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= exercises.length) return
    
    // 交换位置
    [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]]
    
    // 更新order
    exercises.forEach((exercise, idx) => {
      exercise.order = idx + 1
    })
    
    setAssignment(prev => ({ ...prev, exercises }))
  }

  const updateExerciseConfig = (exerciseId: string, updates: Partial<HomeworkExerciseConfig>) => {
    setAssignment(prev => ({
      ...prev,
      exercises: prev.exercises?.map(e => 
        e.exerciseId === exerciseId ? { ...e, ...updates } : e
      ) || []
    }))
  }

  // 保存作业
  const handleSave = async (publish: boolean = false) => {
    if (!validateAllSteps()) {
      alert('请完成所有必填信息')
      return
    }

    try {
      setLoading(true)
      
      const assignmentData = {
        ...assignment,
        assignedBy: user?.id,
        autoRelease: publish,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const url = assignmentId 
        ? `/api/homework/assignments/${assignmentId}`
        : '/api/homework/assignments'
      
      const method = assignmentId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(assignmentData)
      })

      if (response.ok) {
        const data = await response.json()
        onSave?.(data.data)
        alert(publish ? '作业发布成功！' : '作业保存成功！')
      } else {
        const error = await response.json()
        alert(`保存失败: ${error.error}`)
      }
    } catch (error) {
      console.error('保存作业失败:', error)
      alert('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const validateAllSteps = (): boolean => {
    return steps.every((_, index) => validateStep(index))
  }

  // 计算总估计时间
  const getTotalEstimatedTime = (): number => {
    if (!assignment.exercises) return 0
    
    return assignment.exercises.reduce((total, exerciseConfig) => {
      const exercise = availableExercises.find(e => e.id === exerciseConfig.exerciseId)
      return total + (exercise?.timeLimit || 30) // 默认30分钟
    }, 0)
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 基本信息
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                作业标题 *
              </Label>
              <Input
                id="title"
                value={assignment.title || ''}
                onChange={(e) => setAssignment(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入作业标题"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                作业描述
              </Label>
              <Textarea
                id="description"
                value={assignment.description || ''}
                onChange={(e) => setAssignment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述作业的目标和要求"
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="instructions" className="text-base font-medium">
                作业说明
              </Label>
              <Textarea
                id="instructions"
                value={assignment.instructions || ''}
                onChange={(e) => setAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="详细的作业完成指导"
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority" className="text-base font-medium">
                  优先级
                </Label>
                <select
                  id="priority"
                  value={assignment.priority || 'medium'}
                  onChange={(e) => setAssignment(prev => ({ 
                    ...prev, 
                    priority: e.target.value as PriorityType 
                  }))}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>

              <div>
                <Label htmlFor="totalPoints" className="text-base font-medium">
                  总分
                </Label>
                <Input
                  id="totalPoints"
                  type="number"
                  value={assignment.totalPoints || 100}
                  onChange={(e) => setAssignment(prev => ({ 
                    ...prev, 
                    totalPoints: parseInt(e.target.value) || 100 
                  }))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      case 1: // 练习选择
        return (
          <QuestionSelector
            exercises={availableExercises}
            selectedExercises={assignment.exercises || []}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onMoveExercise={moveExercise}
            onUpdateConfig={updateExerciseConfig}
          />
        )

      case 2: // 学生分配
        return (
          <AssignmentManager
            students={availableStudents}
            selectedStudents={assignment.assignedTo || []}
            onUpdateSelection={(studentIds) => 
              setAssignment(prev => ({ ...prev, assignedTo: studentIds }))
            }
          />
        )

      case 3: // 设置选项
        return (
          <TimeSettings
            assignment={assignment}
            onUpdate={(updates) => setAssignment(prev => ({ ...prev, ...updates }))}
          />
        )

      case 4: // 预览确认
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">作业预览</h3>
              
              <div className="space-y-4">
                <div>
                  <strong>标题:</strong> {assignment.title}
                </div>
                <div>
                  <strong>描述:</strong> {assignment.description || '无'}
                </div>
                <div>
                  <strong>分配给:</strong> {assignment.assignedTo?.length || 0} 名学生
                </div>
                <div>
                  <strong>练习数量:</strong> {assignment.exercises?.length || 0} 个
                </div>
                <div>
                  <strong>预估时间:</strong> {getTotalEstimatedTime()} 分钟
                </div>
                <div>
                  <strong>总分:</strong> {assignment.totalPoints} 分
                </div>
                <div>
                  <strong>及格分:</strong> {assignment.passingScore} 分
                </div>
                <div>
                  <strong>截止日期:</strong> {
                    assignment.dueDate 
                      ? new Date(assignment.dueDate).toLocaleString('zh-CN')
                      : '无限制'
                  }
                </div>
              </div>
            </Card>

            {assignment.exercises && assignment.exercises.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">练习列表</h3>
                <div className="space-y-2">
                  {assignment.exercises.map((exerciseConfig, index) => {
                    const exercise = availableExercises.find(e => e.id === exerciseConfig.exerciseId)
                    return (
                      <div key={exerciseConfig.exerciseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{index + 1}. {exercise?.title}</span>
                          <div className="text-sm text-gray-600">
                            {exercise?.subject} • {exercise?.difficulty}
                            {exerciseConfig.isRequired && <Badge className="ml-2">必做</Badge>}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          权重: {exerciseConfig.weight}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 步骤导航 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {assignmentId ? '编辑作业' : '创建作业'}
          </h2>
          <div className="text-sm text-gray-500">
            步骤 {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* 进度条 */}
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-6" />

        {/* 步骤标签 */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep || validateStep(index)
            const isClickable = index <= currentStep || isCompleted

            return (
              <button
                key={step.id}
                onClick={() => isClickable && goToStep(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{step.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* 步骤内容 */}
      <Card className="p-6 min-h-[500px]">
        {renderStepContent()}
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel || (() => window.history.back())}
        >
          取消
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            上一步
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              下一步
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={loading || !validateAllSteps()}
              >
                <Save size={16} className="mr-2" />
                保存草稿
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={loading || !validateAllSteps()}
              >
                <Send size={16} className="mr-2" />
                发布作业
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}