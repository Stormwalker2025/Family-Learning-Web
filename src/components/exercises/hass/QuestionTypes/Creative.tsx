'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Palette, CheckCircle, AlertCircle } from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface CreativeQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

export function CreativeQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete,
}: CreativeQuestionProps) {
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
  const hasMinimumAnswer = wordCount >= 40

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Creative Question
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{question.subject}</Badge>
            <Badge variant="secondary">{question.bloomsTaxonomy}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-base leading-relaxed">{question.question}</p>

          {question.hints && question.hints.length > 0 && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Creative prompts:</p>
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
          <CardTitle>Your Creative Response ({wordCount} words)</CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            placeholder="Be creative! Design, imagine, propose, or create something new based on what you've learned..."
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
              ? 'Creative response ready'
              : 'Need more creative detail (40+ words)'}
          </span>
        </div>

        <Button onClick={onComplete} disabled={!hasMinimumAnswer}>
          Complete Creative Task
        </Button>
      </div>
    </div>
  )
}
