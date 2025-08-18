// 认证系统配置文件
// Family Learning Web Platform Authentication Configuration

// JWT 相关配置
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'family-learning-jwt-secret-2024',
  accessTokenExpiry: '24h', // 访问令牌有效期
  refreshTokenExpiry: '7d', // 刷新令牌有效期
  issuer: 'family-learning-web',
  audience: 'family-learning-users'
} as const

// 会话配置
export const SESSION_CONFIG = {
  cookieName: 'family-learning-session',
  maxAge: 24 * 60 * 60 * 1000, // 24小时（毫秒）
  secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
  sameSite: 'lax' as const,
  httpOnly: true
} as const

// 密码安全配置
export const PASSWORD_CONFIG = {
  minLength: 6,
  requireNumbers: false, // 考虑到年幼学生使用
  requireUppercase: false,
  requireSpecialChars: false,
  bcryptRounds: 12 // bcrypt加密轮数
} as const

// 登录安全配置
export const LOGIN_SECURITY = {
  maxFailedAttempts: 5, // 最大失败尝试次数
  lockoutDuration: 15 * 60 * 1000, // 锁定时间15分钟（毫秒）
  rateLimitWindow: 15 * 60 * 1000, // 限频窗口15分钟
  rateLimitMaxRequests: 10 // 窗口期内最大请求数
} as const

// 角色权限配置
export const ROLE_PERMISSIONS = {
  STUDENT: {
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canViewOwnProgress: true,
    canSubmitExercises: true,
    canViewVocabulary: true,
    canAccessHomework: true,
    canManageUsers: false,
    canViewSystemLogs: false
  },
  PARENT: {
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canViewOwnProgress: true,
    canSubmitExercises: false,
    canViewVocabulary: false,
    canAccessHomework: true,
    canManageUsers: false,
    canViewSystemLogs: false,
    canViewChildrenProgress: true,
    canAssignHomework: true,
    canManageUnlockRules: true
  },
  ADMIN: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canViewOwnProgress: true,
    canSubmitExercises: true,
    canViewVocabulary: true,
    canAccessHomework: true,
    canManageUsers: true,
    canViewSystemLogs: true,
    canViewChildrenProgress: true,
    canAssignHomework: true,
    canManageUnlockRules: true,
    canManageSystem: true
  }
} as const

// 家庭成员关系配置
export const FAMILY_CONFIG = {
  maxMembersPerFamily: 10,
  defaultTimezone: 'Australia/Brisbane',
  parentalCodes: {
    minLength: 4,
    maxLength: 8,
    alphanumeric: true
  }
} as const

// 路由保护配置
export const PROTECTED_ROUTES = {
  // 需要认证的路由
  requireAuth: [
    '/dashboard',
    '/exercises',
    '/vocabulary',
    '/homework',
    '/admin',
    '/profile'
  ],
  // 管理员专用路由
  adminOnly: [
    '/admin',
    '/admin/*'
  ],
  // 家长和管理员路由
  parentOrAdmin: [
    '/homework/assign',
    '/admin/users',
    '/reports'
  ],
  // 公开路由（不需要认证）
  public: [
    '/',
    '/login',
    '/about',
    '/help'
  ]
} as const

// 环境变量验证
export function validateAuthConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is required')
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 获取客户端安全配置（不包含敏感信息）
export function getClientAuthConfig() {
  return {
    passwordRequirements: PASSWORD_CONFIG,
    sessionTimeout: SESSION_CONFIG.maxAge,
    rateLimits: {
      maxAttempts: LOGIN_SECURITY.maxFailedAttempts,
      lockoutDuration: LOGIN_SECURITY.lockoutDuration
    }
  }
}