'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface ComprehensionQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

export function ComprehensionQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete,
}: ComprehensionQuestionProps) {
  const [currentAnswer, setCurrentAnswer] = useState(answer?.content || '')
  const [reasoning, setReasoning] = useState(answer?.reasoning || '')
  const [confidence, setConfidence] = useState(answer?.confidence || 3)
  const [showHints, setShowHints] = useState(false)
  const [usedHints, setUsedHints] = useState<Set<number>>(new Set())

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
    onAnswerChange({
      content: value,
      reasoning,
      confidence,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const handleReasoningChange = (value: string) => {
    setReasoning(value)
    onAnswerChange({
      content: currentAnswer,
      reasoning: value,
      confidence,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const handleConfidenceChange = (value: number) => {
    setConfidence(value)
    onAnswerChange({
      content: currentAnswer,
      reasoning,
      confidence: value,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const useHint = (index: number) => {
    setUsedHints(prev => new Set([...prev, index]))
  }

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  const getAnswerQuality = () => {
    const wordCount = getWordCount(currentAnswer)
    if (wordCount < 10)
      return {
        level: 'needs-work',
        color: 'text-red-600',
        message: 'Answer needs more detail',
      }
    if (wordCount < 30)
      return {
        level: 'developing',
        color: 'text-yellow-600',
        message: 'Good start, could use more explanation',
      }
    if (wordCount < 60)
      return {
        level: 'proficient',
        color: 'text-blue-600',
        message: 'Well-developed answer',
      }
    return {
      level: 'advanced',
      color: 'text-green-600',
      message: 'Comprehensive answer',
    }
  }

  const quality = getAnswerQuality()
  const wordCount = getWordCount(currentAnswer)
  const hasMinimumAnswer = wordCount >= 10

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Comprehension Question
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{question.subject}</Badge>
                <Badge variant="secondary">{question.bloomsTaxonomy}</Badge>
                <Badge variant="outline">{question.difficulty}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {question.points} points
              </div>
              <div className="text-sm text-muted-foreground">
                ~{question.estimatedTime} min
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">{question.question}</p>

            {question.instructions && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Instructions:</p>
                <p className="text-sm">{question.instructions}</p>
              </div>
            )}

            {question.context && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-1">Context:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {question.context}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answer Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Answer</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {wordCount} words
              </span>
              <span className={`text-sm font-medium ${quality.color}`}>
                {quality.message}
              </span>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <Progress
                value={Math.min(100, (wordCount / 60) * 100)}
                className="w-20 h-2"
              />
              {hasMinimumAnswer && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your answer here. Explain your thinking and provide evidence from the text where possible..."
            value={currentAnswer}
            onChange={e => handleAnswerChange(e.target.value)}
            className="min-h-32 resize-none"
          />

          {/* Sample answers guidance (if available) */}
          {question.sampleAnswers && question.sampleAnswers.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                A good answer might include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                {question.sampleAnswers.slice(0, 3).map((sample, index) => (
                  <li key={index}>{sample}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reasoning (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Explain Your Thinking (Optional)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Show how you arrived at your answer. This helps demonstrate your
            understanding.
          </p>
        </CardHeader>

        <CardContent>
          <Textarea
            placeholder="Explain how you came to this conclusion. What evidence did you use? What connections did you make?"
            value={reasoning}
            onChange={e => handleReasoningChange(e.target.value)}
            className="min-h-20 resize-none"
          />
        </CardContent>
      </Card>

      {/* Confidence Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            How confident are you in your answer?
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Not confident</span>
              <span className="text-sm font-medium">
                Confidence Level: {confidence}/5
              </span>
              <span className="text-sm">Very confident</span>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Button
                  key={level}
                  variant={confidence >= level ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleConfidenceChange(level)}
                >
                  {level}
                </Button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {confidence === 1 && "I'm just guessing"}
              {confidence === 2 && "I think I understand but I'm not sure"}
              {confidence === 3 && 'I understand the main ideas'}
              {confidence === 4 && 'I understand well and can explain it'}
              {confidence === 5 &&
                'I understand completely and could teach others'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hints */}
      {question.hints && question.hints.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Need Help? ({usedHints.size}/{question.hints.length} hints used)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
            </div>
          </CardHeader>

          {showHints && (
            <CardContent>
              <div className="space-y-3">
                {question.hints.map((hint, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      usedHints.has(index)
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    {usedHints.has(index) ? (
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {hint}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Hint {index + 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => useHint(index)}
                        >
                          Reveal Hint
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {usedHints.size > 0 && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Using hints may slightly reduce your score but helps with
                    learning
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Skills Being Assessed */}
      {question.skillsAssessed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Being Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {question.skillsAssessed.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Area */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          {hasMinimumAnswer ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className="text-sm font-medium">
            {hasMinimumAnswer
              ? 'Answer ready for submission'
              : 'Answer needs more detail (minimum 10 words)'}
          </span>
        </div>

        <Button
          onClick={onComplete}
          disabled={!hasMinimumAnswer}
          className="min-w-24"
        >
          Complete Question
        </Button>
      </div>
    </div>
  )
}
