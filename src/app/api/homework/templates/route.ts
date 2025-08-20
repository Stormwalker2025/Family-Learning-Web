import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()

// 作业模板创建模式
const createTemplateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空'),
  description: z.string().optional(),
  type: z.enum(['quick-assignment', 'weekly-plan', 'exam-prep', 'custom']),
  yearLevels: z.array(z.number()).min(1, '必须指定适用年级'),
  subjects: z
    .array(z.enum(['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY']))
    .min(1, '必须指定适用学科'),
  exerciseSelectionRules: z.array(
    z.object({
      subject: z.enum(['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY']),
      minCount: z.number().min(1),
      maxCount: z.number().min(1),
      difficultyDistribution: z.record(z.number()).optional(),
      topicCoverage: z.array(z.string()).optional(),
      adaptToStudentLevel: z.boolean().default(true),
    })
  ),
  defaultSettings: z.object({
    estimatedTime: z.number().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    totalPoints: z.number().default(100),
    passingScore: z.number().default(70),
    allowMultipleAttempts: z.boolean().default(true),
    autoRelease: z.boolean().default(true),
    lateSubmissionAllowed: z.boolean().default(true),
  }),
  estimatedTime: z.number().default(60),
  adaptiveDifficulty: z.boolean().default(false),
  personalizedContent: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

// GET - 获取作业模板列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const yearLevel = searchParams.get('yearLevel')
    const subject = searchParams.get('subject')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 构建查询条件
    const where: any = {}

    if (type) {
      where.type = type.toUpperCase().replace('-', '_')
    }

    if (yearLevel) {
      where.yearLevels = {
        has: parseInt(yearLevel),
      }
    }

    if (subject) {
      where.subjects = {
        has: subject.toUpperCase(),
      }
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // 权限过滤：学生只能看到活跃的模板，管理员和家长可以看到所有
    if (payload.role === 'STUDENT') {
      where.isActive = true
    }

    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.homeworkTemplate?.findMany({
        where,
        include: {
          creator: {
            select: { id: true, displayName: true, username: true },
          },
        },
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }) || [],
      prisma.homeworkTemplate?.count({ where }) || 0,
    ])

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取作业模板失败:', error)
    return NextResponse.json({ error: '获取作业模板失败' }, { status: 500 })
  }
}

// POST - 创建新的作业模板
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 权限检查：只有管理员和家长可以创建模板
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { error: '学生无权创建作业模板' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    // 验证练习选择规则的一致性
    const ruleSubjects = validatedData.exerciseSelectionRules.map(
      rule => rule.subject
    )
    const hasInvalidSubjects = ruleSubjects.some(
      subject => !validatedData.subjects.includes(subject)
    )

    if (hasInvalidSubjects) {
      return NextResponse.json(
        { error: '练习选择规则中的学科必须在模板适用学科范围内' },
        { status: 400 }
      )
    }

    // 创建模板
    const template = await prisma.homeworkTemplate?.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type.toUpperCase().replace('-', '_'),
        yearLevels: validatedData.yearLevels,
        subjects: validatedData.subjects,
        exerciseSelectionRules: JSON.stringify(
          validatedData.exerciseSelectionRules
        ),
        defaultSettings: JSON.stringify(validatedData.defaultSettings),
        estimatedTime: validatedData.estimatedTime,
        adaptiveDifficulty: validatedData.adaptiveDifficulty,
        personalizedContent: validatedData.personalizedContent,
        usageCount: 0,
        isActive: validatedData.isActive,
        createdBy: payload.userId,
      },
      include: {
        creator: {
          select: { id: true, displayName: true, username: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: '作业模板创建成功',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建作业模板失败:', error)
    return NextResponse.json({ error: '创建作业模板失败' }, { status: 500 })
  }
}

// POST - 使用模板创建作业
export async function POST_USE_TEMPLATE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 权限检查
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { error: '学生无权使用模板创建作业' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { templateId, customization } = body

    if (!templateId) {
      return NextResponse.json({ error: '缺少模板ID' }, { status: 400 })
    }

    // 获取模板
    const template = await prisma.homeworkTemplate?.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 })
    }

    if (!template.isActive) {
      return NextResponse.json({ error: '模板已禁用' }, { status: 400 })
    }

    // 解析模板设置
    const exerciseSelectionRules = JSON.parse(
      template.exerciseSelectionRules as string
    )
    const defaultSettings = JSON.parse(template.defaultSettings as string)

    // 应用自定义设置
    const finalSettings = {
      ...defaultSettings,
      ...customization?.settings,
    }

    // 根据模板规则选择练习
    const selectedExercises = await selectExercisesByRules(
      exerciseSelectionRules,
      template.yearLevels,
      customization?.targetStudents || [],
      template.adaptiveDifficulty
    )

    if (selectedExercises.length === 0) {
      return NextResponse.json(
        { error: '根据模板规则未找到合适的练习' },
        { status: 400 }
      )
    }

    // 创建作业分配
    const assignmentData = {
      title: customization?.title || `基于 ${template.name} 的作业`,
      description: customization?.description || template.description,
      instructions: customization?.instructions,
      assignedBy: payload.userId,
      assignedTo: customization?.targetStudents || [],
      dueDate: customization?.dueDate
        ? new Date(customization.dueDate)
        : undefined,
      estimatedTime: finalSettings.estimatedTime || template.estimatedTime,
      priority: finalSettings.priority || 'MEDIUM',
      totalPoints: finalSettings.totalPoints || 100,
      passingScore: finalSettings.passingScore || 70,
      allowMultipleAttempts: finalSettings.allowMultipleAttempts ?? true,
      autoRelease: finalSettings.autoRelease ?? true,
      lateSubmissionAllowed: finalSettings.lateSubmissionAllowed ?? true,
      exercises: selectedExercises.map((exercise, index) => ({
        exerciseId: exercise.id,
        order: index + 1,
        isRequired: exercise.isRequired ?? true,
        weight: exercise.weight || 1,
      })),
    }

    // 创建作业（调用作业创建逻辑）
    const assignment = await createHomeworkFromTemplate(assignmentData)

    // 更新模板使用次数
    await prisma.homeworkTemplate?.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: assignment,
      message: '基于模板的作业创建成功',
    })
  } catch (error) {
    console.error('使用模板创建作业失败:', error)
    return NextResponse.json({ error: '使用模板创建作业失败' }, { status: 500 })
  }
}

// 根据规则选择练习
async function selectExercisesByRules(
  rules: any[],
  yearLevels: number[],
  targetStudents: string[],
  adaptiveDifficulty: boolean
) {
  const selectedExercises = []

  for (const rule of rules) {
    // 构建练习查询条件
    const where: any = {
      subject: rule.subject,
      yearLevel: { in: yearLevels },
      isActive: true,
    }

    // 如果启用自适应难度，根据学生水平调整
    if (adaptiveDifficulty && targetStudents.length > 0) {
      const studentLevels = await getStudentLevels(targetStudents, rule.subject)
      const avgLevel = calculateAverageLevel(studentLevels)
      where.difficulty = getDifficultyForLevel(avgLevel)
    }

    // 如果指定了主题覆盖
    if (rule.topicCoverage && rule.topicCoverage.length > 0) {
      // 这里需要根据具体的练习内容结构来实现主题过滤
      // where.content 或其他字段的过滤逻辑
    }

    // 查询练习
    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: rule.maxCount,
    })

    // 应用难度分布（如果指定）
    let filteredExercises = exercises
    if (rule.difficultyDistribution) {
      filteredExercises = applyDifficultyDistribution(
        exercises,
        rule.difficultyDistribution
      )
    }

    // 确保满足最小数量要求
    const countToSelect = Math.min(
      Math.max(rule.minCount, filteredExercises.length),
      rule.maxCount
    )

    const selected = filteredExercises
      .slice(0, countToSelect)
      .map(exercise => ({
        ...exercise,
        isRequired: true,
        weight: 1,
      }))

    selectedExercises.push(...selected)
  }

  return selectedExercises
}

// 获取学生在特定学科的水平
async function getStudentLevels(studentIds: string[], subject: string) {
  const progress = await prisma.learningProgress.findMany({
    where: {
      userId: { in: studentIds },
      subject: subject,
      status: { in: ['COMPLETED', 'MASTERED'] },
    },
    select: {
      userId: true,
      masteryLevel: true,
      bestPercentage: true,
    },
  })

  return progress.reduce(
    (acc, p) => {
      acc[p.userId] = {
        masteryLevel: p.masteryLevel,
        percentage: p.bestPercentage || 0,
      }
      return acc
    },
    {} as Record<string, any>
  )
}

// 计算平均水平
function calculateAverageLevel(studentLevels: Record<string, any>): number {
  const levels = Object.values(studentLevels).map(
    (level: any) => level.masteryLevel || 0
  )
  return levels.length > 0
    ? levels.reduce((sum, level) => sum + level, 0) / levels.length
    : 50
}

// 根据水平确定难度
function getDifficultyForLevel(level: number): string {
  if (level >= 80) return 'HARD'
  if (level >= 60) return 'MEDIUM'
  if (level >= 40) return 'EASY'
  return 'BEGINNER'
}

// 应用难度分布
function applyDifficultyDistribution(
  exercises: any[],
  distribution: Record<string, number>
) {
  const grouped = exercises.reduce(
    (acc, exercise) => {
      const difficulty = exercise.difficulty
      if (!acc[difficulty]) acc[difficulty] = []
      acc[difficulty].push(exercise)
      return acc
    },
    {} as Record<string, any[]>
  )

  const result = []
  const totalExercises = exercises.length

  for (const [difficulty, percentage] of Object.entries(distribution)) {
    const count = Math.floor((percentage / 100) * totalExercises)
    const available = grouped[difficulty.toUpperCase()] || []
    result.push(...available.slice(0, count))
  }

  return result
}

// 创建基于模板的作业
async function createHomeworkFromTemplate(assignmentData: any) {
  // 验证目标学生
  const students = await prisma.user.findMany({
    where: {
      id: { in: assignmentData.assignedTo },
      role: 'STUDENT',
    },
    select: { id: true, displayName: true },
  })

  if (students.length !== assignmentData.assignedTo.length) {
    throw new Error('部分目标学生不存在或角色不正确')
  }

  // 验证练习
  const exerciseIds = assignmentData.exercises.map((e: any) => e.exerciseId)
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, title: true },
  })

  if (exercises.length !== exerciseIds.length) {
    throw new Error('部分练习不存在')
  }

  // 创建作业
  const assignment = await prisma.homeworkAssignment.create({
    data: {
      title: assignmentData.title,
      description: assignmentData.description,
      instructions: assignmentData.instructions,
      assignedBy: assignmentData.assignedBy,
      dueDate: assignmentData.dueDate,
      estimatedTime: assignmentData.estimatedTime,
      priority: assignmentData.priority,
      status: assignmentData.autoRelease ? 'ASSIGNED' : 'IN_PROGRESS',
      isVisible: assignmentData.autoRelease,
      totalPoints: assignmentData.totalPoints,
      passingScore: assignmentData.passingScore,
      allowMultipleAttempts: assignmentData.allowMultipleAttempts,
      assignedTo: {
        connect: assignmentData.assignedTo.map((id: string) => ({ id })),
      },
      exercises: {
        create: assignmentData.exercises.map((exercise: any) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          isRequired: exercise.isRequired,
        })),
      },
    },
    include: {
      assignedByUser: {
        select: { id: true, displayName: true },
      },
      assignedTo: {
        select: { id: true, displayName: true, yearLevel: true },
      },
      exercises: {
        include: {
          exercise: {
            select: { id: true, title: true, subject: true },
          },
        },
      },
    },
  })

  // 为每个学生创建提交记录
  await Promise.all(
    assignmentData.assignedTo.map((studentId: string) =>
      prisma.homeworkSubmission.create({
        data: {
          homeworkId: assignment.id,
          userId: studentId,
          status: 'NOT_STARTED',
          totalExercises: assignmentData.exercises.length,
          maxPossibleScore: assignmentData.totalPoints,
        },
      })
    )
  )

  return assignment
}
