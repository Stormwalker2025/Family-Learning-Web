'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { ReadingExercise } from '@/types'
import { ReadingExercise as ReadingExerciseComponent } from '@/components/exercises/english/ReadingExercise'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Clock,
  Target,
  Filter,
  Search,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

export default function EnglishReadingPage() {
  const { user, getAuthToken } = useAuth()
  const [exercises, setExercises] = useState<ReadingExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterYearLevel, setFilterYearLevel] = useState<number | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)

  useEffect(() => {
    async function loadExercises() {
      try {
        const token = await getAuthToken()
        if (!token) {
          setError('Authentication required')
          setLoading(false)
          return
        }

        const params = new URLSearchParams()
        if (filterYearLevel)
          params.append('yearLevel', filterYearLevel.toString())
        if (filterDifficulty) params.append('difficulty', filterDifficulty)

        const response = await fetch(
          `/api/exercises/english?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load exercises')
        }

        const data = await response.json()
        if (data.success) {
          setExercises(data.exercises)
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (err) {
        console.error('Error loading exercises:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load exercises'
        )
      } finally {
        setLoading(false)
      }
    }

    loadExercises()
  }, [getAuthToken, filterYearLevel, filterDifficulty])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const resetFilters = () => {
    setFilterYearLevel(null)
    setFilterDifficulty(null)
  }

  if (selectedExercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedExercise(null)}
            className="mb-4"
          >
            ← Back to Exercises
          </Button>
        </div>
        <ReadingExerciseComponent
          exerciseId={selectedExercise}
          onComplete={() => {
            // Optional: refresh exercises or show success message
            console.log('Exercise completed!')
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">English Reading Exercises</h1>
        </div>
        <p className="text-muted-foreground">
          Practice reading comprehension with IELTS GT style questions designed
          for Australian students
        </p>
      </div>

      {/* Stats and Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {exercises.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Available Exercises
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              Year {user?.yearLevel || 'All'}
            </div>
            <div className="text-sm text-muted-foreground">Your Level</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">5 Types</div>
            <div className="text-sm text-muted-foreground">
              Question Formats
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Exercises</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Year Level:</span>
              <div className="flex space-x-2">
                <Button
                  variant={filterYearLevel === 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFilterYearLevel(filterYearLevel === 3 ? null : 3)
                  }
                >
                  Year 3
                </Button>
                <Button
                  variant={filterYearLevel === 6 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFilterYearLevel(filterYearLevel === 6 ? null : 6)
                  }
                >
                  Year 6
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Difficulty:</span>
              <div className="flex space-x-2">
                {['easy', 'medium', 'hard'].map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={
                      filterDifficulty === difficulty ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setFilterDifficulty(
                        filterDifficulty === difficulty ? null : difficulty
                      )
                    }
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {(filterYearLevel || filterDifficulty) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <BookOpen className="h-8 w-8 animate-spin mr-2" />
          <span>Loading exercises...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error Loading Exercises</p>
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : exercises.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No Exercises Found</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later for new content.
            </p>
            <Button onClick={resetFilters}>Clear All Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map(exercise => (
            <Card
              key={exercise.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedExercise(exercise.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {exercise.title}
                  </CardTitle>
                  <div className="flex flex-col space-y-1">
                    <Badge variant="outline" className="text-xs">
                      Year {exercise.yearLevel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(exercise.article.difficulty)}`}
                    >
                      {exercise.article.difficulty}
                    </Badge>
                  </div>
                </div>
                {exercise.description && (
                  <p className="text-sm text-muted-foreground">
                    {exercise.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Article Info */}
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">{exercise.article.title}</p>
                    <div className="flex items-center space-x-4">
                      <span>{exercise.article.wordCount} words</span>
                      <span>{exercise.article.readingTime} min read</span>
                    </div>
                  </div>

                  {/* Exercise Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{exercise.totalPoints} points</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{exercise.timeLimit} min</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {exercise.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {exercise.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{exercise.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full">Start Exercise</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
