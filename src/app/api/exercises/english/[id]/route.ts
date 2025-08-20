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

// GET /api/exercises/english/[id] - Get specific reading exercise
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Find exercise by ID
    const exercise = mockReadingExercises.find(ex => ex.id === id)

    if (!exercise) {
      return NextResponse.json(
        { error: 'Reading exercise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      exercise,
    })
  } catch (error) {
    console.error('Error fetching reading exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/exercises/english/[id] - Update reading exercise (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()

    // Find exercise index
    const exerciseIndex = mockReadingExercises.findIndex(ex => ex.id === id)

    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'Reading exercise not found' },
        { status: 404 }
      )
    }

    // Update exercise
    const updatedExercise = {
      ...mockReadingExercises[exerciseIndex],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    }

    mockReadingExercises[exerciseIndex] = updatedExercise

    return NextResponse.json({
      success: true,
      exercise: updatedExercise,
    })
  } catch (error) {
    console.error('Error updating reading exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/exercises/english/[id] - Delete reading exercise (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Find exercise index
    const exerciseIndex = mockReadingExercises.findIndex(ex => ex.id === id)

    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'Reading exercise not found' },
        { status: 404 }
      )
    }

    // Remove exercise
    const deletedExercise = mockReadingExercises.splice(exerciseIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Reading exercise deleted successfully',
      exercise: deletedExercise,
    })
  } catch (error) {
    console.error('Error deleting reading exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
