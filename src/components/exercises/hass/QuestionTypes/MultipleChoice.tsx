'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle, Target } from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface MultipleChoiceQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

export function MultipleChoiceQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete
}: MultipleChoiceQuestionProps) {
  const [selectedOption, setSelectedOption] = useState(answer?.content || '')
  const [confidence, setConfidence] = useState(answer?.confidence || 3)

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    onAnswerChange({
      content: value,
      confidence,
      timeSpent: answer?.timeSpent || 0
    })
  }

  const handleConfidenceChange = (value: number) => {
    setConfidence(value)
    onAnswerChange({
      content: selectedOption,
      confidence: value,
      timeSpent: answer?.timeSpent || 0
    })
  }

  const hasAnswer = selectedOption.trim() !== ''

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Multiple Choice Question
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{question.subject}</Badge>
                <Badge variant="secondary">{question.bloomsTaxonomy}</Badge>
                <Badge variant="outline">{question.difficulty}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{question.points} points</div>
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
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose the best answer:</CardTitle>
        </CardHeader>
        
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer font-medium text-sm leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Confidence Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How confident are you in your answer?</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Not confident</span>
              <span className="text-sm font-medium">Confidence Level: {confidence}/5</span>
              <span className="text-sm">Very confident</span>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
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
          </div>
        </CardContent>
      </Card>

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
          {hasAnswer ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className="text-sm font-medium">
            {hasAnswer ? 'Answer selected' : 'Please select an answer'}
          </span>
        </div>
        
        <Button
          onClick={onComplete}
          disabled={!hasAnswer}
          className="min-w-24"
        >
          Complete Question
        </Button>
      </div>
    </div>
  )
}