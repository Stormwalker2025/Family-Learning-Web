export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'short_answer'
  | 'essay'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge'
export type Subject = 'english' | 'mathematics' | 'hass' | 'science'

export interface MediaContent {
  type: 'image' | 'audio' | 'video'
  url: string
  alt?: string
  caption?: string
  duration?: number // for audio/video in seconds
}

export interface BaseQuestion {
  id: string
  type: QuestionType
  title?: string
  instruction: string
  content: QuestionContent
  answerKey: AnswerKey
  metadata: QuestionMetadata
  scoring: ScoringConfig
  accessibility?: AccessibilityConfig
}

export type QuestionContent =
  | MCQContent
  | TrueFalseContent
  | MatchingContent
  | FillBlankContent
  | ShortAnswerContent
  | EssayContent

export type AnswerKey =
  | MCQAnswerKey
  | TrueFalseAnswerKey
  | MatchingAnswerKey
  | FillBlankAnswerKey
  | ShortAnswerAnswerKey
  | EssayAnswerKey

export interface QuestionMetadata {
  difficulty: Difficulty
  yearLevel: number
  subject: Subject
  topic?: string
  curriculum: {
    framework: 'ACARA' | 'QLD'
    contentDescriptor: string
    achievementStandard?: string
  }
  tags: string[]
  estimatedTime: number // seconds
  maxAttempts?: number
  createdAt: string
  updatedAt: string
}

export interface ScoringConfig {
  maxPoints: number
  partialCredit: boolean
  penaltyForWrong?: number
  bonusForSpeed?: number
  rubric?: ScoringRubric[]
}

export interface ScoringRubric {
  criteria: string
  excellent: { points: number; description: string }
  good: { points: number; description: string }
  satisfactory: { points: number; description: string }
  needsImprovement: { points: number; description: string }
}

export interface AccessibilityConfig {
  screenReader: {
    alt: string
    longDescription?: string
  }
  visualSupport: {
    highContrast?: boolean
    largeText?: boolean
    images?: ImageDescription[]
  }
  audioSupport?: {
    textToSpeech: boolean
    audioClues?: string[]
  }
}

export interface ImageDescription {
  imageId: string
  description: string
  decorative?: boolean
}

// Multiple Choice Questions
export interface MCQContent {
  stem: string
  stimulus?: {
    type: 'text' | 'image' | 'audio' | 'video'
    content: string | MediaContent
  }
  options: MCQOption[]
  randomizeOptions?: boolean
  selectMultiple?: boolean
}

export interface MCQOption {
  id: string
  text: string
  media?: MediaContent
  isDistractor?: boolean
}

export interface MCQAnswerKey {
  correct: string[]
  explanation?: string
  workingOut?: string
  distractorFeedback?: Record<string, string>
}

// True/False Questions
export interface TrueFalseContent {
  statement: string
  stimulus?: MediaContent
  context?: string
}

export interface TrueFalseAnswerKey {
  correct: boolean
  explanation: string
  reasoning?: string
}

// Matching Questions
export interface MatchingContent {
  instruction: string
  leftColumn: MatchingItem[]
  rightColumn: MatchingItem[]
  matchType: 'one_to_one' | 'one_to_many' | 'many_to_many'
  allowPartialMatching?: boolean
}

export interface MatchingItem {
  id: string
  content: string | MediaContent
  type?: 'text' | 'image' | 'audio'
}

export interface MatchingAnswerKey {
  matches: MatchPair[]
  explanation?: string
}

export interface MatchPair {
  left: string
  right: string
  points?: number
}

// Fill-in-the-Blank Questions
export interface FillBlankContent {
  text: string
  blanks: BlankDefinition[]
  caseSensitive?: boolean
  preserveOrder?: boolean
}

export interface BlankDefinition {
  id: string
  placeholder: string
  wordLimit?: number
  inputType: 'text' | 'number' | 'select'
  options?: string[]
  width?: number
}

export interface FillBlankAnswerKey {
  answers: BlankAnswer[]
  explanation?: string
}

export interface BlankAnswer {
  blankId: string
  acceptedAnswers: string[]
  caseSensitive?: boolean
  acceptSynonyms?: boolean
  points?: number
  feedback?: string
}

// Short Answer Questions
export interface ShortAnswerContent {
  question: string
  stimulus?: MediaContent
  wordLimit?: number
  characterLimit?: number
}

export interface ShortAnswerAnswerKey {
  sampleAnswers: string[]
  keywords: string[]
  rubric: ScoringRubric[]
  explanation?: string
}

// Essay Questions
export interface EssayContent {
  prompt: string
  stimulus?: MediaContent
  wordLimit: {
    min: number
    max: number
  }
  structure?: {
    introduction: boolean
    bodyParagraphs: number
    conclusion: boolean
  }
}

export interface EssayAnswerKey {
  rubric: ScoringRubric[]
  sampleResponse?: string
  keyPoints: string[]
  explanation?: string
}

// Grading Results
export interface GradingResult {
  score: number // 0-100 percentage
  points: number // Raw points earned
  maxPoints: number // Maximum possible points
  isCorrect: boolean // Overall correctness
  partialCredit: number // Partial credit earned (0-1)
  feedback: string[] // Feedback messages
  detailedResults: DetailedResult[]
  timeBonus?: number // Bonus for quick completion
  penalty?: number // Penalty for wrong answers
  gradingMetadata: GradingMetadata
}

export interface DetailedResult {
  questionPart: string
  userAnswer: any
  correctAnswer: any
  isCorrect: boolean
  points: number
  maxPoints: number
  feedback?: string
  confidence?: number // AI confidence in grading (0-1)
}

export interface GradingMetadata {
  gradedAt: string
  gradingVersion: string
  processingTime: number // milliseconds
  errorDiagnosis?: ErrorDiagnosis[]
  suggestions?: string[]
}

// Error Diagnosis
export interface ErrorDiagnosis {
  errorType: string
  confidence: number
  description: string
  remediation: string
  relatedConcepts: string[]
  priority: 'high' | 'medium' | 'low'
}

// User Answers
export type UserAnswer =
  | string[] // MCQ answers (option IDs)
  | boolean // True/False answer
  | MatchPair[] // Matching pairs
  | Record<string, string> // Fill-in-blank answers (blankId -> answer)
  | string // Short answer or essay

// Timing Configuration
export interface TimingConfig {
  expectedTime: number
  speedBonusThreshold: number
  timeoutPenalty: number
  maxBonus: number
  maxPenalty: number
}

// Question Bank
export interface QuestionBank {
  id: string
  name: string
  description?: string
  questions: BaseQuestion[]
  metadata: {
    subject: Subject
    yearLevels: number[]
    tags: string[]
    createdAt: string
    updatedAt: string
    version: string
  }
}
