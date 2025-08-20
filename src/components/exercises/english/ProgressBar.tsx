'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ProgressBarProps {
  progress: number // 0-100
  currentQuestion: number
  totalQuestions: number
  timeElapsed: number // in minutes
  timeLimit?: number // in minutes
}

export function ProgressBar({
  progress,
  currentQuestion,
  totalQuestions,
  timeElapsed,
  timeLimit,
}: ProgressBarProps) {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTimeStatus = () => {
    if (!timeLimit) return 'normal'

    const timeUsedPercentage = (timeElapsed / timeLimit) * 100

    if (timeUsedPercentage >= 90) return 'critical'
    if (timeUsedPercentage >= 75) return 'warning'
    return 'normal'
  }

  const timeStatus = getTimeStatus()

  const getTimeStatusColor = () => {
    switch (timeStatus) {
      case 'critical':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTimeStatusIcon = () => {
    switch (timeStatus) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">
                Question {currentQuestion} of {totalQuestions}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {getTimeStatusIcon()}
              <span className={`text-sm font-medium ${getTimeStatusColor()}`}>
                {formatTime(timeElapsed)}
                {timeLimit && (
                  <span className="text-muted-foreground">
                    {' '}
                    / {formatTime(timeLimit)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% Complete</span>
              <span>
                {totalQuestions - currentQuestion} questions remaining
              </span>
            </div>
          </div>

          {/* Time Progress (if time limit exists) */}
          {timeLimit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Progress:</span>
                <span className={getTimeStatusColor()}>
                  {Math.round((timeElapsed / timeLimit) * 100)}%
                </span>
              </div>
              <Progress
                value={(timeElapsed / timeLimit) * 100}
                className={`h-2 ${
                  timeStatus === 'critical'
                    ? '[&>div]:bg-red-500'
                    : timeStatus === 'warning'
                      ? '[&>div]:bg-yellow-500'
                      : '[&>div]:bg-blue-500'
                }`}
              />
              <div className="text-xs text-muted-foreground text-center">
                {timeLimit - timeElapsed > 0
                  ? `${formatTime(timeLimit - timeElapsed)} remaining`
                  : 'Time exceeded'}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {timeStatus === 'warning' && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Time Warning:</strong> You've used 75% of the
                recommended time. Consider speeding up your pace.
              </p>
            </div>
          )}

          {timeStatus === 'critical' && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-800">
                <strong>Time Critical:</strong> You've used 90% of the
                recommended time. Please finish the remaining questions quickly.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
