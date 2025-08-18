'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NumberLineProps {
  min?: number
  max?: number
  step?: number
  showFractions?: boolean
  allowInteraction?: boolean
  highlightNumbers?: number[]
  className?: string
  onNumberSelect?: (number: number) => void
}

export const NumberLine: React.FC<NumberLineProps> = ({
  min = 0,
  max = 10,
  step = 1,
  showFractions = false,
  allowInteraction = true,
  highlightNumbers = [],
  className = '',
  onNumberSelect
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [customMin, setCustomMin] = useState(min.toString())
  const [customMax, setCustomMax] = useState(max.toString())
  const [zoom, setZoom] = useState(1)

  const range = max - min
  const totalWidth = 800 * zoom
  const numberCount = Math.floor(range / step) + 1
  const spacing = totalWidth / (numberCount - 1)

  const handleNumberClick = (number: number) => {
    if (!allowInteraction) return
    
    setSelectedNumber(number)
    if (onNumberSelect) {
      onNumberSelect(number)
    }
  }

  const updateRange = () => {
    const newMin = parseFloat(customMin)
    const newMax = parseFloat(customMax)
    
    if (!isNaN(newMin) && !isNaN(newMax) && newMin < newMax) {
      // This would trigger a re-render with new props in a real implementation
      console.log('Range updated:', { min: newMin, max: newMax })
    }
  }

  const formatNumber = (num: number): string => {
    if (showFractions && num % 1 !== 0) {
      // Simple fraction conversion for common decimals
      const decimal = num % 1
      if (decimal === 0.5) return `${Math.floor(num)} ½`
      if (decimal === 0.25) return `${Math.floor(num)} ¼`
      if (decimal === 0.75) return `${Math.floor(num)} ¾`
      if (decimal === 0.33) return `${Math.floor(num)} ⅓`
      if (decimal === 0.67) return `${Math.floor(num)} ⅔`
    }
    
    return step >= 1 ? num.toString() : num.toFixed(1)
  }

  const generateNumbers = () => {
    const numbers = []
    for (let i = min; i <= max; i += step) {
      numbers.push(Number(i.toFixed(2))) // Handle floating point precision
    }
    return numbers
  }

  const numbers = generateNumbers()

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Min:</label>
            <Input
              type="number"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="w-20"
              step={step}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Max:</label>
            <Input
              type="number"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              className="w-20"
              step={step}
            />
          </div>
          
          <Button size="sm" onClick={updateRange} variant="outline">
            Update Range
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm font-medium">Zoom:</label>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              −
            </Button>
            <span className="text-sm w-12 text-center">{zoom}×</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              +
            </Button>
          </div>
        </div>

        {/* Selected Number Display */}
        {selectedNumber !== null && (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-center">
              <span className="text-lg font-semibold text-blue-900">
                Selected Number: {formatNumber(selectedNumber)}
              </span>
            </div>
          </div>
        )}

        {/* Number Line */}
        <div className="relative overflow-x-auto">
          <div className="relative" style={{ width: totalWidth, height: '120px' }}>
            {/* Main line */}
            <div 
              className="absolute top-12 bg-gray-400 h-1"
              style={{ width: totalWidth }}
            />

            {/* Numbers and tick marks */}
            {numbers.map((number, index) => {
              const position = index * spacing
              const isHighlighted = highlightNumbers.includes(number)
              const isSelected = selectedNumber === number
              
              return (
                <div
                  key={number}
                  className="absolute flex flex-col items-center"
                  style={{ left: position - 20, top: 0, width: 40 }}
                >
                  {/* Tick mark */}
                  <div 
                    className={`w-0.5 bg-gray-600 mb-1 ${
                      number % (step * 5) === 0 ? 'h-6' : 'h-4'
                    }`}
                    style={{ marginTop: number % (step * 5) === 0 ? '32px' : '36px' }}
                  />
                  
                  {/* Number label */}
                  <button
                    className={`
                      px-2 py-1 rounded text-sm font-medium transition-all
                      ${allowInteraction ? 'cursor-pointer hover:bg-blue-100' : 'cursor-default'}
                      ${isSelected ? 'bg-blue-500 text-white' : ''}
                      ${isHighlighted && !isSelected ? 'bg-yellow-200 text-yellow-900' : ''}
                      ${!isSelected && !isHighlighted ? 'text-gray-700' : ''}
                    `}
                    onClick={() => handleNumberClick(number)}
                    disabled={!allowInteraction}
                    style={{ marginTop: '8px' }}
                  >
                    {formatNumber(number)}
                  </button>
                  
                  {/* Highlight indicator */}
                  {isHighlighted && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />
                  )}
                </div>
              )
            })}

            {/* Arrow at the end */}
            <div 
              className="absolute top-12 transform -translate-y-1/2"
              style={{ left: totalWidth - 10 }}
            >
              <div className="w-0 h-0 border-l-8 border-r-0 border-t-4 border-b-4 border-l-gray-600 border-t-transparent border-b-transparent" />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Number Line Help:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Click on any number to select it</li>
            <li>• Use the Min/Max controls to change the number range</li>
            <li>• Zoom in/out to make numbers easier to see</li>
            <li>• Yellow highlighted numbers show important values</li>
            {showFractions && <li>• Fractions are shown as mixed numbers (e.g., 2½)</li>}
          </ul>
        </div>

        {/* Range Information */}
        <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <span>Range: {formatNumber(min)} to {formatNumber(max)}</span>
          <span>Step: {step}</span>
          <span>Total: {numbers.length} numbers</span>
        </div>
      </div>
    </Card>
  )
}