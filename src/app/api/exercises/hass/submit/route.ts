import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { HassSubmission, HassExercise, HassAnswer, HassFeedback } from '@/types'
import { year3HassExercises } from '@/data/hass-exercises/year3-examples'
import { year6HassExercises } from '@/data/hass-exercises/year6-examples'

// Combined mock data - in production this would come from database
const mockHassExercises: HassExercise[] = [
  ...year3HassExercises,
  ...year6HassExercises
]

// Mock submissions storage - in production this would be in database
const mockSubmissions: HassSubmission[] = []

// POST /api/exercises/hass/submit - Submit HASS exercise answers
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
    
    // Validate required fields
    if (!body.exerciseId || !body.answers || !body.startedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId, answers, startedAt' },
        { status: 400 }
      )
    }

    // Find the exercise
    const exercise = mockHassExercises.find(ex => ex.id === body.exerciseId)
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Calculate score and generate feedback
    const { score, feedback } = await evaluateHassSubmission(exercise, body.answers)

    // Create submission record
    const submission: HassSubmission = {
      id: `hass-submission-${Date.now()}`,
      userId: decoded.userId,
      exerciseId: body.exerciseId,
      answers: body.answers,
      notes: body.notes || {},
      bookmarks: body.bookmarks || [],
      score,
      maxScore: exercise.totalPoints,
      rubricScores: feedback.questionAnalysis.reduce((acc, analysis) => {
        if (analysis.rubricScores) {
          Object.entries(analysis.rubricScores).forEach(([criterion, points]) => {
            acc[criterion] = (acc[criterion] || 0) + points
          })
        }
        return acc
      }, {} as Record<string, number>),
      timeSpent: body.timeSpent || 0,
      readingTime: body.readingTime || 0,
      questionTime: body.questionTime || {},
      mediaInteractions: body.mediaInteractions || {},
      startedAt: new Date(body.startedAt),
      submittedAt: new Date(),
      feedback
    }

    // Store submission
    mockSubmissions.push(submission)

    return NextResponse.json({
      success: true,
      submission,
      score: submission.score,
      maxScore: submission.maxScore,
      percentage: Math.round((submission.score / submission.maxScore) * 100),
      feedback: submission.feedback
    })

  } catch (error) {
    console.error('Error submitting HASS exercise:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to evaluate HASS submission and generate feedback
async function evaluateHassSubmission(
  exercise: HassExercise,
  answers: Record<string, HassAnswer>
): Promise<{ score: number; feedback: HassFeedback }> {
  
  let totalScore = 0
  const questionAnalyses = []
  const skillsAnalysis = new Map<string, number>()

  // Evaluate each question
  for (const question of exercise.questions) {
    const userAnswer = answers[question.id]
    let questionScore = 0
    let isCorrect = false

    if (userAnswer && userAnswer.content) {
      // Evaluate answer based on question type
      switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
          isCorrect = evaluateExactMatch(question.correctAnswer, userAnswer.content)
          questionScore = isCorrect ? question.points : 0
          break
          
        case 'short-answer':
          // Simple keyword matching for demo - in production would use more sophisticated NLP
          questionScore = evaluateShortAnswer(question.correctAnswer, userAnswer.content, question.points)
          isCorrect = questionScore > 0
          break
          
        case 'essay':
        case 'analysis':
        case 'evaluation':
          // Use rubric scoring for open-ended questions
          questionScore = evaluateWithRubric(question, userAnswer)
          isCorrect = questionScore >= question.points * 0.6 // 60% threshold
          break
          
        case 'comprehension':
        case 'application':
        case 'creative':
          // Partial credit based on content quality
          questionScore = evaluateOpenEnded(question, userAnswer)
          isCorrect = questionScore >= question.points * 0.5
          break
      }
    }

    totalScore += questionScore

    // Track skills assessment
    question.skillsAssessed.forEach(skill => {
      const current = skillsAnalysis.get(skill) || 0
      skillsAnalysis.set(skill, current + (isCorrect ? 1 : 0))
    })

    questionAnalyses.push({
      questionId: question.id,
      questionType: question.type,
      subject: question.subject,
      skillsAssessed: question.skillsAssessed,
      isCorrect,
      userAnswer,
      correctAnswer: question.correctAnswer,
      rubricScores: question.rubric ? { 'overall': questionScore } : undefined,
      strengths: isCorrect ? ['Good understanding demonstrated'] : [],
      improvements: isCorrect ? [] : ['Review the content and try again'],
      timeEfficiency: userAnswer.timeSpent < question.estimatedTime ? 'efficient' : 'adequate',
      thinkingDepth: assessThinkingDepth(userAnswer, question.bloomsTaxonomy)
    })
  }

  // Generate feedback
  const feedback: HassFeedback = {
    overallScore: totalScore,
    subjectMastery: {
      [exercise.subject]: Math.round((totalScore / exercise.totalPoints) * 100)
    },
    skillsAnalysis: Array.from(skillsAnalysis.entries()).map(([skill, correct]) => ({
      skill,
      level: correct >= exercise.questions.length * 0.8 ? 'proficient' :
            correct >= exercise.questions.length * 0.6 ? 'developing' :
            correct >= exercise.questions.length * 0.4 ? 'emerging' : 'needs-support' as any,
      evidence: [`Answered ${correct} out of ${exercise.questions.length} questions correctly`],
      nextSteps: correct < exercise.questions.length * 0.6 ? [`Practice more ${skill} exercises`] : []
    })),
    conceptUnderstanding: exercise.learningObjectives.map(objective => ({
      concept: objective,
      understanding: Math.round((totalScore / exercise.totalPoints) * 100),
      misconceptions: totalScore < exercise.totalPoints * 0.6 ? ['Review the key concepts'] : undefined,
      supportNeeded: totalScore < exercise.totalPoints * 0.4 ? ['Additional scaffolding needed'] : undefined
    })),
    criticalThinking: assessCriticalThinking(questionAnalyses),
    sourceAnalysis: assessSourceAnalysis(questionAnalyses),
    strengths: generateStrengths(totalScore, exercise.totalPoints, questionAnalyses),
    improvements: generateImprovements(totalScore, exercise.totalPoints, questionAnalyses),
    recommendations: generateRecommendations(exercise, totalScore),
    nextSteps: generateNextSteps(exercise, totalScore),
    questionAnalysis: questionAnalyses,
    curriculumAlignment: exercise.article.australianCurriculum.map(code => ({
      code,
      description: `Australian Curriculum standard ${code}`,
      achievement: totalScore >= exercise.totalPoints * 0.8 ? 'above' :
                  totalScore >= exercise.totalPoints * 0.6 ? 'at' : 'below',
      evidence: [`Exercise score: ${Math.round((totalScore / exercise.totalPoints) * 100)}%`]
    }))
  }

  return { score: totalScore, feedback }
}

// Helper evaluation functions
function evaluateExactMatch(correctAnswer: any, userAnswer: any): boolean {
  const correct = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
  const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
  
  return correct.every(ans => user.some(ua => 
    String(ua).toLowerCase().trim() === String(ans).toLowerCase().trim()
  ))
}

function evaluateShortAnswer(correctAnswer: any, userAnswer: any, maxPoints: number): number {
  const keywords = String(correctAnswer).toLowerCase().split(/\s+/)
  const userText = String(userAnswer).toLowerCase()
  
  const matchedKeywords = keywords.filter(keyword => 
    userText.includes(keyword)
  ).length
  
  return Math.round((matchedKeywords / keywords.length) * maxPoints)
}

function evaluateWithRubric(question: any, userAnswer: HassAnswer): number {
  // Simplified rubric evaluation - in production would be more sophisticated
  const contentLength = String(userAnswer.content).length
  const maxPoints = question.points
  
  if (contentLength < 50) return Math.round(maxPoints * 0.3)
  if (contentLength < 150) return Math.round(maxPoints * 0.6)
  return maxPoints
}

function evaluateOpenEnded(question: any, userAnswer: HassAnswer): number {
  // Simplified scoring based on answer complexity
  const content = String(userAnswer.content)
  const complexity = content.split('.').length + content.split(',').length
  
  return Math.min(Math.round(complexity * 0.2 * question.points), question.points)
}

function assessThinkingDepth(userAnswer: HassAnswer, taxonomy: string): 'surface' | 'developing' | 'deep' {
  const content = String(userAnswer.content)
  const reasoning = userAnswer.reasoning || ''
  
  if (reasoning.length > 100 || content.includes('because') || content.includes('therefore')) {
    return 'deep'
  }
  if (content.length > 50) {
    return 'developing'
  }
  return 'surface'
}

function assessCriticalThinking(questionAnalyses: any[]): number {
  const analysisQuestions = questionAnalyses.filter(qa => 
    ['analysis', 'evaluation', 'creative'].includes(qa.questionType)
  )
  
  if (analysisQuestions.length === 0) return 0
  
  const correctAnalysis = analysisQuestions.filter(qa => qa.isCorrect).length
  return Math.round((correctAnalysis / analysisQuestions.length) * 100)
}

function assessSourceAnalysis(questionAnalyses: any[]): number {
  const sourceQuestions = questionAnalyses.filter(qa => 
    qa.questionType === 'source-analysis'
  )
  
  if (sourceQuestions.length === 0) return 0
  
  const correct = sourceQuestions.filter(qa => qa.isCorrect).length
  return Math.round((correct / sourceQuestions.length) * 100)
}

function generateStrengths(score: number, maxScore: number, analyses: any[]): string[] {
  const percentage = (score / maxScore) * 100
  const strengths = []
  
  if (percentage >= 80) {
    strengths.push('Excellent overall understanding of the content')
  }
  if (percentage >= 60) {
    strengths.push('Good comprehension of key concepts')
  }
  
  const correctAnalysis = analyses.filter(qa => 
    qa.isCorrect && ['analysis', 'evaluation'].includes(qa.questionType)
  ).length
  
  if (correctAnalysis > 0) {
    strengths.push('Strong analytical thinking skills')
  }
  
  return strengths.length > 0 ? strengths : ['Shows understanding of basic concepts']
}

function generateImprovements(score: number, maxScore: number, analyses: any[]): string[] {
  const percentage = (score / maxScore) * 100
  const improvements = []
  
  if (percentage < 60) {
    improvements.push('Review the article content more carefully')
    improvements.push('Practice answering questions with more detail')
  }
  
  const incorrectAnalysis = analyses.filter(qa => 
    !qa.isCorrect && ['analysis', 'evaluation'].includes(qa.questionType)
  ).length
  
  if (incorrectAnalysis > 0) {
    improvements.push('Work on developing critical thinking skills')
  }
  
  return improvements
}

function generateRecommendations(exercise: HassExercise, score: number): any[] {
  const percentage = (score / exercise.totalPoints) * 100
  const recommendations = []
  
  if (percentage < 50) {
    recommendations.push({
      type: 'review',
      title: 'Review Content',
      description: 'Spend more time reading and understanding the article',
      priority: 'high'
    })
  }
  
  if (percentage >= 80) {
    recommendations.push({
      type: 'extension',
      title: 'Extension Activities',
      description: 'Try more advanced exercises in this subject',
      priority: 'medium'
    })
  }
  
  return recommendations
}

function generateNextSteps(exercise: HassExercise, score: number): string[] {
  const percentage = (score / exercise.totalPoints) * 100
  
  if (percentage >= 80) {
    return [`Try Year ${exercise.yearLevel + 1} ${exercise.subject} exercises`]
  }
  if (percentage >= 60) {
    return [`Practice more ${exercise.subject} exercises at this level`]
  }
  return [`Review ${exercise.subject} concepts`, 'Ask for help if needed']
}