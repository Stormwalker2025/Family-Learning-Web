import { faker } from '@faker-js/faker'

export interface ExerciseFactory {
  id: string
  title: string
  description?: string
  subject: 'ENGLISH' | 'MATHS' | 'HASS' | 'VOCABULARY'
  yearLevel: number
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED'
  exerciseType: string
  timeLimit?: number
  isActive: boolean
  order: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface QuestionFactory {
  id: string
  exerciseId: string
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'CALCULATION' | 'TRUE_FALSE'
  question: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  points: number
  order: number
}

export const createExercise = (overrides: Partial<ExerciseFactory> = {}): ExerciseFactory => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  description: faker.lorem.paragraph({ min: 1, max: 3 }),
  subject: faker.helpers.arrayElement(['ENGLISH', 'MATHS', 'HASS', 'VOCABULARY'] as const),
  yearLevel: faker.number.int({ min: 1, max: 12 }),
  difficulty: faker.helpers.arrayElement(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED'] as const),
  exerciseType: 'READING_COMPREHENSION',
  timeLimit: faker.number.int({ min: 10, max: 60 }),
  isActive: true,
  order: faker.number.int({ min: 1, max: 100 }),
  createdBy: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const createEnglishReading = (yearLevel: number = 6): ExerciseFactory =>
  createExercise({
    title: 'IELTS Reading Comprehension - Australian Wildlife',
    subject: 'ENGLISH',
    yearLevel,
    difficulty: 'MEDIUM',
    exerciseType: 'IELTS_GT',
    timeLimit: 30,
  })

export const createMathsExercise = (yearLevel: number = 3): ExerciseFactory =>
  createExercise({
    title: 'Place Value and Decimal Numbers',
    subject: 'MATHS',
    yearLevel,
    difficulty: 'EASY',
    exerciseType: 'PLACE_VALUE',
    timeLimit: 20,
  })

export const createHASSExercise = (yearLevel: number = 6): ExerciseFactory =>
  createExercise({
    title: 'Australian History - First Fleet',
    subject: 'HASS',
    yearLevel,
    difficulty: 'MEDIUM',
    exerciseType: 'HASS_ARTICLE',
    timeLimit: 25,
  })

export const createQuestion = (overrides: Partial<QuestionFactory> = {}): QuestionFactory => ({
  id: faker.string.uuid(),
  exerciseId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'CALCULATION', 'TRUE_FALSE'] as const),
  question: faker.lorem.sentence() + '?',
  options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
  correctAnswer: 'A',
  explanation: faker.lorem.sentence(),
  points: faker.number.int({ min: 1, max: 5 }),
  order: faker.number.int({ min: 1, max: 20 }),
  ...overrides,
})

export const createMultipleChoiceQuestion = (exerciseId: string): QuestionFactory =>
  createQuestion({
    exerciseId,
    type: 'MULTIPLE_CHOICE',
    question: 'Which of the following Australian animals is a marsupial?',
    options: ['A. Kangaroo', 'B. Platypus', 'C. Dingo', 'D. Crocodile'],
    correctAnswer: 'A',
    explanation: 'Kangaroos are marsupials as they carry their young in a pouch.',
  })

export const createCalculationQuestion = (exerciseId: string): QuestionFactory =>
  createQuestion({
    exerciseId,
    type: 'CALCULATION',
    question: 'What is 15% of 240?',
    correctAnswer: '36',
    explanation: '15% of 240 = 0.15 × 240 = 36',
    points: 2,
  })