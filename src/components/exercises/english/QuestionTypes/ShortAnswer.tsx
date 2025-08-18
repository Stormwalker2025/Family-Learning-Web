'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { PenTool, RotateCcw } from 'lucide-react'

interface ShortAnswerProps {
  answer: string | string[]
  onAnswerChange: (answer: string) => void
}

export function ShortAnswer({ answer, onAnswerChange }: ShortAnswerProps) {
  const currentAnswer = typeof answer === 'string' ? answer : ''
  const [wordCount, setWordCount] = useState(0)

  const handleInputChange = (value: string) => {
    onAnswerChange(value)
    
    // Calculate word count
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }

  const clearAnswer = () => {
    onAnswerChange('')
    setWordCount(0)
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Write your answer in the text box below. 
          Keep your answer concise and based on the information in the text.
        </p>
      </div>

      {/* Answer Input */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>Your Answer:</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </span>
                {currentAnswer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAnswer}
                    className="h-7 px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Maximum 500 characters</span>
              <span>{currentAnswer.length}/500</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Preview */}
      {currentAnswer && (
        <Card>
          <CardContent className="p-3">
            <p className="text-sm">
              <strong>Answer preview:</strong> {currentAnswer}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Tips:</strong>
        </p>
        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
          <li>• Look for keywords in the question to find the answer in the text</li>
          <li>• Use the exact words from the text when possible</li>
          <li>• Keep your answer brief but complete</li>
          <li>• Check spelling and grammar</li>
        </ul>
      </div>
    </div>
  )
}