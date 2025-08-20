import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from './rate-limiter'
import { validateUserInput } from './input-validator'
import { auditLogger } from './audit-logger'
import { anomalyDetector.recordUserBehavior } from './anomaly-detector'

export interface SecurityConfig {
  rateLimiter?: {
    requests: number
    window: number // in seconds
    skipSuccessfulRequests?: boolean
  }
  authentication?: {
    required: boolean
    allowedRoles?: string[]
  }
  inputValidation?: {
    enabled: boolean
    rules?: ValidationRule[]
  }
  auditLogging?: {
    enabled: boolean
    logLevel: 'basic' | 'detailed' | 'full'
  }
  csrf?: {
    enabled: boolean
    exemptMethods?: string[]
  }
  cors?: {
    enabled: boolean
    allowedOrigins: string[]
  }
}

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'email' | 'custom'
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean
}

/**
 * Main security middleware that applies multiple security controls
 */
export function withSecurity(config: SecurityConfig = {}) {
  return async function securityMiddleware(
    request: NextRequest,
    response: NextResponse
  ): Promise<NextResponse | Response> {
    const startTime = Date.now()
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const method = request.method
    const url = request.url

    try {
      // 1. Rate Limiting
      if (config.rateLimiter) {
        const rateLimiterResult = await rateLimiter({
          key: clientIp,
          requests: config.rateLimiter.requests,
          window: config.rateLimiter.window,
          skipSuccessful: config.rateLimiter.skipSuccessfulRequests,
        })

        if (!rateLimiterResult.allowed) {
          await auditLogger.logSecurityEvent({
            type: 'RATE_LIMIT_EXCEEDED',
            ip: clientIp,
            userAgent,
            url,
            metadata: {
              attempts: rateLimiterResult.attempts,
              resetTime: rateLimiterResult.resetTime,
            },
          })

          return new Response('Too Many Requests', {
            status: 429,
            headers: {
              'Retry-After': rateLimiterResult.resetTime.toString(),
              'X-RateLimit-Limit': config.rateLimiter.requests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimiterResult.resetTime.toString(),
            },
          })
        }
      }

      // 2. CORS Validation
      if (config.cors?.enabled) {
        const corsResult = validateCors(request, config.cors)
        if (!corsResult.valid) {
          await auditLogger.logSecurityEvent({
            type: 'CORS_VIOLATION',
            ip: clientIp,
            userAgent,
            url,
            metadata: { origin: request.headers.get('origin') },
          })

          return new Response('CORS Policy Violation', { status: 403 })
        }
      }

      // 3. Input Validation (for POST/PUT/PATCH requests)
      if (
        config.inputValidation?.enabled &&
        ['POST', 'PUT', 'PATCH'].includes(method)
      ) {
        try {
          const requestData = await getRequestBody(request)
          const validationResult = validateUserInput(
            requestData,
            config.inputValidation.rules || []
          )

          if (!validationResult.valid) {
            await auditLogger.logSecurityEvent({
              type: 'INPUT_VALIDATION_FAILED',
              ip: clientIp,
              userAgent,
              url,
              metadata: {
                errors: validationResult.errors,
                suspiciousInput: detectSuspiciousInput(requestData),
              },
            })

            return new Response(
              JSON.stringify({
                error: 'Invalid input',
                details: validationResult.errors,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }
        } catch (error) {
          // Handle JSON parsing errors
          return new Response('Invalid JSON', { status: 400 })
        }
      }

      // 4. Authentication Check
      if (config.authentication?.required) {
        const authResult = await validateAuthentication(request)
        if (!authResult.valid) {
          await auditLogger.logSecurityEvent({
            type: 'AUTHENTICATION_FAILED',
            ip: clientIp,
            userAgent,
            url,
            metadata: { reason: authResult.reason },
          })

          return new Response('Unauthorized', { status: 401 })
        }

        // Check role-based authorization
        if (
          config.authentication.allowedRoles &&
          !config.authentication.allowedRoles.includes(
            authResult.user?.role || ''
          )
        ) {
          await auditLogger.logSecurityEvent({
            type: 'AUTHORIZATION_FAILED',
            ip: clientIp,
            userAgent,
            url,
            metadata: {
              userId: authResult.user?.id,
              requiredRoles: config.authentication.allowedRoles,
              userRole: authResult.user?.role,
            },
          })

          return new Response('Forbidden', { status: 403 })
        }
      }

      // 5. CSRF Protection
      if (config.csrf?.enabled && isStateChangingMethod(method)) {
        const csrfResult = await validateCsrfToken(request)
        if (!csrfResult.valid) {
          await auditLogger.logSecurityEvent({
            type: 'CSRF_TOKEN_INVALID',
            ip: clientIp,
            userAgent,
            url,
            metadata: { reason: csrfResult.reason },
          })

          return new Response('CSRF Token Invalid', { status: 403 })
        }
      }

      // 6. Anomaly Detection
      const anomalyResult = await anomalyDetector.recordUserBehavior({
        ip: clientIp,
        userAgent,
        url,
        method,
        timestamp: Date.now(),
      })

      if (anomalyResult.suspicious) {
        await auditLogger.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          ip: clientIp,
          userAgent,
          url,
          metadata: {
            anomalies: anomalyResult.anomalies,
            riskScore: anomalyResult.riskScore,
          },
        })

        // High risk activities are blocked
        if (anomalyResult.riskScore > 0.8) {
          return new Response('Suspicious Activity Detected', { status: 429 })
        }
      }

      // 7. Security Headers
      const secureHeaders = getSecurityHeaders()
      Object.entries(secureHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // 8. Audit Logging
      if (config.auditLogging?.enabled) {
        const processingTime = Date.now() - startTime
        await auditLogger.logRequest({
          method,
          url,
          ip: clientIp,
          userAgent,
          status: response.status,
          processingTime,
          level: config.auditLogging.logLevel,
        })
      }

      return response
    } catch (error) {
      // Security middleware error - fail securely
      await auditLogger.logSecurityEvent({
        type: 'SECURITY_MIDDLEWARE_ERROR',
        ip: clientIp,
        userAgent,
        url,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      })

      return new Response('Internal Security Error', { status: 500 })
    }
  }
}

/**
 * Helper function to get client IP address
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to connection remote address
  return request.ip || 'unknown'
}

/**
 * Validate CORS policy
 */
function validateCors(
  request: NextRequest,
  corsConfig: NonNullable<SecurityConfig['cors']>
) {
  const origin = request.headers.get('origin')

  if (!origin) {
    return { valid: true } // Same-origin requests don't have Origin header
  }

  const isAllowed =
    corsConfig.allowedOrigins.includes('*') ||
    corsConfig.allowedOrigins.includes(origin)

  return {
    valid: isAllowed,
    origin,
  }
}

/**
 * Extract request body safely
 */
async function getRequestBody(request: NextRequest): Promise<any> {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData()
    const body: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      body[key] = value
    }
    return body
  }

  return {}
}

/**
 * Detect suspicious input patterns
 */
function detectSuspiciousInput(data: any): string[] {
  const suspicious: string[] = []
  const dataString = JSON.stringify(data).toLowerCase()

  // SQL injection patterns
  const sqlPatterns = [
    'union select',
    'drop table',
    'drop database',
    'xp_cmdshell',
    'sp_executesql',
    '--',
    ';--',
    'exec(',
    'execute(',
    'union all select',
    'insert into',
    'delete from',
    'update set',
  ]

  // XSS patterns
  const xssPatterns = [
    '<script',
    'javascript:',
    'onerror=',
    'onload=',
    'onclick=',
    'vbscript:',
    'data:text/html',
    'eval(',
    'alert(',
    'document.cookie',
  ]

  // Path traversal patterns
  const pathTraversalPatterns = [
    '../',
    '..\\',
    '..\/',
    '%2e%2e%2f',
    '%2e%2e%5c',
    '/etc/passwd',
    '/etc/shadow',
    'c:\\windows',
    '/proc/version',
  ]

  // Command injection patterns
  const commandInjectionPatterns = [
    '|',
    '&',
    ';',
    '$(',
    '`',
    'wget ',
    'curl ',
    'nc ',
    'netcat',
    'chmod ',
    'chown ',
    'rm -rf',
    'find /',
    'cat /etc',
  ]

  const allPatterns = [
    ...sqlPatterns.map(p => ({ pattern: p, type: 'SQL_INJECTION' })),
    ...xssPatterns.map(p => ({ pattern: p, type: 'XSS' })),
    ...pathTraversalPatterns.map(p => ({ pattern: p, type: 'PATH_TRAVERSAL' })),
    ...commandInjectionPatterns.map(p => ({
      pattern: p,
      type: 'COMMAND_INJECTION',
    })),
  ]

  for (const { pattern, type } of allPatterns) {
    if (dataString.includes(pattern)) {
      suspicious.push(type)
    }
  }

  return [...new Set(suspicious)] // Remove duplicates
}

/**
 * Validate authentication token
 */
async function validateAuthentication(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const sessionCookie = request.cookies.get('session-token')?.value

  const token = authHeader?.replace('Bearer ', '') || sessionCookie

  if (!token) {
    return { valid: false, reason: 'NO_TOKEN' }
  }

  try {
    // Verify JWT token (implementation depends on your auth system)
    const payload = await verifyJwtToken(token)

    if (!payload || !payload.sub) {
      return { valid: false, reason: 'INVALID_TOKEN' }
    }

    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'TOKEN_EXPIRED' }
    }

    return {
      valid: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    }
  } catch (error) {
    return { valid: false, reason: 'TOKEN_VERIFICATION_FAILED' }
  }
}

/**
 * Check if HTTP method changes state
 */
function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
}

/**
 * Validate CSRF token
 */
async function validateCsrfToken(request: NextRequest) {
  const csrfToken =
    request.headers.get('x-csrf-token') || request.headers.get('x-xsrf-token')

  const csrfCookie = request.cookies.get('csrf-token')?.value

  if (!csrfToken || !csrfCookie) {
    return { valid: false, reason: 'MISSING_CSRF_TOKEN' }
  }

  if (csrfToken !== csrfCookie) {
    return { valid: false, reason: 'CSRF_TOKEN_MISMATCH' }
  }

  return { valid: true }
}

/**
 * Generate security headers
 */
function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent content type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  }
}

/**
 * JWT token verification (placeholder - implement based on your auth system)
 */
async function verifyJwtToken(token: string): Promise<any> {
  // This should implement your actual JWT verification logic
  // For example, using jsonwebtoken library or your auth provider's SDK
  throw new Error('JWT verification not implemented')
}

/**
 * Specific middleware for different route types
 */
export const apiSecurity = withSecurity({
  rateLimiter: { requests: 100, window: 900 }, // 100 requests per 15 minutes
  authentication: { required: true },
  inputValidation: { enabled: true },
  auditLogging: { enabled: true, logLevel: 'detailed' },
  csrf: { enabled: true },
  cors: { enabled: true, allowedOrigins: ['http://localhost:3000'] },
})

export const publicApiSecurity = withSecurity({
  rateLimiter: { requests: 50, window: 900 }, // 50 requests per 15 minutes
  inputValidation: { enabled: true },
  auditLogging: { enabled: true, logLevel: 'basic' },
  cors: { enabled: true, allowedOrigins: ['http://localhost:3000'] },
})

export const adminApiSecurity = withSecurity({
  rateLimiter: { requests: 200, window: 900 }, // 200 requests per 15 minutes
  authentication: { required: true, allowedRoles: ['admin', 'teacher'] },
  inputValidation: { enabled: true },
  auditLogging: { enabled: true, logLevel: 'full' },
  csrf: { enabled: true },
  cors: { enabled: true, allowedOrigins: ['http://localhost:3000'] },
})
