'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Target,
} from 'lucide-react'
import { HassQuestion, HassAnswer } from '@/types'

interface AnalysisQuestionProps {
  question: HassQuestion
  answer?: HassAnswer
  onAnswerChange: (answer: Partial<HassAnswer>) => void
  onComplete: () => void
}

interface AnalysisPoint {
  id: string
  point: string
  evidence: string
  explanation: string
}

export function AnalysisQuestion({
  question,
  answer,
  onAnswerChange,
  onComplete,
}: AnalysisQuestionProps) {
  const [analysisPoints, setAnalysisPoints] = useState<AnalysisPoint[]>(() => {
    if (answer?.content && typeof answer.content === 'string') {
      try {
        const parsed = JSON.parse(answer.content)
        return Array.isArray(parsed)
          ? parsed
          : [{ id: '1', point: '', evidence: '', explanation: '' }]
      } catch {
        return [{ id: '1', point: '', evidence: '', explanation: '' }]
      }
    }
    return [{ id: '1', point: '', evidence: '', explanation: '' }]
  })

  const [reasoning, setReasoning] = useState(answer?.reasoning || '')
  const [confidence, setConfidence] = useState(answer?.confidence || 3)
  const [showFramework, setShowFramework] = useState(false)
  const [usedHints, setUsedHints] = useState<Set<number>>(new Set())

  const updateAnswer = () => {
    onAnswerChange({
      content: JSON.stringify(analysisPoints),
      reasoning,
      confidence,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const addAnalysisPoint = () => {
    const newPoint: AnalysisPoint = {
      id: Date.now().toString(),
      point: '',
      evidence: '',
      explanation: '',
    }
    setAnalysisPoints([...analysisPoints, newPoint])
    updateAnswer()
  }

  const removeAnalysisPoint = (id: string) => {
    setAnalysisPoints(analysisPoints.filter(p => p.id !== id))
    updateAnswer()
  }

  const updateAnalysisPoint = (
    id: string,
    field: keyof AnalysisPoint,
    value: string
  ) => {
    setAnalysisPoints(points =>
      points.map(p => (p.id === id ? { ...p, [field]: value } : p))
    )
    updateAnswer()
  }

  const handleReasoningChange = (value: string) => {
    setReasoning(value)
    onAnswerChange({
      content: JSON.stringify(analysisPoints),
      reasoning: value,
      confidence,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const handleConfidenceChange = (value: number) => {
    setConfidence(value)
    onAnswerChange({
      content: JSON.stringify(analysisPoints),
      reasoning,
      confidence: value,
      timeSpent: answer?.timeSpent || 0,
    })
  }

  const useHint = (index: number) => {
    setUsedHints(prev => new Set([...prev, index]))
  }

  const getAnalysisQuality = () => {
    const completedPoints = analysisPoints.filter(
      p => p.point.trim() && p.evidence.trim() && p.explanation.trim()
    ).length

    if (completedPoints === 0)
      return {
        level: 'not-started',
        color: 'text-gray-600',
        message: 'Start your analysis',
      }
    if (completedPoints === 1)
      return {
        level: 'developing',
        color: 'text-yellow-600',
        message: 'Good start, add more points',
      }
    if (completedPoints === 2)
      return {
        level: 'proficient',
        color: 'text-blue-600',
        message: 'Well-developed analysis',
      }
    return {
      level: 'advanced',
      color: 'text-green-600',
      message: 'Comprehensive analysis',
    }
  }

  const quality = getAnalysisQuality()
  const completedPoints = analysisPoints.filter(
    p => p.point.trim() && p.evidence.trim() && p.explanation.trim()
  ).length
  const hasMinimumAnalysis = completedPoints >= 1

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Analysis Question
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
          </div>
        </CardContent>
      </Card>

      {/* Analysis Framework */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analysis Framework
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${quality.color}`}>
                {quality.message}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFramework(!showFramework)}
              >
                {showFramework ? 'Hide' : 'Show'} Framework
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {completedPoints} of {analysisPoints.length} points completed
            </span>
            <Progress
              value={
                (completedPoints / Math.max(2, analysisPoints.length)) * 100
              }
              className="w-32 h-2"
            />
          </div>
        </CardHeader>

        {showFramework && (
          <CardContent>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to Analyze Effectively:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>
                  <strong>Identify key points</strong> - What are the main
                  issues, causes, or effects?
                </li>
                <li>
                  <strong>Find evidence</strong> - What facts, examples, or
                  quotes support each point?
                </li>
                <li>
                  <strong>Explain connections</strong> - How do the pieces fit
                  together? What patterns do you see?
                </li>
                <li>
                  <strong>Consider multiple perspectives</strong> - What
                  different viewpoints exist?
                </li>
                <li>
                  <strong>Draw conclusions</strong> - What does your analysis
                  reveal?
                </li>
              </ol>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Analysis Points */}
      <div className="space-y-4">
        {analysisPoints.map((point, index) => (
          <Card key={point.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Analysis Point {index + 1}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {point.point.trim() &&
                    point.evidence.trim() &&
                    point.explanation.trim() && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  {analysisPoints.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnalysisPoint(point.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Main Point */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  What is your main analytical point?
                </label>
                <Input
                  placeholder="State your key point or argument..."
                  value={point.point}
                  onChange={e =>
                    updateAnalysisPoint(point.id, 'point', e.target.value)
                  }
                  className="font-medium"
                />
              </div>

              {/* Evidence */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  What evidence supports this point?
                </label>
                <Textarea
                  placeholder="Provide specific examples, facts, quotes, or data that support your point..."
                  value={point.evidence}
                  onChange={e =>
                    updateAnalysisPoint(point.id, 'evidence', e.target.value)
                  }
                  className="min-h-20 resize-none"
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  How does this evidence support your point?
                </label>
                <Textarea
                  placeholder="Explain the connection between your evidence and your point. Why is this evidence significant?"
                  value={point.explanation}
                  onChange={e =>
                    updateAnalysisPoint(point.id, 'explanation', e.target.value)
                  }
                  className="min-h-20 resize-none"
                />
              </div>

              {/* Connection indicator */}
              {point.point.trim() && point.evidence.trim() && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{point.point.slice(0, 30)}...</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>Evidence</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>Analysis</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add Point Button */}
        <Button
          variant="outline"
          onClick={addAnalysisPoint}
          className="w-full border-dashed"
          disabled={analysisPoints.length >= 5}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Analysis Point
        </Button>
      </div>

      {/* Synthesis/Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Synthesis & Conclusion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your analysis points and draw overall conclusions.
          </p>
        </CardHeader>

        <CardContent>
          <Textarea
            placeholder="How do your analysis points connect? What overall patterns or conclusions can you draw? What is the significance of your analysis?"
            value={reasoning}
            onChange={e => handleReasoningChange(e.target.value)}
            className="min-h-24 resize-none"
          />
        </CardContent>
      </Card>

      {/* Confidence Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            How confident are you in your analysis?
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
          </div>
        </CardContent>
      </Card>

      {/* Hints */}
      {question.hints && question.hints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Analysis Hints ({usedHints.size}/{question.hints.length} used)
            </CardTitle>
          </CardHeader>

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
                        Analysis Hint {index + 1}
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
            </div>
          </CardContent>
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
          {hasMinimumAnalysis ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className="text-sm font-medium">
            {hasMinimumAnalysis
              ? 'Analysis ready for submission'
              : 'Complete at least one analysis point (point + evidence + explanation)'}
          </span>
        </div>

        <Button
          onClick={onComplete}
          disabled={!hasMinimumAnalysis}
          className="min-w-24"
        >
          Complete Analysis
        </Button>
      </div>
    </div>
  )
}
