'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CalculatorProps {
  onCalculation?: (calculation: string, result: number) => void
  allowedOperations?: ('add' | 'subtract' | 'multiply' | 'divide' | 'decimal')[]
  maxDigits?: number
  className?: string
}

export const Calculator: React.FC<CalculatorProps> = ({
  onCalculation,
  allowedOperations = ['add', 'subtract', 'multiply', 'divide', 'decimal'],
  maxDigits = 8,
  className = '',
}) => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNew, setWaitingForNew] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const inputNumber = (num: string) => {
    if (display.replace(/[^0-9]/g, '').length >= maxDigits) return

    if (waitingForNew) {
      setDisplay(num)
      setWaitingForNew(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputDecimal = () => {
    if (!allowedOperations.includes('decimal')) return

    if (waitingForNew) {
      setDisplay('0.')
      setWaitingForNew(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNew(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      const calculationString = `${previousValue} ${operation} ${inputValue} = ${newValue}`
      setHistory(prev => [...prev.slice(-4), calculationString])

      setDisplay(String(newValue))
      setPreviousValue(newValue)

      if (onCalculation) {
        onCalculation(calculationString, newValue)
      }
    }

    setWaitingForNew(true)
    setOperation(nextOperation)
  }

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string
  ): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      default:
        return secondValue
    }
  }

  const performEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      const calculationString = `${previousValue} ${operation} ${inputValue} = ${newValue}`

      setHistory(prev => [...prev.slice(-4), calculationString])
      setDisplay(String(newValue))

      if (onCalculation) {
        onCalculation(calculationString, newValue)
      }

      setPreviousValue(null)
      setOperation(null)
      setWaitingForNew(true)
    }
  }

  const isOperationAllowed = (op: string): boolean => {
    const operationMap = {
      '+': 'add',
      '-': 'subtract',
      '*': 'multiply',
      '/': 'divide',
    }
    return allowedOperations.includes(
      operationMap[op as keyof typeof operationMap] as any
    )
  }

  return (
    <Card className={`p-4 w-80 ${className}`}>
      <div className="space-y-4">
        {/* History Display */}
        <div className="bg-gray-50 p-2 rounded min-h-[60px] text-sm">
          <div className="text-gray-600 mb-1">Calculation History:</div>
          {history.length === 0 ? (
            <div className="text-gray-400 text-xs">No calculations yet</div>
          ) : (
            <div className="space-y-1">
              {history.slice(-3).map((calc, index) => (
                <div key={index} className="text-xs text-gray-700 font-mono">
                  {calc}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-right text-2xl font-mono font-bold text-blue-900 min-h-[36px] break-all">
            {display}
          </div>
          {operation && (
            <div className="text-right text-sm text-blue-600">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <Button variant="destructive" onClick={clear} className="col-span-2">
            Clear
          </Button>
          <Button
            variant="secondary"
            onClick={() => setDisplay(display.slice(0, -1) || '0')}
          >
            ⌫
          </Button>
          <Button
            variant="outline"
            onClick={() => performOperation('/')}
            disabled={!isOperationAllowed('/')}
            className={!isOperationAllowed('/') ? 'opacity-50' : ''}
          >
            ÷
          </Button>

          {/* Row 2 */}
          <Button variant="outline" onClick={() => inputNumber('7')}>
            7
          </Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>
            8
          </Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>
            9
          </Button>
          <Button
            variant="outline"
            onClick={() => performOperation('*')}
            disabled={!isOperationAllowed('*')}
            className={!isOperationAllowed('*') ? 'opacity-50' : ''}
          >
            ×
          </Button>

          {/* Row 3 */}
          <Button variant="outline" onClick={() => inputNumber('4')}>
            4
          </Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>
            5
          </Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>
            6
          </Button>
          <Button
            variant="outline"
            onClick={() => performOperation('-')}
            disabled={!isOperationAllowed('-')}
            className={!isOperationAllowed('-') ? 'opacity-50' : ''}
          >
            −
          </Button>

          {/* Row 4 */}
          <Button variant="outline" onClick={() => inputNumber('1')}>
            1
          </Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>
            2
          </Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>
            3
          </Button>
          <Button
            variant="outline"
            onClick={() => performOperation('+')}
            disabled={!isOperationAllowed('+')}
            className={
              !isOperationAllowed('+') ? 'opacity-50 row-span-2' : 'row-span-2'
            }
          >
            +
          </Button>

          {/* Row 5 */}
          <Button
            variant="outline"
            onClick={() => inputNumber('0')}
            className="col-span-2"
          >
            0
          </Button>
          <Button
            variant="outline"
            onClick={inputDecimal}
            disabled={!allowedOperations.includes('decimal')}
            className={
              !allowedOperations.includes('decimal') ? 'opacity-50' : ''
            }
          >
            .
          </Button>

          {/* Equals button in the space next to + */}
        </div>

        {/* Equals button full width */}
        <Button
          variant="default"
          onClick={performEquals}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          = Calculate
        </Button>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Calculator Help:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Enter numbers by clicking the number buttons</li>
            <li>• Choose an operation (+, −, ×, ÷)</li>
            <li>• Click "= Calculate" to see the result</li>
            <li>• Use "Clear" to start over</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
