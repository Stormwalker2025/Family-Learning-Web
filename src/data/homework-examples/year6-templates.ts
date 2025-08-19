import { HomeworkTemplate, HomeworkAssignmentConfig } from '@/types'

// Year 6 作业模板
export const year6Templates: HomeworkTemplate[] = [
  {
    id: 'y6-comprehensive-practice',
    name: 'Year 6 综合练习',
    description: '适合Year 6学生的综合性练习，涵盖高年级核心技能',
    type: 'quick-assignment',
    yearLevels: [6],
    subjects: ['ENGLISH', 'MATHS', 'HASS'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { 'MEDIUM': 50, 'HARD': 40, 'ADVANCED': 10 },
        topicCoverage: ['advanced-reading', 'persuasive-writing', 'literary-analysis'],
        adaptToStudentLevel: true
      },
      {
        subject: 'MATHS',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { 'MEDIUM': 40, 'HARD': 50, 'ADVANCED': 10 },
        topicCoverage: ['fractions-decimals', 'algebra-basics', 'geometry-advanced'],
        adaptToStudentLevel: true
      },
      {
        subject: 'HASS',
        minCount: 1,
        maxCount: 2,
        difficultyDistribution: { 'MEDIUM': 60, 'HARD': 40 },
        topicCoverage: ['australian-government', 'world-geography', 'economic-concepts'],
        adaptToStudentLevel: true
      }
    ],
    defaultSettings: {
      estimatedTime: 75,
      priority: 'MEDIUM',
      totalPoints: 150,
      passingScore: 75,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: true
    },
    usageCount: 0,
    estimatedTime: 75,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  {
    id: 'y6-high-school-prep',
    name: 'Year 6 中学预备',
    description: 'Year 6学生的中学预备练习，提高学术技能和自主学习能力',
    type: 'exam-prep',
    yearLevels: [6],
    subjects: ['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 3,
        maxCount: 4,
        difficultyDistribution: { 'HARD': 60, 'ADVANCED': 40 },
        topicCoverage: ['complex-texts', 'essay-writing', 'critical-thinking'],
        adaptToStudentLevel: true
      },
      {
        subject: 'MATHS',
        minCount: 3,
        maxCount: 4,
        difficultyDistribution: { 'HARD': 50, 'ADVANCED': 50 },
        topicCoverage: ['problem-solving', 'mathematical-reasoning', 'data-analysis'],
        adaptToStudentLevel: true
      },
      {
        subject: 'HASS',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { 'HARD': 70, 'ADVANCED': 30 },
        topicCoverage: ['research-skills', 'source-analysis', 'argumentative-writing'],
        adaptToStudentLevel: true
      },
      {
        subject: 'VOCABULARY',
        minCount: 1,
        maxCount: 2,
        difficultyDistribution: { 'HARD': 60, 'ADVANCED': 40 },
        topicCoverage: ['academic-vocabulary', 'subject-specific-terms'],
        adaptToStudentLevel: true
      }
    ],
    defaultSettings: {
      estimatedTime: 120,
      priority: 'HIGH',
      totalPoints: 200,
      passingScore: 80,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: false
    },
    usageCount: 0,
    estimatedTime: 120,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  {
    id: 'y6-project-based',
    name: 'Year 6 项目式学习',
    description: '基于项目的深度学习，培养研究、分析和表达能力',
    type: 'custom',
    yearLevels: [6],
    subjects: ['ENGLISH', 'HASS', 'VOCABULARY'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { 'HARD': 40, 'ADVANCED': 60 },
        topicCoverage: ['research-writing', 'presentation-skills', 'media-literacy'],
        adaptToStudentLevel: true
      },
      {
        subject: 'HASS',
        minCount: 2,
        maxCount: 3,
        difficultyDistribution: { 'HARD': 50, 'ADVANCED': 50 },
        topicCoverage: ['historical-inquiry', 'geographical-investigation', 'civic-engagement'],
        adaptToStudentLevel: true
      },
      {
        subject: 'VOCABULARY',
        minCount: 1,
        maxCount: 1,
        difficultyDistribution: { 'ADVANCED': 100 },
        topicCoverage: ['academic-discourse', 'specialized-terminology'],
        adaptToStudentLevel: true
      }
    ],
    defaultSettings: {
      estimatedTime: 150,
      priority: 'HIGH',
      totalPoints: 180,
      passingScore: 85,
      allowMultipleAttempts: false,
      autoRelease: true,
      lateSubmissionAllowed: true
    },
    usageCount: 0,
    estimatedTime: 150,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  {
    id: 'y6-critical-thinking',
    name: 'Year 6 批判性思维',
    description: '培养高阶思维技能，包括分析、评价和创造能力',
    type: 'custom',
    yearLevels: [6],
    subjects: ['ENGLISH', 'MATHS', 'HASS'],
    exerciseSelectionRules: [
      {
        subject: 'ENGLISH',
        minCount: 2,
        maxCount: 2,
        difficultyDistribution: { 'ADVANCED': 100 },
        topicCoverage: ['argument-analysis', 'bias-detection', 'evidence-evaluation'],
        adaptToStudentLevel: true
      },
      {
        subject: 'MATHS',
        minCount: 2,
        maxCount: 2,
        difficultyDistribution: { 'HARD': 30, 'ADVANCED': 70 },
        topicCoverage: ['mathematical-proof', 'pattern-recognition', 'logical-reasoning'],
        adaptToStudentLevel: true
      },
      {
        subject: 'HASS',
        minCount: 2,
        maxCount: 2,
        difficultyDistribution: { 'HARD': 40, 'ADVANCED': 60 },
        topicCoverage: ['source-credibility', 'multiple-perspectives', 'cause-effect-analysis'],
        adaptToStudentLevel: true
      }
    ],
    defaultSettings: {
      estimatedTime: 90,
      priority: 'HIGH',
      totalPoints: 160,
      passingScore: 80,
      allowMultipleAttempts: true,
      autoRelease: true,
      lateSubmissionAllowed: true
    },
    usageCount: 0,
    estimatedTime: 90,
    adaptiveDifficulty: true,
    personalizedContent: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
]

// Year 6 示例作业内容
export const year6ExampleAssignments: Partial<HomeworkAssignmentConfig>[] = [
  {
    title: 'Year 6 高阶数学与逻辑思维',
    description: '培养Year 6学生的数学推理能力和逻辑思维技能',
    instructions: `
这次作业将挑战你的数学思维：

1. **代数思维**：
   - 理解变量和代数表达式
   - 解决简单的方程问题
   - 探索数学模式和规律

2. **几何推理**：
   - 计算复杂图形的面积和周长
   - 理解三维图形的特性
   - 应用几何知识解决实际问题

3. **数据分析**：
   - 解读图表和统计数据
   - 计算平均数、中位数和众数
   - 做出基于数据的推论

4. **问题解决策略**：
   - 使用多种方法解决同一问题
   - 解释你的思考过程
   - 验证答案的合理性

记住：数学不只是计算，更是思考的过程！
    `,
    priority: 'HIGH',
    estimatedTime: 90,
    totalPoints: 150,
    passingScore: 80,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 5
  },

  {
    title: 'Year 6 澳大利亚历史深度探索',
    description: '深入了解澳大利亚的历史发展，培养历史思维和研究技能',
    instructions: `
让我们成为历史侦探：

1. **殖民历史研究**：
   - 了解欧洲殖民对澳大利亚的影响
   - 分析不同群体的历史经历
   - 理解历史事件的多重视角

2. **原住民文化**：
   - 深入了解澳大利亚原住民的历史和文化
   - 探讨和解进程的重要性
   - 反思历史对当代社会的影响

3. **史料分析**：
   - 阅读和分析历史文档
   - 区分史实和观点
   - 评估历史资料的可靠性

4. **历史思维**：
   - 理解因果关系
   - 比较不同时期的变化
   - 连接过去、现在和未来

用历史学家的眼光看世界！
    `,
    priority: 'HIGH',
    estimatedTime: 75,
    totalPoints: 120,
    passingScore: 75,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 10
  },

  {
    title: 'Year 6 高级英语阅读与写作',
    description: '提高高级阅读理解和学术写作能力，为中学做准备',
    instructions: `
提升你的英语学术技能：

1. **高级阅读理解**：
   - 分析复杂文本的结构和意图
   - 识别作者的观点和偏见
   - 理解隐含意义和象征手法
   - 比较不同文本的观点

2. **批判性思维**：
   - 评估论据的强度
   - 识别逻辑谬误
   - 形成并支持自己的观点
   - 考虑多种解释

3. **学术写作**：
   - 撰写结构清晰的论述文章
   - 使用证据支持论点
   - 正确引用资料来源
   - 编辑和改进文章

4. **高级词汇**：
   - 学习学术词汇
   - 理解词汇的精确含义
   - 在写作中恰当使用高级词汇

准备好迎接中学的学术挑战！
    `,
    priority: 'HIGH',
    estimatedTime: 100,
    totalPoints: 140,
    passingScore: 82,
    allowMultipleAttempts: true,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 8
  },

  {
    title: 'Year 6 跨学科项目：可持续发展',
    description: '综合运用多学科知识，探讨环境和可持续发展问题',
    instructions: `
这是一个跨学科的探索项目：

1. **科学理解**：
   - 了解气候变化的科学原理
   - 研究可再生能源技术
   - 分析环境数据和趋势

2. **地理视角**：
   - 绘制澳大利亚的环境地图
   - 比较不同地区的环境挑战
   - 探讨人类活动对环境的影响

3. **经济考量**：
   - 理解环保政策的经济成本
   - 分析可持续发展的商业机会
   - 评估个人消费选择的影响

4. **公民行动**：
   - 研究环保法律和政策
   - 设计社区环保倡议
   - 撰写给政府的建议信

5. **数学应用**：
   - 计算碳足迹
   - 分析环境统计数据
   - 制作图表展示研究结果

成为地球的守护者！
    `,
    priority: 'HIGH',
    estimatedTime: 180,
    totalPoints: 200,
    passingScore: 85,
    allowMultipleAttempts: false,
    autoRelease: true,
    lateSubmissionAllowed: true,
    latePenalty: 15
  }
]

// Year 6 快速分配选项
export const year6QuickAssignments = [
  {
    name: '日常挑战 (45分钟)',
    description: '适合Year 6的日常学术挑战',
    settings: {
      timeframe: 'daily' as const,
      difficultyLevel: 'hard' as const,
      includeReview: true,
      priority: 'MEDIUM' as const
    }
  },
  {
    name: '周末深度学习 (90分钟)',
    description: '综合性的周末深度学习',
    settings: {
      timeframe: 'weekend' as const,
      difficultyLevel: 'advanced' as const,
      includeReview: true,
      priority: 'HIGH' as const
    }
  },
  {
    name: '数学专项训练 (60分钟)',
    description: '专注于高级数学技能训练',
    settings: {
      timeframe: 'custom' as const,
      customDuration: 60,
      subjectFocus: 'MATHS' as const,
      difficultyLevel: 'hard' as const,
      includeReview: false,
      priority: 'HIGH' as const
    }
  },
  {
    name: '英语写作专项 (75分钟)',
    description: '提高学术写作和批判性阅读能力',
    settings: {
      timeframe: 'custom' as const,
      customDuration: 75,
      subjectFocus: 'ENGLISH' as const,
      difficultyLevel: 'advanced' as const,
      includeReview: false,
      priority: 'HIGH' as const
    }
  },
  {
    name: '中学预备综合练习 (120分钟)',
    description: '为升入中学做全面准备',
    settings: {
      timeframe: 'custom' as const,
      customDuration: 120,
      difficultyLevel: 'advanced' as const,
      includeReview: true,
      priority: 'HIGH' as const
    }
  }
]