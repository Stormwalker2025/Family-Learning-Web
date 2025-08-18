import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { MathExercise } from '@/types'
import { year3MathExercises } from '@/data/math-exercises/year3-examples'
import { year6MathExercises } from '@/data/math-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockMathExercises: MathExercise[] = [
  ...year3MathExercises,
  ...year6MathExercises
]

// GET /api/exercises/maths - Get all math exercises
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
    let filteredExercises = mockMathExercises

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

    if (topic) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.topic === topic || exercise.tags.includes(topic.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      exercises: filteredExercises,
      total: filteredExercises.length
    })

  } catch (error) {
    console.error('Error fetching math exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exercises/maths - Create new math exercise (admin only)
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
    if (!body.title || !body.topic || !body.conceptIntro || !body.questions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topic, conceptIntro, questions' },
        { status: 400 }
      )
    }

    // In production, this would save to database
    const newExercise: MathExercise = {
      id: `math-${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add to mock data for now
    mockMathExercises.push(newExercise)

    return NextResponse.json({
      success: true,
      exercise: newExercise
    })

  } catch (error) {
    console.error('Error creating math exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}