import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { ReadingExercise } from '@/types'
import { year3ReadingExercises } from '@/data/reading-exercises/year3-examples'
import { year6ReadingExercises } from '@/data/reading-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockReadingExercises: ReadingExercise[] = [
  ...year3ReadingExercises,
  ...year6ReadingExercises,
]

// GET /api/exercises/english - Get all reading exercises
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
    const difficulty = searchParams.get('difficulty')
    const topic = searchParams.get('topic')

    // Filter exercises based on query parameters
    let filteredExercises = mockReadingExercises

    if (yearLevel) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.yearLevel === parseInt(yearLevel)
      )
    }

    if (difficulty) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.article.difficulty === difficulty
      )
    }

    if (topic) {
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.tags.includes(topic.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      exercises: filteredExercises,
      total: filteredExercises.length,
    })
  } catch (error) {
    console.error('Error fetching reading exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exercises/english - Create new reading exercise (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.article || !body.questions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, article, questions' },
        { status: 400 }
      )
    }

    // In production, this would save to database
    const newExercise: ReadingExercise = {
      id: `reading-${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to mock data for now
    mockReadingExercises.push(newExercise)

    return NextResponse.json({
      success: true,
      exercise: newExercise,
    })
  } catch (error) {
    console.error('Error creating reading exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
