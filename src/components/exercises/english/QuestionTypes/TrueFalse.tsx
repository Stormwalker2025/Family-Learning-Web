'use client'

import { Button } from '@/components/ui/button'
import { Check, X, HelpCircle } from 'lucide-react'

interface TrueFalseProps {
  answer: string | string[]
  onAnswerChange: (answer: string) => void
}

export function TrueFalse({ answer, onAnswerChange }: TrueFalseProps) {
  const selectedAnswer = typeof answer === 'string' ? answer : ''

  const options = [
    { 
      value: 'true', 
      label: 'True', 
      description: 'The statement is correct according to the text',
      icon: Check,
      color: 'green'
    },
    { 
      value: 'false', 
      label: 'False', 
      description: 'The statement is incorrect according to the text',
      icon: X,
      color: 'red'
    },
    { 
      value: 'not-given', 
      label: 'Not Given', 
      description: 'The information is not mentioned in the text',
      icon: HelpCircle,
      color: 'orange'
    }
  ]

  const handleOptionClick = (value: string) => {
    onAnswerChange(value)
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-700">
          <strong>Instructions:</strong> Choose one of the three options based on the information in the text:
        </p>
        <ul className="text-xs text-gray-600 mt-2 space-y-1">
          <li>• <strong>True:</strong> The statement matches the information in the text</li>
          <li>• <strong>False:</strong> The statement contradicts the information in the text</li>
          <li>• <strong>Not Given:</strong> The information is not mentioned in the text</li>
        </ul>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.value
          const Icon = option.icon

          return (
            <Button
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto p-4 ${
                isSelected 
                  ? getSelectedColorClass(option.color)
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isSelected 
                    ? 'bg-white text-current' 
                    : getBorderColorClass(option.color)
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
      
      {selectedAnswer && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {options.find(opt => opt.value === selectedAnswer)?.label}
          </p>
        </div>
      )}
    </div>
  )
}

function getSelectedColorClass(color: string): string {
  switch (color) {
    case 'green':
      return 'bg-green-600 hover:bg-green-700 text-white'
    case 'red':
      return 'bg-red-600 hover:bg-red-700 text-white'
    case 'orange':
      return 'bg-orange-600 hover:bg-orange-700 text-white'
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white'
  }
}

function getBorderColorClass(color: string): string {
  switch (color) {
    case 'green':
      return 'border-2 border-green-300 text-green-600'
    case 'red':
      return 'border-2 border-red-300 text-red-600'
    case 'orange':
      return 'border-2 border-orange-300 text-orange-600'
    default:
      return 'border-2 border-blue-300 text-blue-600'
  }
}