'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FractionBar } from '../MathTools/FractionBar'
import { MathQuestion } from '@/types'

interface FractionQuestionProps {
  question: MathQuestion
  onAnswer: (answer: any) => void
  showFeedback?: boolean
  isCorrect?: boolean | null
  className?: string
}

export const FractionQuestion: React.FC<FractionQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  isCorrect = null,
  className = ''
}) => {
  const [userAnswer, setUserAnswer] = useState<any>(null)
  const [showFractionBar, setShowFractionBar] = useState(false)
  const [draggedItems, setDraggedItems] = useState<{ [key: string]: string }>({})
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

  const problemData = question.problemData

  useEffect(() => {
    if (userAnswer !== null) {
      onAnswer(userAnswer)
    }
  }, [userAnswer, onAnswer])

  const handleMultipleChoice = (answer: string) => {
    setUserAnswer(answer)
  }

  const handleTrueFalse = (answer: boolean) => {
    setUserAnswer(answer)
  }

  const handleDragDrop = (sourceId: string, targetId: string) => {
    const newDraggedItems = { ...draggedItems, [targetId]: sourceId }
    setDraggedItems(newDraggedItems)
    setUserAnswer(newDraggedItems)
  }

  const renderFractionVisual = () => {
    const { visualType, totalParts, shadedParts } = problemData || {}
    
    if (!visualType || !totalParts) return null

    const segments = []
    const segmentSize = visualType === 'circle' ? 360 / totalParts : 200 / totalParts

    if (visualType === 'rectangle') {
      for (let i = 0; i < totalParts; i++) {
        const isShaded = i < (shadedParts || 0)
        segments.push(
          <rect
            key={i}
            x={i * segmentSize}
            y={20}
            width={segmentSize - 2}
            height={60}
            fill={isShaded ? '#3B82F6' : '#F3F4F6'}
            stroke="#6B7280"
            strokeWidth="1"
          />
        )
      }
      return (
        <div className="flex justify-center mb-4">
          <svg width="200" height="100" className="border rounded">
            {segments}
          </svg>
        </div>
      )
    }

    if (visualType === 'circle') {
      const radius = 40
      const centerX = 50
      const centerY = 50
      
      for (let i = 0; i < totalParts; i++) {
        const startAngle = (i * 360 / totalParts) * Math.PI / 180
        const endAngle = ((i + 1) * 360 / totalParts) * Math.PI / 180
        const isShaded = i < (shadedParts || 0)
        
        const x1 = centerX + radius * Math.cos(startAngle)
        const y1 = centerY + radius * Math.sin(startAngle)
        const x2 = centerX + radius * Math.cos(endAngle)
        const y2 = centerY + radius * Math.sin(endAngle)
        
        const largeArc = (360 / totalParts) > 180 ? 1 : 0
        
        segments.push(
          <path
            key={i}
            d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={isShaded ? '#3B82F6' : '#F3F4F6'}
            stroke="#6B7280"
            strokeWidth="1"
          />
        )
      }
      
      return (
        <div className="flex justify-center mb-4">
          <svg width="100" height="100" className="border rounded">
            {segments}
          </svg>
        </div>
      )
    }

    return null
  }

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>
      
      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

      {renderFractionVisual()}

      <div className="space-y-2">
        {question.possibleAnswers?.map((answer, index) => (
          <Button
            key={index}
            variant={userAnswer === answer ? 'default' : 'outline'}
            className={`
              w-full text-left justify-start p-4 h-auto
              ${showFeedback && isCorrect === true && userAnswer === answer ? 'bg-green-100 border-green-500 text-green-800' : ''}
              ${showFeedback && isCorrect === false && userAnswer === answer ? 'bg-red-100 border-red-500 text-red-800' : ''}
              ${showFeedback && answer === question.correctAnswer && userAnswer !== answer ? 'bg-green-50 border-green-300 text-green-700' : ''}
            `}
            onClick={() => handleMultipleChoice(answer)}
            disabled={showFeedback}
          >
            <div className="text-xl font-mono">{answer}</div>
          </Button>
        ))}
      </div>

      {showFeedback && question.explanation && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        </div>
      )}
    </div>
  )

  const renderFractionVisualQuestion = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>
      
      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

      {renderFractionVisual()}

      <div className="space-y-2">
        {question.possibleAnswers?.map((answer, index) => (
          <Button
            key={index}
            variant={userAnswer === answer ? 'default' : 'outline'}
            className={`
              w-full text-left justify-start p-4 h-auto
              ${showFeedback && isCorrect === true && userAnswer === answer ? 'bg-green-100 border-green-500 text-green-800' : ''}
              ${showFeedback && isCorrect === false && userAnswer === answer ? 'bg-red-100 border-red-500 text-red-800' : ''}
              ${showFeedback && answer === question.correctAnswer && userAnswer !== answer ? 'bg-green-50 border-green-300 text-green-700' : ''}
            `}
            onClick={() => handleMultipleChoice(answer)}
            disabled={showFeedback}
          >
            <div className="text-xl font-mono">{answer}</div>
          </Button>
        ))}
      </div>
    </div>
  )

  const renderDragDrop = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>
      
      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

      {/* Fraction Options */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Drag fractions to match the pictures:</div>
        <div className="flex gap-4 justify-center flex-wrap">
          {problemData?.fractions?.map((fraction: string, index: number) => (
            <div
              key={index}
              className={`
                px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-move
                text-xl font-bold text-center min-w-[60px]
                hover:border-blue-400 hover:bg-blue-50
                ${Object.values(draggedItems).includes(fraction) ? 'opacity-50 bg-gray-100' : ''}
              `}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', fraction)
              }}
            >
              {fraction}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {problemData?.visuals?.map((visual: any, index: number) => (
          <div
            key={visual.id}
            className={`
              p-4 border-2 border-dashed border-gray-400 rounded-lg text-center
              min-h-[150px] flex flex-col items-center justify-center
              hover:border-blue-400 hover:bg-blue-50
              ${draggedItems[visual.id] ? 'border-green-500 bg-green-50' : ''}
            `}
            onDrop={(e) => {
              e.preventDefault()
              const fraction = e.dataTransfer.getData('text/plain')
              handleDragDrop(fraction, visual.id)
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Visual Representation */}
            <div className="mb-2">
              {visual.type === 'circle' && (
                <svg width="80" height="80">
                  {Array.from({ length: visual.total }).map((_, i) => {
                    const angle = (i * 360 / visual.total) * Math.PI / 180
                    const nextAngle = ((i + 1) * 360 / visual.total) * Math.PI / 180
                    const isShaded = i < visual.shaded
                    
                    const x1 = 40 + 35 * Math.cos(angle)
                    const y1 = 40 + 35 * Math.sin(angle)
                    const x2 = 40 + 35 * Math.cos(nextAngle)
                    const y2 = 40 + 35 * Math.sin(nextAngle)
                    
                    return (
                      <path
                        key={i}
                        d={`M 40 40 L ${x1} ${y1} A 35 35 0 0 1 ${x2} ${y2} Z`}
                        fill={isShaded ? '#3B82F6' : '#F3F4F6'}
                        stroke="#6B7280"
                        strokeWidth="1"
                      />
                    )
                  })}
                </svg>
              )}
              
              {visual.type === 'rectangle' && (
                <svg width="120" height="40">
                  {Array.from({ length: visual.total }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * (120 / visual.total)}
                      y={0}
                      width={(120 / visual.total) - 1}
                      height={40}
                      fill={i < visual.shaded ? '#3B82F6' : '#F3F4F6'}
                      stroke="#6B7280"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              )}
            </div>

            {/* Drop Zone */}
            <div className={`
              border-2 border-dashed rounded p-2 min-w-[60px] min-h-[40px]
              flex items-center justify-center text-lg font-bold
              ${draggedItems[visual.id] ? 'border-green-500 bg-white' : 'border-gray-300'}
            `}>
              {draggedItems[visual.id] || '?'}
            </div>
          </div>
        ))}
      </div>

      {showFeedback && question.explanation && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        </div>
      )}
    </div>
  )

  const renderTrueFalse = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>
      
      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

      {/* Fraction Comparison Display */}
      {problemData?.fraction1 && problemData?.fraction2 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono mb-2">
                {problemData.fraction1.numerator}/{problemData.fraction1.denominator}
              </div>
              <div className="text-sm text-gray-600">
                = {(problemData.fraction1.numerator / problemData.fraction1.denominator).toFixed(3)}
              </div>
            </div>
            
            <div className="text-3xl text-gray-400">vs</div>
            
            <div className="text-center">
              <div className="text-2xl font-bold font-mono mb-2">
                {problemData.fraction2.numerator}/{problemData.fraction2.denominator}
              </div>
              <div className="text-sm text-gray-600">
                = {(problemData.fraction2.numerator / problemData.fraction2.denominator).toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          variant={userAnswer === true ? 'default' : 'outline'}
          size="lg"
          onClick={() => handleTrueFalse(true)}
          disabled={showFeedback}
          className={`
            px-8
            ${showFeedback && isCorrect === true && userAnswer === true ? 'bg-green-100 border-green-500 text-green-800' : ''}
            ${showFeedback && isCorrect === false && userAnswer === true ? 'bg-red-100 border-red-500 text-red-800' : ''}
          `}
        >
          True
        </Button>
        <Button
          variant={userAnswer === false ? 'default' : 'outline'}
          size="lg"
          onClick={() => handleTrueFalse(false)}
          disabled={showFeedback}
          className={`
            px-8
            ${showFeedback && isCorrect === true && userAnswer === false ? 'bg-green-100 border-green-500 text-green-800' : ''}
            ${showFeedback && isCorrect === false && userAnswer === false ? 'bg-red-100 border-red-500 text-red-800' : ''}
          `}
        >
          False
        </Button>
      </div>

      {showFeedback && question.explanation && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        </div>
      )}
    </div>
  )

  const renderDrawing = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>
      
      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

      {/* Drawing Canvas */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Draw and shade to show: {problemData?.targetFraction?.numerator}/{problemData?.targetFraction?.denominator}
          </div>
          
          {/* Simple Rectangle for Drawing */}
          <svg width="240" height="120" className="border border-gray-400 mx-auto">
            <rect
              x="0"
              y="0"
              width="240"
              height="120"
              fill="white"
              stroke="#6B7280"
              strokeWidth="2"
            />
            {/* This would be enhanced with actual drawing tools */}
            <text x="120" y="65" textAnchor="middle" className="fill-gray-400 text-sm">
              Click to draw and shade {problemData?.targetFraction?.numerator}/{problemData?.targetFraction?.denominator}
            </text>
          </svg>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button size="sm" variant="outline">✏️ Draw Lines</Button>
          <Button size="sm" variant="outline">🎨 Shade</Button>
          <Button size="sm" variant="outline">🗑️ Clear</Button>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={() => setUserAnswer('drawn')}>
          Submit Drawing
        </Button>
      </div>

      {showFeedback && question.explanation && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Question Content */}
        <div>
          {question.type === 'multiple-choice' && renderMultipleChoice()}
          {question.type === 'fraction-visual' && renderFractionVisualQuestion()}
          {question.type === 'drag-drop' && renderDragDrop()}
          {question.type === 'true-false' && renderTrueFalse()}
          {question.type === 'drawing' && renderDrawing()}
        </div>

        {/* Interactive Tools */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowFractionBar(!showFractionBar)}
            >
              {showFractionBar ? 'Hide' : 'Show'} Fraction Bar
            </Button>
          </div>

          {showFractionBar && (
            <FractionBar
              initialFraction={{ numerator: 1, denominator: 4 }}
              allowInteraction={true}
              showEquivalent={true}
              onFractionChange={(fraction) => {
                console.log('Fraction changed:', fraction)
              }}
            />
          )}
        </div>

        {/* Hints */}
        {question.hints && question.hints.length > 0 && (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-2 text-lg font-medium text-gray-900">
              💡 Need a hint?
              <span className="group-open:rotate-180 transition-transform">
                ⌄
              </span>
            </summary>
            <div className="mt-2 space-y-2">
              {question.hints.map((hint, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>Hint {index + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Question Info */}
        <div className="flex justify-between text-xs text-gray-500 border-t pt-4">
          <span>Difficulty: {question.difficulty}</span>
          <span>Points: {question.points}</span>
          <span>Estimated Time: {question.estimatedTime} min</span>
        </div>
      </div>
    </Card>
  )
}