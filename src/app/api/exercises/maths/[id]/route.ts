import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { MathExercise } from '@/types'
import { year3MathExercises } from '@/data/math-exercises/year3-examples'
import { year6MathExercises } from '@/data/math-exercises/year6-examples'

// Combined mock data for demonstration
const mockMathExercises: MathExercise[] = [
  ...year3MathExercises,
  ...year6MathExercises,
]

// GET /api/exercises/maths/[id] - Get specific math exercise
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

    const exercise = mockMathExercises.find(ex => ex.id === params.id)

    if (!exercise) {
      return NextResponse.json(
        { error: 'Math exercise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      exercise,
    })
  } catch (error) {
    console.error('Error fetching math exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/exercises/maths/[id] - Update math exercise (admin only)
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

    const body = await request.json()
    const exerciseIndex = mockMathExercises.findIndex(ex => ex.id === params.id)

    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'Math exercise not found' },
        { status: 404 }
      )
    }

    // Update exercise
    mockMathExercises[exerciseIndex] = {
      ...mockMathExercises[exerciseIndex],
      ...body,
      updatedAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      exercise: mockMathExercises[exerciseIndex],
    })
  } catch (error) {
    console.error('Error updating math exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/exercises/maths/[id] - Delete math exercise (admin only)
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

    const exerciseIndex = mockMathExercises.findIndex(ex => ex.id === params.id)

    if (exerciseIndex === -1) {
      return NextResponse.json(
        { error: 'Math exercise not found' },
        { status: 404 }
      )
    }

    // Remove exercise
    mockMathExercises.splice(exerciseIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Math exercise deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting math exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
