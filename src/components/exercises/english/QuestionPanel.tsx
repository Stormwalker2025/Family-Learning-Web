'use client'

import { ReadingQuestion } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MultipleChoice } from './QuestionTypes/MultipleChoice'
import { TrueFalse } from './QuestionTypes/TrueFalse'
import { ShortAnswer } from './QuestionTypes/ShortAnswer'
import { SentenceCompletion } from './QuestionTypes/SentenceCompletion'
import { Matching } from './QuestionTypes/Matching'
import { HelpCircle, Star } from 'lucide-react'

interface QuestionPanelProps {
  question: ReadingQuestion
  answer: string | string[] | undefined
  onAnswerChange: (questionId: string, answer: string | string[]) => void
}

export function QuestionPanel({
  question,
  answer,
  onAnswerChange,
}: QuestionPanelProps) {
  const handleAnswerChange = (newAnswer: string | string[]) => {
    onAnswerChange(question.id, newAnswer)
  }

  const renderQuestionComponent = () => {
    const commonProps = {
      answer: answer || '',
      onAnswerChange: handleAnswerChange,
    }

    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoice {...commonProps} options={question.options || []} />
        )

      case 'true-false':
        return <TrueFalse {...commonProps} />

      case 'short-answer':
        return <ShortAnswer {...commonProps} />

      case 'sentence-completion':
        return <SentenceCompletion {...commonProps} />

      case 'matching':
        return (
          <Matching
            {...commonProps}
            matchingOptions={question.matchingOptions || []}
          />
        )

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <HelpCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Question type not supported: {question.type}</p>
          </div>
        )
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'multiple-choice': 'Multiple Choice',
      'true-false': 'True/False/Not Given',
      'short-answer': 'Short Answer',
      'sentence-completion': 'Sentence Completion',
      matching: 'Matching',
    }
    return labels[type] || type
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {getQuestionTypeLabel(question.type)}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                <span>
                  {question.points} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {question.question}
            </CardTitle>
          </div>
        </div>

        {question.instructions && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> {question.instructions}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>{renderQuestionComponent()}</CardContent>
    </Card>
  )
}
