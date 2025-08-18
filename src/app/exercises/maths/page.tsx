'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TopicSelector, MathExercise, MathResults } from '@/components/exercises/maths'
import { MathExercise as MathExerciseType, MathTopic, MathSubmission } from '@/types'

type ViewMode = 'topic-selection' | 'exercise' | 'results' | 'loading'

interface MathSubmissionResult {
  id?: string
  score: number
  maxScore: number
  correctAnswers: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  feedback?: any
}

export default function MathExercisePage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('topic-selection')
  const [availableExercises, setAvailableExercises] = useState<MathExerciseType[]>([])
  const [currentExercise, setCurrentExercise] = useState<MathExerciseType | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null)
  const [results, setResults] = useState<MathSubmissionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAvailableExercises()
  }, [])

  const loadAvailableExercises = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/exercises/maths', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load exercises')
      }

      const data = await response.json()
      if (data.success) {
        setAvailableExercises(data.exercises)
      } else {
        throw new Error(data.error || 'Failed to load exercises')
      }
    } catch (err) {
      console.error('Error loading exercises:', err)
      setError(err instanceof Error ? err.message : 'Failed to load exercises')
    }
  }

  const handleTopicSelect = async (topic: MathTopic, yearLevel?: number, difficulty?: string) => {
    setViewMode('loading')
    setSelectedTopic(topic)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (yearLevel) params.set('yearLevel', yearLevel.toString())
      if (difficulty) params.set('difficulty', difficulty)
      params.set('limit', '1') // For now, just get one exercise

      const response = await fetch(`/api/exercises/maths/${topic}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load topic exercises')
      }

      const data = await response.json()
      if (data.success && data.exercises.length > 0) {
        setCurrentExercise(data.exercises[0])
        setViewMode('exercise')
      } else {
        throw new Error('No exercises found for this topic')
      }
    } catch (err) {
      console.error('Error loading topic exercises:', err)
      setError(err instanceof Error ? err.message : 'Failed to load exercises')
      setViewMode('topic-selection')
    }
  }

  const handleExerciseComplete = async (submission: Partial<MathSubmission>) => {
    setViewMode('loading')

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/exercises/maths/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      })

      if (!response.ok) {
        throw new Error('Failed to submit exercise')
      }

      const data = await response.json()
      if (data.success) {
        setResults(data.submission)
        setViewMode('results')
      } else {
        throw new Error(data.error || 'Failed to submit exercise')
      }
    } catch (err) {
      console.error('Error submitting exercise:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit exercise')
      setViewMode('exercise')
    }
  }

  const handleRetry = () => {
    setResults(null)
    setViewMode('exercise')
  }

  const handleContinue = () => {
    setCurrentExercise(null)
    setResults(null)
    setSelectedTopic(null)
    setViewMode('topic-selection')
  }

  const handleBackToTopics = () => {
    setCurrentExercise(null)
    setResults(null)
    setSelectedTopic(null)
    setViewMode('topic-selection')
    setError(null)
  }

  const renderHeader = () => (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧮 Math Practice
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              Interactive Australian curriculum-aligned math exercises
            </p>
            {user && (
              <Badge variant="outline">
                Welcome, {user.displayName}
              </Badge>
            )}
          </div>
        </div>

        {viewMode !== 'topic-selection' && (
          <Button
            variant="outline"
            onClick={handleBackToTopics}
          >
            ← Back to Topics
          </Button>
        )}
      </div>
    </Card>
  )

  const renderError = () => (
    <Card className="p-8 text-center">
      <div className="text-red-600 mb-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-lg">{error}</p>
      </div>
      
      <div className="flex gap-4 justify-center mt-6">
        <Button onClick={handleBackToTopics}>
          Back to Topics
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </Card>
  )

  const renderLoading = () => (
    <Card className="p-8 text-center">
      <div className="text-blue-600 mb-4">
        <div className="text-6xl mb-4 animate-bounce">🧮</div>
        <h2 className="text-2xl font-bold mb-2">Loading Math Exercises...</h2>
        <p className="text-lg text-gray-600">
          {selectedTopic ? `Preparing ${selectedTopic.replace('-', ' ')} exercises` : 'Getting things ready for you'}
        </p>
      </div>
      
      <div className="flex justify-center mt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </Card>
  )

  const renderTopicSelection = () => (
    <TopicSelector
      onTopicSelect={handleTopicSelect}
      availableExercises={availableExercises}
      selectedYear={user?.yearLevel}
    />
  )

  const renderExercise = () => {
    if (!currentExercise) return null

    return (
      <MathExercise
        exercise={currentExercise}
        onComplete={handleExerciseComplete}
      />
    )
  }

  const renderResults = () => {
    if (!results) return null

    return (
      <MathResults
        submission={results}
        onRetry={handleRetry}
        onContinue={handleContinue}
        onReviewAnswers={() => {
          // This would show a detailed review of answers
          console.log('Review answers clicked')
        }}
      />
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {renderHeader()}

          {error && renderError()}

          {!error && (
            <>
              {viewMode === 'topic-selection' && renderTopicSelection()}
              {viewMode === 'exercise' && renderExercise()}
              {viewMode === 'results' && renderResults()}
              {viewMode === 'loading' && renderLoading()}
            </>
          )}

          {/* Fun Footer */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-gray-700 font-medium">
                "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding."
              </p>
              <p className="text-gray-500 text-sm mt-2">— William Paul Thurston</p>
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}