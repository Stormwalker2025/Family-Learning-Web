'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw, Edit3 } from 'lucide-react'

interface SentenceCompletionProps {
  answer: string | string[]
  onAnswerChange: (answer: string) => void
}

export function SentenceCompletion({ answer, onAnswerChange }: SentenceCompletionProps) {
  const currentAnswer = typeof answer === 'string' ? answer : ''
  const [blanks, setBlanks] = useState<string[]>([])

  // Parse the current answer into individual blanks
  useEffect(() => {
    if (currentAnswer) {
      const parsedBlanks = currentAnswer.split(',').map(blank => blank.trim())
      setBlanks(parsedBlanks)
    }
  }, [currentAnswer])

  // Determine number of blanks based on question format
  // This is a simplified approach - in a real implementation, 
  // you might parse the question to count underscore patterns
  const numberOfBlanks = 3 // Default for the example question

  const handleBlankChange = (index: number, value: string) => {
    const newBlanks = [...blanks]
    newBlanks[index] = value.trim()
    
    // Pad array if necessary
    while (newBlanks.length < numberOfBlanks) {
      newBlanks.push('')
    }
    
    setBlanks(newBlanks)
    
    // Convert back to comma-separated string
    const answerString = newBlanks.slice(0, numberOfBlanks).join(', ')
    onAnswerChange(answerString)
  }

  const clearAllBlanks = () => {
    setBlanks(new Array(numberOfBlanks).fill(''))
    onAnswerChange('')
  }

  const isComplete = blanks.slice(0, numberOfBlanks).every(blank => blank.length > 0)

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Fill in the blanks using words from the text. 
          Each blank should be filled with one or more words that complete the sentence correctly.
        </p>
      </div>

      {/* Blanks Input */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Fill in the blanks:</span>
              </label>
              {currentAnswer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllBlanks}
                  className="h-7 px-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Input fields for each blank */}
            <div className="space-y-3">
              {Array.from({ length: numberOfBlanks }, (_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium min-w-[60px]">
                    Blank {index + 1}:
                  </span>
                  <Input
                    value={blanks[index] || ''}
                    onChange={(e) => handleBlankChange(index, e.target.value)}
                    placeholder={`Enter word(s) for blank ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Preview */}
      {currentAnswer && (
        <Card>
          <CardContent className="p-3">
            <p className="text-sm">
              <strong>Your answer:</strong> {currentAnswer}
            </p>
            <div className="mt-2">
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                isComplete 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isComplete ? 'Complete' : `${blanks.filter(b => b.length > 0).length}/${numberOfBlanks} filled`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Tips:</strong>
        </p>
        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
          <li>• Look for the exact words used in the text</li>
          <li>• Pay attention to grammar and word forms</li>
          <li>• Make sure your completed sentence makes sense</li>
          <li>• Use only the information given in the text</li>
        </ul>
      </div>
    </div>
  )
}