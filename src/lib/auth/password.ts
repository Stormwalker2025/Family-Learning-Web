// 密码加密和验证工具函数
// Password encryption and validation utilities

import bcrypt from 'bcryptjs'
import { PASSWORD_CONFIG } from './config'

/**
 * 哈希密码
 * @param password 明文密码
 * @returns Promise<string> 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_CONFIG.bcryptRounds)
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 哈希后的密码
 * @returns Promise<boolean> 是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 密码强度验证
 * @param password 明文密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number // 0-100
} {
  const errors: string[] = []
  let score = 0

  // 长度检查
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`密码长度至少需要 ${PASSWORD_CONFIG.minLength} 位`)
  } else {
    score += 20
    // 额外长度加分
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
  }

  // 数字检查（可选）
  if (PASSWORD_CONFIG.requireNumbers) {
    if (!/\d/.test(password)) {
      errors.push('密码必须包含至少一个数字')
    } else {
      score += 15
    }
  } else {
    // 即使不强制要求，包含数字也会加分
    if (/\d/.test(password)) score += 10
  }

  // 大写字母检查（可选）
  if (PASSWORD_CONFIG.requireUppercase) {
    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含至少一个大写字母')
    } else {
      score += 15
    }
  } else {
    if (/[A-Z]/.test(password)) score += 10
  }

  // 小写字母检查
  if (/[a-z]/.test(password)) score += 10

  // 特殊字符检查（可选）
  if (PASSWORD_CONFIG.requireSpecialChars) {
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密码必须包含至少一个特殊字符')
    } else {
      score += 20
    }
  } else {
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
  }

  // 常见密码检查
  const commonPasswords = [
    'password',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    '111111',
    '123123',
    'admin',
    'welcome',
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('不能使用常见密码')
    score = Math.min(score, 30)
  }

  // 重复字符检查
  if (/(.)\1{2,}/.test(password)) {
    errors.push('密码不能有连续重复的字符')
    score -= 10
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, Math.min(100, score)),
  }
}

/**
 * 生成随机密码
 * @param length 密码长度，默认8位
 * @param includeSpecialChars 是否包含特殊字符
 * @returns 生成的密码
 */
export function generateRandomPassword(
  length: number = 8,
  includeSpecialChars: boolean = false
): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specialChars = '!@#$%^&*(),.?":{}|<>'

  let charset = lowercase + uppercase + numbers
  if (includeSpecialChars) {
    charset += specialChars
  }

  let password = ''

  // 确保至少包含一个小写字母、一个大写字母和一个数字
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]

  if (includeSpecialChars) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)]
  }

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }

  // 打乱密码字符顺序
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * 检查密码是否过期（预留功能）
 * @param lastPasswordChange 上次密码更改时间
 * @param maxAgeInDays 密码最大有效期（天）
 * @returns 是否过期
 */
export function isPasswordExpired(
  lastPasswordChange: Date,
  maxAgeInDays: number = 90
): boolean {
  const ageInMs = Date.now() - lastPasswordChange.getTime()
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
  return ageInDays > maxAgeInDays
}

/**
 * 密码相似度检查（防止用户使用过于相似的新密码）
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @returns 相似度评分 (0-100, 越高越相似)
 */
export function calculatePasswordSimilarity(
  oldPassword: string,
  newPassword: string
): number {
  if (oldPassword === newPassword) return 100

  const old = oldPassword.toLowerCase()
  const newPwd = newPassword.toLowerCase()

  // 简单的编辑距离算法
  const matrix: number[][] = []
  const oldLen = old.length
  const newLen = newPwd.length

  for (let i = 0; i <= oldLen; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= newLen; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (old[i - 1] === newPwd[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + 1 // 替换
        )
      }
    }
  }

  const editDistance = matrix[oldLen][newLen]
  const maxLength = Math.max(oldLen, newLen)
  const similarity = ((maxLength - editDistance) / maxLength) * 100

  return Math.round(similarity)
}
