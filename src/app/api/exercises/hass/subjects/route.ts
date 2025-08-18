import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { HassSubject } from '@/types'
import { year3HassExercises } from '@/data/hass-exercises/year3-examples'
import { year6HassExercises } from '@/data/hass-exercises/year6-examples'

// Combined mock data
const mockHassExercises = [
  ...year3HassExercises,
  ...year6HassExercises
]

// GET /api/exercises/hass/subjects - Get exercises grouped by subject
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const yearLevel = searchParams.get('yearLevel')

    // Filter by year level if specified
    let filteredExercises = mockHassExercises
    if (yearLevel) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.yearLevel === parseInt(yearLevel)
      )
    }

    // Group exercises by subject
    const exercisesBySubject = filteredExercises.reduce((acc, exercise) => {
      const subject = exercise.subject
      if (!acc[subject]) {
        acc[subject] = []
      }
      acc[subject].push({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        yearLevel: exercise.yearLevel,
        difficulty: exercise.difficulty,
        estimatedDuration: exercise.estimatedDuration,
        topics: exercise.article.topics,
        totalPoints: exercise.totalPoints,
        tags: exercise.tags
      })
      return acc
    }, {} as Record<HassSubject, any[]>)

    // Generate subject metadata
    const subjects = {
      history: {
        name: 'History',
        description: 'Explore Australia\'s past, from Aboriginal culture to modern times',
        icon: '📚',
        exercises: exercisesBySubject.history || [],
        topics: ['aboriginal-culture', 'european-settlement', 'federation', 'immigration', 'war-history'],
        color: 'bg-amber-500'
      },
      geography: {
        name: 'Geography', 
        description: 'Discover Australia\'s diverse landscapes, climate, and places',
        icon: '🗺️',
        exercises: exercisesBySubject.geography || [],
        topics: ['australian-states', 'landforms', 'climate', 'natural-disasters', 'environment'],
        color: 'bg-green-500'
      },
      civics: {
        name: 'Civics & Citizenship',
        description: 'Learn about democracy, rights, and responsibilities in Australia',
        icon: '🏛️',
        exercises: exercisesBySubject.civics || [],
        topics: ['democracy', 'government', 'citizenship', 'law', 'community'],
        color: 'bg-blue-500'
      },
      economics: {
        name: 'Economics & Business',
        description: 'Understand how money, trade, and business work in Australia',
        icon: '💰',
        exercises: exercisesBySubject.economics || [],
        topics: ['money', 'trade', 'resources', 'entrepreneurship', 'sustainability'],
        color: 'bg-purple-500'
      }
    }

    return NextResponse.json({
      success: true,
      subjects,
      totalExercises: filteredExercises.length,
      yearLevel: yearLevel ? parseInt(yearLevel) : 'all'
    })

  } catch (error) {
    console.error('Error fetching HASS subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}