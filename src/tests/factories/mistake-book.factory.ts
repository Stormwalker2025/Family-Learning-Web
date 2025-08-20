import { faker } from '@faker-js/faker'

export interface MistakeBookFactory {
  id: string
  userId: string
  exerciseId: string
  questionId: string
  wrongAnswer: string
  correctAnswer: string
  explanation?: string
  mistakeType:
    | 'CARELESS_ERROR'
    | 'CONCEPT_ERROR'
    | 'METHOD_ERROR'
    | 'CALCULATION_ERROR'
    | 'READING_ERROR'
    | 'TIME_PRESSURE'
    | 'VOCABULARY_ERROR'
    | 'GRAMMAR_ERROR'
  topic?: string
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED'
  isResolved: boolean
  reviewCount: number
  lastReviewed?: Date
  nextReviewDate?: Date
  notes?: string
  isStarred: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MistakeBookReviewFactory {
  id: string
  mistakeId: string
  isCorrect: boolean
  timeSpent?: number
  notes?: string
  reviewedAt: Date
}

export const createMistakeBook = (
  overrides: Partial<MistakeBookFactory> = {}
): MistakeBookFactory => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  exerciseId: faker.string.uuid(),
  questionId: faker.string.uuid(),
  wrongAnswer: faker.lorem.word(),
  correctAnswer: faker.lorem.word(),
  explanation: faker.lorem.sentence(),
  mistakeType: faker.helpers.arrayElement([
    'CARELESS_ERROR',
    'CONCEPT_ERROR',
    'METHOD_ERROR',
    'CALCULATION_ERROR',
    'READING_ERROR',
    'TIME_PRESSURE',
    'VOCABULARY_ERROR',
    'GRAMMAR_ERROR',
  ] as const),
  topic: faker.lorem.words({ min: 1, max: 3 }),
  difficulty: faker.helpers.arrayElement([
    'BEGINNER',
    'EASY',
    'MEDIUM',
    'HARD',
    'ADVANCED',
  ] as const),
  isResolved: faker.datatype.boolean({ probability: 0.3 }),
  reviewCount: faker.number.int({ min: 0, max: 5 }),
  lastReviewed: faker.datatype.boolean() ? faker.date.past() : undefined,
  nextReviewDate: faker.datatype.boolean() ? faker.date.future() : undefined,
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  isStarred: faker.datatype.boolean({ probability: 0.2 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const createMistakeBookReview = (
  overrides: Partial<MistakeBookReviewFactory> = {}
): MistakeBookReviewFactory => ({
  id: faker.string.uuid(),
  mistakeId: faker.string.uuid(),
  isCorrect: faker.datatype.boolean({ probability: 0.7 }),
  timeSpent: faker.number.int({ min: 30, max: 300 }), // 30 seconds to 5 minutes
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  reviewedAt: faker.date.recent(),
  ...overrides,
})

// 澳洲特定的错题类型
export const createMathsMistake = (
  userId: string,
  exerciseId: string
): MistakeBookFactory =>
  createMistakeBook({
    userId,
    exerciseId,
    wrongAnswer: '0.75',
    correctAnswer: '0.25',
    explanation: 'To convert 1/4 to decimal, divide 1 by 4: 1 ÷ 4 = 0.25',
    mistakeType: 'CALCULATION_ERROR',
    topic: 'Fraction to Decimal Conversion',
    difficulty: 'MEDIUM',
    isResolved: false,
  })

export const createEnglishMistake = (
  userId: string,
  exerciseId: string
): MistakeBookFactory =>
  createMistakeBook({
    userId,
    exerciseId,
    wrongAnswer: 'Their going to the park',
    correctAnswer: "They're going to the park",
    explanation:
      "Use 'They're' (they are) instead of 'Their' (possessive pronoun)",
    mistakeType: 'GRAMMAR_ERROR',
    topic: "Homophones - Their vs They're",
    difficulty: 'EASY',
    isResolved: false,
  })

export const createHASSMistake = (
  userId: string,
  exerciseId: string
): MistakeBookFactory =>
  createMistakeBook({
    userId,
    exerciseId,
    wrongAnswer: '1901',
    correctAnswer: '1788',
    explanation:
      'The First Fleet arrived in Australia in 1788, not 1901 (which was Federation)',
    mistakeType: 'CONCEPT_ERROR',
    topic: 'Australian History - First Fleet',
    difficulty: 'MEDIUM',
    isResolved: false,
  })

export const createVocabularyMistake = (
  userId: string,
  exerciseId: string
): MistakeBookFactory =>
  createMistakeBook({
    userId,
    exerciseId,
    wrongAnswer: 'Joey means baby bird',
    correctAnswer: 'Joey means baby kangaroo/marsupial',
    explanation:
      'A joey is specifically a young kangaroo, wallaby, or other marsupial',
    mistakeType: 'VOCABULARY_ERROR',
    topic: 'Australian Animals Vocabulary',
    difficulty: 'EASY',
    isResolved: false,
  })

export const createResolvedMistake = (
  userId: string,
  exerciseId: string
): MistakeBookFactory =>
  createMistakeBook({
    userId,
    exerciseId,
    mistakeType: 'CARELESS_ERROR',
    isResolved: true,
    reviewCount: 3,
    lastReviewed: faker.date.past({ days: 2 }),
    notes: 'Mastered after 3 reviews. No longer making this mistake.',
  })

export const createSuccessfulReview = (
  mistakeId: string
): MistakeBookReviewFactory =>
  createMistakeBookReview({
    mistakeId,
    isCorrect: true,
    timeSpent: faker.number.int({ min: 45, max: 120 }),
    notes: 'Got it right this time! Understanding improved.',
  })

export const createFailedReview = (
  mistakeId: string
): MistakeBookReviewFactory =>
  createMistakeBookReview({
    mistakeId,
    isCorrect: false,
    timeSpent: faker.number.int({ min: 60, max: 180 }),
    notes: 'Still struggling with this concept. Need more practice.',
  })
