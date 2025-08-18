// ========== 认证相关类型 ==========

// 用户角色枚举
export type UserRole = 'STUDENT' | 'PARENT' | 'ADMIN'

// 用户完整信息接口
export interface User {
  id: string
  username: string
  email?: string
  displayName: string
  role: UserRole
  isActive: boolean
  timezone: string
  yearLevel?: number // 学生年级
  birthYear?: number // 出生年份
  parentalCode?: string // 家长监督码
  familyId?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 认证会话信息
export interface AuthSession {
  user: User
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

// 注册请求（管理员创建用户）
export interface RegisterRequest {
  username: string
  email?: string
  password: string
  displayName: string
  role: UserRole
  yearLevel?: number
  birthYear?: number
  familyId?: string
}

// 登录响应
export interface LoginResponse {
  success: boolean
  user?: User
  accessToken?: string
  message?: string
}

// 密码重置请求
export interface PasswordResetRequest {
  username: string
  newPassword: string
  confirmPassword: string
}

// 家庭信息
export interface Family {
  id: string
  name: string
  timezone: string
  members: User[]
  createdAt: Date
  updatedAt: Date
}

// 权限检查结果
export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
}

// JWT Token Payload
export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
  familyId?: string
  iat: number
  exp: number
}

// Subject types
export type SubjectType = 'english' | 'maths' | 'hass'

// ========== HASS (Humanities and Social Sciences) 相关类型 ==========

// HASS学科枚举
export type HassSubject = 
  | 'history'           // 历史
  | 'geography'         // 地理  
  | 'civics'           // 公民教育
  | 'economics'        // 经济商业

// HASS题型枚举
export type HassQuestionType = 
  | 'comprehension'     // 理解题
  | 'analysis'          // 分析题
  | 'evaluation'        // 评价题  
  | 'application'       // 应用题
  | 'creative'          // 创造题
  | 'multiple-choice'   // 选择题
  | 'true-false'        // 判断题
  | 'short-answer'      // 简答题
  | 'essay'             // 论述题
  | 'source-analysis'   // 史料分析
  | 'map-skills'        // 地图技能
  | 'data-interpretation' // 数据解读

// 多媒体类型
export type MediaType = 
  | 'image'
  | 'video'
  | 'audio' 
  | 'interactive-map'
  | 'timeline'
  | 'chart'
  | 'diagram'

// 多媒体资源
export interface MediaResource {
  id: string
  type: MediaType
  title: string
  url: string
  description?: string
  thumbnail?: string
  duration?: number // 视频/音频时长(秒)
  interactive?: boolean
  metadata?: Record<string, any>
}

// HASS文章内容
export interface HassArticle {
  id: string
  title: string
  content: string // Markdown格式
  subject: HassSubject
  yearLevel: number
  difficulty: 'foundation' | 'developing' | 'proficient' | 'advanced'
  readingTime: number // 预估阅读时间(分钟)
  wordCount: number
  
  // 澳洲特色内容
  topics: string[] // 主题标签，如['aboriginal-culture', 'federation', 'climate-change']
  culturalContext: 'indigenous' | 'multicultural' | 'contemporary' | 'historical'[]
  australianCurriculum: string[] // 对应的课程标准代码
  
  // 多媒体支持
  mediaResources: MediaResource[]
  interactiveElements: string[] // 交互元素ID列表
  
  // 学习支持
  keyVocabulary: HassVocabulary[]
  backgroundInfo: string // 背景知识介绍
  discussionPrompts: string[] // 讨论话题
  
  createdAt: Date
  updatedAt: Date
}

// HASS专业词汇
export interface HassVocabulary {
  id: string
  term: string
  definition: string
  pronunciation?: string // 发音标注
  etymology?: string // 词源
  synonyms?: string[]
  antonyms?: string[]
  context: string // 使用语境
  examples: string[] // 例句
  relatedTerms?: string[]
  difficulty: number // 1-5难度级别
  subject: HassSubject
  yearLevel?: number
}

// HASS问题
export interface HassQuestion {
  id: string
  articleId: string
  type: HassQuestionType
  subject: HassSubject
  
  // 问题内容
  question: string
  instructions?: string
  context?: string // 问题背景
  
  // 答案选项(选择题用)
  options?: string[]
  
  // 评分标准
  correctAnswer?: string | string[]
  sampleAnswers?: string[] // 示例答案
  rubric?: HassRubric // 评分细则
  
  // 技能评估
  skillsAssessed: string[] // 评估的技能，如['analysis', 'critical-thinking', 'source-evaluation']
  bloomsTaxonomy: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  
  // 学习支持
  hints?: string[]
  scaffolding?: string[] // 脚手架提示
  resources?: MediaResource[] // 相关资源
  
  points: number
  order: number
  difficulty: 'foundation' | 'developing' | 'proficient' | 'advanced'
  estimatedTime: number // 预估答题时间(分钟)
}

// 评分细则
export interface HassRubric {
  id: string
  questionId: string
  criteria: RubricCriterion[]
  holistic?: boolean // 是否整体评分
  maxPoints: number
}

// 评分标准
export interface RubricCriterion {
  id: string
  name: string
  description: string
  levels: RubricLevel[]
  weight?: number // 权重
}

// 评分等级
export interface RubricLevel {
  id: string
  name: string // 如'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'
  description: string
  points: number
  indicators: string[] // 表现指标
}

// 完整的HASS练习
export interface HassExercise {
  id: string
  title: string
  description?: string
  subject: HassSubject
  yearLevel: number
  difficulty: 'foundation' | 'developing' | 'proficient' | 'advanced'
  
  // 练习内容
  article: HassArticle
  questions: HassQuestion[]
  
  // 学习目标
  learningObjectives: string[]
  assessmentCriteria: string[]
  crossCurricularLinks?: string[] // 跨学科链接
  
  // 时间管理
  estimatedDuration: number // 预估完成时间(分钟)
  timeLimit?: number // 时间限制(分钟)
  
  // 扩展活动
  extensionActivities?: ExtensionActivity[]
  
  // 元数据
  tags: string[]
  totalPoints: number
  createdAt: Date
  updatedAt: Date
}

// 扩展活动
export interface ExtensionActivity {
  id: string
  title: string
  description: string
  type: 'research' | 'creative' | 'discussion' | 'presentation' | 'field-work'
  instructions: string[]
  resources?: MediaResource[]
  duration: number // 建议用时(分钟)
  difficulty: 'foundation' | 'developing' | 'proficient' | 'advanced'
}

// HASS答案提交
export interface HassSubmission {
  id: string
  userId: string
  exerciseId: string
  
  // 答案内容
  answers: Record<string, HassAnswer> // questionId -> answer
  notes?: Record<string, string> // 用户笔记
  bookmarks?: string[] // 书签的段落ID
  
  // 评分结果
  score: number
  maxScore: number
  rubricScores?: Record<string, number> // 各评分标准得分
  
  // 统计信息
  timeSpent: number // 实际用时(分钟)
  startedAt: Date
  submittedAt: Date
  
  // 学习分析
  readingTime: number // 阅读用时
  questionTime: Record<string, number> // 各题用时
  mediaInteractions: Record<string, number> // 多媒体交互次数
  
  feedback?: HassFeedback
}

// HASS答案
export interface HassAnswer {
  content: string | string[] // 答案内容
  confidence?: number // 信心度 1-5
  reasoning?: string // 推理过程
  sources?: string[] // 引用来源
  draftVersions?: string[] // 草稿版本
  timeSpent: number
}

// HASS反馈
export interface HassFeedback {
  overallScore: number
  subjectMastery: Record<HassSubject, number>
  skillsAnalysis: SkillAssessment[]
  
  // 内容掌握
  conceptUnderstanding: ConceptAssessment[]
  criticalThinking: number // 批判性思维得分
  sourceAnalysis: number // 史料分析能力
  
  // 学习建议
  strengths: string[]
  improvements: string[]
  recommendations: LearningRecommendation[]
  nextSteps: string[]
  
  // 问题分析
  questionAnalysis: HassQuestionAnalysis[]
  
  // 澳洲课程标准对接
  curriculumAlignment: CurriculumAlignment[]
}

// 技能评估
export interface SkillAssessment {
  skill: string
  level: 'emerging' | 'developing' | 'proficient' | 'advanced'
  evidence: string[]
  nextSteps: string[]
}

// 概念评估
export interface ConceptAssessment {
  concept: string
  understanding: number // 0-100
  misconceptions?: string[]
  supportNeeded?: string[]
}

// 学习建议
export interface LearningRecommendation {
  type: 'practice' | 'review' | 'extension' | 'support'
  title: string
  description: string
  resources?: string[]
  priority: 'high' | 'medium' | 'low'
}

// 问题分析
export interface HassQuestionAnalysis {
  questionId: string
  questionType: HassQuestionType
  subject: HassSubject
  skillsAssessed: string[]
  
  isCorrect: boolean
  userAnswer: HassAnswer
  correctAnswer?: string | string[]
  
  rubricScores?: Record<string, number>
  strengths: string[]
  improvements: string[]
  
  timeEfficiency: 'efficient' | 'adequate' | 'needs-improvement'
  thinkingDepth: 'surface' | 'developing' | 'deep'
}

// 课程标准对接
export interface CurriculumAlignment {
  code: string // 如'ACHASSK061'
  description: string
  achievement: 'below' | 'at' | 'above'
  evidence: string[]
}

// 互动地图数据
export interface InteractiveMapData {
  id: string
  title: string
  baseMap: 'australia' | 'world' | 'state' | 'local'
  layers: MapLayer[]
  markers: MapMarker[]
  regions: MapRegion[]
  initialView: {
    center: [number, number] // [latitude, longitude]
    zoom: number
  }
}

// 地图图层
export interface MapLayer {
  id: string
  name: string
  type: 'political' | 'physical' | 'climate' | 'population' | 'economic' | 'historical'
  visible: boolean
  opacity: number
  data?: any
}

// 地图标记
export interface MapMarker {
  id: string
  position: [number, number]
  title: string
  description?: string
  icon?: string
  popup?: string
  category: string
}

// 地图区域
export interface MapRegion {
  id: string
  name: string
  coordinates: [number, number][]
  properties: Record<string, any>
  style?: {
    color?: string
    fillColor?: string
    opacity?: number
  }
}

// 时间线数据
export interface TimelineData {
  id: string
  title: string
  description?: string
  events: TimelineEvent[]
  dateRange: {
    start: Date
    end: Date
  }
  scale: 'day' | 'month' | 'year' | 'decade' | 'century'
}

// 时间线事件
export interface TimelineEvent {
  id: string
  title: string
  date: Date
  endDate?: Date // 持续性事件
  description: string
  significance: 'major' | 'important' | 'minor'
  category: string
  images?: string[]
  sources?: string[]
  relatedEvents?: string[] // 相关事件ID
}

// Exercise types
export interface Exercise {
  id: string
  title: string
  description?: string
  subject: SubjectType
  yearLevel: number
  difficulty: 'easy' | 'medium' | 'hard'
  content: string // JSON stringified exercise content
  timeLimit?: number // in minutes
  createdAt: Date
  updatedAt: Date
}

// Question types
export interface Question {
  id: string
  exerciseId: string
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'calculation' | 'true-false' | 'sentence-completion' | 'matching'
  question: string
  options?: string[] // For multiple choice
  correctAnswer: string
  explanation?: string
  points: number
  order: number
}

// ========== 英语阅读练习相关类型 ==========

// 雅思GT风格题型枚举
export type ReadingQuestionType = 
  | 'multiple-choice'     // 选择题
  | 'true-false'          // 判断题 (True/False/Not Given)
  | 'short-answer'        // 简答题
  | 'sentence-completion' // 完形填空
  | 'matching'            // 配对题

// 判断题的答案选项
export type TrueFalseAnswer = 'true' | 'false' | 'not-given'

// 配对题选项
export interface MatchingOption {
  id: string
  content: string
  type: 'statement' | 'option'
}

// 阅读练习文章
export interface ReadingArticle {
  id: string
  title: string
  content: string
  wordCount: number
  readingTime: number // 预估阅读时间（分钟）
  yearLevel: number
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string // 文章主题
  source?: string // 文章来源
  vocabulary: string[] // 重点词汇
  createdAt: Date
  updatedAt: Date
}

// 阅读练习题目
export interface ReadingQuestion {
  id: string
  articleId: string
  type: ReadingQuestionType
  question: string
  instructions?: string // 题目说明
  options?: string[] // 选择题选项
  matchingOptions?: MatchingOption[] // 配对题选项
  correctAnswer: string | string[] // 正确答案，可能是单个或多个
  explanation?: string
  points: number
  order: number
  difficulty: 'easy' | 'medium' | 'hard'
}

// 完整的阅读练习
export interface ReadingExercise {
  id: string
  title: string
  description?: string
  article: ReadingArticle
  questions: ReadingQuestion[]
  yearLevel: number
  totalPoints: number
  timeLimit?: number // 建议完成时间（分钟）
  tags: string[] // 标签，如 ['animals', 'australia', 'science']
  createdAt: Date
  updatedAt: Date
}

// 阅读练习答案提交
export interface ReadingSubmission {
  id: string
  userId: string
  exerciseId: string
  answers: Record<string, string | string[]> // questionId -> answer(s)
  score: number
  maxScore: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number // 实际用时（分钟）
  startedAt: Date
  submittedAt: Date
  feedback?: ReadingFeedback
}

// 阅读练习反馈
export interface ReadingFeedback {
  overallScore: number
  strengths: string[] // 强项
  improvements: string[] // 需要改进的地方
  questionAnalysis: QuestionAnalysis[]
  recommendations: string[] // 学习建议
}

// 单题分析
export interface QuestionAnalysis {
  questionId: string
  questionType: ReadingQuestionType
  isCorrect: boolean
  userAnswer: string | string[]
  correctAnswer: string | string[]
  explanation?: string
  skillTested: string // 测试的技能，如 'detail comprehension', 'main idea', etc.
}

// Submission types
export interface Submission {
  id: string
  userId: string
  exerciseId: string
  answers: Record<string, string> // questionId -> answer
  score?: number
  maxScore: number
  startedAt: Date
  submittedAt?: Date
  timeSpent?: number // in minutes
}

// Vocabulary types
export interface VocabularyWord {
  id: string
  word: string
  definition: string
  partOfSpeech: string
  example?: string
  difficulty: number
  frequency: number
  yearLevel?: number
  createdAt: Date
}

// Learning progress types
export interface LearningProgress {
  id: string
  userId: string
  subjectType: SubjectType
  exerciseId: string
  status: 'not-started' | 'in-progress' | 'completed' | 'review-needed'
  score?: number
  attempts: number
  lastAttemptAt?: Date
  masteryLevel: number // 0-100
}

// Homework assignment types
export interface HomeworkAssignment {
  id: string
  title: string
  description?: string
  assignedBy: string // User ID of parent/admin
  assignedTo: string[] // Array of student User IDs
  exerciseIds: string[]
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue'
  createdAt: Date
  updatedAt: Date
}

// iPad unlock configuration
export interface UnlockRule {
  id: string
  userId: string
  minScore: number // Minimum score percentage required
  subjectRequirements: Record<SubjectType, number> // Required exercises per subject
  unlockDuration: number // Minutes of iPad time unlocked
  createdAt: Date
  updatedAt: Date
}

// ========== 数学练习相关类型 ==========

// 数学主题枚举
export type MathTopic = 
  | 'place-value'        // 位值
  | 'fractions'          // 分数
  | 'area'               // 面积
  | 'perimeter'          // 周长
  | 'decimals'           // 小数
  | 'measurement'        // 测量
  | 'money'              // 货币

// 数学练习题型
export type MathQuestionType = 
  | 'multiple-choice'     // 选择题
  | 'input-answer'        // 输入答案
  | 'drag-drop'           // 拖拽操作
  | 'true-false'          // 判断题
  | 'drawing'             // 绘图题
  | 'calculation'         // 计算题
  | 'unit-conversion'     // 单位转换
  | 'place-value-builder' // 位值构建
  | 'fraction-visual'     // 分数可视化

// 数学工具类型
export type MathToolType = 
  | 'calculator'          // 计算器
  | 'number-line'         // 数轴
  | 'fraction-bar'        // 分数条
  | 'shape-drawer'        // 几何绘图
  | 'measurement-tool'    // 测量工具
  | 'place-value-chart'   // 位值表

// 数学概念难度
export type MathDifficulty = 'foundation' | 'developing' | 'proficient' | 'advanced'

// 数学单位类型
export interface MathUnit {
  name: string
  symbol: string
  type: 'length' | 'area' | 'volume' | 'mass' | 'time' | 'money'
  baseUnit?: string // 基本单位
  conversionFactor?: number // 转换系数
}

// 数学练习内容
export interface MathExercise {
  id: string
  title: string
  description?: string
  topic: MathTopic
  yearLevel: number
  difficulty: MathDifficulty
  timeLimit?: number // 建议完成时间（分钟）
  conceptIntro: MathConcept
  questions: MathQuestion[]
  totalPoints: number
  requiredTools: MathToolType[] // 需要的数学工具
  learningObjectives: string[] // 学习目标
  tags: string[] // 标签
  createdAt: Date
  updatedAt: Date
}

// 数学概念介绍
export interface MathConcept {
  id: string
  topic: MathTopic
  title: string
  explanation: string
  examples: MathExample[]
  keyTerms: MathTerm[]
  visualAids: MathVisual[]
  realWorldApplications: string[]
}

// 数学示例
export interface MathExample {
  id: string
  description: string
  problem: string
  solution: string
  steps: MathStep[]
  visualization?: MathVisual
}

// 解题步骤
export interface MathStep {
  id: string
  stepNumber: number
  description: string
  formula?: string
  calculation?: string
  result?: string
}

// 数学术语
export interface MathTerm {
  term: string
  definition: string
  example?: string
}

// 数学可视化
export interface MathVisual {
  id: string
  type: 'diagram' | 'chart' | 'animation' | 'interactive'
  title: string
  description?: string
  imageUrl?: string
  svgContent?: string
  interactiveData?: any // 交互式数据
}

// 数学题目
export interface MathQuestion {
  id: string
  exerciseId: string
  type: MathQuestionType
  question: string
  instructions?: string
  problemData: any // 题目数据，根据题型而定
  correctAnswer: any // 正确答案
  possibleAnswers?: any[] // 可能的答案选项
  tolerance?: number // 数值答案的容差
  unit?: MathUnit // 答案单位
  hints: string[] // 提示
  explanation?: string
  points: number
  order: number
  difficulty: MathDifficulty
  estimatedTime: number // 预估答题时间（分钟）
  requiredTools: MathToolType[] // 此题需要的工具
}

// 位值题目数据
export interface PlaceValueData {
  number: number
  targetPlace?: 'ones' | 'tens' | 'hundreds' | 'thousands' | 'ten-thousands' | 'hundred-thousands'
  expanded?: boolean // 是否要求展开形式
  compareNumbers?: number[] // 比较数字
}

// 分数题目数据
export interface FractionData {
  numerator: number
  denominator: number
  operation?: 'add' | 'subtract' | 'multiply' | 'divide' | 'compare' | 'simplify'
  secondFraction?: { numerator: number; denominator: number }
  visualType?: 'circle' | 'rectangle' | 'number-line' | 'bar'
  mixedNumber?: boolean
}

// 几何题目数据
export interface GeometryData {
  shapes: Shape[]
  calculationType: 'area' | 'perimeter' | 'both'
  units: MathUnit
  realWorldContext?: string // 实际应用情境
}

// 几何形状
export interface Shape {
  id: string
  type: 'rectangle' | 'square' | 'triangle' | 'circle' | 'composite'
  dimensions: Record<string, number> // 尺寸参数
  position?: { x: number; y: number }
  color?: string
}

// 小数题目数据
export interface DecimalData {
  number: number
  decimalPlaces: number
  operation?: 'add' | 'subtract' | 'multiply' | 'divide' | 'round' | 'compare'
  secondNumber?: number
  roundTo?: number // 四舍五入到几位小数
  context?: 'money' | 'measurement' | 'general'
}

// 数学答案提交
export interface MathSubmission {
  id: string
  userId: string
  exerciseId: string
  answers: Record<string, any> // questionId -> answer
  toolUsage: Record<string, number> // 工具使用统计
  score: number
  maxScore: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number // 实际用时（分钟）
  startedAt: Date
  submittedAt: Date
  feedback?: MathFeedback
}

// 数学练习反馈
export interface MathFeedback {
  overallScore: number
  conceptMastery: Record<string, number> // 概念掌握程度
  strengths: string[] // 强项
  improvements: string[] // 需要改进的地方
  questionAnalysis: MathQuestionAnalysis[]
  recommendations: string[] // 学习建议
  nextTopics: MathTopic[] // 建议下一步学习的主题
}

// 数学题目分析
export interface MathQuestionAnalysis {
  questionId: string
  questionType: MathQuestionType
  topic: MathTopic
  isCorrect: boolean
  userAnswer: any
  correctAnswer: any
  explanation?: string
  skillTested: string // 测试的技能
  timeSpent: number
  hintsUsed: number
  toolsUsed: MathToolType[]
}
