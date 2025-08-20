'use client'

import { ReadingSubmission, ReadingFeedback, ReadingExercise } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  BookOpen,
  TrendingUp,
  Award,
  RotateCcw,
} from 'lucide-react'

interface ResultsSummaryProps {
  submission: ReadingSubmission
  feedback: ReadingFeedback
  exercise: ReadingExercise
  onRestart?: () => void
}

export function ResultsSummary({
  submission,
  feedback,
  exercise,
  onRestart,
}: ResultsSummaryProps) {
  const scorePercentage = Math.round(
    (submission.score / submission.maxScore) * 100
  )

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (percentage >= 80) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (percentage >= 70)
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy
                className={`h-16 w-16 ${getScoreColor(scorePercentage)}`}
              />
              {scorePercentage >= 90 && (
                <Award className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl">
            <span className={getScoreColor(scorePercentage)}>
              {scorePercentage}%
            </span>
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            {submission.score} out of {submission.maxScore} points
          </p>
          <Badge
            className={`${getScoreBadgeColor(scorePercentage)} text-sm px-3 py-1`}
          >
            {scorePercentage >= 90
              ? 'Excellent!'
              : scorePercentage >= 80
                ? 'Great job!'
                : scorePercentage >= 70
                  ? 'Good effort!'
                  : 'Keep practicing!'}
          </Badge>
        </CardHeader>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {submission.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {submission.totalQuestions - submission.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">
              Incorrect Answers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(submission.timeSpent)}
            </div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Question Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.questionAnalysis.map((analysis, index) => {
              const question = exercise.questions.find(
                q => q.id === analysis.questionId
              )
              if (!question) return null

              return (
                <div
                  key={analysis.questionId}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">
                          Question {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.questionType.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analysis.skillTested}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.question}
                      </p>
                    </div>
                    <div className="ml-4">
                      {analysis.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Your answer:</strong>{' '}
                      <span
                        className={
                          analysis.isCorrect ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {Array.isArray(analysis.userAnswer)
                          ? analysis.userAnswer.join(', ')
                          : analysis.userAnswer}
                      </span>
                    </div>

                    {!analysis.isCorrect && (
                      <div>
                        <strong>Correct answer:</strong>{' '}
                        <span className="text-green-600">
                          {Array.isArray(analysis.correctAnswer)
                            ? analysis.correctAnswer.join(', ')
                            : analysis.correctAnswer}
                        </span>
                      </div>
                    )}

                    {analysis.explanation && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <strong>Explanation:</strong> {analysis.explanation}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span>Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {feedback.improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <Target className="h-5 w-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {feedback.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Learning Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {onRestart && (
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button onClick={() => window.print()}>Print Results</Button>
      </div>
    </div>
  )
}
