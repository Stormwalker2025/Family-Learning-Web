import { describe, it, expect } from 'vitest'
import { createUser, createAustralianStudent } from './factories/user.factory'

describe('测试框架验证', () => {
  it('应该能够运行基本测试', () => {
    expect(1 + 1).toBe(2)
  })

  it('应该能够使用用户工厂创建测试数据', () => {
    const user = createUser()
    
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('username')
    expect(user).toHaveProperty('email')
    expect(user.role).toBe('STUDENT')
    expect(user.timezone).toBe('Australia/Brisbane')
  })

  it('应该能够创建澳洲学生数据', () => {
    const year3Student = createAustralianStudent(3)
    const year6Student = createAustralianStudent(6)
    
    expect(year3Student.yearLevel).toBe(3)
    expect(year3Student.displayName).toBe('August Chen')
    
    expect(year6Student.yearLevel).toBe(6)
    expect(year6Student.displayName).toBe('Michael Chen')
  })
})