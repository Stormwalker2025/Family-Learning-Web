import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { HassExercise } from '@/types'
import { year3HassExercises } from '@/data/hass-exercises/year3-examples'
import { year6HassExercises } from '@/data/hass-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockHassExercises: HassExercise[] = [
  ...year3HassExercises,
  ...year6HassExercises,
]

// GET /api/exercises/hass/[id] - Get specific HASS exercise
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

    // Find the exercise by ID
    const exercise = mockHassExercises.find(ex => ex.id === id)

    if (!exercise) {
      return NextResponse.json(
        { error: 'HASS exercise not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to access this exercise
    // For students, check year level compatibility
    if (decoded.role === 'STUDENT') {
      const userYearLevel = decoded.yearLevel || 3

      // Allow access to exercises at or below user's year level
      if (exercise.yearLevel > userYearLevel + 1) {
        return NextResponse.json(
          { error: 'Exercise too advanced for your year level' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      exercise: exercise,
    })
  } catch (error) {
    console.error('Error fetching HASS exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/exercises/hass/[id] - Update HASS exercise (admin only)
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

    // Find existing exercise
    const exerciseIndex = mockHassExercises.findIndex(ex => ex.id === id)
    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'HASS exercise not found' },
        { status: 404 }
      )
    }

    // Update exercise
    const updatedExercise: HassExercise = {
      ...mockHassExercises[exerciseIndex],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    }

    mockHassExercises[exerciseIndex] = updatedExercise

    return NextResponse.json({
      success: true,
      exercise: updatedExercise,
    })
  } catch (error) {
    console.error('Error updating HASS exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/exercises/hass/[id] - Delete HASS exercise (admin only)
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

    // Find exercise
    const exerciseIndex = mockHassExercises.findIndex(ex => ex.id === id)
    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'HASS exercise not found' },
        { status: 404 }
      )
    }

    // Remove exercise from mock data
    const deletedExercise = mockHassExercises.splice(exerciseIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'HASS exercise deleted successfully',
      exercise: deletedExercise,
    })
  } catch (error) {
    console.error('Error deleting HASS exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
