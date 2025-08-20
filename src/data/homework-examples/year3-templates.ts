import { HomeworkTemplate, HomeworkAssignmentConfig } from '@/types'

// Year 3 作业模板
export const year3Templates: HomeworkTemplate[] = [
  {
    id: 'y3-daily-practice',
    name: 'Year 3 日常练习',
    description:
      '适合Year 3学生的日常基础练习，包含英语阅读、数学计算和HASS常识',
    type: 'quick-assignment',
    yearLevels: [3],
    subjects: ['ENGLISH', 'MATHS', 'HASS'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 1,
        maxCount: 2,
        difficultyDistribution: { EASY: 70, MEDIUM: 30 },
        topicCoverage: ['reading-comprehension', 'vocabulary'],
        adaptToStudentLevel: true,
      },
      {
        subject: 'MATHS',
        minCount: 1,
        maxCount: 2,
        difficultyDistribution: { EASY: 60, MEDIUM: 40 },
        topicCoverage: ['place-value', 'basic-operations'],
        adaptToStudentLevel: true,
      },
      {
        subject: 'HASS',
        minCount: 1,
        maxCount: 1,
        difficultyDistribution: { EASY: 100 },
        topicCoverage: ['australian-history', 'geography-basics'],
        adaptToStudentLevel: true,
      },
    ],
    defaultSettings: {
      estimatedTime: 45,
      priority: 'MEDIUM',
      totalPoints: 100,
      passingScore: 70,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: true,
    },
    usageCount: 0,
    estimatedTime: 45,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },

  {
    id: 'y3-weekly-review',
    name: 'Year 3 周练习',
    description: '适合Year 3学生的周末复习作业，涵盖本周学习内容',
    type: 'weekly-plan',
    yearLevels: [3],
    subjects: ['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { EASY: 50, MEDIUM: 40, HARD: 10 },
        topicCoverage: [
          'reading-comprehension',
          'grammar-basics',
          'creative-writing',
        ],
        adaptToStudentLevel: true,
      },
      {
        subject: 'MATHS',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { EASY: 40, MEDIUM: 50, HARD: 10 },
        topicCoverage: ['number-sense', 'measurement', 'geometry-basics'],
        adaptToStudentLevel: true,
      },
      {
        subject: 'HASS',
        minCount: 1,
        maxCount: 2,
        difficultyDistribution: { EASY: 70, MEDIUM: 30 },
        topicCoverage: ['community-helpers', 'local-environment'],
        adaptToStudentLevel: true,
      },
      {
        subject: 'VOCABULARY',
        minCount: 1,
        maxCount: 1,
        difficultyDistribution: { EASY: 80, MEDIUM: 20 },
        topicCoverage: ['daily-life', 'school-subjects'],
        adaptToStudentLevel: true,
      },
    ],
    defaultSettings: {
      estimatedTime: 90,
      priority: 'MEDIUM',
      totalPoints: 150,
      passingScore: 75,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: true,
    },
    usageCount: 0,
    estimatedTime: 90,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },

  {
    id: 'y3-reading-focus',
    name: 'Year 3 阅读专项',
    description: '专注于提高Year 3学生的英语阅读理解能力',
    type: 'custom',
    yearLevels: [3],
    subjects: ['ENGLISH', 'VOCABULARY'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 3,
        maxCount: 4,
        difficultyDistribution: { EASY: 40, MEDIUM: 50, HARD: 10 },
        topicCoverage: [
          'short-stories',
          'informational-texts',
          'picture-books',
        ],
        adaptToStudentLevel: true,
      },
      {
        subject: 'VOCABULARY',
        minCount: 2,
        maxCount: 2,
        difficultyDistribution: { EASY: 60, MEDIUM: 40 },
        topicCoverage: ['reading-vocabulary', 'context-clues'],
        adaptToStudentLevel: true,
      },
    ],
    defaultSettings: {
      estimatedTime: 60,
      priority: 'HIGH',
      totalPoints: 120,
      passingScore: 80,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: false,
    },
    usageCount: 0,
    estimatedTime: 60,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
]

// Year 3 示例作业内容
export const year3ExampleAssignments: Partial<HomeworkAssignmentConfig>[] = [
  {
    title: 'Year 3 数学与阅读基础练习',
    description: '练习基本的数学运算和英语阅读理解，适合Year 3学生的水平',
    instructions: `
请认真完成以下练习：

1. **数学部分**：
   - 仔细阅读每道题目
   - 使用所学的位值知识解题
   - 检查你的答案是否合理

2. **英语阅读部分**：
   - 先完整阅读文章
   - 理解文章主要内容
   - 仔细回答理解问题

3. **HASS部分**：
   - 了解澳大利亚的地理和历史
   - 思考这些知识与生活的联系

完成后请检查所有答案，确保书写清晰。
    `,
    priority: 'MEDIUM',
    estimatedTime: 45,
    totalPoints: 100,
    passingScore: 70,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 5,
  },

  {
    title: 'Year 3 澳大利亚文化探索',
    description: '通过阅读和练习了解澳大利亚的文化、历史和地理',
    instructions: `
这次作业让我们一起探索澳大利亚的文化：

1. **阅读任务**：
   - 阅读关于澳大利亚原住民文化的文章
   - 了解不同州和领地的特色

2. **思考问题**：
   - 澳大利亚有哪些著名的动物？
   - 我们的国旗有什么特殊含义？
   - 你最喜欢澳大利亚的什么地方？

3. **实践活动**：
   - 在地图上找到你居住的州
   - 画一画你最喜欢的澳大利亚动物

鼓励与家长讨论你的发现！
    `,
    priority: 'MEDIUM',
    estimatedTime: 60,
    totalPoints: 80,
    passingScore: 65,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 10,
  },

  {
    title: 'Year 3 创意阅读与写作',
    description: '培养创意思维，提高阅读理解和基础写作能力',
    instructions: `
让我们用创意的方式学习英语：

1. **创意阅读**：
   - 阅读趣味故事
   - 想象故事的不同结局
   - 理解角色的感受

2. **词汇游戏**：
   - 学习新的词汇
   - 用新词造句
   - 找出同义词和反义词

3. **简单写作**：
   - 写几句话描述你最喜欢的角色
   - 续写故事的开头

记住：没有错误的答案，只有不同的想法！
    `,
    priority: 'HIGH',
    estimatedTime: 50,
    totalPoints: 90,
    passingScore: 75,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 0,
  },
]

// Year 3 快速分配选项
export const year3QuickAssignments = [
  {
    name: '日常练习 (30分钟)',
    description: '适合放学后的快速练习',
    settings: {
      timeframe: 'daily' as const,
      subjectFocus: 'MATHS' as const,
      difficultyLevel: 'easy' as const,
      includeReview: true,
      priority: 'MEDIUM' as const,
    },
  },
  {
    name: '周末作业 (60分钟)',
    description: '综合性的周末练习',
    settings: {
      timeframe: 'weekend' as const,
      difficultyLevel: 'medium' as const,
      includeReview: true,
      priority: 'MEDIUM' as const,
    },
  },
  {
    name: '英语阅读专项 (45分钟)',
    description: '专注于提高阅读理解能力',
    settings: {
      timeframe: 'custom' as const,
      customDuration: 45,
      subjectFocus: 'ENGLISH' as const,
      difficultyLevel: 'adaptive' as const,
      includeReview: false,
      priority: 'HIGH' as const,
    },
  },
]
