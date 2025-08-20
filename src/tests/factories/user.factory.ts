import { faker } from '@faker-js/faker'

export interface UserFactory {
  id: string
  username: string
  email: string
  displayName: string
  role: 'STUDENT' | 'PARENT' | 'ADMIN'
  yearLevel?: number
  birthYear?: number
  isActive: boolean
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export const createUser = (
  overrides: Partial<UserFactory> = {}
): UserFactory => ({
  id: faker.string.uuid(),
  username: faker.internet.username(),
  email: faker.internet.email(),
  displayName: faker.person.fullName(),
  role: 'STUDENT',
  yearLevel: faker.number.int({ min: 1, max: 12 }),
  birthYear: faker.number.int({ min: 2005, max: 2020 }),
  isActive: true,
  timezone: 'Australia/Brisbane',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const createStudent = (
  overrides: Partial<UserFactory> = {}
): UserFactory =>
  createUser({
    role: 'STUDENT',
    yearLevel: faker.number.int({ min: 1, max: 12 }),
    birthYear: faker.number.int({ min: 2010, max: 2018 }),
    ...overrides,
  })

export const createParent = (
  overrides: Partial<UserFactory> = {}
): UserFactory =>
  createUser({
    role: 'PARENT',
    yearLevel: undefined,
    birthYear: faker.number.int({ min: 1970, max: 1990 }),
    ...overrides,
  })

export const createAdmin = (
  overrides: Partial<UserFactory> = {}
): UserFactory =>
  createUser({
    role: 'ADMIN',
    yearLevel: undefined,
    birthYear: faker.number.int({ min: 1975, max: 1985 }),
    ...overrides,
  })

// 澳洲特定的学生数据
export const createAustralianStudent = (yearLevel: 3 | 6 = 3): UserFactory =>
  createStudent({
    yearLevel,
    timezone: 'Australia/Brisbane',
    displayName: yearLevel === 3 ? 'August Chen' : 'Michael Chen',
    username: yearLevel === 3 ? 'august_year3' : 'michael_year6',
    email: yearLevel === 3 ? 'august@family.test' : 'michael@family.test',
    birthYear: yearLevel === 3 ? 2016 : 2013,
  })

export const createAustralianParents = () => ({
  mother: createParent({
    displayName: 'Grace Chen',
    username: 'grace_parent',
    email: 'grace@family.test',
    birthYear: 1985,
  }),
  father: createAdmin({
    displayName: 'Dan Chen',
    username: 'dan_admin',
    email: 'dan@family.test',
    birthYear: 1983,
  }),
})
