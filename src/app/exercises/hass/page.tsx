'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Target,
  Users,
  Globe,
  Landmark,
  Scale,
  Briefcase,
} from 'lucide-react'
import { HassExercise as HassExerciseType, HassSubmission } from '@/types'
import { HassExercise } from '@/components/exercises/hass'
import { useAuth } from '@/hooks/auth/useAuth'

export default function HassPage() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<HassExerciseType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] =
    useState<HassExerciseType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all')

  const subjects = [
    {
      value: 'history',
      label: 'History',
      icon: Landmark,
      color: 'text-purple-600',
    },
    {
      value: 'geography',
      label: 'Geography',
      icon: Globe,
      color: 'text-blue-600',
    },
    { value: 'civics', label: 'Civics', icon: Scale, color: 'text-green-600' },
    {
      value: 'economics',
      label: 'Economics',
      icon: Briefcase,
      color: 'text-orange-600',
    },
  ]

  useEffect(() => {
    fetchExercises()
  }, [selectedSubject, selectedDifficulty, selectedYearLevel])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedSubject !== 'all') params.set('subject', selectedSubject)
      if (selectedDifficulty !== 'all')
        params.set('difficulty', selectedDifficulty)
      if (selectedYearLevel !== 'all')
        params.set('yearLevel', selectedYearLevel)

      const response = await fetch(`/api/exercises/hass?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExercises(data.exercises || [])
      }
    } catch (error) {
      console.error('Error fetching HASS exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch =
      searchTerm === '' ||
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return matchesSearch
  })

  const handleSubmission = async (submission: HassSubmission) => {
    try {
      const response = await fetch('/api/exercises/hass/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(submission),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Submission successful:', result)
        setSelectedExercise(null) // Go back to exercise list
      }
    } catch (error) {
      console.error('Error submitting exercise:', error)
    }
  }

  const getSubjectIcon = (subject: string) => {
    const subjectConfig = subjects.find(s => s.value === subject)
    const Icon = subjectConfig?.icon || BookOpen
    return (
      <Icon className={`h-4 w-4 ${subjectConfig?.color || 'text-gray-600'}`} />
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      foundation:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      developing:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      proficient:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return (
      colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    )
  }

  if (selectedExercise && user) {
    return (
      <HassExercise
        exercise={selectedExercise}
        onSubmit={handleSubmission}
        userId={user.id}
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          HASS (Humanities and Social Sciences)
        </h1>
        <p className="text-muted-foreground">
          Explore history, geography, civics, and economics through engaging
          Australian content
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Perfect Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Subject Tabs */}
          <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Subjects</TabsTrigger>
              {subjects.map(subject => (
                <TabsTrigger
                  key={subject.value}
                  value={subject.value}
                  className="flex items-center gap-2"
                >
                  {getSubjectIcon(subject.value)}
                  {subject.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Year Level:</label>
              <select
                value={selectedYearLevel}
                onChange={e => setSelectedYearLevel(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Years</option>
                <option value="3">Year 3</option>
                <option value="6">Year 6</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Difficulty:</label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Levels</option>
                <option value="foundation">Foundation</option>
                <option value="developing">Developing</option>
                <option value="proficient">Proficient</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exercises...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map(exercise => (
            <Card
              key={exercise.id}
              className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedExercise(exercise)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2">
                      {exercise.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getSubjectIcon(exercise.subject)}
                      <Badge variant="outline" className="text-xs">
                        {exercise.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Year {exercise.yearLevel}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {exercise.description}
                </p>

                {/* Exercise Stats */}
                <div className="grid grid-cols-3 gap-4 text-center py-3 border-t">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{exercise.article.readingTime}m</span>
                    </div>
                    <div className="text-xs font-medium">Reading</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{exercise.questions.length}</span>
                    </div>
                    <div className="text-xs font-medium">Questions</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{exercise.totalPoints}</span>
                    </div>
                    <div className="text-xs font-medium">Points</div>
                  </div>
                </div>

                {/* Tags */}
                {exercise.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {exercise.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.replace('-', ' ')}
                      </Badge>
                    ))}
                    {exercise.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{exercise.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Button className="w-full mt-4">Start Exercise</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredExercises.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new
            content.
          </p>
        </div>
      )}
    </div>
  )
}
