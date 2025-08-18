import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { HassExercise } from '@/types'
import { year3HassExercises } from '@/data/hass-exercises/year3-examples'
import { year6HassExercises } from '@/data/hass-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockHassExercises: HassExercise[] = [
  ...year3HassExercises,
  ...year6HassExercises
]

// GET /api/exercises/hass - Get all HASS exercises
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
    const subject = searchParams.get('subject') // history, geography, civics, economics
    const topic = searchParams.get('topic')

    // Filter exercises based on query parameters
    let filteredExercises = mockHassExercises

    if (yearLevel) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.yearLevel === parseInt(yearLevel)
      )
    }

    if (difficulty) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.difficulty === difficulty
      )
    }

    if (subject) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.subject === subject
      )
    }

    if (topic) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.tags.includes(topic.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      exercises: filteredExercises,
      total: filteredExercises.length,
      subjects: ['history', 'geography', 'civics', 'economics'],
      yearLevels: [3, 6],
      difficulties: ['foundation', 'developing', 'proficient', 'advanced']
    })

  } catch (error) {
    console.error('Error fetching HASS exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exercises/hass - Create new HASS exercise (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.subject || !body.article || !body.questions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, subject, article, questions' },
        { status: 400 }
      )
    }

    // Validate subject
    const validSubjects = ['history', 'geography', 'civics', 'economics']
    if (!validSubjects.includes(body.subject)) {
      return NextResponse.json(
        { error: 'Invalid subject. Must be one of: history, geography, civics, economics' },
        { status: 400 }
      )
    }

    // In production, this would save to database
    const newExercise: HassExercise = {
      id: `hass-${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add to mock data for now
    mockHassExercises.push(newExercise)

    return NextResponse.json({
      success: true,
      exercise: newExercise
    })

  } catch (error) {
    console.error('Error creating HASS exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}