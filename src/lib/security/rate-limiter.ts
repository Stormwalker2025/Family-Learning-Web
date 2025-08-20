/**
 * Rate Limiter - 速率限制器
 * 提供API调用频率限制功能
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map()

  /**
   * 检查请求是否在速率限制范围内
   */
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const record = this.limits.get(key)

    if (!record || now > record.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  /**
   * 获取剩余请求次数
   */
  getRemainingRequests(key: string, maxRequests: number): number {
    const record = this.limits.get(key)
    if (!record || Date.now() > record.resetTime) {
      return maxRequests
    }
    return Math.max(0, maxRequests - record.count)
  }
}

export const rateLimiter = new RateLimiter()

// 定期清理过期记录
setInterval(() => {
  rateLimiter.cleanup()
}, 60000) // 每分钟清理一次