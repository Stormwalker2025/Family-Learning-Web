import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

// GET - 获取作业分析统计
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
    const type = searchParams.get('type') // 'homework', 'student', 'subject', 'overview'
    const homeworkId = searchParams.get('homeworkId')
    const studentId = searchParams.get('studentId')
    const subject = searchParams.get('subject')
    const timeRange = searchParams.get('timeRange') || '30d' // 30d, 7d, 90d, 1y

    // 权限检查
    if (payload.role === 'STUDENT' && studentId && studentId !== payload.userId) {
      return NextResponse.json({ error: '学生只能查看自己的统计' }, { status: 403 })
    }

    switch (type) {
      case 'homework':
        if (!homeworkId) {
          return NextResponse.json({ error: '缺少作业ID' }, { status: 400 })
        }
        return await getHomeworkAnalytics(homeworkId, payload)

      case 'student':
        const targetStudentId = studentId || payload.userId
        return await getStudentAnalytics(targetStudentId, payload, timeRange)

      case 'subject':
        if (!subject) {
          return NextResponse.json({ error: '缺少学科参数' }, { status: 400 })
        }
        return await getSubjectAnalytics(subject, payload, timeRange)

      case 'overview':
        return await getOverviewAnalytics(payload, timeRange)

      default:
        return NextResponse.json({ error: '无效的分析类型' }, { status: 400 })
    }

  } catch (error) {
    console.error('获取分析统计失败:', error)
    return NextResponse.json(
      { error: '获取分析统计失败' },
      { status: 500 }
    )
  }
}

// 获取特定作业的分析统计
async function getHomeworkAnalytics(homeworkId: string, payload: any) {
  // 获取作业基本信息
  const homework = await prisma.homeworkAssignment.findUnique({
    where: { id: homeworkId },
    include: {
      assignedTo: { select: { id: true, displayName: true, yearLevel: true } },
      exercises: {
        include: {
          exercise: {
            select: { id: true, title: true, subject: true, difficulty: true }
          }
        }
      },
      submissions: {
        include: {
          user: { select: { id: true, displayName: true, yearLevel: true } }
        }
      }
    }
  })

  if (!homework) {
    return NextResponse.json({ error: '作业不存在' }, { status: 404 })
  }

  // 权限检查
  const hasAccess = 
    payload.role === 'ADMIN' ||
    homework.assignedBy === payload.userId ||
    homework.assignedTo.some(student => student.id === payload.userId) ||
    (payload.role === 'PARENT' && await checkParentAccess(payload.userId, homework.assignedTo.map(s => s.id)))

  if (!hasAccess) {
    return NextResponse.json({ error: '无权查看此作业的分析' }, { status: 403 })
  }

  // 计算基础统计
  const totalStudents = homework.assignedTo.length
  const submissions = homework.submissions
  const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED' || s.status === 'SUBMITTED')
  const gradedSubmissions = submissions.filter(s => s.gradedAt && s.totalScore !== null)

  // 分数统计
  const scores = gradedSubmissions.map(s => s.totalScore || 0)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const medianScore = scores.length > 0 ? calculateMedian(scores) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  // 分数分布
  const scoreDistribution = calculateScoreDistribution(scores, homework.totalPoints)

  // 时间统计
  const timeData = completedSubmissions
    .filter(s => s.totalTimeSpent > 0)
    .map(s => s.totalTimeSpent)
  const averageTimeSpent = timeData.length > 0 ? timeData.reduce((sum, time) => sum + time, 0) / timeData.length : 0
  const timeDistribution = calculateTimeDistribution(timeData)

  // 题目分析
  const questionAnalytics = await getQuestionAnalytics(homeworkId)

  // 学科掌握度分析
  const subjectMastery = await getSubjectMasteryData(homework.exercises.map(e => e.exercise), submissions)

  // 需要关注的学生
  const studentsNeedAttention = identifyStudentsNeedingAttention(submissions, homework.totalPoints, homework.passingScore)

  // 趋势分析（与之前的作业比较）
  const trends = await calculateTrendAnalysis(homework.assignedTo.map(s => s.id), homework.exercises.map(e => e.exercise.subject))

  const analytics = {
    assignmentId: homeworkId,
    totalStudents,
    submittedCount: completedSubmissions.length,
    completedCount: completedSubmissions.length,
    overdueCount: submissions.filter(s => s.isLate).length,
    averageScore,
    medianScore,
    highestScore,
    lowestScore,
    scoreDistribution,
    averageTimeSpent,
    timeDistribution,
    questionAnalytics,
    subjectMastery,
    trends,
    studentsNeedAttention,
    generatedAt: new Date()
  }

  return NextResponse.json({
    success: true,
    data: analytics
  })
}

// 获取学生个人分析统计
async function getStudentAnalytics(studentId: string, payload: any, timeRange: string) {
  // 权限检查
  if (payload.role === 'STUDENT' && studentId !== payload.userId) {
    return NextResponse.json({ error: '无权查看其他学生的统计' }, { status: 403 })
  }

  if (payload.role === 'PARENT') {
    const hasAccess = await checkParentAccess(payload.userId, [studentId])
    if (!hasAccess) {
      return NextResponse.json({ error: '无权查看此学生的统计' }, { status: 403 })
    }
  }

  // 获取时间范围
  const dateFilter = getDateFilter(timeRange)

  // 获取学生的作业提交记录
  const submissions = await prisma.homeworkSubmission.findMany({
    where: {
      userId: studentId,
      createdAt: dateFilter,
    },
    include: {
      homework: {
        include: {
          exercises: {
            include: {
              exercise: { select: { subject: true, difficulty: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 计算统计数据
  const totalAssignments = submissions.length
  const completedAssignments = submissions.filter(s => s.status === 'COMPLETED' || s.status === 'SUBMITTED').length
  const averageScore = calculateAverageScore(submissions.filter(s => s.totalScore !== null))
  const subjectPerformance = calculateSubjectPerformance(submissions)
  const timeManagement = calculateTimeManagement(submissions)
  const progressTrend = calculateProgressTrend(submissions)

  // 学习建议
  const recommendations = generateLearningRecommendations(subjectPerformance, progressTrend, averageScore)

  const analytics = {
    studentId,
    timeRange,
    summary: {
      totalAssignments,
      completedAssignments,
      completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
      averageScore,
      improvement: progressTrend
    },
    subjectPerformance,
    timeManagement,
    recommendations,
    generatedAt: new Date()
  }

  return NextResponse.json({
    success: true,
    data: analytics
  })
}

// 获取学科分析统计
async function getSubjectAnalytics(subject: string, payload: any, timeRange: string) {
  // 权限检查和数据过滤
  let studentFilter = {}
  if (payload.role === 'STUDENT') {
    studentFilter = { userId: payload.userId }
  } else if (payload.role === 'PARENT') {
    const family = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        family: {
          include: {
            members: {
              where: { role: 'STUDENT' },
              select: { id: true }
            }
          }
        }
      }
    })

    if (family?.family?.members) {
      const studentIds = family.family.members.map(m => m.id)
      studentFilter = { userId: { in: studentIds } }
    }
  }

  const dateFilter = getDateFilter(timeRange)

  // 获取该学科的所有相关数据
  const submissions = await prisma.homeworkSubmission.findMany({
    where: {
      ...studentFilter,
      createdAt: dateFilter,
      homework: {
        exercises: {
          some: {
            exercise: {
              subject: subject.toUpperCase()
            }
          }
        }
      }
    },
    include: {
      homework: {
        include: {
          exercises: {
            include: {
              exercise: true
            }
          }
        }
      },
      user: {
        select: { id: true, displayName: true, yearLevel: true }
      }
    }
  })

  // 分析学科表现
  const subjectAnalytics = analyzeSubjectPerformance(submissions, subject)

  return NextResponse.json({
    success: true,
    data: subjectAnalytics
  })
}

// 获取总览统计
async function getOverviewAnalytics(payload: any, timeRange: string) {
  let studentFilter = {}
  if (payload.role === 'STUDENT') {
    studentFilter = { userId: payload.userId }
  } else if (payload.role === 'PARENT') {
    const family = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        family: {
          include: {
            members: {
              where: { role: 'STUDENT' },
              select: { id: true }
            }
          }
        }
      }
    })

    if (family?.family?.members) {
      const studentIds = family.family.members.map(m => m.id)
      studentFilter = { userId: { in: studentIds } }
    }
  }

  const dateFilter = getDateFilter(timeRange)

  // 获取总体统计
  const [totalAssignments, totalSubmissions, completedSubmissions] = await Promise.all([
    prisma.homeworkAssignment.count({
      where: { createdAt: dateFilter }
    }),
    prisma.homeworkSubmission.count({
      where: { ...studentFilter, createdAt: dateFilter }
    }),
    prisma.homeworkSubmission.count({
      where: { 
        ...studentFilter, 
        createdAt: dateFilter,
        status: { in: ['COMPLETED', 'SUBMITTED'] }
      }
    })
  ])

  // 学科分布
  const subjectDistribution = await getSubjectDistribution(studentFilter, dateFilter)

  // 最近的活动
  const recentActivity = await getRecentActivity(studentFilter, dateFilter)

  const overview = {
    summary: {
      totalAssignments,
      totalSubmissions,
      completedSubmissions,
      completionRate: totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0
    },
    subjectDistribution,
    recentActivity,
    timeRange,
    generatedAt: new Date()
  }

  return NextResponse.json({
    success: true,
    data: overview
  })
}

// 辅助函数
function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function calculateScoreDistribution(scores: number[], maxScore: number) {
  const ranges = ['90-100', '80-89', '70-79', '60-69', '50-59', '0-49']
  const distribution = ranges.map(range => ({ range, count: 0, percentage: 0 }))

  scores.forEach(score => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) distribution[0].count++
    else if (percentage >= 80) distribution[1].count++
    else if (percentage >= 70) distribution[2].count++
    else if (percentage >= 60) distribution[3].count++
    else if (percentage >= 50) distribution[4].count++
    else distribution[5].count++
  })

  distribution.forEach(item => {
    item.percentage = scores.length > 0 ? (item.count / scores.length) * 100 : 0
  })

  return distribution
}

function calculateTimeDistribution(times: number[]) {
  const ranges = ['0-30min', '30-60min', '60-120min', '120min+']
  const distribution = ranges.map(range => ({ timeRange: range, count: 0, percentage: 0 }))

  times.forEach(time => {
    const minutes = time / 60
    if (minutes <= 30) distribution[0].count++
    else if (minutes <= 60) distribution[1].count++
    else if (minutes <= 120) distribution[2].count++
    else distribution[3].count++
  })

  distribution.forEach(item => {
    item.percentage = times.length > 0 ? (item.count / times.length) * 100 : 0
  })

  return distribution
}

function getDateFilter(timeRange: string) {
  const now = new Date()
  const days = parseInt(timeRange.replace(/[^\d]/g, '')) || 30
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  
  return { gte: startDate }
}

function calculateAverageScore(submissions: any[]): number {
  if (submissions.length === 0) return 0
  const total = submissions.reduce((sum, s) => sum + (s.totalScore || 0), 0)
  return total / submissions.length
}

function calculateSubjectPerformance(submissions: any[]) {
  const subjectData: Record<string, any> = {}

  submissions.forEach(submission => {
    submission.homework.exercises.forEach((exercise: any) => {
      const subject = exercise.exercise.subject
      if (!subjectData[subject]) {
        subjectData[subject] = {
          totalScore: 0,
          maxScore: 0,
          count: 0,
          submissions: []
        }
      }
      
      subjectData[subject].totalScore += submission.totalScore || 0
      subjectData[subject].maxScore += submission.maxPossibleScore || 0
      subjectData[subject].count++
      subjectData[subject].submissions.push(submission)
    })
  })

  return Object.entries(subjectData).map(([subject, data]: [string, any]) => ({
    subject,
    averageScore: data.count > 0 ? data.totalScore / data.count : 0,
    averagePercentage: data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0,
    assignmentCount: data.count,
    masteryLevel: calculateMasteryLevel(data.submissions)
  }))
}

function calculateTimeManagement(submissions: any[]) {
  const totalTime = submissions.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0)
  const avgTime = submissions.length > 0 ? totalTime / submissions.length : 0
  
  return {
    totalTimeSpent: totalTime,
    averageTimePerAssignment: avgTime,
    efficiency: calculateEfficiency(submissions),
    suggestions: generateTimeManagementSuggestions(avgTime, submissions)
  }
}

function calculateProgressTrend(submissions: any[]) {
  if (submissions.length < 2) return 0
  
  const recent = submissions.slice(0, Math.ceil(submissions.length / 2))
  const older = submissions.slice(Math.ceil(submissions.length / 2))
  
  const recentAvg = calculateAverageScore(recent.filter(s => s.totalScore !== null))
  const olderAvg = calculateAverageScore(older.filter(s => s.totalScore !== null))
  
  return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
}

function generateLearningRecommendations(subjectPerformance: any[], progressTrend: number, averageScore: number) {
  const recommendations = []

  // 基于整体表现的建议
  if (averageScore < 70) {
    recommendations.push({
      type: 'improvement',
      title: '加强基础练习',
      description: '建议增加基础知识的练习，巩固核心概念',
      priority: 'high'
    })
  }

  // 基于进度趋势的建议
  if (progressTrend < -10) {
    recommendations.push({
      type: 'support',
      title: '寻求额外帮助',
      description: '最近的表现有所下降，建议寻求老师或家长的帮助',
      priority: 'high'
    })
  } else if (progressTrend > 10) {
    recommendations.push({
      type: 'challenge',
      title: '尝试更高难度',
      description: '表现持续改善，可以尝试更有挑战性的题目',
      priority: 'medium'
    })
  }

  // 基于学科表现的建议
  subjectPerformance.forEach(subject => {
    if (subject.averagePercentage < 60) {
      recommendations.push({
        type: 'practice',
        title: `加强${subject.subject}练习`,
        description: `在${subject.subject}方面需要更多练习`,
        priority: 'high'
      })
    }
  })

  return recommendations
}

function calculateMasteryLevel(submissions: any[]): number {
  if (submissions.length === 0) return 0
  
  const scores = submissions
    .filter(s => s.totalScore !== null && s.maxPossibleScore > 0)
    .map(s => (s.totalScore / s.maxPossibleScore) * 100)
  
  if (scores.length === 0) return 0
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Math.round(average)
}

function calculateEfficiency(submissions: any[]): number {
  // 简化的效率计算：分数与时间的比值
  const validSubmissions = submissions.filter(s => s.totalScore && s.totalTimeSpent > 0)
  if (validSubmissions.length === 0) return 0
  
  const avgEfficiency = validSubmissions.reduce((sum, s) => {
    return sum + (s.totalScore / (s.totalTimeSpent / 3600)) // 每小时得分
  }, 0) / validSubmissions.length
  
  return Math.round(avgEfficiency)
}

function generateTimeManagementSuggestions(avgTime: number, submissions: any[]): string[] {
  const suggestions = []
  
  if (avgTime > 7200) { // 超过2小时
    suggestions.push('建议将作业分段完成，避免疲劳影响效率')
  }
  
  if (avgTime < 1800) { // 少于30分钟
    suggestions.push('可以花更多时间仔细检查答案')
  }
  
  return suggestions
}

async function getQuestionAnalytics(homeworkId: string) {
  // 实现题目分析逻辑
  // 这里需要查询具体的题目答题情况
  return []
}

async function getSubjectMasteryData(exercises: any[], submissions: any[]) {
  const subjectData: Record<string, any> = {}
  
  exercises.forEach(exercise => {
    const subject = exercise.subject
    if (!subjectData[subject]) {
      subjectData[subject] = {
        subject,
        overallMastery: 0,
        topicBreakdown: {},
        conceptsNeedReinforcement: [],
        studentsStrugglingMost: []
      }
    }
  })
  
  return subjectData
}

function identifyStudentsNeedingAttention(submissions: any[], totalPoints: number, passingScore: number) {
  return submissions
    .filter(s => {
      const percentage = s.totalScore ? (s.totalScore / totalPoints) * 100 : 0
      return percentage < passingScore || s.status === 'NOT_STARTED' || s.isLate
    })
    .map(s => ({
      userId: s.userId,
      userName: s.user?.displayName || 'Unknown',
      reason: s.status === 'NOT_STARTED' ? 'not-submitted' : 
              s.isLate ? 'time-management' : 'low-score',
      details: `得分: ${s.totalScore || 0}/${totalPoints}`,
      urgency: s.status === 'NOT_STARTED' ? 'high' : 'medium',
      suggestedActions: ['联系学生', '提供额外帮助', '安排补习']
    }))
}

async function calculateTrendAnalysis(studentIds: string[], subjects: string[]) {
  // 实现趋势分析逻辑
  return {
    performanceTrend: 'stable' as const,
    comparedToPrevious: 0,
    strongestSubjects: subjects.slice(0, 1),
    weakestSubjects: subjects.slice(-1),
    timeManagementTrend: 'stable' as const
  }
}

function analyzeSubjectPerformance(submissions: any[], subject: string) {
  // 实现学科性能分析
  return {
    subject,
    totalAssignments: submissions.length,
    averageScore: calculateAverageScore(submissions.filter(s => s.totalScore !== null)),
    trends: {},
    recommendations: []
  }
}

async function getSubjectDistribution(studentFilter: any, dateFilter: any) {
  // 实现学科分布统计
  return []
}

async function getRecentActivity(studentFilter: any, dateFilter: any) {
  // 实现最近活动统计
  return []
}

async function checkParentAccess(parentId: string, studentIds: string[]): Promise<boolean> {
  const parent = await prisma.user.findUnique({
    where: { id: parentId },
    include: {
      family: {
        include: {
          members: {
            where: { role: 'STUDENT' },
            select: { id: true }
          }
        }
      }
    }
  })

  if (!parent?.family?.members) {
    return false
  }

  const familyStudentIds = parent.family.members.map(member => member.id)
  return studentIds.some(studentId => familyStudentIds.includes(studentId))
}