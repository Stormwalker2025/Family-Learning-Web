'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface MultipleChoiceProps {
  options: string[]
  answer: string | string[]
  onAnswerChange: (answer: string) => void
}

export function MultipleChoice({
  options,
  answer,
  onAnswerChange,
}: MultipleChoiceProps) {
  const selectedAnswer = typeof answer === 'string' ? answer : ''

  const handleOptionClick = (option: string) => {
    onAnswerChange(option)
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option
        const optionLabel = String.fromCharCode(65 + index) // A, B, C, D

        return (
          <Button
            key={index}
            variant={isSelected ? 'default' : 'outline'}
            className={`w-full justify-start text-left h-auto p-4 ${
              isSelected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleOptionClick(option)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div
                className={`
                flex items-center justify-center w-6 h-6 rounded-full border-2 text-sm font-semibold
                ${
                  isSelected
                    ? 'bg-white text-blue-600 border-white'
                    : 'border-gray-300 text-gray-500'
                }
              `}
              >
                {isSelected ? <Check className="h-4 w-4" /> : optionLabel}
              </div>
              <span className="flex-1 text-sm leading-relaxed">{option}</span>
            </div>
          </Button>
        )
      })}

      {selectedAnswer && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedAnswer}
          </p>
        </div>
      )}
    </div>
  )
}
