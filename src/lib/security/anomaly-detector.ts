/**
 * Anomaly Detector - 异常检测器
 * 检测异常用户行为和安全威胁
 */

interface UserBehavior {
  userId: string
  lastActivity: Date
  requestCount: number
  failedLogins: number
  suspiciousActions: string[]
}

interface AnomalyRule {
  name: string
  condition: (behavior: UserBehavior) => boolean
  severity: 'low' | 'medium' | 'high'
  action: string
}

class AnomalyDetector {
  private userBehaviors: Map<string, UserBehavior> = new Map()
  private rules: AnomalyRule[] = []

  constructor() {
    this.initializeRules()
  }

  /**
   * 初始化异常检测规则
   */
  private initializeRules(): void {
    this.rules = [
      {
        name: 'excessive_requests',
        condition: (behavior) => behavior.requestCount > 100, // 1分钟内超过100次请求
        severity: 'high',
        action: 'rate_limit',
      },
      {
        name: 'multiple_failed_logins',
        condition: (behavior) => behavior.failedLogins > 5, // 5次登录失败
        severity: 'medium',
        action: 'account_lock',
      },
      {
        name: 'suspicious_activity_pattern',
        condition: (behavior) => behavior.suspiciousActions.length > 3,
        severity: 'high',
        action: 'security_review',
      },
    ]
  }

  /**
   * 记录用户行为
   */
  recordUserBehavior(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    const behavior = this.userBehaviors.get(userId) || {
      userId,
      lastActivity: new Date(),
      requestCount: 0,
      failedLogins: 0,
      suspiciousActions: [],
    }

    behavior.lastActivity = new Date()
    behavior.requestCount++

    // 记录特定类型的行为
    if (action === 'login_failed') {
      behavior.failedLogins++
    }

    if (this.isSuspiciousAction(action, metadata)) {
      behavior.suspiciousActions.push(action)
    }

    this.userBehaviors.set(userId, behavior)

    // 检测异常
    this.detectAnomalies(userId)
  }

  /**
   * 判断是否为可疑行为
   */
  private isSuspiciousAction(
    action: string,
    metadata?: Record<string, any>
  ): boolean {
    const suspiciousPatterns = [
      'sql_injection_attempt',
      'xss_attempt',
      'unauthorized_access',
      'data_scraping',
      'brute_force_attempt',
    ]

    return suspiciousPatterns.includes(action)
  }

  /**
   * 检测用户异常
   */
  private detectAnomalies(userId: string): void {
    const behavior = this.userBehaviors.get(userId)
    if (!behavior) return

    for (const rule of this.rules) {
      if (rule.condition(behavior)) {
        this.handleAnomaly(userId, rule, behavior)
      }
    }
  }

  /**
   * 处理检测到的异常
   */
  private handleAnomaly(
    userId: string,
    rule: AnomalyRule,
    behavior: UserBehavior
  ): void {
    console.warn(`[ANOMALY DETECTED] ${rule.name} for user ${userId}`, {
      rule: rule.name,
      severity: rule.severity,
      action: rule.action,
      behavior: {
        requestCount: behavior.requestCount,
        failedLogins: behavior.failedLogins,
        suspiciousActions: behavior.suspiciousActions.length,
      },
    })

    // 执行相应的安全措施
    switch (rule.action) {
      case 'rate_limit':
        this.applyRateLimit(userId)
        break
      case 'account_lock':
        this.lockAccount(userId)
        break
      case 'security_review':
        this.triggerSecurityReview(userId)
        break
    }
  }

  /**
   * 应用速率限制
   */
  private applyRateLimit(userId: string): void {
    console.log(`Applying rate limit to user: ${userId}`)
    // 实现速率限制逻辑
  }

  /**
   * 锁定账户
   */
  private lockAccount(userId: string): void {
    console.log(`Locking account: ${userId}`)
    // 实现账户锁定逻辑
  }

  /**
   * 触发安全审查
   */
  private triggerSecurityReview(userId: string): void {
    console.log(`Triggering security review for user: ${userId}`)
    // 实现安全审查逻辑
  }

  /**
   * 重置用户行为计数器
   */
  resetUserBehavior(userId: string): void {
    const behavior = this.userBehaviors.get(userId)
    if (behavior) {
      behavior.requestCount = 0
      behavior.failedLogins = 0
      behavior.suspiciousActions = []
      this.userBehaviors.set(userId, behavior)
    }
  }

  /**
   * 清理过期的用户行为数据
   */
  cleanupExpiredData(): void {
    const now = Date.now()
    const expirationTime = 60 * 1000 // 1分钟

    for (const [userId, behavior] of this.userBehaviors.entries()) {
      if (now - behavior.lastActivity.getTime() > expirationTime) {
        this.userBehaviors.delete(userId)
      }
    }
  }

  /**
   * 获取用户当前的行为状态
   */
  getUserBehavior(userId: string): UserBehavior | undefined {
    return this.userBehaviors.get(userId)
  }
}

export const anomalyDetector = new AnomalyDetector()

// 定期清理过期数据
setInterval(() => {
  anomalyDetector.cleanupExpiredData()
}, 60000) // 每分钟清理一次