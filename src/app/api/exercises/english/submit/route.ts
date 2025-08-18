import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { ReadingSubmission, ReadingFeedback, QuestionAnalysis } from '@/types'
import { year3ReadingExercises } from '@/data/reading-exercises/year3-examples'
import { year6ReadingExercises } from '@/data/reading-exercises/year6-examples'

// Combined mock data for validation
const mockReadingExercises = [
  ...year3ReadingExercises,
  ...year6ReadingExercises
]

// POST /api/exercises/english/submit - Submit reading exercise answers
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
    const { exerciseId, answers, startedAt, timeSpent } = body

    // Validate required fields
    if (!exerciseId || !answers || !startedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId, answers, startedAt' },
        { status: 400 }
      )
    }

    // Find the exercise
    const exercise = mockReadingExercises.find(ex => ex.id === exerciseId)
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Grade the submission
    let score = 0
    let correctAnswers = 0
    const questionAnalysis: QuestionAnalysis[] = []

    exercise.questions.forEach(question => {
      const userAnswer = answers[question.id]
      const isCorrect = checkAnswer(question.correctAnswer, userAnswer, question.type)
      
      if (isCorrect) {
        score += question.points
        correctAnswers++
      }

      questionAnalysis.push({
        questionId: question.id,
        questionType: question.type as any,
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: getExplanation(question.id),
        skillTested: getSkillTested(question.type as any)
      })
    })

    // Generate feedback
    const feedback: ReadingFeedback = generateFeedback(
      score,
      exercise.totalPoints,
      correctAnswers,
      exercise.questions.length,
      questionAnalysis
    )

    // Create submission record
    const submission: ReadingSubmission = {
      id: `submission-${Date.now()}`,
      userId: decoded.userId,
      exerciseId,
      answers,
      score,
      maxScore: exercise.totalPoints,
      correctAnswers,
      totalQuestions: exercise.questions.length,
      timeSpent: timeSpent || 0,
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      feedback
    }

    // In production, this would save to database
    console.log('Submission saved:', submission)

    return NextResponse.json({
      success: true,
      submission,
      feedback
    })

  } catch (error) {
    console.error('Error submitting reading exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to check if answer is correct
function checkAnswer(correctAnswer: string, userAnswer: string, questionType: string): boolean {
  if (!userAnswer) return false
  
  const correct = correctAnswer.toLowerCase().trim()
  const user = userAnswer.toLowerCase().trim()

  switch (questionType) {
    case 'multiple-choice':
    case 'true-false':
      return correct === user

    case 'short-answer':
      // Allow for some flexibility in short answers
      return correct === user || correct.includes(user) || user.includes(correct)

    case 'sentence-completion':
      // Split by commas and check each part
      const correctParts = correct.split(',').map(p => p.trim())
      const userParts = user.split(',').map(p => p.trim())
      
      if (correctParts.length !== userParts.length) return false
      
      return correctParts.every((part, index) => 
        part === userParts[index] || part.includes(userParts[index])
      )

    default:
      return correct === user
  }
}

// Get explanation for each question
function getExplanation(questionId: string): string {
  const explanations: Record<string, string> = {
    'q1': 'The text states that kangaroos can hop at speeds of up to 60 kilometres per hour.',
    'q2': 'The text clearly states that koalas are not bears, they are marsupials.',
    'q3': 'According to the text, koalas eat only eucalyptus leaves.',
    'q4': 'These are the three characteristics mentioned in the text about the platypus.'
  }
  return explanations[questionId] || 'No explanation available.'
}

// Get skill being tested for each question type
function getSkillTested(questionType: string): string {
  const skills: Record<string, string> = {
    'multiple-choice': 'detail comprehension',
    'true-false': 'fact verification',
    'short-answer': 'information retrieval',
    'sentence-completion': 'detail comprehension and text analysis',
    'matching': 'relationship understanding'
  }
  return skills[questionType] || 'reading comprehension'
}

// Generate comprehensive feedback
function generateFeedback(
  score: number,
  maxScore: number,
  correctAnswers: number,
  totalQuestions: number,
  questionAnalysis: QuestionAnalysis[]
): ReadingFeedback {
  const percentage = Math.round((score / maxScore) * 100)
  
  const strengths: string[] = []
  const improvements: string[] = []
  const recommendations: string[] = []

  // Analyze performance by question type
  const typePerformance: Record<string, { correct: number; total: number }> = {}
  
  questionAnalysis.forEach(analysis => {
    const type = analysis.questionType
    if (!typePerformance[type]) {
      typePerformance[type] = { correct: 0, total: 0 }
    }
    typePerformance[type].total++
    if (analysis.isCorrect) {
      typePerformance[type].correct++
    }
  })

  // Generate strengths and improvements based on performance
  Object.entries(typePerformance).forEach(([type, perf]) => {
    const typePercentage = (perf.correct / perf.total) * 100
    
    if (typePercentage >= 80) {
      strengths.push(`Excellent performance on ${type.replace('-', ' ')} questions`)
    } else if (typePercentage >= 60) {
      strengths.push(`Good understanding of ${type.replace('-', ' ')} concepts`)
    } else {
      improvements.push(`Need more practice with ${type.replace('-', ' ')} questions`)
    }
  })

  // Overall performance feedback
  if (percentage >= 90) {
    strengths.push('Outstanding reading comprehension skills')
    recommendations.push('Try more challenging reading materials')
  } else if (percentage >= 80) {
    strengths.push('Strong reading comprehension')
    recommendations.push('Continue practicing with similar level texts')
  } else if (percentage >= 70) {
    improvements.push('Reading comprehension needs some improvement')
    recommendations.push('Practice active reading strategies like note-taking')
  } else {
    improvements.push('Reading comprehension needs significant improvement')
    recommendations.push('Start with shorter, simpler texts and gradually increase difficulty')
    recommendations.push('Practice vocabulary building exercises')
  }

  // Specific recommendations based on question types missed
  if (typePerformance['true-false']?.correct / typePerformance['true-false']?.total < 0.7) {
    recommendations.push('Practice distinguishing between facts and inferences')
  }
  
  if (typePerformance['short-answer']?.correct / typePerformance['short-answer']?.total < 0.7) {
    recommendations.push('Practice finding specific information in texts')
  }

  return {
    overallScore: percentage,
    strengths,
    improvements,
    questionAnalysis,
    recommendations
  }
}