'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MathSubmission, MathFeedback } from '@/types'

interface MathResultsProps {
  submission: {
    id?: string
    score: number
    maxScore: number
    correctAnswers: number
    totalQuestions: number
    percentage: number
    timeSpent: number
    feedback?: MathFeedback
  }
  onRetry?: () => void
  onContinue?: () => void
  onReviewAnswers?: () => void
  className?: string
}

export const MathResults: React.FC<MathResultsProps> = ({
  submission,
  onRetry,
  onContinue,
  onReviewAnswers,
  className = '',
}) => {
  const {
    score,
    maxScore,
    correctAnswers,
    totalQuestions,
    percentage,
    timeSpent,
    feedback,
  } = submission

  const getPerformanceLevel = (
    percentage: number
  ): { level: string; color: string; message: string } => {
    if (percentage >= 90) {
      return {
        level: 'Excellent',
        color: 'text-green-600 bg-green-100',
        message: 'Outstanding work! You have mastered this concept.',
      }
    } else if (percentage >= 80) {
      return {
        level: 'Very Good',
        color: 'text-blue-600 bg-blue-100',
        message: 'Great job! You have a strong understanding.',
      }
    } else if (percentage >= 70) {
      return {
        level: 'Good',
        color: 'text-yellow-600 bg-yellow-100',
        message: 'Good work! Keep practicing to improve further.',
      }
    } else if (percentage >= 60) {
      return {
        level: 'Satisfactory',
        color: 'text-orange-600 bg-orange-100',
        message: "You're on the right track. More practice will help.",
      }
    } else {
      return {
        level: 'Needs Improvement',
        color: 'text-red-600 bg-red-100',
        message: "Don't worry! Review the concepts and try again.",
      }
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'less than 1 minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  const performanceLevel = getPerformanceLevel(percentage)

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Main Results */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {percentage}%
          </div>
          <Badge className={`text-lg px-4 py-2 ${performanceLevel.color}`}>
            {performanceLevel.level}
          </Badge>
          <p className="text-gray-600 mt-4 text-lg">
            {performanceLevel.message}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-blue-700 font-medium">Questions Correct</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {score}
            </div>
            <div className="text-purple-700 font-medium">Points Earned</div>
            <div className="text-sm text-purple-600">out of {maxScore}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatTime(timeSpent)}
            </div>
            <div className="text-green-700 font-medium">Time Spent</div>
          </div>
        </div>

        <Progress value={percentage} className="h-4 mb-4" />
        <div className="text-sm text-gray-600">
          Overall Progress: {percentage}% Complete
        </div>
      </Card>

      {/* Detailed Feedback */}
      {feedback && (
        <>
          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedback.strengths.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  ✅ Your Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {feedback.improvements.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                  📈 Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-orange-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Concept Mastery */}
          {Object.keys(feedback.conceptMastery).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Concept Mastery
              </h3>
              <div className="space-y-4">
                {Object.entries(feedback.conceptMastery).map(
                  ([concept, mastery]) => (
                    <div key={concept}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 capitalize">
                          {concept.replace('-', ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {mastery}%
                        </span>
                      </div>
                      <Progress value={mastery} className="h-2" />
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {feedback.recommendations.length > 0 && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                💡 Recommendations
              </h3>
              <ul className="space-y-3">
                {feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-blue-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Next Topics */}
          {feedback.nextTopics && feedback.nextTopics.length > 0 && (
            <Card className="p-6 bg-purple-50 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">
                🚀 Ready for Next Level?
              </h3>
              <p className="text-purple-700 mb-4">
                Based on your performance, you might be ready to try these
                topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {feedback.nextTopics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-purple-700 border-purple-300"
                  >
                    {topic.replace('-', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Question Analysis Summary */}
          {feedback.questionAnalysis &&
            feedback.questionAnalysis.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📝 Question Analysis Summary
                </h3>
                <div className="space-y-3">
                  {feedback.questionAnalysis.map((analysis, index) => (
                    <div
                      key={analysis.questionId}
                      className={`p-3 rounded-lg border ${
                        analysis.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <Badge
                          variant={
                            analysis.isCorrect ? 'default' : 'destructive'
                          }
                        >
                          {analysis.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Skill: {analysis.skillTested}</div>
                        <div>
                          Type: {analysis.questionType.replace('-', ' ')}
                        </div>
                        {analysis.explanation && (
                          <div className="mt-2 text-gray-700">
                            <strong>Explanation:</strong> {analysis.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
        </>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onReviewAnswers && (
            <Button variant="outline" onClick={onReviewAnswers}>
              📋 Review Answers
            </Button>
          )}

          {onRetry && percentage < 80 && (
            <Button variant="outline" onClick={onRetry}>
              🔄 Try Again
            </Button>
          )}

          {onContinue && (
            <Button
              onClick={onContinue}
              className={
                percentage >= 70 ? 'bg-green-600 hover:bg-green-700' : ''
              }
            >
              {percentage >= 70 ? '🚀 Continue Learning' : '📚 Keep Practicing'}
            </Button>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {percentage >= 90 &&
            "🌟 Amazing work! You're ready for more challenges!"}
          {percentage >= 70 &&
            percentage < 90 &&
            '🎯 Good progress! Keep building your skills!'}
          {percentage < 70 &&
            '💪 Every mistake is a learning opportunity. Keep trying!'}
        </div>
      </Card>

      {/* Fun Facts or Encouragement */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          🎓 Did You Know?
        </h3>
        <div className="text-center text-gray-700">
          {percentage >= 90 && (
            <p>
              Students who score 90% or higher typically remember 95% of what
              they learned!
            </p>
          )}
          {percentage >= 70 && percentage < 90 && (
            <p>
              Regular practice for just 15 minutes a day can improve math scores
              by 40%!
            </p>
          )}
          {percentage < 70 && (
            <p>
              The brain grows stronger every time you make a mistake and learn
              from it!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
