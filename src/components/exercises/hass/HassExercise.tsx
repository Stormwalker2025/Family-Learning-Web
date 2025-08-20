'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, BookOpen, Target, Users, Lightbulb } from 'lucide-react'
import {
  HassExercise as HassExerciseType,
  HassSubmission,
  HassAnswer,
} from '@/types'

// Import HASS components
import { ArticleDisplay } from './ArticleReader/ArticleDisplay'
import { NoteTaking } from './ArticleReader/NoteTaking'
import { Glossary } from './ArticleReader/Glossary'
import { VocabularyHelper } from './LearningSupport/VocabularyHelper'
import { BackgroundInfo } from './LearningSupport/BackgroundInfo'
import { DiscussionGuide } from './LearningSupport/DiscussionGuide'
import { ComprehensionQuestion } from './QuestionTypes/Comprehension'
import { AnalysisQuestion } from './QuestionTypes/Analysis'
import { EvaluationQuestion } from './QuestionTypes/Evaluation'
import { ApplicationQuestion } from './QuestionTypes/Application'
import { CreativeQuestion } from './QuestionTypes/Creative'
import { MultipleChoiceQuestion } from './QuestionTypes/MultipleChoice'

interface HassExerciseProps {
  exercise: HassExerciseType
  onSubmit: (submission: HassSubmission) => void
  userId: string
}

type ExercisePhase = 'overview' | 'reading' | 'questions' | 'review' | 'results'

export function HassExercise({
  exercise,
  onSubmit,
  userId,
}: HassExerciseProps) {
  const [currentPhase, setCurrentPhase] = useState<ExercisePhase>('overview')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, HassAnswer>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [mediaInteractions, setMediaInteractions] = useState<
    Record<string, number>
  >({})
  const [showVocabularyHelper, setShowVocabularyHelper] = useState(false)
  const [showBackgroundInfo, setShowBackgroundInfo] = useState(false)
  const [showDiscussion, setShowDiscussion] = useState(false)

  const startTimeRef = useRef<number>(Date.now())
  const phaseStartTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000 / 60))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    phaseStartTimeRef.current = Date.now()
    if (currentPhase === 'questions') {
      setQuestionStartTime(Date.now())
    }
  }, [currentPhase, currentQuestionIndex])

  const handlePhaseChange = (phase: ExercisePhase) => {
    if (currentPhase === 'reading') {
      const readingDuration = Math.floor(
        (Date.now() - phaseStartTimeRef.current) / 1000 / 60
      )
      setReadingTime(prev => prev + readingDuration)
    }
    setCurrentPhase(phase)
  }

  const handleAnswerChange = (
    questionId: string,
    answer: Partial<HassAnswer>
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...answer,
        timeSpent: prev[questionId]?.timeSpent || 0,
      },
    }))
  }

  const handleQuestionComplete = (questionId: string) => {
    const timeSpentOnQuestion = Math.floor(
      (Date.now() - questionStartTime) / 1000 / 60
    )
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        timeSpent: timeSpentOnQuestion,
      },
    }))
  }

  const handleNoteChange = (sectionId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [sectionId]: note,
    }))
  }

  const handleBookmark = (sectionId: string) => {
    setBookmarks(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleMediaInteraction = (mediaId: string) => {
    setMediaInteractions(prev => ({
      ...prev,
      [mediaId]: (prev[mediaId] || 0) + 1,
    }))
  }

  const handleSubmit = () => {
    const totalTimeSpent = Math.floor(
      (Date.now() - startTimeRef.current) / 1000 / 60
    )

    const submission: HassSubmission = {
      id: `submission-${Date.now()}`,
      userId,
      exerciseId: exercise.id,
      answers,
      notes,
      bookmarks,
      score: 0, // Will be calculated by the backend
      maxScore: exercise.totalPoints,
      timeSpent: totalTimeSpent,
      readingTime,
      questionTime: Object.fromEntries(
        exercise.questions.map(q => [q.id, answers[q.id]?.timeSpent || 0])
      ),
      mediaInteractions,
      startedAt: new Date(startTimeRef.current),
      submittedAt: new Date(),
    }

    onSubmit(submission)
    setCurrentPhase('results')
  }

  const getProgressPercentage = () => {
    const totalPhases = 4 // overview, reading, questions, review
    const phaseProgress = {
      overview: 0,
      reading: 25,
      questions:
        25 + (50 * (currentQuestionIndex + 1)) / exercise.questions.length,
      review: 75,
      results: 100,
    }
    return phaseProgress[currentPhase]
  }

  const currentQuestion = exercise.questions[currentQuestionIndex]

  const renderQuestion = (question: any) => {
    const baseProps = {
      question,
      answer: answers[question.id],
      onAnswerChange: (answer: Partial<HassAnswer>) =>
        handleAnswerChange(question.id, answer),
      onComplete: () => handleQuestionComplete(question.id),
    }

    switch (question.type) {
      case 'comprehension':
        return <ComprehensionQuestion {...baseProps} />
      case 'analysis':
        return <AnalysisQuestion {...baseProps} />
      case 'evaluation':
        return <EvaluationQuestion {...baseProps} />
      case 'application':
        return <ApplicationQuestion {...baseProps} />
      case 'creative':
        return <CreativeQuestion {...baseProps} />
      case 'multiple-choice':
        return <MultipleChoiceQuestion {...baseProps} />
      default:
        return <ComprehensionQuestion {...baseProps} />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {exercise.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {exercise.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{exercise.subject}</Badge>
              <Badge variant="outline">Year {exercise.yearLevel}</Badge>
              <Badge variant="outline">{exercise.difficulty}</Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeSpent}m
                </span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Phase Content */}
      {currentPhase === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercise Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {exercise.article.readingTime}m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reading Time
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {exercise.questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Questions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {exercise.totalPoints}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {exercise.estimatedDuration}m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Est. Duration
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => handlePhaseChange('reading')}
                    className="w-full"
                    size="lg"
                  >
                    Start Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Discussion Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exercise.article.discussionPrompts
                    .slice(0, 3)
                    .map((prompt, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{prompt}</p>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setShowDiscussion(true)}
                >
                  View All Discussion Topics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Vocabulary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exercise.article.keyVocabulary.slice(0, 4).map(vocab => (
                    <div
                      key={vocab.id}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{vocab.term}</span>
                      <Badge variant="outline" className="text-xs">
                        Level {vocab.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setShowVocabularyHelper(true)}
                >
                  View All Vocabulary
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentPhase === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ArticleDisplay
              article={exercise.article}
              notes={notes}
              bookmarks={bookmarks}
              onNoteChange={handleNoteChange}
              onBookmark={handleBookmark}
              onMediaInteraction={handleMediaInteraction}
            />

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => handlePhaseChange('overview')}
              >
                Back to Overview
              </Button>
              <Button onClick={() => handlePhaseChange('questions')}>
                Start Questions
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <NoteTaking notes={notes} onNoteChange={handleNoteChange} />
            <Glossary vocabulary={exercise.article.keyVocabulary} />
          </div>
        </div>
      )}

      {currentPhase === 'questions' && currentQuestion && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Question {currentQuestionIndex + 1} of{' '}
                  {exercise.questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentQuestion.type}</Badge>
                  <Badge variant="secondary">
                    {currentQuestion.points} points
                  </Badge>
                </div>
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) / exercise.questions.length) * 100
                }
                className="mt-2"
              />
            </CardHeader>
            <CardContent>{renderQuestion(currentQuestion)}</CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                } else {
                  handlePhaseChange('reading')
                }
              }}
            >
              {currentQuestionIndex > 0
                ? 'Previous Question'
                : 'Back to Reading'}
            </Button>

            <Button
              onClick={() => {
                handleQuestionComplete(currentQuestion.id)
                if (currentQuestionIndex < exercise.questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1)
                } else {
                  handlePhaseChange('review')
                }
              }}
              disabled={!answers[currentQuestion.id]?.content}
            >
              {currentQuestionIndex < exercise.questions.length - 1
                ? 'Next Question'
                : 'Review Answers'}
            </Button>
          </div>
        </div>
      )}

      {currentPhase === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Answers</CardTitle>
              <CardDescription>
                Review your responses before submitting. You can go back to make
                changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercise.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        {answers[question.id]?.content ? (
                          <Badge variant="default">Answered</Badge>
                        ) : (
                          <Badge variant="destructive">Not Answered</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentQuestionIndex(index)
                            handlePhaseChange('questions')
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {question.question}
                    </p>
                    {answers[question.id]?.content && (
                      <div className="bg-muted p-3 rounded">
                        <p className="text-sm">
                          {answers[question.id].content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => handlePhaseChange('questions')}
                >
                  Back to Questions
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={exercise.questions.some(
                    q => !answers[q.id]?.content
                  )}
                >
                  Submit Exercise
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning Support Modals */}
      {showVocabularyHelper && (
        <VocabularyHelper
          vocabulary={exercise.article.keyVocabulary}
          onClose={() => setShowVocabularyHelper(false)}
        />
      )}

      {showBackgroundInfo && (
        <BackgroundInfo
          info={exercise.article.backgroundInfo}
          culturalContext={exercise.article.culturalContext}
          onClose={() => setShowBackgroundInfo(false)}
        />
      )}

      {showDiscussion && (
        <DiscussionGuide
          prompts={exercise.article.discussionPrompts}
          learningObjectives={exercise.learningObjectives}
          onClose={() => setShowDiscussion(false)}
        />
      )}
    </div>
  )
}
