import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import {
  MathSubmission,
  MathFeedback,
  MathQuestionAnalysis,
  MathTopic,
} from '@/types'
import { year3MathExercises } from '@/data/math-exercises/year3-examples'
import { year6MathExercises } from '@/data/math-exercises/year6-examples'

// Combined mock data
const mockMathExercises = [...year3MathExercises, ...year6MathExercises]

// POST /api/exercises/maths/submit - Submit math exercise answers
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { exerciseId, answers, startedAt, toolUsage = {} } = body

    // Validate required fields
    if (!exerciseId || !answers || !startedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId, answers, startedAt' },
        { status: 400 }
      )
    }

    // Find the exercise
    const exercise = mockMathExercises.find(ex => ex.id === exerciseId)
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Calculate score and analyze answers
    const submittedAt = new Date()
    const timeSpent = Math.round(
      (submittedAt.getTime() - new Date(startedAt).getTime()) / (1000 * 60)
    ) // minutes

    let correctAnswers = 0
    let totalScore = 0
    const questionAnalysis: MathQuestionAnalysis[] = []

    for (const question of exercise.questions) {
      const userAnswer = answers[question.id]
      const isCorrect = checkAnswer(question, userAnswer)

      if (isCorrect) {
        correctAnswers++
        totalScore += question.points
      }

      // Detailed analysis for each question
      questionAnalysis.push({
        questionId: question.id,
        questionType: question.type,
        topic: exercise.topic,
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        skillTested: getSkillTested(question.type, exercise.topic),
        timeSpent: Math.round(timeSpent / exercise.questions.length), // Estimate per question
        hintsUsed: 0, // This would be tracked in the frontend
        toolsUsed: question.requiredTools || [],
      })
    }

    // Generate feedback
    const feedback = generateMathFeedback(
      exercise,
      questionAnalysis,
      totalScore,
      exercise.totalPoints,
      timeSpent
    )

    // Create submission object
    const submission: MathSubmission = {
      id: `math-submission-${Date.now()}`,
      userId: decoded.userId,
      exerciseId: exercise.id,
      answers,
      toolUsage,
      score: totalScore,
      maxScore: exercise.totalPoints,
      correctAnswers,
      totalQuestions: exercise.questions.length,
      timeSpent,
      startedAt: new Date(startedAt),
      submittedAt,
      feedback,
    }

    // In production, save to database
    console.log('Math submission saved:', submission)

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score: totalScore,
        maxScore: exercise.totalPoints,
        correctAnswers,
        totalQuestions: exercise.questions.length,
        percentage: Math.round((totalScore / exercise.totalPoints) * 100),
        timeSpent,
        feedback,
      },
    })
  } catch (error) {
    console.error('Error submitting math exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to check if an answer is correct
function checkAnswer(question: any, userAnswer: any): boolean {
  if (!userAnswer || userAnswer === null || userAnswer === undefined) {
    return false
  }

  const correctAnswer = question.correctAnswer

  switch (question.type) {
    case 'multiple-choice':
      return (
        String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase()
      )

    case 'true-false':
      return Boolean(userAnswer) === Boolean(correctAnswer)

    case 'input-answer':
    case 'calculation':
      // Handle numeric answers with tolerance
      if (question.tolerance && question.tolerance > 0) {
        const userNum = parseFloat(String(userAnswer).replace(/[^0-9.-]/g, ''))
        const correctNum = parseFloat(
          String(correctAnswer).replace(/[^0-9.-]/g, '')
        )
        return Math.abs(userNum - correctNum) <= question.tolerance
      }
      // Exact match for non-numeric or zero tolerance
      return (
        String(userAnswer).toLowerCase().trim() ===
        String(correctAnswer).toLowerCase().trim()
      )

    case 'fraction-visual':
      return String(userAnswer) === String(correctAnswer)

    case 'drag-drop':
      // For drag-drop, compare arrays or objects
      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        return (
          JSON.stringify(userAnswer.sort()) ===
          JSON.stringify(correctAnswer.sort())
        )
      }
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)

    case 'place-value-builder':
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)

    case 'unit-conversion':
      // Handle unit conversion with tolerance
      const userConverted = parseFloat(
        String(userAnswer).replace(/[^0-9.-]/g, '')
      )
      const correctConverted = parseFloat(
        String(correctAnswer).replace(/[^0-9.-]/g, '')
      )
      const tolerance = question.tolerance || 0.01
      return Math.abs(userConverted - correctConverted) <= tolerance

    default:
      return (
        String(userAnswer).toLowerCase().trim() ===
        String(correctAnswer).toLowerCase().trim()
      )
  }
}

// Helper function to determine what skill is being tested
function getSkillTested(questionType: string, topic: MathTopic): string {
  const skillMap: Record<string, Record<MathTopic, string>> = {
    'multiple-choice': {
      'place-value': 'Place value recognition',
      fractions: 'Fraction identification',
      area: 'Area calculation',
      perimeter: 'Perimeter calculation',
      decimals: 'Decimal understanding',
      measurement: 'Unit recognition',
      money: 'Money counting',
    },
    calculation: {
      'place-value': 'Number operations',
      fractions: 'Fraction operations',
      area: 'Area formula application',
      perimeter: 'Perimeter formula application',
      decimals: 'Decimal calculations',
      measurement: 'Unit conversion',
      money: 'Money calculations',
    },
    'input-answer': {
      'place-value': 'Number writing and representation',
      fractions: 'Fraction conversion',
      area: 'Measurement application',
      perimeter: 'Measurement application',
      decimals: 'Decimal notation',
      measurement: 'Unit conversion',
      money: 'Money representation',
    },
  }

  return skillMap[questionType]?.[topic] || `${topic} problem solving`
}

// Helper function to generate comprehensive feedback
function generateMathFeedback(
  exercise: any,
  questionAnalysis: MathQuestionAnalysis[],
  score: number,
  maxScore: number,
  timeSpent: number
): MathFeedback {
  const percentage = Math.round((score / maxScore) * 100)
  const correctCount = questionAnalysis.filter(q => q.isCorrect).length

  // Analyze concept mastery
  const conceptMastery: Record<string, number> = {}
  const topicQuestions = questionAnalysis.filter(
    q => q.topic === exercise.topic
  )
  const topicCorrect = topicQuestions.filter(q => q.isCorrect).length
  conceptMastery[exercise.topic] =
    topicQuestions.length > 0
      ? Math.round((topicCorrect / topicQuestions.length) * 100)
      : 0

  // Generate strengths and improvements
  const strengths: string[] = []
  const improvements: string[] = []

  if (percentage >= 80) {
    strengths.push(
      `Excellent work on ${exercise.topic.replace('-', ' ')} concepts!`
    )
  }

  if (correctCount > 0) {
    const skillAreas = [
      ...new Set(
        questionAnalysis.filter(q => q.isCorrect).map(q => q.skillTested)
      ),
    ]
    strengths.push(`Strong performance in: ${skillAreas.join(', ')}`)
  }

  const incorrectQuestions = questionAnalysis.filter(q => !q.isCorrect)
  if (incorrectQuestions.length > 0) {
    const improvementAreas = [
      ...new Set(incorrectQuestions.map(q => q.skillTested)),
    ]
    improvements.push(`Practice needed in: ${improvementAreas.join(', ')}`)
  }

  if (timeSpent > (exercise.timeLimit || 20)) {
    improvements.push(
      'Try to work more efficiently - practice will help build speed'
    )
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (percentage < 60) {
    recommendations.push(
      `Review the ${exercise.topic.replace('-', ' ')} concepts before trying similar exercises`
    )
    recommendations.push('Use the interactive tools to visualize the problems')
  } else if (percentage < 80) {
    recommendations.push(
      'Good progress! Focus on the areas that need improvement'
    )
    recommendations.push('Try more exercises at this level to build confidence')
  } else {
    recommendations.push(
      'Excellent work! You can try more challenging exercises'
    )
    recommendations.push(
      'Help others or teach the concepts to deepen your understanding'
    )
  }

  // Suggest next topics
  const nextTopics: MathTopic[] = []
  if (percentage >= 70) {
    const topicProgression: Record<MathTopic, MathTopic[]> = {
      'place-value': ['fractions', 'decimals'],
      fractions: ['decimals', 'area'],
      decimals: ['money', 'measurement'],
      area: ['perimeter', 'measurement'],
      perimeter: ['area', 'measurement'],
      measurement: ['area', 'perimeter'],
      money: ['decimals', 'fractions'],
    }
    nextTopics.push(...(topicProgression[exercise.topic] || []))
  }

  return {
    overallScore: percentage,
    conceptMastery,
    strengths,
    improvements,
    questionAnalysis,
    recommendations,
    nextTopics,
  }
}
