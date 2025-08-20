'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PlaceValueChartProps {
  maxPlaces?: number
  showDecimals?: boolean
  allowInteraction?: boolean
  initialNumber?: string
  highlightPlaces?: string[]
  className?: string
  onNumberChange?: (number: string) => void
  onPlaceValueSelect?: (place: string, digit: string, value: number) => void
}

interface PlaceValue {
  place: string
  name: string
  value: number
  digit: string
}

export const PlaceValueChart: React.FC<PlaceValueChartProps> = ({
  maxPlaces = 7,
  showDecimals = true,
  allowInteraction = true,
  initialNumber = '2457.263',
  highlightPlaces = [],
  className = '',
  onNumberChange,
  onPlaceValueSelect,
}) => {
  const [currentNumber, setCurrentNumber] = useState(initialNumber)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [showExpandedForm, setShowExpandedForm] = useState(false)

  const placeNames = [
    { place: 'millions', name: 'Millions', multiplier: 1000000 },
    {
      place: 'hundred-thousands',
      name: 'Hundred Thousands',
      multiplier: 100000,
    },
    { place: 'ten-thousands', name: 'Ten Thousands', multiplier: 10000 },
    { place: 'thousands', name: 'Thousands', multiplier: 1000 },
    { place: 'hundreds', name: 'Hundreds', multiplier: 100 },
    { place: 'tens', name: 'Tens', multiplier: 10 },
    { place: 'ones', name: 'Ones', multiplier: 1 },
    { place: 'tenths', name: 'Tenths', multiplier: 0.1 },
    { place: 'hundredths', name: 'Hundredths', multiplier: 0.01 },
    { place: 'thousandths', name: 'Thousandths', multiplier: 0.001 },
  ]

  const parseNumber = (numberString: string): PlaceValue[] => {
    const cleanNumber = numberString.replace(/[^0-9.-]/g, '')
    const [wholePart = '0', decimalPart = ''] = cleanNumber.split('.')

    const wholeDigits = wholePart.padStart(7, '0').split('').reverse()
    const decimalDigits = decimalPart.padEnd(3, '0').split('')

    const placeValues: PlaceValue[] = []

    // Whole number places (ones, tens, hundreds, etc.)
    const wholePlaces = placeNames.filter(p => p.multiplier >= 1).reverse()
    wholePlaces.forEach((placeInfo, index) => {
      const digit = wholeDigits[index] || '0'
      placeValues.push({
        place: placeInfo.place,
        name: placeInfo.name,
        value: parseInt(digit) * placeInfo.multiplier,
        digit: digit,
      })
    })

    // Decimal places
    if (showDecimals) {
      const decimalPlaces = placeNames.filter(p => p.multiplier < 1)
      decimalPlaces.forEach((placeInfo, index) => {
        const digit = decimalDigits[index] || '0'
        placeValues.push({
          place: placeInfo.place,
          name: placeInfo.name,
          value: parseInt(digit) * placeInfo.multiplier,
          digit: digit,
        })
      })
    }

    return placeValues.reverse() // Display from largest to smallest
  }

  const updateNumber = (newNumber: string) => {
    setCurrentNumber(newNumber)
    if (onNumberChange) {
      onNumberChange(newNumber)
    }
  }

  const handlePlaceClick = (placeValue: PlaceValue) => {
    if (!allowInteraction) return

    setSelectedPlace(placeValue.place)
    if (onPlaceValueSelect) {
      onPlaceValueSelect(placeValue.place, placeValue.digit, placeValue.value)
    }
  }

  const updateDigitInPlace = (place: string, newDigit: string) => {
    if (!allowInteraction || newDigit.length > 1 || !/^[0-9]$/.test(newDigit))
      return

    const placeValues = parseNumber(currentNumber)
    const placeIndex = placeValues.findIndex(pv => pv.place === place)
    if (placeIndex === -1) return

    // Reconstruct number with new digit
    let newNumberParts = currentNumber.split('.')
    let wholePart = newNumberParts[0] || '0'
    let decimalPart = newNumberParts[1] || ''

    const wholeMultipliers = [1000000, 100000, 10000, 1000, 100, 10, 1]
    const decimalMultipliers = [0.1, 0.01, 0.001]

    const placeInfo = placeNames.find(p => p.place === place)
    if (!placeInfo) return

    if (placeInfo.multiplier >= 1) {
      // Update whole number part
      const wholeArray = wholePart.padStart(7, '0').split('')
      const wholeIndex = wholeMultipliers.indexOf(placeInfo.multiplier)
      if (wholeIndex !== -1) {
        wholeArray[wholeIndex] = newDigit
        wholePart = parseInt(wholeArray.join('')).toString()
      }
    } else {
      // Update decimal part
      const decimalArray = decimalPart.padEnd(3, '0').split('')
      const decimalIndex = decimalMultipliers.indexOf(placeInfo.multiplier)
      if (decimalIndex !== -1) {
        decimalArray[decimalIndex] = newDigit
        decimalPart = decimalArray.join('').replace(/0+$/, '')
      }
    }

    const newNumber = decimalPart ? `${wholePart}.${decimalPart}` : wholePart
    updateNumber(newNumber)
  }

  const generateExpandedForm = (): string => {
    const placeValues = parseNumber(currentNumber)
    const nonZeroPlaces = placeValues.filter(pv => pv.value > 0)

    if (nonZeroPlaces.length === 0) return '0'

    return nonZeroPlaces
      .map(pv => {
        if (pv.multiplier >= 1) {
          return pv.value.toLocaleString()
        } else {
          return pv.value.toFixed(3).replace(/\.?0+$/, '')
        }
      })
      .join(' + ')
  }

  const placeValues = parseNumber(currentNumber)

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Number Input */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded">
          <label className="text-sm font-medium">Number:</label>
          <Input
            type="text"
            value={currentNumber}
            onChange={e => updateNumber(e.target.value)}
            className="text-lg font-mono"
            placeholder="Enter a number..."
            disabled={!allowInteraction}
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExpandedForm(!showExpandedForm)}
            >
              {showExpandedForm ? 'Hide' : 'Show'} Expanded
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => updateNumber('0')}
              disabled={!allowInteraction}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Expanded Form */}
        {showExpandedForm && (
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <div className="text-sm font-medium text-green-800 mb-2">
                Expanded Form:
              </div>
              <div className="text-lg font-mono text-green-900">
                {generateExpandedForm()}
              </div>
            </div>
          </div>
        )}

        {/* Place Value Chart */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Headers */}
            <div className="grid grid-cols-10 gap-1 mb-2">
              {placeValues.map(pv => (
                <div
                  key={pv.place}
                  className={`
                    p-2 text-center text-xs font-medium border-2 rounded-t
                    ${pv.place === 'ones' ? 'bg-yellow-100 border-yellow-400' : ''}
                    ${pv.multiplier >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}
                    ${highlightPlaces.includes(pv.place) ? 'ring-2 ring-purple-400' : ''}
                  `}
                >
                  {pv.name}
                  <div className="text-xs text-gray-500 mt-1">
                    {pv.multiplier >= 1
                      ? pv.multiplier.toLocaleString()
                      : pv.multiplier}
                  </div>
                </div>
              ))}
            </div>

            {/* Digits */}
            <div className="grid grid-cols-10 gap-1 mb-2">
              {placeValues.map(pv => (
                <div key={`digit-${pv.place}`}>
                  {allowInteraction ? (
                    <Input
                      type="text"
                      value={pv.digit}
                      onChange={e =>
                        updateDigitInPlace(pv.place, e.target.value)
                      }
                      onClick={() => handlePlaceClick(pv)}
                      className={`
                        text-center text-2xl font-bold h-16 
                        ${selectedPlace === pv.place ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
                        ${pv.place === 'ones' ? 'bg-yellow-50 border-yellow-300' : ''}
                        ${pv.multiplier >= 1 ? 'border-blue-300' : 'border-green-300'}
                        ${highlightPlaces.includes(pv.place) ? 'ring-2 ring-purple-400' : ''}
                      `}
                      maxLength={1}
                    />
                  ) : (
                    <div
                      className={`
                        h-16 flex items-center justify-center text-2xl font-bold border-2 rounded cursor-pointer
                        ${selectedPlace === pv.place ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
                        ${pv.place === 'ones' ? 'bg-yellow-50 border-yellow-300' : ''}
                        ${pv.multiplier >= 1 ? 'border-blue-300' : 'border-green-300'}
                        ${highlightPlaces.includes(pv.place) ? 'ring-2 ring-purple-400' : ''}
                        hover:bg-gray-50
                      `}
                      onClick={() => handlePlaceClick(pv)}
                    >
                      {pv.digit}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Values */}
            <div className="grid grid-cols-10 gap-1">
              {placeValues.map(pv => (
                <div
                  key={`value-${pv.place}`}
                  className={`
                    p-2 text-center text-sm border-2 rounded-b
                    ${pv.place === 'ones' ? 'bg-yellow-100 border-yellow-400' : ''}
                    ${pv.multiplier >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}
                    ${highlightPlaces.includes(pv.place) ? 'ring-2 ring-purple-400' : ''}
                  `}
                >
                  <div className="font-semibold">
                    {pv.value >= 1
                      ? pv.value.toLocaleString()
                      : pv.value.toFixed(3).replace(/\.?0+$/, '')}
                  </div>
                </div>
              ))}
            </div>

            {/* Decimal Point Indicator */}
            {showDecimals && (
              <div className="grid grid-cols-10 gap-1 mt-2">
                <div className="col-span-7"></div>
                <div className="flex justify-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">.</span>
                  </div>
                </div>
                <div className="col-span-2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Place Info */}
        {selectedPlace && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-center">
              {(() => {
                const selectedPV = placeValues.find(
                  pv => pv.place === selectedPlace
                )
                if (!selectedPV) return null

                return (
                  <div>
                    <div className="text-lg font-semibold text-blue-900">
                      {selectedPV.name} Place
                    </div>
                    <div className="text-sm text-blue-700 mt-2 space-y-1">
                      <div>
                        Digit:{' '}
                        <span className="font-bold text-2xl">
                          {selectedPV.digit}
                        </span>
                      </div>
                      <div>
                        Place Value:{' '}
                        {selectedPV.multiplier >= 1
                          ? selectedPV.multiplier.toLocaleString()
                          : selectedPV.multiplier}
                      </div>
                      <div>
                        Actual Value:{' '}
                        <span className="font-bold">
                          {selectedPV.value >= 1
                            ? selectedPV.value.toLocaleString()
                            : selectedPV.value.toFixed(3).replace(/\.?0+$/, '')}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        {selectedPV.digit} ×{' '}
                        {selectedPV.multiplier >= 1
                          ? selectedPV.multiplier.toLocaleString()
                          : selectedPV.multiplier}{' '}
                        ={' '}
                        {selectedPV.value >= 1
                          ? selectedPV.value.toLocaleString()
                          : selectedPV.value.toFixed(3).replace(/\.?0+$/, '')}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Quick Numbers */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-center">
            Quick Number Examples:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '2457',
              '35628',
              '146789',
              '2457.5',
              '35.42',
              '3.142',
              '0.075',
            ].map(num => (
              <Button
                key={num}
                variant="outline"
                size="sm"
                onClick={() => updateNumber(num)}
                disabled={!allowInteraction}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Place Value Chart Help:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Enter any number to see its place value breakdown</li>
            <li>• Click on digits to edit them individually</li>
            <li>
              • Yellow column shows the "ones" place (decimal point reference)
            </li>
            <li>
              • Blue columns are whole numbers, green columns are decimals
            </li>
            <li>
              • "Show Expanded" displays the number as sum of place values
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
