// JWT 令牌处理工具
// JWT token utilities for authentication

import jwt from 'jsonwebtoken'
import { JWTPayload, User } from '@/types'
import { JWT_CONFIG } from './config'

/**
 * 生成访问令牌
 * @param user 用户信息
 * @returns JWT访问令牌
 */
export function generateAccessToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    familyId: user.familyId,
  }

  return jwt.sign(payload, JWT_CONFIG.secret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    expiresIn: JWT_CONFIG.accessTokenExpiry,
  })
}

/**
 * 生成刷新令牌
 * @param user 用户信息
 * @returns JWT刷新令牌
 */
export function generateRefreshToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
    type: 'refresh',
  }

  return jwt.sign(payload, JWT_CONFIG.secret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
  })
}

/**
 * 验证并解析JWT令牌
 * @param token JWT令牌
 * @returns 解析后的载荷或null（如果无效）
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error('JWT验证失败:', error)
    return null
  }
}

/**
 * 从令牌中提取载荷（不验证签名，用于调试）
 * @param token JWT令牌
 * @returns 载荷内容或null
 */
export function decodeTokenUnsafe(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error('JWT解码失败:', error)
    return null
  }
}

/**
 * 检查令牌是否即将过期
 * @param token JWT令牌
 * @param bufferMinutes 缓冲时间（分钟），默认5分钟
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(
  token: string,
  bufferMinutes: number = 5
): boolean {
  const payload = decodeTokenUnsafe(token)
  if (!payload?.exp) return true

  const expiryTime = payload.exp * 1000 // 转换为毫秒
  const bufferTime = bufferMinutes * 60 * 1000 // 缓冲时间（毫秒）
  const currentTime = Date.now()

  return expiryTime - currentTime <= bufferTime
}

/**
 * 获取令牌剩余有效时间
 * @param token JWT令牌
 * @returns 剩余秒数，-1表示已过期或无效
 */
export function getTokenRemainingTime(token: string): number {
  const payload = decodeTokenUnsafe(token)
  if (!payload?.exp) return -1

  const expiryTime = payload.exp * 1000
  const currentTime = Date.now()
  const remainingMs = expiryTime - currentTime

  return remainingMs > 0 ? Math.floor(remainingMs / 1000) : -1
}

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 * @param user 用户信息
 * @returns 新的访问令牌或null
 */
export function refreshAccessToken(
  refreshToken: string,
  user: User
): string | null {
  try {
    const payload = jwt.verify(refreshToken, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as any

    // 验证令牌类型和用户ID
    if (payload.type !== 'refresh' || payload.userId !== user.id) {
      return null
    }

    // 生成新的访问令牌
    return generateAccessToken(user)
  } catch (error) {
    console.error('刷新令牌验证失败:', error)
    return null
  }
}

/**
 * 创建令牌黑名单项（用于注销）
 * @param token JWT令牌
 * @returns 黑名单项信息
 */
export function createTokenBlacklistEntry(token: string): {
  jti: string
  exp: number
} | null {
  const payload = decodeTokenUnsafe(token)
  if (!payload) return null

  return {
    jti: payload.userId + '_' + payload.iat,
    exp: payload.exp,
  }
}

/**
 * 验证令牌格式
 * @param token 候选令牌字符串
 * @returns 是否为有效的JWT格式
 */
export function isValidJWTFormat(token: string): boolean {
  const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
  return jwtRegex.test(token)
}

/**
 * 从请求头中提取Bearer令牌
 * @param authHeader Authorization头部值
 * @returns 提取的令牌或null
 */
export function extractBearerToken(
  authHeader: string | undefined
): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  const token = parts[1]
  return isValidJWTFormat(token) ? token : null
}

/**
 * 生成API密钥（用于服务间通信）
 * @param service 服务名称
 * @param permissions 权限列表
 * @returns API密钥
 */
export function generateApiKey(
  service: string,
  permissions: string[] = []
): string {
  const payload = {
    service,
    permissions,
    type: 'api_key',
    iat: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, JWT_CONFIG.secret, {
    issuer: JWT_CONFIG.issuer,
    audience: 'api',
    noTimestamp: false,
  })
}
