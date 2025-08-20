import { faker } from '@faker-js/faker'

export interface HomeworkAssignmentFactory {
  id: string
  title: string
  description?: string
  instructions?: string
  assignedBy: string
  dueDate?: Date
  estimatedTime?: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'REVIEWED'
  isVisible: boolean
  totalPoints: number
  passingScore: number
  allowMultipleAttempts: boolean
  createdAt: Date
  updatedAt: Date
}

export interface HomeworkSubmissionFactory {
  id: string
  homeworkId: string
  userId: string
  status:
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SUBMITTED'
    | 'LATE_SUBMIT'
  totalScore?: number
  maxPossibleScore?: number
  percentage?: number
  completedExercises: number
  totalExercises: number
  startedAt?: Date
  submittedAt?: Date
  lastWorkedAt?: Date
  totalTimeSpent: number
  feedback?: string
  isLate: boolean
  createdAt: Date
  updatedAt: Date
}

export const createHomeworkAssignment = (
  overrides: Partial<HomeworkAssignmentFactory> = {}
): HomeworkAssignmentFactory => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  description: faker.lorem.paragraph({ min: 1, max: 2 }),
  instructions: faker.lorem.paragraph({ min: 1, max: 3 }),
  assignedBy: faker.string.uuid(),
  dueDate: faker.date.future({ days: 7 }),
  estimatedTime: faker.number.int({ min: 30, max: 120 }),
  priority: faker.helpers.arrayElement([
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
  ] as const),
  status: 'ASSIGNED',
  isVisible: true,
  totalPoints: 100,
  passingScore: 70,
  allowMultipleAttempts: true,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const createHomeworkSubmission = (
  overrides: Partial<HomeworkSubmissionFactory> = {}
): HomeworkSubmissionFactory => ({
  id: faker.string.uuid(),
  homeworkId: faker.string.uuid(),
  userId: faker.string.uuid(),
  status: 'NOT_STARTED',
  totalScore: undefined,
  maxPossibleScore: 100,
  percentage: undefined,
  completedExercises: 0,
  totalExercises: faker.number.int({ min: 3, max: 8 }),
  startedAt: undefined,
  submittedAt: undefined,
  lastWorkedAt: undefined,
  totalTimeSpent: 0,
  feedback: undefined,
  isLate: false,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

// 澳洲特定的作业模板
export const createAustralianHomework = (
  yearLevel: 3 | 6 = 6
): HomeworkAssignmentFactory =>
  createHomeworkAssignment({
    title:
      yearLevel === 3
        ? 'Year 3 Australian Animals and Basic Maths'
        : 'Year 6 IELTS Reading and Advanced Maths',
    description:
      yearLevel === 3
        ? 'Learn about Australian native animals and practice basic arithmetic'
        : 'Practice IELTS GT reading comprehension and solve complex mathematical problems',
    estimatedTime: yearLevel === 3 ? 45 : 90,
    totalPoints: yearLevel === 3 ? 80 : 120,
    passingScore: yearLevel === 3 ? 60 : 85,
  })

export const createCompletedSubmission = (
  homeworkId: string,
  userId: string
): HomeworkSubmissionFactory =>
  createHomeworkSubmission({
    homeworkId,
    userId,
    status: 'COMPLETED',
    totalScore: 85,
    maxPossibleScore: 100,
    percentage: 85.0,
    completedExercises: 5,
    totalExercises: 5,
    startedAt: faker.date.past({ days: 2 }),
    submittedAt: faker.date.past({ days: 1 }),
    lastWorkedAt: faker.date.past({ days: 1 }),
    totalTimeSpent: 3600, // 1 hour in seconds
    feedback: 'Great work! You showed good understanding of the concepts.',
    isLate: false,
  })

export const createInProgressSubmission = (
  homeworkId: string,
  userId: string
): HomeworkSubmissionFactory =>
  createHomeworkSubmission({
    homeworkId,
    userId,
    status: 'IN_PROGRESS',
    totalScore: undefined,
    maxPossibleScore: 100,
    percentage: undefined,
    completedExercises: 2,
    totalExercises: 5,
    startedAt: faker.date.past({ days: 1 }),
    submittedAt: undefined,
    lastWorkedAt: faker.date.recent(),
    totalTimeSpent: 1800, // 30 minutes in seconds
    feedback: undefined,
    isLate: false,
  })
