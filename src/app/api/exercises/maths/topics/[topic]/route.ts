import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { MathExercise, MathTopic } from '@/types'
import { year3MathExercises } from '@/data/math-exercises/year3-examples'
import { year6MathExercises } from '@/data/math-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockMathExercises: MathExercise[] = [
  ...year3MathExercises,
  ...year6MathExercises,
]

// Valid math topics
const validTopics: MathTopic[] = [
  'place-value',
  'fractions',
  'area',
  'perimeter',
  'decimals',
  'measurement',
  'money',
]

// GET /api/exercises/maths/topics/[topic] - Get math exercises by topic
export async function GET(
  request: NextRequest,
  { params }: { params: { topic: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const topic = params.topic as MathTopic

    // Validate topic
    if (!validTopics.includes(topic)) {
      return NextResponse.json(
        {
          error: 'Invalid topic',
          validTopics: validTopics,
          message: `Topic '${topic}' is not supported. Valid topics are: ${validTopics.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const yearLevel = searchParams.get('yearLevel')
    const difficulty = searchParams.get('difficulty')
    const limit = searchParams.get('limit')

    // Filter exercises by topic
    let filteredExercises = mockMathExercises.filter(
      exercise => exercise.topic === topic
    )

    // Apply additional filters
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

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit)
      if (limitNum > 0) {
        filteredExercises = filteredExercises.slice(0, limitNum)
      }
    }

    // Sort by difficulty and year level
    filteredExercises.sort((a, b) => {
      if (a.yearLevel !== b.yearLevel) {
        return a.yearLevel - b.yearLevel
      }

      const difficultyOrder = {
        foundation: 1,
        developing: 2,
        proficient: 3,
        advanced: 4,
      }
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    })

    return NextResponse.json({
      success: true,
      topic: topic,
      exercises: filteredExercises,
      total: filteredExercises.length,
      filters: {
        yearLevel: yearLevel ? parseInt(yearLevel) : null,
        difficulty: difficulty || null,
        limit: limit ? parseInt(limit) : null,
      },
    })
  } catch (error) {
    console.error('Error fetching math exercises by topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get topic descriptions
function getTopicDescription(topic: MathTopic): string {
  const descriptions = {
    'place-value':
      'Understanding the value of digits in numbers and decimal numbers',
    fractions: 'Working with fractions, equivalence, and fraction operations',
    area: 'Calculating area of rectangles, triangles, and composite shapes',
    perimeter: 'Measuring and calculating perimeter of various shapes',
    decimals: 'Understanding and working with decimal numbers and money',
    measurement: 'Units of measurement and conversions in the metric system',
    money: 'Australian currency - counting, adding, and making change',
  }

  return descriptions[topic] || 'Mathematical concept and problem solving'
}
