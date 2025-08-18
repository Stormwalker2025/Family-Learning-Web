'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { MathExercise as MathExerciseType, MathQuestion, MathSubmission } from '@/types'
import { PlaceValueQuestion, FractionQuestion, AreaPerimeterQuestion } from './QuestionTypes'

interface MathExerciseProps {
  exercise: MathExerciseType
  onComplete: (submission: Partial<MathSubmission>) => void
  className?: string
}

interface Answer {
  questionId: string
  answer: any
  timeSpent: number
}

export const MathExercise: React.FC<MathExerciseProps> = ({
  exercise,
  onComplete,
  className = ''
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showConceptIntro, setShowConceptIntro] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)

  const currentQuestion = exercise.questions[currentQuestionIndex]
  const progress = (currentQuestionIndex / exercise.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === exercise.questions.length - 1

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer }
    setAnswers(newAnswers)

    // Check if answer is correct
    const correct = checkAnswer(currentQuestion, answer)
    setIsCorrect(correct)
    setShowFeedback(true)
  }

  const checkAnswer = (question: MathQuestion, userAnswer: any): boolean => {
    if (!userAnswer || userAnswer === null || userAnswer === undefined) {
      return false
    }

    const correctAnswer = question.correctAnswer

    switch (question.type) {
      case 'multiple-choice':
        return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
      
      case 'true-false':
        return Boolean(userAnswer) === Boolean(correctAnswer)
      
      case 'input-answer':
      case 'calculation':
        // Handle numeric answers with tolerance
        if (question.tolerance && question.tolerance > 0) {
          const userNum = parseFloat(String(userAnswer).replace(/[^0-9.-]/g, ''))
          const correctNum = parseFloat(String(correctAnswer).replace(/[^0-9.-]/g, ''))
          return Math.abs(userNum - correctNum) <= question.tolerance
        }
        return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
      
      case 'drag-drop':
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
      
      case 'place-value-builder':
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
      
      case 'unit-conversion':
        const userConverted = parseFloat(String(userAnswer).replace(/[^0-9.-]/g, ''))
        const correctConverted = parseFloat(String(correctAnswer).replace(/[^0-9.-]/g, ''))
        const tolerance = question.tolerance || 0.01
        return Math.abs(userConverted - correctConverted) <= tolerance
      
      default:
        return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowFeedback(false)
      setIsCorrect(null)
      setQuestionStartTime(Date.now())
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowFeedback(false)
      setIsCorrect(null)
      setQuestionStartTime(Date.now())
    }
  }

  const handleSubmit = () => {
    const totalTimeMinutes = Math.round((Date.now() - startTime) / (1000 * 60))
    
    const submission: Partial<MathSubmission> = {
      exerciseId: exercise.id,
      answers,
      startedAt: new Date(startTime),
      submittedAt: new Date(),
      timeSpent: totalTimeMinutes,
      toolUsage: {} // This would be tracked by individual tools
    }

    onComplete(submission)
  }

  const renderConceptIntro = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {exercise.conceptIntro.title}
        </h2>
        <Badge variant="outline" className="mb-4">
          {exercise.topic.replace('-', ' ').toUpperCase()} • Year {exercise.yearLevel}
        </Badge>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">What you'll learn:</h3>
        <p className="text-blue-800 mb-4">{exercise.conceptIntro.explanation}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Key Terms:</h4>
            <ul className="space-y-2">
              {exercise.conceptIntro.keyTerms.slice(0, 3).map((term, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-blue-800">{term.term}:</span>
                  <span className="text-blue-700 ml-1">{term.definition}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-blue-900 mb-2">Real-world uses:</h4>
            <ul className="space-y-1">
              {exercise.conceptIntro.realWorldApplications.slice(0, 3).map((app, index) => (
                <li key={index} className="text-sm text-blue-700">• {app}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {exercise.conceptIntro.examples.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">Example:</h3>
          <div className="space-y-3">
            <div className="text-green-800">
              <strong>Problem:</strong> {exercise.conceptIntro.examples[0].problem}
            </div>
            <div className="text-green-700">
              <strong>Solution:</strong> {exercise.conceptIntro.examples[0].solution}
            </div>
            {exercise.conceptIntro.examples[0].steps && (
              <div className="space-y-2">
                <div className="font-medium text-green-900">Steps:</div>
                {exercise.conceptIntro.examples[0].steps.map((step, index) => (
                  <div key={index} className="text-sm text-green-700 ml-4">
                    {step.stepNumber}. {step.description}
                    {step.calculation && (
                      <div className="font-mono text-green-600 ml-4">{step.calculation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => setShowConceptIntro(false)}
          size="lg"
          className="px-8"
        >
          Start Exercise
        </Button>
      </div>
    </div>
  )

  const renderQuestion = () => {
    const questionProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      showFeedback,
      isCorrect,
      className: "mb-6"
    }

    // Route to appropriate question component based on topic and type
    if (exercise.topic === 'place-value') {
      return <PlaceValueQuestion {...questionProps} />
    }
    
    if (exercise.topic === 'fractions') {
      return <FractionQuestion {...questionProps} />
    }
    
    if (exercise.topic === 'area' || exercise.topic === 'perimeter') {
      return <AreaPerimeterQuestion {...questionProps} />
    }

    // Fallback to general question display
    return (
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="text-lg font-medium">{currentQuestion.question}</div>
          <div className="text-sm text-gray-600">{currentQuestion.instructions}</div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-sm text-yellow-800">
              Question type "{currentQuestion.type}" not yet implemented for topic "{exercise.topic}"
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showConceptIntro) {
    return (
      <Card className={`p-8 max-w-4xl mx-auto ${className}`}>
        {renderConceptIntro()}
      </Card>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {exercise.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge variant="outline">
                {exercise.topic.replace('-', ' ')} • Year {exercise.yearLevel}
              </Badge>
              <span>Difficulty: {exercise.difficulty}</span>
              <span>⏱️ {formatTime(timeSpent)}</span>
              {exercise.timeLimit && (
                <span>/ {exercise.timeLimit} min limit</span>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowConceptIntro(true)}
            className="text-sm"
          >
            📚 Review Concept
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {exercise.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Question */}
      {renderQuestion()}

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {exercise.questions.length}
            </div>
            
            {answers[currentQuestion.id] && (
              <Badge variant={isCorrect ? 'default' : 'destructive'}>
                {isCorrect ? '✓ Correct' : '✗ Try again'}
              </Badge>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!showFeedback}
            variant={isLastQuestion ? 'default' : 'outline'}
          >
            {isLastQuestion ? 'Finish' : 'Next'} →
          </Button>
        </div>
      </Card>

      {/* Exercise Info */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(answers).length}
            </div>
            <div className="text-sm text-gray-600">Answered</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Object.entries(answers).filter(([questionId, answer]) => {
                const question = exercise.questions.find(q => q.id === questionId)
                return question && checkAnswer(question, answer)
              }).length}
            </div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-purple-600">
              {exercise.totalPoints}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-orange-600">
              {formatTime(timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
        </div>
      </Card>
    </div>
  )
}