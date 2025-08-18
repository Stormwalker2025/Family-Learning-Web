'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShapeDrawer } from '../MathTools/ShapeDrawer'
import { Calculator } from '../MathTools/Calculator'
import { MathQuestion } from '@/types'

interface AreaPerimeterQuestionProps {
  question: MathQuestion
  onAnswer: (answer: any) => void
  showFeedback?: boolean
  isCorrect?: boolean | null
  className?: string
}

export const AreaPerimeterQuestion: React.FC<AreaPerimeterQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  isCorrect = null,
  className = ''
}) => {
  const [userAnswer, setUserAnswer] = useState<any>(null)
  const [showShapeDrawer, setShowShapeDrawer] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculationSteps, setCalculationSteps] = useState<string[]>([])

  const problemData = question.problemData

  useEffect(() => {
    if (userAnswer !== null) {
      onAnswer(userAnswer)
    }
  }, [userAnswer, onAnswer])

  const handleCalculation = (calculation: string, result: number) => {
    setCalculationSteps(prev => [...prev.slice(-2), calculation])
  }

  const renderShapeVisual = () => {
    if (!problemData?.shape) return null

    const { shape, length, width, base, height, radius, side } = problemData

    const shapeProps = {
      rectangle: { width: length || 150, height: width || 100 },
      square: { width: side || 100, height: side || 100 },
      triangle: { width: base || 120, height: height || 80 },
      circle: { width: (radius || 50) * 2, height: (radius || 50) * 2 }
    }

    const currentShape = shapeProps[shape as keyof typeof shapeProps] || shapeProps.rectangle

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="text-center">
          <svg width={currentShape.width + 40} height={currentShape.height + 60} className="mx-auto">
            {/* Shape */}
            {shape === 'rectangle' && (
              <>
                <rect
                  x="20"
                  y="20"
                  width={currentShape.width}
                  height={currentShape.height}
                  fill="#E0F2FE"
                  stroke="#0284C7"
                  strokeWidth="2"
                />
                {/* Dimension labels */}
                <text x={20 + currentShape.width / 2} y="15" textAnchor="middle" className="text-sm fill-gray-700">
                  {length}m
                </text>
                <text x="10" y={20 + currentShape.height / 2} textAnchor="middle" className="text-sm fill-gray-700" transform={`rotate(-90, 10, ${20 + currentShape.height / 2})`}>
                  {width}m
                </text>
              </>
            )}

            {shape === 'square' && (
              <>
                <rect
                  x="20"
                  y="20"
                  width={currentShape.width}
                  height={currentShape.height}
                  fill="#F0F9FF"
                  stroke="#0284C7"
                  strokeWidth="2"
                />
                <text x={20 + currentShape.width / 2} y="15" textAnchor="middle" className="text-sm fill-gray-700">
                  {side}m
                </text>
              </>
            )}

            {shape === 'triangle' && (
              <>
                <polygon
                  points={`20,${20 + currentShape.height} ${20 + currentShape.width},${20 + currentShape.height} ${20 + currentShape.width / 2},20`}
                  fill="#FEF3C7"
                  stroke="#D97706"
                  strokeWidth="2"
                />
                <text x={20 + currentShape.width / 2} y={20 + currentShape.height + 15} textAnchor="middle" className="text-sm fill-gray-700">
                  base: {base}m
                </text>
                <text x="10" y={20 + currentShape.height / 2} textAnchor="middle" className="text-sm fill-gray-700" transform={`rotate(-90, 10, ${20 + currentShape.height / 2})`}>
                  height: {height}m
                </text>
              </>
            )}

            {shape === 'circle' && (
              <>
                <circle
                  cx={20 + currentShape.width / 2}
                  cy={20 + currentShape.height / 2}
                  r={currentShape.width / 2}
                  fill="#FECACA"
                  stroke="#DC2626"
                  strokeWidth="2"
                />
                <line
                  x1={20 + currentShape.width / 2}
                  y1={20 + currentShape.height / 2}
                  x2={20 + currentShape.width}
                  y2={20 + currentShape.height / 2}
                  stroke="#DC2626"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text x={20 + currentShape.width * 0.75} y={20 + currentShape.height / 2 - 5} textAnchor="middle" className="text-sm fill-gray-700">
                  r = {radius}m
                </text>
              </>
            )}
          </svg>

          <div className="mt-2 text-sm text-gray-600">
            {problemData.context}
          </div>
        </div>
      </div>
    )
  }

  const renderCalculation = () => (
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

      {renderShapeVisual()}

      {/* Formula Helper */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-sm font-medium text-yellow-800 mb-2">Formula Reminder:</div>
        <div className="text-sm text-yellow-700 space-y-1">
          {problemData?.shape === 'rectangle' && (
            <>
              <div>Area = length × width</div>
              <div>Perimeter = 2 × (length + width)</div>
            </>
          )}
          {problemData?.shape === 'square' && (
            <>
              <div>Area = side × side</div>
              <div>Perimeter = 4 × side</div>
            </>
          )}
          {problemData?.shape === 'triangle' && (
            <>
              <div>Area = ½ × base × height</div>
              <div>Perimeter = side + side + side</div>
            </>
          )}
          {problemData?.shape === 'circle' && (
            <>
              <div>Area = π × radius²</div>
              <div>Circumference = 2 × π × radius</div>
            </>
          )}
        </div>
      </div>

      {/* Answer Input */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Your Answer:</label>
        <Input
          type="number"
          value={userAnswer || ''}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`
            text-lg font-mono w-32
            ${showFeedback && isCorrect === true ? 'border-green-500 bg-green-50' : ''}
            ${showFeedback && isCorrect === false ? 'border-red-500 bg-red-50' : ''}
          `}
          placeholder="0"
          disabled={showFeedback}
          step="0.1"
        />
        {question.unit && (
          <span className="text-sm font-medium text-gray-600">
            {question.unit.symbol}
          </span>
        )}
      </div>

      {/* Calculation History */}
      {calculationSteps.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Recent Calculations:</div>
          {calculationSteps.map((calc, index) => (
            <div key={index} className="text-sm font-mono text-gray-600">
              {calc}
            </div>
          ))}
        </div>
      )}

      {showFeedback && question.explanation && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        </div>
      )}
    </div>
  )

  const renderUnitConversion = () => (
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

      {/* Conversion Helper */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="text-sm font-medium text-purple-800 mb-2">Unit Conversions:</div>
        <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
          <div>1 metre = 100 centimetres</div>
          <div>1 m² = 10,000 cm²</div>
          <div>1 kilometre = 1,000 metres</div>
          <div>1 hectare = 10,000 m²</div>
        </div>
        {problemData?.fromUnit && problemData?.toUnit && (
          <div className="mt-2 text-sm font-bold text-purple-800">
            Converting from {problemData.fromUnit} to {problemData.toUnit}
          </div>
        )}
      </div>

      {/* Show the original measurement */}
      {problemData?.sideCm && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold">
            {problemData.sideCm} cm
          </div>
          <div className="text-sm text-gray-600">Original measurement</div>
        </div>
      )}

      {/* Answer Input */}
      <div className="flex items-center gap-4 justify-center">
        <label className="text-sm font-medium">Answer in {question.unit?.symbol || 'm²'}:</label>
        <Input
          type="number"
          value={userAnswer || ''}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`
            text-lg font-mono w-32
            ${showFeedback && isCorrect === true ? 'border-green-500 bg-green-50' : ''}
            ${showFeedback && isCorrect === false ? 'border-red-500 bg-red-50' : ''}
          `}
          placeholder="0"
          disabled={showFeedback}
          step="0.01"
        />
        <span className="text-sm font-medium text-gray-600">
          {question.unit?.symbol}
        </span>
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

  const renderCompositeShapes = () => {
    const shapes = problemData?.shapes || []
    
    return (
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

        {/* Show individual shapes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shapes.map((shape: any, index: number) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-2 font-medium">
                {shape.type === 'rectangle' ? 'Rectangle' : 'Square'} {index + 1}
              </div>
              <div className="flex justify-center mb-2">
                <svg width="160" height="100">
                  <rect
                    x="10"
                    y="10"
                    width={Math.min(shape.length * 2, 140)}
                    height={Math.min(shape.width * 2, 80)}
                    fill={index === 0 ? '#E0F2FE' : '#F0F9FF'}
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  <text x="80" y="25" textAnchor="middle" className="text-xs fill-gray-700">
                    {shape.length}m
                  </text>
                  <text x="5" y="50" textAnchor="middle" className="text-xs fill-gray-700" transform="rotate(-90, 5, 50)">
                    {shape.width}m
                  </text>
                </svg>
              </div>
              <div className="text-center text-sm text-gray-600">
                {shape.length}m × {shape.width}m
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-2">Step-by-step approach:</div>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Calculate the area of each shape separately</li>
            <li>Add the areas together for the total area</li>
            <li>Don't forget to include the correct units (m²)</li>
          </ol>
        </div>

        {/* Answer Input */}
        <div className="flex items-center gap-4 justify-center">
          <label className="text-sm font-medium">Total Area:</label>
          <Input
            type="number"
            value={userAnswer || ''}
            onChange={(e) => setUserAnswer(e.target.value)}
            className={`
              text-lg font-mono w-32
              ${showFeedback && isCorrect === true ? 'border-green-500 bg-green-50' : ''}
              ${showFeedback && isCorrect === false ? 'border-red-500 bg-red-50' : ''}
            `}
            placeholder="0"
            disabled={showFeedback}
            step="0.1"
          />
          <span className="text-sm font-medium text-gray-600">
            {question.unit?.symbol || 'm²'}
          </span>
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
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Question Content */}
        <div>
          {question.type === 'calculation' && !problemData?.shapes && renderCalculation()}
          {question.type === 'calculation' && problemData?.shapes && renderCompositeShapes()}
          {question.type === 'unit-conversion' && renderUnitConversion()}
        </div>

        {/* Interactive Tools */}
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              {showCalculator ? 'Hide' : 'Show'} Calculator
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShapeDrawer(!showShapeDrawer)}
            >
              {showShapeDrawer ? 'Hide' : 'Show'} Shape Drawer
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {showCalculator && (
              <Calculator
                onCalculation={handleCalculation}
                allowedOperations={['add', 'subtract', 'multiply', 'divide', 'decimal']}
              />
            )}

            {showShapeDrawer && (
              <ShapeDrawer
                width={400}
                height={300}
                allowDrawing={true}
                showGrid={true}
                showMeasurements={true}
                onAreaCalculated={(area, perimeter) => {
                  console.log('Shape drawn:', { area, perimeter })
                }}
              />
            )}
          </div>
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