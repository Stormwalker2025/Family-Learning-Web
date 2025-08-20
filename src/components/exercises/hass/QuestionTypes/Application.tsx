'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Target, CheckCircle, AlertCircle } from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface ApplicationQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

export function ApplicationQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete,
}: ApplicationQuestionProps) {
  const [currentAnswer, setCurrentAnswer] = useState(answer?.content || '')
  const [confidence, setConfidence] = useState(answer?.confidence || 3)

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
    onAnswerChange({
      content: value,
      confidence,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  const wordCount = getWordCount(currentAnswer)
  const hasMinimumAnswer = wordCount >= 30

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Application Question
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{question.subject}</Badge>
            <Badge variant="secondary">{question.bloomsTaxonomy}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-base leading-relaxed">{question.question}</p>

          {question.hints && question.hints.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Consider:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {question.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Application ({wordCount} words)</CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            placeholder="Apply the concepts to the new situation. Explain how you would use what you've learned..."
            value={currentAnswer}
            onChange={e => handleAnswerChange(e.target.value)}
            className="min-h-32"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          {hasMinimumAnswer ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className="text-sm font-medium">
            {hasMinimumAnswer
              ? 'Application ready'
              : 'Need more detailed application (30+ words)'}
          </span>
        </div>

        <Button onClick={onComplete} disabled={!hasMinimumAnswer}>
          Complete Application
        </Button>
      </div>
    </div>
  )
}
