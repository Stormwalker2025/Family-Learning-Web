/**
 * New Word Learning Component
 * 新词学习组件 - 系统化的新词汇学习流程
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Star,
  Target,
  Clock,
} from 'lucide-react'

interface NewWordLearningProps {
  onProgressUpdate?: () => void
}

interface VocabularyWord {
  id: string
  word: string
  definition: string
  chineseDefinition?: string
  pronunciation?: string
  partOfSpeech: string
  difficulty: number
  yearLevel?: number
  category?: string
  example?: string
  synonyms: string[]
  antonyms: string[]
}

interface LearningSession {
  words: VocabularyWord[]
  currentIndex: number
  completedWords: string[]
  sessionStats: {
    startTime: Date
    totalWords: number
    correctAnswers: number
    studyTime: number
  }
}

const LEARNING_PHASES = [
  {
    id: 'introduction',
    name: '单词介绍',
    description: '初次接触新单词，了解基本信息',
    icon: Eye,
  },
  {
    id: 'recognition',
    name: '词义识别',
    description: '看英文选择正确的中文释义',
    icon: Target,
  },
  {
    id: 'comprehension',
    name: '理解练习',
    description: '根据释义选择正确的英文单词',
    icon: BookOpen,
  },
  {
    id: 'application',
    name: '应用练习',
    description: '在语境中理解和使用单词',
    icon: Star,
  },
]

export function NewWordLearning({ onProgressUpdate }: NewWordLearningProps) {
  const [session, setSession] = useState<LearningSession | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>('introduction')
  const [loading, setLoading] = useState(false)
  const [showDefinition, setShowDefinition] = useState(false)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [studyStartTime, setStudyStartTime] = useState<Date>(new Date())

  // 获取新词汇进行学习
  const startNewSession = useCallback(async () => {
    setLoading(true)
    try {
      // 获取还未开始学习的词汇
      const response = await fetch(
        '/api/vocabulary/progress?needsReview=false&phase=',
        {
          method: 'GET',
        }
      )

      if (response.ok) {
        const data = await response.json()

        // 获取还未学习的词汇
        const unlearnedWords =
          data.progress?.filter(
            (p: any) => p.attempts === 0 || p.masteryLevel < 30
          ) || []

        if (unlearnedWords.length === 0) {
          // 如果没有未学习的词汇，获取一些随机词汇
          const wordsResponse = await fetch('/api/vocabulary?limit=10')
          if (wordsResponse.ok) {
            const wordsData = await wordsResponse.json()
            initializeSession(wordsData.words.slice(0, 5))
          }
        } else {
          // 选择前5个未学习的词汇
          const wordsToLearn = unlearnedWords
            .slice(0, 5)
            .map((p: any) => p.word)
          initializeSession(wordsToLearn)
        }
      }
    } catch (error) {
      console.error('Failed to start learning session:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化学习会话
  const initializeSession = (words: VocabularyWord[]) => {
    const newSession: LearningSession = {
      words: words,
      currentIndex: 0,
      completedWords: [],
      sessionStats: {
        startTime: new Date(),
        totalWords: words.length,
        correctAnswers: 0,
        studyTime: 0,
      },
    }

    setSession(newSession)
    setCurrentPhase('introduction')
    setStudyStartTime(new Date())
    setShowDefinition(false)
    setShowResult(false)
  }

  // 初始加载
  useEffect(() => {
    startNewSession()
  }, [startNewSession])

  // 文本转语音
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-AU'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // 处理阶段切换
  const handlePhaseComplete = async () => {
    if (!session) return

    const currentWord = session.words[session.currentIndex]
    const studyTime = Math.floor(
      (new Date().getTime() - studyStartTime.getTime()) / 1000
    )

    // 更新学习进度
    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          isCorrect: isCorrect,
          timeSpent: studyTime,
          practiceType: currentPhase,
        }),
      })

      onProgressUpdate?.()
    } catch (error) {
      console.error('Failed to update progress:', error)
    }

    // 切换到下一个阶段或下一个单词
    const currentPhaseIndex = LEARNING_PHASES.findIndex(
      p => p.id === currentPhase
    )

    if (currentPhaseIndex < LEARNING_PHASES.length - 1) {
      // 下一个阶段
      setCurrentPhase(LEARNING_PHASES[currentPhaseIndex + 1].id)
      setShowDefinition(false)
      setShowResult(false)
      setUserAnswer('')
      setStudyStartTime(new Date())
    } else {
      // 下一个单词
      if (session.currentIndex < session.words.length - 1) {
        setSession(prev =>
          prev
            ? {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                completedWords: [...prev.completedWords, currentWord.id],
                sessionStats: {
                  ...prev.sessionStats,
                  correctAnswers: isCorrect
                    ? prev.sessionStats.correctAnswers + 1
                    : prev.sessionStats.correctAnswers,
                },
              }
            : null
        )
        setCurrentPhase('introduction')
        setShowDefinition(false)
        setShowResult(false)
        setUserAnswer('')
        setStudyStartTime(new Date())
      } else {
        // 完成所有单词
        completeSession()
      }
    }
  }

  // 完成学习会话
  const completeSession = () => {
    if (!session) return

    const totalTime = Math.floor(
      (new Date().getTime() - session.sessionStats.startTime.getTime()) / 1000
    )
    const accuracy =
      (session.sessionStats.correctAnswers / session.sessionStats.totalWords) *
      100

    alert(
      `学习完成！\n总用时: ${Math.floor(totalTime / 60)}分${totalTime % 60}秒\n正确率: ${accuracy.toFixed(1)}%`
    )

    // 重新开始新的会话
    startNewSession()
  }

  // 生成练习选项
  const generateOptions = (
    correctAnswer: string,
    type: 'chinese' | 'english'
  ) => {
    if (!session) return []

    const currentWord = session.words[session.currentIndex]
    const allWords = session.words
    const options = [correctAnswer]

    // 添加错误选项
    while (options.length < 4) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
      const option =
        type === 'chinese'
          ? randomWord.chineseDefinition || randomWord.definition
          : randomWord.word

      if (!options.includes(option)) {
        options.push(option)
      }
    }

    // 随机排序
    return options.sort(() => Math.random() - 0.5)
  }

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentWord = session.words[session.currentIndex]
  const currentPhaseInfo = LEARNING_PHASES.find(p => p.id === currentPhase)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 会话状态 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">新词学习</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              单词 {session.currentIndex + 1} / {session.words.length}
            </span>
            <span>
              正确率{' '}
              {Math.round(
                (session.sessionStats.correctAnswers /
                  Math.max(session.completedWords.length, 1)) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        <Progress
          value={
            ((session.currentIndex * LEARNING_PHASES.length +
              LEARNING_PHASES.findIndex(p => p.id === currentPhase) +
              1) /
              (session.words.length * LEARNING_PHASES.length)) *
            100
          }
          className="h-3"
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">
            当前阶段: {currentPhaseInfo?.name}
          </span>
          <span className="text-sm text-blue-600">
            {currentPhaseInfo?.description}
          </span>
        </div>
      </Card>

      {/* 学习阶段指示器 */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          {LEARNING_PHASES.map((phase, index) => {
            const Icon = phase.icon
            const isActive = phase.id === currentPhase
            const isCompleted =
              LEARNING_PHASES.findIndex(p => p.id === currentPhase) > index

            return (
              <div key={phase.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{phase.name}</span>
                </div>
                {index < LEARNING_PHASES.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* 主要学习内容 */}
      <Card className="p-8">
        <div className="text-center space-y-6">
          {/* 单词头部 */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <h1 className="text-4xl font-bold text-gray-900">
                {currentWord.word}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(currentWord.word)}
                className="p-2"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            {currentWord.pronunciation && (
              <p className="text-lg text-gray-600">
                /{currentWord.pronunciation}/
              </p>
            )}

            <div className="flex justify-center space-x-2">
              <Badge variant="outline">{currentWord.partOfSpeech}</Badge>
              <Badge
                className={`${
                  currentWord.difficulty <= 2
                    ? 'bg-green-100 text-green-800'
                    : currentWord.difficulty <= 3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                难度 {currentWord.difficulty}
              </Badge>
              {currentWord.category && (
                <Badge variant="secondary">{currentWord.category}</Badge>
              )}
            </div>
          </div>

          {/* 根据学习阶段显示不同内容 */}
          {currentPhase === 'introduction' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center justify-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>单词释义</span>
                </h3>
                <p className="text-lg mb-2">{currentWord.definition}</p>
                {currentWord.chineseDefinition && (
                  <p className="text-gray-700">
                    {currentWord.chineseDefinition}
                  </p>
                )}
              </div>

              {currentWord.example && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">例句</h4>
                  <p className="italic">"{currentWord.example}"</p>
                </div>
              )}

              {(currentWord.synonyms.length > 0 ||
                currentWord.antonyms.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentWord.synonyms.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-green-800">
                        同义词
                      </h4>
                      <p className="text-green-700">
                        {currentWord.synonyms.join(', ')}
                      </p>
                    </div>
                  )}
                  {currentWord.antonyms.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-red-800">反义词</h4>
                      <p className="text-red-700">
                        {currentWord.antonyms.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => {
                  setIsCorrect(true)
                  handlePhaseComplete()
                }}
                className="px-8 py-3"
              >
                我记住了，继续
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentPhase === 'recognition' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">选择正确的中文释义</h3>

              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(
                    currentWord.chineseDefinition || currentWord.definition,
                    'chinese'
                  ).map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left"
                      onClick={() => {
                        setUserAnswer(option)
                        setIsCorrect(
                          option ===
                            (currentWord.chineseDefinition ||
                              currentWord.definition)
                        )
                        setShowResult(true)
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {showResult && (
                <div
                  className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {isCorrect ? '正确！' : '错误'}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="mb-4">
                      <p className="text-red-700">正确答案是：</p>
                      <p className="font-semibold">
                        {currentWord.chineseDefinition ||
                          currentWord.definition}
                      </p>
                    </div>
                  )}

                  <Button onClick={handlePhaseComplete}>
                    继续下一阶段
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'comprehension' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">
                  根据释义选择正确的单词
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg">{currentWord.definition}</p>
                  {currentWord.chineseDefinition && (
                    <p className="text-gray-700 mt-2">
                      {currentWord.chineseDefinition}
                    </p>
                  )}
                </div>
              </div>

              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(currentWord.word, 'english').map(
                    (option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="p-4 h-auto"
                        onClick={() => {
                          setUserAnswer(option)
                          setIsCorrect(option === currentWord.word)
                          setShowResult(true)
                        }}
                      >
                        {option}
                      </Button>
                    )
                  )}
                </div>
              )}

              {showResult && (
                <div
                  className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {isCorrect ? '正确！' : '错误'}
                    </span>
                  </div>

                  <Button onClick={handlePhaseComplete}>
                    继续下一阶段
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'application' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">语境应用</h3>

              {currentWord.example && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-lg mb-4">
                    {currentWord.example.replace(
                      new RegExp(currentWord.word, 'gi'),
                      '______'
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    请选择最适合填入空白处的单词
                  </p>
                </div>
              )}

              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(currentWord.word, 'english').map(
                    (option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="p-4 h-auto"
                        onClick={() => {
                          setUserAnswer(option)
                          setIsCorrect(option === currentWord.word)
                          setShowResult(true)
                        }}
                      >
                        {option}
                      </Button>
                    )
                  )}
                </div>
              )}

              {showResult && (
                <div
                  className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {isCorrect ? '太棒了！' : '再试一次'}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded border mb-4">
                    <p className="text-lg">
                      {currentWord.example?.replace(
                        new RegExp(currentWord.word, 'gi'),
                        `<strong>${currentWord.word}</strong>`
                      )}
                    </p>
                  </div>

                  <Button onClick={handlePhaseComplete}>
                    {session.currentIndex < session.words.length - 1
                      ? '下一个单词'
                      : '完成学习'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* 重新开始按钮 */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={startNewSession}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重新开始学习</span>
        </Button>
      </div>
    </div>
  )
}
