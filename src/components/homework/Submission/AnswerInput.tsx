'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  CheckSquare,
  Square,
  Circle,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
} from 'lucide-react'
import { Exercise, Question } from '@/types'

interface AnswerInputProps {
  exercise: Exercise
  answers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  disabled?: boolean
}

export default function AnswerInput({
  exercise,
  answers,
  onAnswerChange,
  disabled = false,
}: AnswerInputProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [savedAnswers, setSavedAnswers] = useState<Record<string, boolean>>({})

  const questions = exercise.questions || []
  const currentQuestion = questions[currentQuestionIndex]

  // 自动保存答案
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (currentQuestion && answers[currentQuestion.id]) {
        setSavedAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: true,
        }))
      }
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [answers, currentQuestion])

  if (!currentQuestion) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无题目</h3>
        <p className="text-gray-600">此练习还没有设置题目。</p>
      </Card>
    )
  }

  // 渲染不同题型的输入组件
  const renderAnswerInput = () => {
    const answer = answers[currentQuestion.id] || ''

    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return renderMultipleChoice(answer)

      case 'TRUE_FALSE':
        return renderTrueFalse(answer)

      case 'SHORT_ANSWER':
        return renderShortAnswer(answer)

      case 'LONG_ANSWER':
        return renderLongAnswer(answer)

      case 'MATCHING':
        return renderMatching(answer)

      case 'FILL_IN_BLANK':
        return renderFillInBlank(answer)

      default:
        return renderGenericInput(answer)
    }
  }

  // 选择题
  const renderMultipleChoice = (answer: string) => {
    const options = currentQuestion.options || []

    return (
      <div className="space-y-3">
        <RadioGroup
          value={answer}
          onValueChange={value =>
            !disabled && onAnswerChange(currentQuestion.id, value)
          }
          disabled={disabled}
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className={`cursor-pointer ${disabled ? 'text-gray-500' : ''}`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  // 判断题
  const renderTrueFalse = (answer: string) => {
    return (
      <div className="space-y-3">
        <RadioGroup
          value={answer}
          onValueChange={value =>
            !disabled && onAnswerChange(currentQuestion.id, value)
          }
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label
              htmlFor="true"
              className={`cursor-pointer ${disabled ? 'text-gray-500' : ''}`}
            >
              正确
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label
              htmlFor="false"
              className={`cursor-pointer ${disabled ? 'text-gray-500' : ''}`}
            >
              错误
            </Label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  // 简答题
  const renderShortAnswer = (answer: string) => {
    return (
      <Input
        value={answer}
        onChange={e =>
          !disabled && onAnswerChange(currentQuestion.id, e.target.value)
        }
        placeholder="请输入您的答案"
        disabled={disabled}
        className="text-base"
      />
    )
  }

  // 长答题
  const renderLongAnswer = (answer: string) => {
    return (
      <Textarea
        value={answer}
        onChange={e =>
          !disabled && onAnswerChange(currentQuestion.id, e.target.value)
        }
        placeholder="请输入您的详细答案"
        rows={6}
        disabled={disabled}
        className="text-base resize-none"
      />
    )
  }

  // 连线题
  const renderMatching = (answer: string) => {
    const leftItems = currentQuestion.leftItems || []
    const rightItems = currentQuestion.rightItems || []
    const matches = answer ? JSON.parse(answer) : {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">左侧选项</h4>
            <div className="space-y-2">
              {leftItems.map((item, index) => (
                <Card key={index} className="p-3 bg-blue-50">
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}.
                  </span>{' '}
                  {item}
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">右侧选项</h4>
            <div className="space-y-2">
              {rightItems.map((item, index) => (
                <Card key={index} className="p-3 bg-green-50">
                  <span className="font-medium">{index + 1}.</span> {item}
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3">
            请输入连线答案 (格式: A-1, B-2, ...)
          </h4>
          <Input
            value={answer}
            onChange={e =>
              !disabled && onAnswerChange(currentQuestion.id, e.target.value)
            }
            placeholder="例如: A-1, B-3, C-2"
            disabled={disabled}
          />
        </div>
      </div>
    )
  }

  // 填空题
  const renderFillInBlank = (answer: string) => {
    const blanks = currentQuestion.blanks || []
    const answers = answer ? JSON.parse(answer) : {}

    return (
      <div className="space-y-4">
        <div className="text-base leading-relaxed">
          {currentQuestion.text?.split('____').map((part, index) => (
            <span key={index}>
              {part}
              {index < blanks.length && (
                <Input
                  key={`blank-${index}`}
                  value={answers[index] || ''}
                  onChange={e => {
                    if (!disabled) {
                      const newAnswers = { ...answers, [index]: e.target.value }
                      onAnswerChange(
                        currentQuestion.id,
                        JSON.stringify(newAnswers)
                      )
                    }
                  }}
                  className="inline-block w-32 mx-2"
                  disabled={disabled}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // 通用输入
  const renderGenericInput = (answer: string) => {
    return (
      <Textarea
        value={answer}
        onChange={e =>
          !disabled && onAnswerChange(currentQuestion.id, e.target.value)
        }
        placeholder="请输入您的答案"
        rows={4}
        disabled={disabled}
        className="text-base"
      />
    )
  }

  // 获取答题状态
  const getAnswerStatus = (questionIndex: number) => {
    const question = questions[questionIndex]
    const hasAnswer = answers[question.id] && answers[question.id].trim() !== ''
    const isSaved = savedAnswers[question.id]

    if (hasAnswer && isSaved) {
      return 'completed'
    } else if (hasAnswer) {
      return 'answered'
    } else {
      return 'unanswered'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'answered':
        return <Circle size={16} className="text-yellow-600" />
      default:
        return <Circle size={16} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 题目导航 */}
      {questions.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">题目导航</h3>
            <span className="text-sm text-gray-600">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((question, index) => {
              const status = getAnswerStatus(index)
              const isCurrent = index === currentQuestionIndex

              return (
                <Button
                  key={question.id}
                  variant={isCurrent ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex items-center justify-center ${
                    status === 'completed'
                      ? 'border-green-500'
                      : status === 'answered'
                        ? 'border-yellow-500'
                        : ''
                  }`}
                >
                  <span className="mr-1">{index + 1}</span>
                  {getStatusIcon(status)}
                </Button>
              )
            })}
          </div>
        </Card>
      )}

      {/* 当前题目 */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">
                第 {currentQuestionIndex + 1} 题
              </h3>
              <span className="text-sm text-gray-500">
                ({currentQuestion.points} 分)
              </span>
              {savedAnswers[currentQuestion.id] && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Save size={14} />
                  已保存
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-base leading-relaxed mb-4">
                {currentQuestion.question}
              </div>

              {currentQuestion.image && (
                <div className="mb-4">
                  <img
                    src={currentQuestion.image}
                    alt="题目图片"
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              {currentQuestion.hint && (
                <Card className="p-3 bg-yellow-50 border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>提示：</strong> {currentQuestion.hint}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {currentQuestion.timeLimit && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              限时 {currentQuestion.timeLimit} 分钟
            </div>
          )}
        </div>

        {/* 答题区域 */}
        <div className="mb-6">{renderAnswerInput()}</div>

        {/* 题目操作按钮 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
          >
            上一题
          </Button>

          <div className="flex gap-2">
            {!disabled && (
              <Button
                variant="outline"
                onClick={() => {
                  setSavedAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: true,
                  }))
                }}
                disabled={!answers[currentQuestion.id]?.trim()}
              >
                <Save size={16} className="mr-2" />
                保存答案
              </Button>
            )}

            <Button
              onClick={() =>
                setCurrentQuestionIndex(
                  Math.min(questions.length - 1, currentQuestionIndex + 1)
                )
              }
              disabled={currentQuestionIndex === questions.length - 1}
            >
              下一题
            </Button>
          </div>
        </div>
      </Card>

      {/* 答题统计 */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(savedAnswers).filter(Boolean).length}
            </div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {Object.keys(answers).length -
                Object.values(savedAnswers).filter(Boolean).length}
            </div>
            <div className="text-sm text-gray-600">已作答</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {questions.length - Object.keys(answers).length}
            </div>
            <div className="text-sm text-gray-600">未作答</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
