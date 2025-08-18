'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { ReadingExercise, ReadingSubmission, ReadingFeedback } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArticleDisplay } from './ArticleDisplay'
import { QuestionPanel } from './QuestionPanel'
import { ProgressBar } from './ProgressBar'
import { ResultsSummary } from './ResultsSummary'
import { Clock, BookOpen, Target, Award } from 'lucide-react'

interface ReadingExerciseProps {
  exerciseId: string
  onComplete?: (submission: ReadingSubmission) => void
}

type ExerciseState = 'loading' | 'reading' | 'answering' | 'completed' | 'error'

export function ReadingExercise({ exerciseId, onComplete }: ReadingExerciseProps) {
  const { user, getAuthToken } = useAuth()
  const [state, setState] = useState<ExerciseState>('loading')
  const [exercise, setExercise] = useState<ReadingExercise | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [submission, setSubmission] = useState<ReadingSubmission | null>(null)
  const [feedback, setFeedback] = useState<ReadingFeedback | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Timer effect
  useEffect(() => {
    if (startTime && state === 'answering') {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) // minutes
        setTimeElapsed(elapsed)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, state])

  // Load exercise data
  useEffect(() => {
    async function loadExercise() {
      try {
        const token = await getAuthToken()
        if (!token) {
          setError('Authentication required')
          setState('error')
          return
        }

        const response = await fetch(`/api/exercises/english/${exerciseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load exercise')
        }

        const data = await response.json()
        if (data.success) {
          setExercise(data.exercise)
          setState('reading')
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (err) {
        console.error('Error loading exercise:', err)
        setError(err instanceof Error ? err.message : 'Failed to load exercise')
        setState('error')
      }
    }

    loadExercise()
  }, [exerciseId, getAuthToken])

  const startAnswering = useCallback(() => {
    setStartTime(new Date())
    setState('answering')
  }, [])

  const handleAnswerChange = useCallback((questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  const nextQuestion = useCallback(() => {
    if (exercise && currentQuestion < exercise.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }, [exercise, currentQuestion])

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }, [currentQuestion])

  const submitExercise = useCallback(async () => {
    if (!exercise || !startTime) return

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const submissionData = {
        exerciseId: exercise.id,
        answers,
        startedAt: startTime.toISOString(),
        timeSpent: Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
      }

      const response = await fetch('/api/exercises/english/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit exercise')
      }

      const data = await response.json()
      if (data.success) {
        setSubmission(data.submission)
        setFeedback(data.feedback)
        setState('completed')
        onComplete?.(data.submission)
      } else {
        throw new Error(data.error || 'Submission failed')
      }
    } catch (err) {
      console.error('Error submitting exercise:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit exercise')
    }
  }, [exercise, startTime, answers, getAuthToken, onComplete])

  if (state === 'loading') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading reading exercise...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'error' || !exercise) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error || 'Failed to load exercise'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'completed' && submission && feedback) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ResultsSummary 
          submission={submission} 
          feedback={feedback}
          exercise={exercise}
        />
      </div>
    )
  }

  const progress = state === 'answering' 
    ? ((currentQuestion + 1) / exercise.questions.length) * 100 
    : 0

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              {exercise.description && (
                <p className="text-muted-foreground mt-2">{exercise.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Year {exercise.yearLevel}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{exercise.totalPoints} points</span>
              </div>
              {exercise.timeLimit && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{exercise.timeLimit} min</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      {state === 'answering' && (
        <ProgressBar 
          progress={progress}
          currentQuestion={currentQuestion + 1}
          totalQuestions={exercise.questions.length}
          timeElapsed={timeElapsed}
          timeLimit={exercise.timeLimit}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article Display */}
        <div className="space-y-4">
          <ArticleDisplay 
            article={exercise.article}
            showVocabulary={state === 'reading'}
          />
          
          {state === 'reading' && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Take your time to read and understand the article. When you're ready, click "Start Questions" to begin answering.
                </p>
                <Button onClick={startAnswering} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Questions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Question Panel */}
        {state === 'answering' && (
          <div className="space-y-4">
            <QuestionPanel
              question={exercise.questions[currentQuestion]}
              answer={answers[exercise.questions[currentQuestion].id]}
              onAnswerChange={handleAnswerChange}
            />
            
            {/* Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion < exercise.questions.length - 1 ? (
                    <Button onClick={nextQuestion}>
                      Next Question
                    </Button>
                  ) : (
                    <Button 
                      onClick={submitExercise}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Exercise
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}