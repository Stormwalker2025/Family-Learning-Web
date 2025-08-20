'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Scale, CheckCircle, AlertCircle } from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface EvaluationQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

export function EvaluationQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete,
}: EvaluationQuestionProps) {
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
  const hasMinimumAnswer = wordCount >= 50

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5" />
            Evaluation Question
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{question.subject}</Badge>
            <Badge variant="secondary">{question.bloomsTaxonomy}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-base leading-relaxed">{question.question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Evaluation ({wordCount} words)</CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            placeholder="Evaluate the topic by weighing different perspectives, evidence, and arguments. Support your judgment with reasoning..."
            value={currentAnswer}
            onChange={e => handleAnswerChange(e.target.value)}
            className="min-h-40"
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
              ? 'Evaluation ready'
              : 'Need more detailed evaluation (50+ words)'}
          </span>
        </div>

        <Button onClick={onComplete} disabled={!hasMinimumAnswer}>
          Complete Evaluation
        </Button>
      </div>
    </div>
  )
}
