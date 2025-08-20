'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Fraction {
  numerator: number
  denominator: number
}

interface FractionBarProps {
  initialFraction?: Fraction
  allowInteraction?: boolean
  showEquivalent?: boolean
  maxDenominator?: number
  className?: string
  onFractionChange?: (fraction: Fraction) => void
}

export const FractionBar: React.FC<FractionBarProps> = ({
  initialFraction = { numerator: 1, denominator: 2 },
  allowInteraction = true,
  showEquivalent = true,
  maxDenominator = 12,
  className = '',
  onFractionChange,
}) => {
  const [fraction, setFraction] = useState<Fraction>(initialFraction)
  const [showingEquivalent, setShowingEquivalent] = useState(false)
  const [compareWith, setCompareWith] = useState<Fraction>({
    numerator: 1,
    denominator: 3,
  })

  const updateFraction = (newFraction: Fraction) => {
    // Validate the fraction
    if (newFraction.denominator <= 0 || newFraction.numerator < 0) return
    if (newFraction.denominator > maxDenominator) return

    setFraction(newFraction)
    if (onFractionChange) {
      onFractionChange(newFraction)
    }
  }

  const simplifyFraction = (frac: Fraction): Fraction => {
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
    const divisor = gcd(frac.numerator, frac.denominator)
    return {
      numerator: frac.numerator / divisor,
      denominator: frac.denominator / divisor,
    }
  }

  const findEquivalentFractions = (frac: Fraction): Fraction[] => {
    const simplified = simplifyFraction(frac)
    const equivalents: Fraction[] = []

    for (let i = 1; i <= 6; i++) {
      const equiv = {
        numerator: simplified.numerator * i,
        denominator: simplified.denominator * i,
      }
      if (equiv.denominator <= maxDenominator) {
        equivalents.push(equiv)
      }
    }

    return equivalents
      .filter(
        eq =>
          !(
            eq.numerator === frac.numerator &&
            eq.denominator === frac.denominator
          )
      )
      .slice(0, 4)
  }

  const toDecimal = (frac: Fraction): number => {
    return frac.numerator / frac.denominator
  }

  const toPercentage = (frac: Fraction): string => {
    return `${Math.round((frac.numerator / frac.denominator) * 100)}%`
  }

  const compareFractions = (frac1: Fraction, frac2: Fraction): string => {
    const decimal1 = toDecimal(frac1)
    const decimal2 = toDecimal(frac2)

    if (decimal1 > decimal2) return 'greater than'
    if (decimal1 < decimal2) return 'less than'
    return 'equal to'
  }

  const renderFractionVisual = (
    frac: Fraction,
    color: string = 'blue',
    title?: string
  ) => {
    const segments = []
    const segmentWidth = 300 / frac.denominator

    for (let i = 0; i < frac.denominator; i++) {
      const isShaded = i < frac.numerator
      segments.push(
        <rect
          key={i}
          x={i * segmentWidth}
          y={0}
          width={segmentWidth - 1}
          height={60}
          fill={
            isShaded ? `${color === 'blue' ? '#3B82F6' : '#EF4444'}` : '#F3F4F6'
          }
          stroke="#6B7280"
          strokeWidth="1"
          className="transition-all hover:opacity-80"
        />
      )
    }

    return (
      <div className="space-y-2">
        {title && (
          <div className="text-sm font-medium text-center">{title}</div>
        )}
        <div className="flex justify-center">
          <svg width="300" height="60" className="border rounded">
            {segments}
          </svg>
        </div>
        <div className="text-center">
          <span className="text-lg font-semibold">
            {frac.numerator}/{frac.denominator}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            = {toDecimal(frac).toFixed(3)} = {toPercentage(frac)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Numerator:</label>
            <Input
              type="number"
              value={fraction.numerator}
              onChange={e =>
                updateFraction({
                  ...fraction,
                  numerator: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className="w-20"
              min="0"
              max={fraction.denominator}
              disabled={!allowInteraction}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Denominator:</label>
            <Input
              type="number"
              value={fraction.denominator}
              onChange={e =>
                updateFraction({
                  ...fraction,
                  denominator: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-20"
              min="1"
              max={maxDenominator}
              disabled={!allowInteraction}
            />
          </div>

          {allowInteraction && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateFraction(simplifyFraction(fraction))}
              >
                Simplify
              </Button>

              {showEquivalent && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowingEquivalent(!showingEquivalent)}
                >
                  {showingEquivalent ? 'Hide' : 'Show'} Equivalent
                </Button>
              )}
            </>
          )}
        </div>

        {/* Main Fraction Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          {renderFractionVisual(fraction, 'blue', 'Main Fraction')}
        </div>

        {/* Equivalent Fractions */}
        {showingEquivalent && showEquivalent && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Equivalent Fractions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {findEquivalentFractions(fraction).map((equiv, index) => (
                <div key={index} className="bg-green-50 p-3 rounded border">
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium">
                      {equiv.numerator}/{equiv.denominator}
                    </div>
                    <div className="flex justify-center">
                      <svg width="150" height="30" className="border rounded">
                        {Array.from({ length: equiv.denominator }).map(
                          (_, i) => (
                            <rect
                              key={i}
                              x={i * (150 / equiv.denominator)}
                              y={0}
                              width={150 / equiv.denominator - 1}
                              height={30}
                              fill={i < equiv.numerator ? '#10B981' : '#F3F4F6'}
                              stroke="#6B7280"
                              strokeWidth="0.5"
                            />
                          )
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fraction Comparison */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            Compare Fractions
          </h3>

          <div className="flex items-center gap-4 justify-center">
            <Input
              type="number"
              value={compareWith.numerator}
              onChange={e =>
                setCompareWith({
                  ...compareWith,
                  numerator: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className="w-16"
              min="0"
              placeholder="Num"
            />
            <span>/</span>
            <Input
              type="number"
              value={compareWith.denominator}
              onChange={e =>
                setCompareWith({
                  ...compareWith,
                  denominator: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-16"
              min="1"
              placeholder="Den"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              {renderFractionVisual(fraction, 'blue')}
            </div>
            <div className="bg-red-50 p-3 rounded">
              {renderFractionVisual(compareWith, 'red')}
            </div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-lg font-semibold">
              {fraction.numerator}/{fraction.denominator} is{' '}
              <span className="text-blue-600">
                {compareFractions(fraction, compareWith)}
              </span>{' '}
              {compareWith.numerator}/{compareWith.denominator}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {toDecimal(fraction).toFixed(3)} vs{' '}
              {toDecimal(compareWith).toFixed(3)}
            </div>
          </div>
        </div>

        {/* Quick Fraction Buttons */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-center">
            Quick Fractions:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { num: 1, den: 2 },
              { num: 1, den: 3 },
              { num: 1, den: 4 },
              { num: 2, den: 3 },
              { num: 3, den: 4 },
              { num: 2, den: 5 },
              { num: 3, den: 5 },
              { num: 5, den: 6 },
            ].map((frac, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => updateFraction(frac)}
                disabled={!allowInteraction}
                className="text-xs"
              >
                {frac.num}/{frac.den}
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Fraction Bar Help:</strong>
          <ul className="mt-1 space-y-1">
            <li>
              • Adjust numerator and denominator to create different fractions
            </li>
            <li>• Shaded parts show the fraction value</li>
            <li>• Use "Simplify" to reduce fractions to lowest terms</li>
            <li>• "Show Equivalent" displays fractions with the same value</li>
            <li>• Compare two fractions to see which is larger</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
