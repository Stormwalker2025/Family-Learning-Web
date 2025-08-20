'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlaceValueChart } from '../MathTools/PlaceValueChart'
import { MathQuestion } from '@/types'

interface PlaceValueQuestionProps {
  question: MathQuestion
  onAnswer: (answer: any) => void
  showFeedback?: boolean
  isCorrect?: boolean | null
  className?: string
}

export const PlaceValueQuestion: React.FC<PlaceValueQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  isCorrect = null,
  className = '',
}) => {
  const [userAnswer, setUserAnswer] = useState<any>(null)
  const [showChart, setShowChart] = useState(false)
  const [selectedDigits, setSelectedDigits] = useState<{
    [place: string]: string
  }>({})

  const problemData = question.problemData

  useEffect(() => {
    if (userAnswer !== null) {
      onAnswer(userAnswer)
    }
  }, [userAnswer, onAnswer])

  const handleMultipleChoice = (answer: string) => {
    setUserAnswer(answer)
  }

  const handleInputAnswer = (answer: string) => {
    setUserAnswer(answer)
  }

  const handlePlaceValueBuilder = (place: string, digit: string) => {
    const newSelectedDigits = { ...selectedDigits, [place]: digit }
    setSelectedDigits(newSelectedDigits)

    // Check if all required places are filled
    const requiredPlaces = ['hundreds', 'tens', 'ones']
    const isComplete = requiredPlaces.every(place => newSelectedDigits[place])

    if (isComplete) {
      setUserAnswer(newSelectedDigits)
    }
  }

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <div className="text-sm text-gray-600 mb-4">{question.instructions}</div>

      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg mb-4">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
        </div>
      )}

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
            <div className="text-lg font-mono">{answer}</div>
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

  const renderInputAnswer = () => (
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

      {problemData?.expandedForm && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-center text-xl font-mono">
            {Array.isArray(problemData.expandedForm)
              ? problemData.expandedForm.join(' + ')
              : problemData.expandedForm}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Your Answer:</label>
        <Input
          type="text"
          value={userAnswer || ''}
          onChange={e => handleInputAnswer(e.target.value)}
          className={`
            text-lg font-mono
            ${showFeedback && isCorrect === true ? 'border-green-500 bg-green-50' : ''}
            ${showFeedback && isCorrect === false ? 'border-red-500 bg-red-50' : ''}
          `}
          placeholder="Enter your answer..."
          disabled={showFeedback}
        />
        {question.unit && (
          <span className="text-sm font-medium text-gray-600">
            {question.unit.symbol}
          </span>
        )}
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

  const renderPlaceValueBuilder = () => (
    <div className="space-y-4">
      <div className="text-lg font-medium">{question.question}</div>
      <div className="text-sm text-gray-600">{question.instructions}</div>

      {problemData?.context && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {problemData.context}
          </div>
          {problemData?.targetNumber && (
            <div className="text-lg font-bold text-blue-900 mt-2">
              Target Number: {problemData.targetNumber}
            </div>
          )}
        </div>
      )}

      {/* Available Digits */}
      {problemData?.availableDigits && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Available Digits:</div>
          <div className="flex gap-2">
            {problemData.availableDigits.map((digit: number, index: number) => (
              <div
                key={index}
                className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center text-xl font-bold cursor-move"
              >
                {digit}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Drag these digits to the correct places below
          </div>
        </div>
      )}

      {/* Place Value Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {['hundreds', 'tens', 'ones'].map(place => (
            <div key={place} className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2 capitalize">
                {place}
              </div>
              <div
                className={`
                  w-16 h-16 border-2 border-dashed border-gray-400 rounded-lg 
                  flex items-center justify-center text-2xl font-bold
                  bg-white cursor-pointer hover:bg-gray-50
                  ${selectedDigits[place] ? 'border-blue-500 bg-blue-50' : ''}
                  ${showFeedback && isCorrect === true && selectedDigits[place] === question.correctAnswer[place] ? 'border-green-500 bg-green-50' : ''}
                  ${showFeedback && isCorrect === false && selectedDigits[place] !== question.correctAnswer[place] ? 'border-red-500 bg-red-50' : ''}
                `}
                onClick={() => {
                  // Simple digit selection - in a full implementation, this would be drag-and-drop
                  const digit = prompt(`Enter digit for ${place} place:`)
                  if (digit && /^[0-9]$/.test(digit)) {
                    handlePlaceValueBuilder(place, digit)
                  }
                }}
              >
                {selectedDigits[place] || '?'}
              </div>
            </div>
          ))}
        </div>

        {/* Current Number Display */}
        <div className="text-center">
          <div className="text-sm text-gray-600">Current Number:</div>
          <div className="text-3xl font-bold font-mono">
            {selectedDigits.hundreds || '0'}
            {selectedDigits.tens || '0'}
            {selectedDigits.ones || '0'}
          </div>
        </div>
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

      {problemData?.number && (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-2xl font-bold font-mono">
            {problemData.number}
          </div>
          {problemData?.statement && (
            <div className="text-lg mt-2 text-gray-700">
              "{problemData.statement}"
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          variant={userAnswer === true ? 'default' : 'outline'}
          size="lg"
          onClick={() => setUserAnswer(true)}
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
          onClick={() => setUserAnswer(false)}
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

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Question Content */}
        <div>
          {question.type === 'multiple-choice' && renderMultipleChoice()}
          {question.type === 'input-answer' && renderInputAnswer()}
          {question.type === 'place-value-builder' && renderPlaceValueBuilder()}
          {question.type === 'true-false' && renderTrueFalse()}
        </div>

        {/* Interactive Tools */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowChart(!showChart)}>
              {showChart ? 'Hide' : 'Show'} Place Value Chart
            </Button>
          </div>

          {showChart && (
            <PlaceValueChart
              initialNumber={problemData?.number?.toString() || '2457'}
              highlightPlaces={
                problemData?.targetPlace ? [problemData.targetPlace] : []
              }
              allowInteraction={true}
              onPlaceValueSelect={(place, digit, value) => {
                console.log('Place value selected:', { place, digit, value })
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
                <div
                  key={index}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
                >
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
