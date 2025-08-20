import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 批改配置模式
const gradingConfigSchema = z.object({
  submissionId: z.string().optional(),
  homeworkId: z.string().optional(),
  autoGradeSettings: z
    .object({
      enabled: z.boolean(),
      subjectSettings: z.record(
        z.object({
          autoGradeEnabled: z.boolean(),
          reviewThreshold: z.number().min(0).max(100),
          questionTypes: z.record(
            z.object({
              method: z.enum([
                'exact-match',
                'fuzzy-match',
                'keyword-match',
                'numeric-tolerance',
                'manual',
              ]),
              tolerance: z.number().optional(),
              keyWords: z.array(z.string()).optional(),
              fuzzyThreshold: z.number().optional(),
              caseSensitive: z.boolean().optional(),
              ignoreWhitespace: z.boolean().optional(),
              partialCredit: z.boolean().optional(),
            })
          ),
        })
      ),
      generalSettings: z.object({
        autoFeedbackEnabled: z.boolean(),
        detailedAnalysis: z.boolean(),
        instantResults: z.boolean(),
        gradingDelay: z.number().optional(),
      }),
    })
    .optional(),
})

// 手动批改模式
const manualGradingSchema = z.object({
  submissionId: z.string(),
  questionGrades: z.array(
    z.object({
      questionId: z.string(),
      score: z.number(),
      maxScore: z.number(),
      feedback: z.string().optional(),
      explanation: z.string().optional(),
    })
  ),
  overallFeedback: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
})

// GET - 获取批改队列或批改结果
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'queue' 或 'results'
    const submissionId = searchParams.get('submissionId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (type === 'queue') {
      return await getGradingQueue(payload, { status, page, limit })
    } else if (type === 'results' && submissionId) {
      return await getGradingResults(payload, submissionId)
    } else {
      return NextResponse.json(
        { error: '请指定查询类型和参数' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('获取批改信息失败:', error)
    return NextResponse.json({ error: '获取批改信息失败' }, { status: 500 })
  }
}

// POST - 执行自动批改或提交手动批改
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action // 'auto-grade' 或 'manual-grade'

    if (action === 'auto-grade') {
      return await performAutoGrading(body, payload)
    } else if (action === 'manual-grade') {
      return await performManualGrading(body, payload)
    } else {
      return NextResponse.json({ error: '无效的批改操作' }, { status: 400 })
    }
  } catch (error) {
    console.error('执行批改失败:', error)
    return NextResponse.json({ error: '执行批改失败' }, { status: 500 })
  }
}

// 获取批改队列
async function getGradingQueue(payload: any, filters: any) {
  // 权限检查：只有管理员和家长可以查看批改队列
  if (payload.role === 'STUDENT') {
    return NextResponse.json({ error: '学生无权查看批改队列' }, { status: 403 })
  }

  const where: any = {}

  if (filters.status) {
    // 根据状态过滤需要批改的提交
    if (filters.status === 'pending') {
      where.status = 'SUBMITTED'
      where.gradedAt = null
    } else if (filters.status === 'auto-graded') {
      where.status = 'SUBMITTED'
      where.gradedAt = { not: null }
      // 可以添加更多条件来区分自动批改和手动批改
    }
  }

  // 如果是家长，只能看到自己孩子的提交
  if (payload.role === 'PARENT') {
    const family = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        family: {
          include: {
            members: {
              where: { role: 'STUDENT' },
              select: { id: true },
            },
          },
        },
      },
    })

    if (family?.family?.members) {
      const studentIds = family.family.members.map(member => member.id)
      where.userId = { in: studentIds }
    }
  }

  const skip = (filters.page - 1) * filters.limit

  const [submissions, total] = await Promise.all([
    prisma.homeworkSubmission.findMany({
      where,
      include: {
        homework: {
          select: {
            id: true,
            title: true,
            totalPoints: true,
            exercises: {
              include: {
                exercise: {
                  select: { id: true, title: true, subject: true },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            yearLevel: true,
          },
        },
      },
      orderBy: [{ submittedAt: 'asc' }, { createdAt: 'asc' }],
      skip,
      take: filters.limit,
    }),
    prisma.homeworkSubmission.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: submissions,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  })
}

// 获取批改结果
async function getGradingResults(payload: any, submissionId: string) {
  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: {
      homework: {
        include: {
          exercises: {
            include: {
              exercise: {
                include: {
                  questions: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: { id: true, displayName: true, username: true },
      },
    },
  })

  if (!submission) {
    return NextResponse.json({ error: '提交记录不存在' }, { status: 404 })
  }

  // 权限检查
  const hasAccess =
    payload.role === 'ADMIN' ||
    submission.userId === payload.userId ||
    (payload.role === 'PARENT' &&
      (await checkParentAccess(payload.userId, [submission.userId])))

  if (!hasAccess) {
    return NextResponse.json({ error: '无权查看此批改结果' }, { status: 403 })
  }

  // 获取详细的批改结果
  // TODO: 实现详细的批改结果查询逻辑

  return NextResponse.json({
    success: true,
    data: {
      submission,
      gradingDetails: {
        // TODO: 添加详细的批改结果
      },
    },
  })
}

// 执行自动批改
async function performAutoGrading(body: any, payload: any) {
  const validatedData = gradingConfigSchema.parse(body)

  // 权限检查：只有管理员和家长可以执行批改
  if (payload.role === 'STUDENT') {
    return NextResponse.json({ error: '学生无权执行批改' }, { status: 403 })
  }

  let submissions = []

  if (validatedData.submissionId) {
    // 批改单个提交
    const submission = await prisma.homeworkSubmission.findUnique({
      where: { id: validatedData.submissionId },
      include: {
        homework: {
          include: {
            exercises: {
              include: {
                exercise: {
                  include: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: '提交记录不存在' }, { status: 404 })
    }

    submissions = [submission]
  } else if (validatedData.homeworkId) {
    // 批改整个作业的所有提交
    submissions = await prisma.homeworkSubmission.findMany({
      where: {
        homeworkId: validatedData.homeworkId,
        status: 'SUBMITTED',
        gradedAt: null,
      },
      include: {
        homework: {
          include: {
            exercises: {
              include: {
                exercise: {
                  include: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  } else {
    return NextResponse.json(
      { error: '请指定要批改的提交ID或作业ID' },
      { status: 400 }
    )
  }

  const gradingResults = []

  for (const submission of submissions) {
    try {
      // 执行自动批改逻辑
      const result = await autoGradeSubmission(
        submission,
        validatedData.autoGradeSettings
      )
      gradingResults.push(result)

      // 更新提交状态
      await prisma.homeworkSubmission.update({
        where: { id: submission.id },
        data: {
          gradedAt: new Date(),
          feedback: result.feedback,
        },
      })
    } catch (error) {
      console.error(`批改提交 ${submission.id} 失败:`, error)
      gradingResults.push({
        submissionId: submission.id,
        success: false,
        error: '批改失败',
      })
    }
  }

  return NextResponse.json({
    success: true,
    data: gradingResults,
    message: `完成 ${gradingResults.filter(r => r.success).length}/${gradingResults.length} 个提交的批改`,
  })
}

// 执行手动批改
async function performManualGrading(body: any, payload: any) {
  const validatedData = manualGradingSchema.parse(body)

  // 权限检查
  if (payload.role === 'STUDENT') {
    return NextResponse.json({ error: '学生无权执行批改' }, { status: 403 })
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: validatedData.submissionId },
    include: {
      homework: true,
    },
  })

  if (!submission) {
    return NextResponse.json({ error: '提交记录不存在' }, { status: 404 })
  }

  // 计算总分
  const totalScore = validatedData.questionGrades.reduce(
    (sum, grade) => sum + grade.score,
    0
  )
  const maxScore = validatedData.questionGrades.reduce(
    (sum, grade) => sum + grade.maxScore,
    0
  )
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  // 更新提交记录
  const updatedSubmission = await prisma.homeworkSubmission.update({
    where: { id: validatedData.submissionId },
    data: {
      totalScore,
      percentage,
      feedback: validatedData.overallFeedback,
      gradedAt: new Date(),
      gradedBy: payload.userId,
    },
  })

  // TODO: 保存详细的题目批改结果

  return NextResponse.json({
    success: true,
    data: updatedSubmission,
    message: '手动批改完成',
  })
}

// 自动批改核心逻辑
async function autoGradeSubmission(submission: any, settings?: any) {
  const gradingResults = []
  let totalScore = 0
  let maxScore = 0

  // 遍历每个练习的每个题目进行批改
  for (const exerciseAssignment of submission.homework.exercises) {
    const exercise = exerciseAssignment.exercise

    for (const question of exercise.questions) {
      try {
        // 获取学生答案
        const studentSubmission = await prisma.submission.findFirst({
          where: {
            userId: submission.userId,
            exerciseId: exercise.id,
          },
          include: {
            answers: {
              where: { questionId: question.id },
            },
          },
        })

        if (studentSubmission?.answers[0]) {
          const studentAnswer = studentSubmission.answers[0].answer
          const result = await gradeQuestion(question, studentAnswer, settings)

          gradingResults.push(result)
          totalScore += result.score
          maxScore += result.maxScore
        }
      } catch (error) {
        console.error(`批改题目 ${question.id} 失败:`, error)
      }
    }
  }

  // 生成反馈
  const feedback = generateFeedback(gradingResults, totalScore, maxScore)

  return {
    submissionId: submission.id,
    success: true,
    totalScore,
    maxScore,
    percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    gradingResults,
    feedback,
  }
}

// 题目批改逻辑
async function gradeQuestion(
  question: any,
  studentAnswer: string,
  settings?: any
) {
  const result = {
    questionId: question.id,
    score: 0,
    maxScore: question.points,
    isCorrect: false,
    gradingMethod: 'automatic',
    confidence: 0,
    feedback: '',
    needsManualReview: false,
  }

  try {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        // 精确匹配
        result.isCorrect =
          studentAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim()
        result.score = result.isCorrect ? question.points : 0
        result.confidence = 100
        break

      case 'SHORT_ANSWER':
        // 可以实现模糊匹配或关键词匹配
        const similarity = calculateStringSimilarity(
          studentAnswer,
          question.correctAnswer
        )
        if (similarity >= 0.8) {
          result.isCorrect = true
          result.score = question.points
          result.confidence = similarity * 100
        } else if (similarity >= 0.6) {
          result.score = Math.floor(question.points * 0.5) // 部分得分
          result.confidence = similarity * 100
          result.needsManualReview = true
        } else {
          result.needsManualReview = true
          result.confidence = similarity * 100
        }
        break

      case 'CALCULATION':
        // 数值计算题
        const numericResult = gradeNumericAnswer(
          studentAnswer,
          question.correctAnswer,
          0.01
        )
        result.isCorrect = numericResult.isCorrect
        result.score = numericResult.score
        result.confidence = numericResult.confidence
        break

      default:
        // 未知题型，标记为需要手动批改
        result.needsManualReview = true
        result.gradingMethod = 'manual'
        break
    }

    // 生成反馈
    if (result.isCorrect) {
      result.feedback = '回答正确！'
    } else if (result.score > 0) {
      result.feedback = '部分正确，请注意细节。'
    } else {
      result.feedback = `正确答案是：${question.correctAnswer}`
    }
  } catch (error) {
    console.error(`批改题目失败:`, error)
    result.needsManualReview = true
    result.gradingMethod = 'error'
  }

  return result
}

// 字符串相似度计算（简化版）
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1

  // 简单的字符包含检查
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8
  }

  // Levenshtein距离计算（简化版）
  const maxLength = Math.max(s1.length, s2.length)
  if (maxLength === 0) return 1

  let matches = 0
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++
  }

  return matches / maxLength
}

// 数值答案批改
function gradeNumericAnswer(
  studentAnswer: string,
  correctAnswer: string,
  tolerance: number = 0.01
) {
  try {
    const studentNum = parseFloat(studentAnswer.replace(/[^\d.-]/g, ''))
    const correctNum = parseFloat(correctAnswer.replace(/[^\d.-]/g, ''))

    if (isNaN(studentNum) || isNaN(correctNum)) {
      return { isCorrect: false, score: 0, confidence: 0 }
    }

    const difference = Math.abs(studentNum - correctNum)
    const relativeError =
      correctNum !== 0 ? difference / Math.abs(correctNum) : difference

    if (relativeError <= tolerance) {
      return { isCorrect: true, score: 1, confidence: 100 }
    } else if (relativeError <= tolerance * 2) {
      return { isCorrect: false, score: 0.5, confidence: 80 }
    } else {
      return { isCorrect: false, score: 0, confidence: 60 }
    }
  } catch (error) {
    return { isCorrect: false, score: 0, confidence: 0 }
  }
}

// 生成综合反馈
function generateFeedback(
  gradingResults: any[],
  totalScore: number,
  maxScore: number
): string {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  const correctCount = gradingResults.filter(r => r.isCorrect).length
  const totalQuestions = gradingResults.length

  let feedback = `本次作业得分：${totalScore}/${maxScore} (${percentage.toFixed(1)}%)\n`
  feedback += `正确题目：${correctCount}/${totalQuestions}\n\n`

  if (percentage >= 90) {
    feedback += '优秀！您掌握得很好，继续保持！'
  } else if (percentage >= 80) {
    feedback += '良好！还有进步空间，加油！'
  } else if (percentage >= 70) {
    feedback += '及格！建议复习相关知识点。'
  } else {
    feedback += '需要更多练习，建议重点复习基础知识。'
  }

  return feedback
}

// 检查家长权限的辅助函数
async function checkParentAccess(
  parentId: string,
  studentIds: string[]
): Promise<boolean> {
  const parent = await prisma.user.findUnique({
    where: { id: parentId },
    include: {
      family: {
        include: {
          members: {
            where: { role: 'STUDENT' },
            select: { id: true },
          },
        },
      },
    },
  })

  if (!parent?.family?.members) {
    return false
  }

  const familyStudentIds = parent.family.members.map(member => member.id)
  return studentIds.some(studentId => familyStudentIds.includes(studentId))
}
