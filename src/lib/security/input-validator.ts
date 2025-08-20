/**
 * Input Validator - 输入验证器
 * 提供输入数据安全验证功能
 */

import { z } from 'zod'

/**
 * 检查输入是否包含恶意内容
 */
export function containsMaliciousContent(input: string): boolean {
  const maliciousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
    /window\.location/gi,
  ]

  return maliciousPatterns.some((pattern) => pattern.test(input))
}

/**
 * 清理HTML内容
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 验证文件上传
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options

  if (file.size > maxSize) {
    return { valid: false, error: '文件大小超出限制' }
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' }
  }

  return { valid: true }
}

/**
 * SQL注入检测
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
    /(\b(UNION|JOIN|WHERE|ORDER BY|GROUP BY)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b|\bAND\b).*?=.*?('|")/gi,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * XSS检测
 */
export function detectXss(input: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * 验证用户输入的通用函数
 */
export function validateUserInput(
  input: string,
  options: {
    maxLength?: number
    minLength?: number
    allowHtml?: boolean
    checkXss?: boolean
    checkSql?: boolean
  } = {}
): { valid: boolean; errors: string[] } {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHtml = false,
    checkXss = true,
    checkSql = true,
  } = options

  const errors: string[] = []

  if (input.length < minLength) {
    errors.push(`输入长度不能少于${minLength}个字符`)
  }

  if (input.length > maxLength) {
    errors.push(`输入长度不能超过${maxLength}个字符`)
  }

  if (checkXss && detectXss(input)) {
    errors.push('输入包含潜在的XSS攻击代码')
  }

  if (checkSql && detectSqlInjection(input)) {
    errors.push('输入包含潜在的SQL注入代码')
  }

  if (!allowHtml && /<[^>]*>/g.test(input)) {
    errors.push('不允许HTML标签')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}