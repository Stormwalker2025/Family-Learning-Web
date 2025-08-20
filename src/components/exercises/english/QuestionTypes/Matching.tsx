'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MatchingOption } from '@/types'
import { RotateCcw, ArrowRight } from 'lucide-react'

interface MatchingProps {
  matchingOptions: MatchingOption[]
  answer: string | string[]
  onAnswerChange: (answer: string) => void
}

export function Matching({
  matchingOptions,
  answer,
  onAnswerChange,
}: MatchingProps) {
  const currentAnswer = typeof answer === 'string' ? answer : ''
  const [matches, setMatches] = useState<Record<string, string>>({})

  // Separate statements and options
  const statements = matchingOptions.filter(
    option => option.type === 'statement'
  )
  const options = matchingOptions.filter(option => option.type === 'option')

  // Parse current answer into matches object
  React.useEffect(() => {
    if (currentAnswer) {
      try {
        const parsedMatches = JSON.parse(currentAnswer)
        setMatches(parsedMatches)
      } catch {
        // If parsing fails, reset matches
        setMatches({})
      }
    }
  }, [currentAnswer])

  const handleMatch = (statementId: string, optionId: string) => {
    const newMatches = { ...matches }

    // Remove any existing match for this statement
    if (newMatches[statementId]) {
      delete newMatches[statementId]
    }

    // Remove this option from any other statement
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === optionId) {
        delete newMatches[key]
      }
    })

    // Add new match
    newMatches[statementId] = optionId

    setMatches(newMatches)
    onAnswerChange(JSON.stringify(newMatches))
  }

  const clearMatch = (statementId: string) => {
    const newMatches = { ...matches }
    delete newMatches[statementId]
    setMatches(newMatches)
    onAnswerChange(JSON.stringify(newMatches))
  }

  const clearAllMatches = () => {
    setMatches({})
    onAnswerChange('')
  }

  const getMatchedOption = (statementId: string) => {
    const optionId = matches[statementId]
    return options.find(option => option.id === optionId)
  }

  const isOptionUsed = (optionId: string) => {
    return Object.values(matches).includes(optionId)
  }

  const completedMatches = Object.keys(matches).length
  const totalStatements = statements.length

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Match each statement on the left with
          the correct option on the right. Click on a statement, then click on
          the option you want to match it with.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Progress: {completedMatches}/{totalStatements} matches
        </div>
        {completedMatches > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllMatches}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Matching Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statements Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Statements</h3>
          {statements.map((statement, index) => {
            const matchedOption = getMatchedOption(statement.id)

            return (
              <Card key={statement.id} className="relative">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="text-sm font-medium mb-1">
                        {index + 1}. {statement.content}
                      </div>
                      {matchedOption && (
                        <div className="flex items-center space-x-2 mt-2">
                          <ArrowRight className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            {matchedOption.content}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearMatch(statement.id)}
                            className="h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Options Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Options</h3>
          {options.map((option, index) => {
            const isUsed = isOptionUsed(option.id)
            const optionLabel = String.fromCharCode(65 + index) // A, B, C, D

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-colors ${
                  isUsed
                    ? 'bg-gray-100 border-gray-300'
                    : 'hover:bg-blue-50 border-blue-200'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                      flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
                      ${
                        isUsed
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-blue-100 text-blue-700'
                      }
                    `}
                    >
                      {optionLabel}
                    </div>
                    <span
                      className={`text-sm ${
                        isUsed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {option.content}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Current Matches Summary */}
      {completedMatches > 0 && (
        <Card>
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm mb-2">Current Matches:</h4>
            <div className="space-y-1">
              {statements.map((statement, index) => {
                const matchedOption = getMatchedOption(statement.id)
                if (!matchedOption) return null

                return (
                  <div
                    key={statement.id}
                    className="text-xs flex items-center space-x-2"
                  >
                    <span className="font-medium">{index + 1}.</span>
                    <span className="flex-1">{statement.content}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{matchedOption.content}</span>
                  </div>
                )
              })}
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
          <li>• Read all statements and options carefully before matching</li>
          <li>• Look for key words that connect statements to options</li>
          <li>• Each option can only be used once</li>
          <li>• You can change your matches at any time</li>
        </ul>
      </div>
    </div>
  )
}
