import { faker } from '@faker-js/faker'

export interface IpadUnlockConfigurationFactory {
  id: string
  name: string
  description?: string
  rules: string // JSON
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface IpadUnlockRecordFactory {
  id: string
  userId: string
  ruleId: string
  configurationId: string
  achievedScore: number
  subjectScores: string // JSON
  unlockedMinutes: number
  unlockedAt: Date
  expiresAt: Date
  used: boolean
  usedAt?: Date
  triggeredBy: string
}

export const createIpadUnlockConfiguration = (overrides: Partial<IpadUnlockConfigurationFactory> = {}): IpadUnlockConfigurationFactory => ({
  id: faker.string.uuid(),
  name: faker.lorem.words({ min: 2, max: 4 }),
  description: faker.lorem.sentence(),
  rules: JSON.stringify({
    mathsThreshold: 90,
    englishThreshold: 85,
    hassThreshold: 80,
    bonusMinutes: 15,
    maxDailyMinutes: 120,
  }),
  isActive: true,
  createdBy: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const createIpadUnlockRecord = (overrides: Partial<IpadUnlockRecordFactory> = {}): IpadUnlockRecordFactory => {
  const unlockedAt = faker.date.recent()
  const expiresAt = new Date(unlockedAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
  
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    ruleId: faker.string.uuid(),
    configurationId: faker.string.uuid(),
    achievedScore: faker.number.float({ min: 70, max: 100, fractionDigits: 1 }),
    subjectScores: JSON.stringify({
      MATHS: faker.number.float({ min: 85, max: 100, fractionDigits: 1 }),
      ENGLISH: faker.number.float({ min: 80, max: 95, fractionDigits: 1 }),
      HASS: faker.number.float({ min: 75, max: 90, fractionDigits: 1 }),
    }),
    unlockedMinutes: faker.number.int({ min: 15, max: 30 }),
    unlockedAt,
    expiresAt,
    used: faker.datatype.boolean(),
    usedAt: faker.datatype.boolean() ? faker.date.between({ from: unlockedAt, to: new Date() }) : undefined,
    triggeredBy: faker.string.uuid(),
    ...overrides,
  }
}

// 澳洲特定的解锁配置
export const createStandardUnlockConfig = (): IpadUnlockConfigurationFactory =>
  createIpadUnlockConfiguration({
    name: 'Standard Australian Learning Rules',
    description: 'Based on QLD education standards for Year 3-6 students',
    rules: JSON.stringify({
      MATHS: { threshold: 90, bonusMinutes: 15, perfectBonus: 30 },
      ENGLISH: { threshold: 85, bonusMinutes: 12, perfectBonus: 25 },
      HASS: { threshold: 80, bonusMinutes: 10, perfectBonus: 20 },
      VOCABULARY: { threshold: 88, bonusMinutes: 8, perfectBonus: 15 },
      maxDailyMinutes: 120,
      weeklyLimit: 600,
    }),
  })

export const createHighAchievementRecord = (userId: string, configId: string): IpadUnlockRecordFactory =>
  createIpadUnlockRecord({
    userId,
    configurationId: configId,
    achievedScore: 95.5,
    subjectScores: JSON.stringify({
      MATHS: 98.0,
      ENGLISH: 94.0,
      HASS: 94.5,
    }),
    unlockedMinutes: 30,
    used: false,
    triggeredBy: 'homework_' + faker.string.uuid(),
  })

export const createUsedUnlockRecord = (userId: string, configId: string): IpadUnlockRecordFactory => {
  const unlockedAt = faker.date.past({ days: 1 })
  const usedAt = faker.date.between({ from: unlockedAt, to: new Date() })
  
  return createIpadUnlockRecord({
    userId,
    configurationId: configId,
    achievedScore: 87.0,
    unlockedMinutes: 20,
    unlockedAt,
    used: true,
    usedAt,
    triggeredBy: 'exercise_' + faker.string.uuid(),
  })
}