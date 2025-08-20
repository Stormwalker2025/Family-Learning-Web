/**
 * Audit Logger - 审计日志器
 * 记录系统安全事件和用户行为
 */

export interface AuditEvent {
  timestamp: Date
  userId?: string
  action: string
  resource?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class AuditLogger {
  private events: AuditEvent[] = []

  /**
   * 记录审计事件
   */
  log(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      timestamp: new Date(),
      ...event,
    }

    this.events.push(auditEvent)

    // 在生产环境中，这里应该写入到持久化存储
    console.log('[AUDIT]', JSON.stringify(auditEvent, null, 2))

    // 如果是高严重性事件，立即处理
    if (event.severity === 'critical' || event.severity === 'high') {
      this.handleHighSeverityEvent(auditEvent)
    }
  }

  /**
   * 处理高严重性事件
   */
  private handleHighSeverityEvent(event: AuditEvent): void {
    console.warn('[HIGH SEVERITY AUDIT EVENT]', event)
    // 这里可以添加告警逻辑，如发送邮件、短信等
  }

  /**
   * 记录登录事件
   */
  logLogin(userId: string, success: boolean, ipAddress?: string): void {
    this.log({
      userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      details: { success },
      ipAddress,
      severity: success ? 'low' : 'medium',
    })
  }

  /**
   * 记录数据访问事件
   */
  logDataAccess(
    userId: string,
    resource: string,
    action: string,
    ipAddress?: string
  ): void {
    this.log({
      userId,
      action: `DATA_${action.toUpperCase()}`,
      resource,
      ipAddress,
      severity: 'low',
    })
  }

  /**
   * 记录安全事件
   */
  logSecurityEvent(
    action: string,
    details: Record<string, any>,
    severity: AuditEvent['severity'] = 'medium',
    userId?: string,
    ipAddress?: string
  ): void {
    this.log({
      userId,
      action: `SECURITY_${action.toUpperCase()}`,
      details,
      ipAddress,
      severity,
    })
  }

  /**
   * 获取最近的审计事件
   */
  getRecentEvents(limit: number = 100): AuditEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * 根据用户ID获取事件
   */
  getEventsByUser(userId: string): AuditEvent[] {
    return this.events.filter((event) => event.userId === userId)
  }

  /**
   * 根据严重性级别获取事件
   */
  getEventsBySeverity(severity: AuditEvent['severity']): AuditEvent[] {
    return this.events.filter((event) => event.severity === severity)
  }
}

export const auditLogger = new AuditLogger()