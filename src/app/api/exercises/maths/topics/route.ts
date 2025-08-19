import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { MathExercise, MathTopic } from '@/types'
import { year3MathExercises } from '@/data/math-exercises/year3-examples'
import { year6MathExercises } from '@/data/math-exercises/year6-examples'

// Combined mock data for demonstration - in production this would come from database
const mockMathExercises: MathExercise[] = [
  ...year3MathExercises,
  ...year6MathExercises
]

// Valid math topics
const validTopics: MathTopic[] = [
  'place-value',
  'fractions', 
  'area',
  'perimeter',
  'decimals',
  'measurement',
  'money'
]

// GET /api/exercises/maths/topics - Get all available topics
export async function GET(request: NextRequest) {
  try {
    // Get topic statistics
    const topicStats = validTopics.map(topic => {
      const topicExercises = mockMathExercises.filter(ex => ex.topic === topic)
      const yearLevels = [...new Set(topicExercises.map(ex => ex.yearLevel))].sort()
      const difficulties = [...new Set(topicExercises.map(ex => ex.difficulty))]
      
      return {
        topic,
        count: topicExercises.length,
        yearLevels,
        difficulties,
        description: getTopicDescription(topic)
      }
    })

    return NextResponse.json({
      success: true,
      availableTopics: topicStats,
      totalTopics: validTopics.length
    })

  } catch (error) {
    console.error('Error fetching math exercises by topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET available topics endpoint
export async function OPTIONS(request: NextRequest) {
  try {
    // Get topic statistics
    const topicStats = validTopics.map(topic => {
      const topicExercises = mockMathExercises.filter(ex => ex.topic === topic)
      const yearLevels = [...new Set(topicExercises.map(ex => ex.yearLevel))].sort()
      const difficulties = [...new Set(topicExercises.map(ex => ex.difficulty))]
      
      return {
        topic,
        count: topicExercises.length,
        yearLevels,
        difficulties,
        description: getTopicDescription(topic)
      }
    })

    return NextResponse.json({
      success: true,
      availableTopics: topicStats,
      totalTopics: validTopics.length
    })

  } catch (error) {
    console.error('Error getting topic information:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get topic descriptions
function getTopicDescription(topic: MathTopic): string {
  const descriptions = {
    'place-value': 'Understanding the value of digits in numbers and decimal numbers',
    'fractions': 'Working with fractions, equivalence, and fraction operations',
    'area': 'Calculating area of rectangles, triangles, and composite shapes',
    'perimeter': 'Measuring and calculating perimeter of various shapes',
    'decimals': 'Understanding and working with decimal numbers and money',
    'measurement': 'Units of measurement and conversions in the metric system',
    'money': 'Australian currency - counting, adding, and making change'
  }
  
  return descriptions[topic] || 'Mathematical concept and problem solving'
}