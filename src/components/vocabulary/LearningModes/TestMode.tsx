/**
 * Test Mode Component
 * 测试模式组件 - 综合性词汇测试和评估
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Target,
  Volume2,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  BookOpen,
  TrendingUp,
  Star,
  RefreshCw,
} from 'lucide-react'

interface TestModeProps {
  onProgressUpdate?: () => void
}

interface TestWord {
  id: string
  word: string
  definition: string
  chineseDefinition?: string
  pronunciation?: string
  partOfSpeech: string
  difficulty: number
  category?: string
  example?: string
  synonyms: string[]
  antonyms: string[]
  userProgress?: {
    masteryLevel: number
    phase: string
  }
}

interface TestQuestion {
  id: number
  type: 'multiple_choice' | 'fill_blank' | 'spelling' | 'matching'
  word: TestWord
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
  timeSpent?: number
}

interface TestSession {
  questions: TestQuestion[]
  currentIndex: number
  startTime: Date
  settings: {
    duration: number // 分钟
    questionCount: number
    difficulty: string
    categories: string[]
    includeSpelling: boolean
  }
  results?: {
    totalQuestions: number
    correctAnswers: number
    totalTime: number
    accuracy: number
    categoriesScore: Record<string, { correct: number; total: number }>
    difficultyScore: Record<number, { correct: number; total: number }>
    recommendations: string[]
  }
}

const TEST_SETTINGS = {
  difficulty: [
    { value: 'mixed', label: '混合难度' },
    { value: 'easy', label: '简单 (1-2级)' },
    { value: 'medium', label: '中等 (3-4级)' },
    { value: 'hard', label: '困难 (4-5级)' },
  ],
  duration: [
    { value: 5, label: '5分钟' },
    { value: 10, label: '10分钟' },
    { value: 15, label: '15分钟' },
    { value: 20, label: '20分钟' },
  ],
  questionCount: [
    { value: 10, label: '10题' },
    { value: 20, label: '20题' },
    { value: 30, label: '30题' },
    { value: 50, label: '50题' },
  ],
}

export function TestMode({ onProgressUpdate }: TestModeProps) {
  const [session, setSession] = useState<TestSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())

  // 默认测试设置
  const [testSettings, setTestSettings] = useState({
    duration: 10,
    questionCount: 20,
    difficulty: 'mixed',
    categories: [] as string[],
    includeSpelling: true,
  })

  // 开始测试
  const startTest = useCallback(async () => {
    setLoading(true)
    try {
      // 根据设置获取词汇
      const params = new URLSearchParams({
        limit: (testSettings.questionCount * 2).toString(), // 获取更多词汇以便筛选
      })

      if (testSettings.difficulty !== 'mixed') {
        if (testSettings.difficulty === 'easy') {
          params.append('difficulty', '1')
          params.append('difficulty', '2')
        } else if (testSettings.difficulty === 'medium') {
          params.append('difficulty', '3')
          params.append('difficulty', '4')
        } else if (testSettings.difficulty === 'hard') {
          params.append('difficulty', '4')
          params.append('difficulty', '5')
        }
      }

      const response = await fetch(`/api/vocabulary?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        const words = data.words.slice(0, testSettings.questionCount)

        // 生成测试题目
        const questions = generateQuestions(words, testSettings)

        const newSession: TestSession = {
          questions,
          currentIndex: 0,
          startTime: new Date(),
          settings: testSettings,
        }

        setSession(newSession)
        setShowSettings(false)
        setRemainingTime(testSettings.duration * 60) // 转换为秒
        setQuestionStartTime(new Date())
      }
    } catch (error) {
      console.error('Failed to start test:', error)
    } finally {
      setLoading(false)
    }
  }, [testSettings])

  // 生成测试题目
  const generateQuestions = (
    words: TestWord[],
    settings: any
  ): TestQuestion[] => {
    const questions: TestQuestion[] = []
    const questionTypes = ['multiple_choice', 'fill_blank']

    if (settings.includeSpelling) {
      questionTypes.push('spelling')
    }

    words.forEach((word, index) => {
      const questionType = questionTypes[
        Math.floor(Math.random() * questionTypes.length)
      ] as TestQuestion['type']

      let question: TestQuestion = {
        id: index + 1,
        type: questionType,
        word: word,
        question: '',
        correctAnswer: '',
      }

      switch (questionType) {
        case 'multiple_choice':
          if (Math.random() > 0.5) {
            // 英译中
            question.question = `"${word.word}" 的中文意思是？`
            question.correctAnswer = word.chineseDefinition || word.definition
            question.options = generateMultipleChoiceOptions(
              question.correctAnswer,
              words.map(w => w.chineseDefinition || w.definition)
            )
          } else {
            // 中译英
            question.question = `"${word.chineseDefinition || word.definition}" 对应的英文单词是？`
            question.correctAnswer = word.word
            question.options = generateMultipleChoiceOptions(
              word.word,
              words.map(w => w.word)
            )
          }
          break

        case 'fill_blank':
          if (word.example) {
            question.question = `请填写句子中缺失的单词：\n"${word.example.replace(
              new RegExp(word.word, 'gi'),
              '______'
            )}"`
            question.correctAnswer = word.word
          } else {
            // 备选：根据定义填空
            question.question = `根据释义填写单词：${word.definition}`
            question.correctAnswer = word.word
          }
          break

        case 'spelling':
          question.question = `听音拼写（请根据发音和释义写出单词）：\n释义：${word.definition}`
          question.correctAnswer = word.word
          break
      }

      questions.push(question)
    })

    // 随机打乱题目顺序
    return questions.sort(() => Math.random() - 0.5)
  }

  // 生成选择题选项
  const generateMultipleChoiceOptions = (
    correctAnswer: string,
    allAnswers: string[]
  ): string[] => {
    const options = [correctAnswer]
    const availableAnswers = allAnswers.filter(
      answer => answer !== correctAnswer && answer && answer.length > 0
    )

    while (options.length < 4 && availableAnswers.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAnswers.length)
      const randomAnswer = availableAnswers.splice(randomIndex, 1)[0]
      options.push(randomAnswer)
    }

    return options.sort(() => Math.random() - 0.5)
  }

  // 计时器
  useEffect(() => {
    if (session && !session.results && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            finishTest() // 时间到，自动结束测试
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session, remainingTime])

  // 提交答案
  const submitAnswer = async (answer: string) => {
    if (!session) return

    const currentQuestion = session.questions[session.currentIndex]
    const isCorrect =
      answer.toLowerCase().trim() ===
      currentQuestion.correctAnswer.toLowerCase().trim()
    const timeSpent = Math.floor(
      (new Date().getTime() - questionStartTime.getTime()) / 1000
    )

    // 更新题目
    const updatedQuestions = [...session.questions]
    updatedQuestions[session.currentIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
    }

    // 更新词汇进度
    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentQuestion.word.id,
          isCorrect: isCorrect,
          timeSpent: timeSpent,
          practiceType: 'test',
        }),
      })

      onProgressUpdate?.()
    } catch (error) {
      console.error('Failed to update progress:', error)
    }

    setSession(prev =>
      prev
        ? {
            ...prev,
            questions: updatedQuestions,
          }
        : null
    )

    // 自动跳转到下一题
    setTimeout(() => {
      nextQuestion()
    }, 1500)
  }

  // 下一题
  const nextQuestion = () => {
    if (!session) return

    if (session.currentIndex < session.questions.length - 1) {
      setSession(prev =>
        prev
          ? {
              ...prev,
              currentIndex: prev.currentIndex + 1,
            }
          : null
      )
      setCurrentAnswer('')
      setQuestionStartTime(new Date())
    } else {
      finishTest()
    }
  }

  // 完成测试
  const finishTest = () => {
    if (!session) return

    const totalQuestions = session.questions.length
    const correctAnswers = session.questions.filter(q => q.isCorrect).length
    const totalTime = Math.floor(
      (new Date().getTime() - session.startTime.getTime()) / 1000
    )
    const accuracy = (correctAnswers / totalQuestions) * 100

    // 分类统计
    const categoriesScore: Record<string, { correct: number; total: number }> =
      {}
    const difficultyScore: Record<number, { correct: number; total: number }> =
      {}

    session.questions.forEach(question => {
      const category = question.word.category || 'Unknown'
      const difficulty = question.word.difficulty

      if (!categoriesScore[category]) {
        categoriesScore[category] = { correct: 0, total: 0 }
      }
      if (!difficultyScore[difficulty]) {
        difficultyScore[difficulty] = { correct: 0, total: 0 }
      }

      categoriesScore[category].total++
      difficultyScore[difficulty].total++

      if (question.isCorrect) {
        categoriesScore[category].correct++
        difficultyScore[difficulty].correct++
      }
    })

    // 生成建议
    const recommendations = generateRecommendations(
      accuracy,
      categoriesScore,
      difficultyScore
    )

    setSession(prev =>
      prev
        ? {
            ...prev,
            results: {
              totalQuestions,
              correctAnswers,
              totalTime,
              accuracy,
              categoriesScore,
              difficultyScore,
              recommendations,
            },
          }
        : null
    )
  }

  // 生成学习建议
  const generateRecommendations = (
    accuracy: number,
    categoriesScore: Record<string, { correct: number; total: number }>,
    difficultyScore: Record<number, { correct: number; total: number }>
  ): string[] => {
    const recommendations: string[] = []

    if (accuracy >= 90) {
      recommendations.push(
        '🎉 优秀！您的词汇掌握非常好，可以挑战更高难度的词汇。'
      )
    } else if (accuracy >= 70) {
      recommendations.push('👍 良好！继续保持，建议多练习错题。')
    } else if (accuracy >= 50) {
      recommendations.push('📚 需要加强练习，建议重点复习基础词汇。')
    } else {
      recommendations.push('💪 基础需要巩固，建议从简单词汇开始系统学习。')
    }

    // 分类建议
    Object.entries(categoriesScore).forEach(([category, score]) => {
      const categoryAccuracy = (score.correct / score.total) * 100
      if (categoryAccuracy < 60) {
        recommendations.push(`📖 ${category}主题词汇需要重点加强练习。`)
      }
    })

    // 难度建议
    const lowDifficultyAccuracy =
      difficultyScore[1] && difficultyScore[2]
        ? ((difficultyScore[1].correct + difficultyScore[2].correct) /
            (difficultyScore[1].total + difficultyScore[2].total)) *
          100
        : 0

    if (lowDifficultyAccuracy < 80) {
      recommendations.push('🔤 建议先巩固基础词汇再进阶高难度词汇。')
    }

    return recommendations
  }

  // 文本转语音
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-AU'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // 重新开始测试
  const resetTest = () => {
    setSession(null)
    setShowSettings(true)
    setRemainingTime(0)
    setCurrentAnswer('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // 测试设置界面
  if (showSettings) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            词汇测试设置
          </h2>

          <div className="space-y-6">
            {/* 测试时长 */}
            <div>
              <label className="block text-sm font-medium mb-2">测试时长</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEST_SETTINGS.duration.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      testSettings.duration === option.value
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setTestSettings(prev => ({
                        ...prev,
                        duration: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 题目数量 */}
            <div>
              <label className="block text-sm font-medium mb-2">题目数量</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEST_SETTINGS.questionCount.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      testSettings.questionCount === option.value
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setTestSettings(prev => ({
                        ...prev,
                        questionCount: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 难度选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">难度等级</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {TEST_SETTINGS.difficulty.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      testSettings.difficulty === option.value
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setTestSettings(prev => ({
                        ...prev,
                        difficulty: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 包含拼写题 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeSpelling"
                checked={testSettings.includeSpelling}
                onChange={e =>
                  setTestSettings(prev => ({
                    ...prev,
                    includeSpelling: e.target.checked,
                  }))
                }
              />
              <label htmlFor="includeSpelling" className="text-sm font-medium">
                包含拼写题目
              </label>
            </div>

            <Button onClick={startTest} className="w-full py-3">
              <Target className="h-4 w-4 mr-2" />
              开始测试
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 测试结果界面
  if (session?.results) {
    const { results } = session

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 总体成绩 */}
        <Card className="p-6 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-3xl font-bold mb-2">测试完成！</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {results.correctAnswers}
              </p>
              <p className="text-sm text-gray-600">正确题数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {results.accuracy.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">正确率</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(results.totalTime / 60)}:
                {(results.totalTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-600">用时</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {results.totalQuestions}
              </p>
              <p className="text-sm text-gray-600">总题数</p>
            </div>
          </div>
        </Card>

        {/* 分类成绩 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">主题表现</h3>
            <div className="space-y-3">
              {Object.entries(results.categoriesScore).map(
                ([category, score]) => {
                  const accuracy = (score.correct / score.total) * 100
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              accuracy >= 80
                                ? 'bg-green-500'
                                : accuracy >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12">
                          {score.correct}/{score.total}
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">难度表现</h3>
            <div className="space-y-3">
              {Object.entries(results.difficultyScore).map(
                ([difficulty, score]) => {
                  const accuracy = (score.correct / score.total) * 100
                  return (
                    <div
                      key={difficulty}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        难度 {difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              accuracy >= 80
                                ? 'bg-green-500'
                                : accuracy >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12">
                          {score.correct}/{score.total}
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </Card>
        </div>

        {/* 学习建议 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            学习建议
          </h3>
          <div className="space-y-2">
            {results.recommendations.map((recommendation, index) => (
              <p
                key={index}
                className="text-gray-700 p-3 bg-gray-50 rounded-lg"
              >
                {recommendation}
              </p>
            ))}
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <Button onClick={resetTest} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新测试
          </Button>
          <Button onClick={() => window.print()}>打印成绩单</Button>
        </div>
      </div>
    )
  }

  // 测试进行界面
  if (session) {
    const currentQuestion = session.questions[session.currentIndex]
    const progress =
      ((session.currentIndex + 1) / session.questions.length) * 100

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 测试状态栏 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                题目 {session.currentIndex + 1} / {session.questions.length}
              </span>
              <Badge variant="outline">
                {currentQuestion.word.partOfSpeech}
              </Badge>
              <Badge
                className={`${
                  currentQuestion.word.difficulty <= 2
                    ? 'bg-green-100 text-green-800'
                    : currentQuestion.word.difficulty <= 3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                难度 {currentQuestion.word.difficulty}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                剩余 {Math.floor(remainingTime / 60)}:
                {(remainingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </Card>

        {/* 题目内容 */}
        <Card className="p-8">
          <div className="text-center space-y-6">
            {/* 单词和发音 */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <h2 className="text-3xl font-bold">
                {currentQuestion.word.word}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(currentQuestion.word.word)}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            {/* 题目 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg font-medium whitespace-pre-line">
                {currentQuestion.question}
              </p>
            </div>

            {/* 根据题目类型显示不同的输入方式 */}
            {currentQuestion.type === 'multiple_choice' &&
              currentQuestion.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left"
                      onClick={() => submitAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

            {(currentQuestion.type === 'fill_blank' ||
              currentQuestion.type === 'spelling') && (
              <div className="space-y-4">
                <Input
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="请输入答案"
                  className="text-center text-lg p-4"
                  onKeyPress={e => {
                    if (e.key === 'Enter' && currentAnswer.trim()) {
                      submitAnswer(currentAnswer.trim())
                    }
                  }}
                />
                <Button
                  onClick={() => submitAnswer(currentAnswer.trim())}
                  disabled={!currentAnswer.trim()}
                  className="px-8"
                >
                  提交答案
                </Button>
              </div>
            )}

            {/* 显示答案结果 */}
            {currentQuestion.userAnswer && (
              <div
                className={`p-6 rounded-lg ${
                  currentQuestion.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {currentQuestion.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span
                    className={`text-lg font-semibold ${
                      currentQuestion.isCorrect
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {currentQuestion.isCorrect ? '正确！' : '错误'}
                  </span>
                </div>

                {!currentQuestion.isCorrect && (
                  <div className="mb-3">
                    <p className="text-red-700">
                      您的答案: {currentQuestion.userAnswer}
                    </p>
                    <p className="text-red-700">
                      正确答案: {currentQuestion.correctAnswer}
                    </p>
                  </div>
                )}

                <div className="bg-white p-4 rounded border">
                  <p>
                    <strong>释义:</strong> {currentQuestion.word.definition}
                  </p>
                  {currentQuestion.word.chineseDefinition && (
                    <p className="mt-1">
                      <strong>中文:</strong>{' '}
                      {currentQuestion.word.chineseDefinition}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return null
}
