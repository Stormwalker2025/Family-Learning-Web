# System Architecture Documentation

## 1. 技术栈概览 (Technology Stack Overview)

### 1.1 核心技术栈
```typescript
interface TechStack {
  frontend: {
    framework: "Next.js 14";
    language: "TypeScript";
    styling: "Tailwind CSS";
    components: "shadcn/ui";
    stateManagement: "React Server Components + Client State";
    testing: "Vitest + React Testing Library + Playwright";
  };
  
  backend: {
    api: "Next.js API Routes";
    database: "SQLite (via Prisma)";
    orm: "Prisma ORM";
    authentication: "JWT + Custom Auth";
    fileHandling: "Multer + Sharp";
    validation: "Zod";
  };
  
  infrastructure: {
    deployment: "Vercel / Self-hosted";
    monitoring: "Built-in logging + Error boundaries";
    cicd: "GitHub Actions";
    security: "OWASP guidelines compliance";
  };
}
```

### 1.2 架构原则
- **单一职责**: 每个模块和组件都有清晰的职责边界
- **关注点分离**: UI、业务逻辑、数据访问层明确分离
- **可测试性**: 所有关键功能都有对应的单元测试和集成测试
- **可扩展性**: 模块化设计支持功能的增量添加
- **安全优先**: 所有数据访问和用户输入都经过验证和清理

## 2. Next.js 目录结构 (Directory Structure)

```
src/
├── app/                          # App Router (Next.js 13+)
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # 主控制面板路由组
│   │   ├── assignments/          # 作业管理
│   │   ├── progress/             # 学习进度
│   │   └── mistakes/             # 错题本
│   ├── (exercises)/              # 练习模块路由组
│   │   ├── english/
│   │   ├── mathematics/
│   │   └── hass/
│   ├── (admin)/                  # 管理员路由组
│   │   ├── users/
│   │   ├── content/
│   │   └── analytics/
│   ├── api/                      # API 路由
│   │   ├── auth/
│   │   ├── exercises/
│   │   ├── homework/
│   │   ├── users/
│   │   └── ipad-unlock/
│   ├── globals.css
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 首页
├── components/                   # 可重用组件
│   ├── ui/                      # 基础 UI 组件 (shadcn/ui)
│   ├── auth/                    # 认证相关组件
│   ├── exercises/               # 练习相关组件
│   ├── homework/                # 作业相关组件
│   ├── layout/                  # 布局组件
│   └── forms/                   # 表单组件
├── features/                     # 功能模块 (Feature-based organization)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── exercises/
│   ├── homework/
│   ├── ipad-unlock/
│   └── analytics/
├── lib/                         # 工具函数和配置
│   ├── auth/
│   ├── db/
│   ├── validations/
│   └── utils.ts
├── types/                       # TypeScript 类型定义
└── data/                        # 静态数据和种子数据
```

## 3. API 边界设计 (API Boundary Design)

### 3.1 RESTful API 结构
```typescript
interface APIStructure {
  // 认证相关
  '/api/auth': {
    'POST /login': LoginRequest;
    'POST /register': RegisterRequest;
    'POST /logout': void;
    'GET /me': UserProfile;
    'POST /reset-password': ResetPasswordRequest;
  };
  
  // 练习相关
  '/api/exercises': {
    'GET /': ExerciseList;
    'GET /:id': ExerciseDetail;
    'POST /:id/submit': SubmissionRequest;
    'GET /subjects': SubjectList;
    'GET /topics/:subject': TopicList;
  };
  
  // 作业系统
  '/api/homework': {
    'GET /assignments': AssignmentList;
    'POST /assignments': CreateAssignmentRequest;
    'GET /assignments/:id': AssignmentDetail;
    'POST /assignments/:id/submit': HomeworkSubmission;
    'GET /submissions': SubmissionHistory;
  };
  
  // 用户管理
  '/api/users': {
    'GET /': UserList;  // Admin only
    'GET /:id': UserProfile;
    'PATCH /:id': UpdateUserRequest;
    'DELETE /:id': DeleteUserRequest;  // Admin only
  };
  
  // iPad解锁系统
  '/api/ipad-unlock': {
    'POST /evaluate': UnlockEvaluationRequest;
    'GET /rules': UnlockRulesList;
    'POST /rules': CreateUnlockRule;  // Parent/Admin only
    'GET /history': UnlockHistory;
  };
  
  // 错题本
  '/api/mistakes': {
    'GET /': MistakeList;
    'POST /': AddMistakeRequest;
    'DELETE /:id': void;
    'GET /analytics': MistakeAnalytics;
  };
}
```

### 3.2 API 设计原则
- **一致性**: 统一的响应格式和错误处理
- **版本控制**: 通过 header 或 URL 进行版本管理
- **分页**: 大数据集的标准分页实现
- **缓存**: 适当的缓存策略和 ETags
- **限流**: 基于用户和IP的请求频率限制

### 3.3 响应格式标准
```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}
```

## 4. Prisma Schema 设计 (Database Schema)

### 4.1 核心数据模型
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 用户模型
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String
  passwordHash String
  role        UserRole @default(STUDENT)
  
  // 家长-学生关系
  childOfId   String?
  childOf     User?    @relation("ParentChild", fields: [childOfId], references: [id])
  children    User[]   @relation("ParentChild")
  
  // 关联数据
  attempts    Attempt[]
  assignments Assignment[]
  unlockLogs  UnlockLog[]
  mistakes    Mistake[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("users")
}

// 作业模型
model Assignment {
  id          String   @id @default(cuid())
  title       String
  description String?
  grade       Int      // Year level (3, 6, etc.)
  subject     Subject
  dueAt       DateTime?
  
  // 关联
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  questions   Question[]
  attempts    Attempt[]
  
  // 设置
  timeLimit   Int?     // minutes
  maxAttempts Int      @default(3)
  isPublished Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("assignments")
}

// 题目模型
model Question {
  id           String     @id @default(cuid())
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  
  type         QuestionType
  title        String?
  content      Json       // 题目内容 (DSL format)
  answerKey    Json       // 正确答案
  explanation  String?
  
  difficulty   Difficulty @default(MEDIUM)
  points       Int        @default(1)
  order        Int        @default(0)
  
  // 元数据
  tags         String[]   @default([])
  yearLevel    Int?
  subject      Subject?
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@map("questions")
}

// 答题记录模型
model Attempt {
  id           String     @id @default(cuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  
  // 成绩和状态
  score        Float?     // 0-100
  maxScore     Float      @default(100)
  status       AttemptStatus @default(IN_PROGRESS)
  
  // 答题数据
  answers      Json       // 用户答案
  timeSpent    Int?       // seconds
  
  // 分析数据
  correctCount Int        @default(0)
  totalCount   Int        @default(0)
  
  // 解锁相关
  unlockLogs   UnlockLog[]
  
  startedAt    DateTime   @default(now())
  completedAt  DateTime?
  createdAt    DateTime   @default(now())
  
  @@map("attempts")
}

// iPad解锁规则模型
model UnlockRule {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // 规则配置
  criteria    Json     // 解锁条件 (JSON schema)
  action      Json     // 解锁动作 (解锁时长等)
  
  // 设置
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  stackable   Boolean  @default(false)
  
  // 限制
  maxDaily    Int?     // 每日最大解锁时长
  maxWeekly   Int?     // 每周最大解锁时长
  
  // 关联
  unlockLogs  UnlockLog[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("unlock_rules")
}

// 解锁记录模型
model UnlockLog {
  id         String     @id @default(cuid())
  userId     String
  user       User       @relation(fields: [userId], references: [id])
  attemptId  String?
  attempt    Attempt?   @relation(fields: [attemptId], references: [id])
  ruleId     String
  rule       UnlockRule @relation(fields: [ruleId], references: [id])
  
  // 解锁信息
  minutes    Int        // 解锁时长
  reason     String?    // 解锁原因
  metadata   Json?      // 额外信息
  
  // 使用状态
  isUsed     Boolean    @default(false)
  usedAt     DateTime?
  
  createdAt  DateTime   @default(now())
  
  @@map("unlock_logs")
}

// 错题记录模型
model Mistake {
  id           String     @id @default(cuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  
  // 错题信息
  questionType QuestionType
  subject      Subject
  topic        String?
  difficulty   Difficulty
  
  // 题目内容 (简化存储)
  questionText String
  correctAnswer String
  userAnswer   String
  explanation  String?
  
  // 复习状态
  reviewCount  Int        @default(0)
  lastReviewed DateTime?
  isResolved   Boolean    @default(false)
  
  // 分析数据
  mistakeType  String?    // 错误类型分类
  tags         String[]   @default([])
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@map("mistakes")
}

// 单词本模型
model Wordbook {
  id        String   @id @default(cuid())
  grade     Int      // Year level
  words     Json     // 单词列表和相关信息
  
  // 元数据
  subject   String   @default("english")
  topic     String?
  difficulty Difficulty @default(MEDIUM)
  
  // 统计
  wordCount Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("wordbooks")
}

// 枚举定义
enum UserRole {
  STUDENT
  PARENT
  ADMIN
  TEACHER
}

enum Subject {
  ENGLISH
  MATHEMATICS
  HASS
  SCIENCE
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  MATCHING
  FILL_BLANK
  SHORT_ANSWER
  ESSAY
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  CHALLENGE
}

enum AttemptStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  TIME_UP
}
```

## 5. 鉴权策略 (Authentication Strategy)

### 5.1 JWT 实现
```typescript
interface AuthSystem {
  // JWT 配置
  jwtConfig: {
    algorithm: 'HS256';
    expiresIn: '24h';
    refreshTokenExpiresIn: '7d';
    issuer: 'family-learning-web';
    audience: 'students-parents';
  };
  
  // 令牌结构
  accessToken: {
    sub: string;        // User ID
    email: string;      // User email
    role: UserRole;     // User role
    permissions: string[]; // Specific permissions
    exp: number;        // Expiration time
    iat: number;        // Issued at time
  };
  
  // 刷新令牌
  refreshToken: {
    sub: string;        // User ID
    tokenId: string;    // Unique token ID
    exp: number;        // Expiration time
  };
}
```

### 5.2 权限控制系统
```typescript
interface PermissionSystem {
  // 基础权限
  basePermissions: {
    STUDENT: [
      'exercise:attempt',
      'homework:submit',
      'mistake:view_own',
      'progress:view_own'
    ];
    PARENT: [
      'child:view_progress',
      'child:manage_settings',
      'unlock_rule:create',
      'unlock_rule:modify_own'
    ];
    ADMIN: [
      'user:manage',
      'content:manage',
      'system:configure',
      'analytics:view_all'
    ];
  };
  
  // 资源级权限检查
  resourcePermissions: {
    checkOwnership: (userId: string, resourceId: string) => boolean;
    checkParentChild: (parentId: string, childId: string) => boolean;
    checkAssignmentAccess: (userId: string, assignmentId: string) => boolean;
  };
}
```

### 5.3 中间件实现
```typescript
// API 路由保护中间件
export const withAuth = (
  handler: NextApiHandler,
  requiredPermissions?: string[]
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // JWT 验证
      const token = extractTokenFromHeader(req.headers.authorization);
      const decoded = verifyJWT(token);
      
      // 权限检查
      if (requiredPermissions) {
        const hasPermission = checkPermissions(decoded.permissions, requiredPermissions);
        if (!hasPermission) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }
      
      // 附加用户信息到请求
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  };
};
```

## 6. 组件分层设计 (Component Architecture)

### 6.1 分层结构
```
components/
├── ui/              # 原子级组件 (Atomic Design)
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── Modal/
├── composite/       # 复合组件
│   ├── QuestionCard/
│   ├── ProgressChart/
│   └── UserProfile/
├── feature/         # 功能组件
│   ├── ExercisePlayer/
│   ├── HomeworkSubmission/
│   └── IpadUnlockPanel/
├── layout/          # 布局组件
│   ├── Header/
│   ├── Sidebar/
│   └── PageLayout/
└── providers/       # 上下文提供者
    ├── AuthProvider/
    ├── ThemeProvider/
    └── NotificationProvider/
```

### 6.2 组件设计原则
```typescript
// 组件接口设计示例
interface ExercisePlayerProps {
  // 必需属性
  exerciseId: string;
  userId: string;
  
  // 可选配置
  timeLimit?: number;
  showHints?: boolean;
  allowRetry?: boolean;
  
  // 事件处理
  onComplete?: (result: ExerciseResult) => void;
  onProgress?: (progress: ProgressUpdate) => void;
  onError?: (error: ExerciseError) => void;
  
  // 样式定制
  className?: string;
  theme?: 'light' | 'dark' | 'high-contrast';
}

// 组件实现模式
export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exerciseId,
  userId,
  timeLimit,
  showHints = true,
  allowRetry = false,
  onComplete,
  onProgress,
  onError,
  className,
  theme = 'light'
}) => {
  // Hooks for state management
  const { exercise, loading, error } = useExercise(exerciseId);
  const { submitAnswer, progress } = useExerciseProgress(exerciseId, userId);
  
  // Event handlers
  const handleAnswerSubmit = useCallback(async (answer: Answer) => {
    try {
      const result = await submitAnswer(answer);
      onProgress?.(result.progress);
      
      if (result.isComplete) {
        onComplete?.(result.finalResult);
      }
    } catch (error) {
      onError?.(error as ExerciseError);
    }
  }, [submitAnswer, onProgress, onComplete, onError]);
  
  // Render logic with proper error boundaries and loading states
  if (loading) return <ExercisePlayerSkeleton />;
  if (error) return <ExercisePlayerError error={error} onRetry={() => {}} />;
  if (!exercise) return <ExercisePlayerNotFound />;
  
  return (
    <div className={cn('exercise-player', className, `theme-${theme}`)}>
      {/* Component implementation */}
    </div>
  );
};
```

## 7. 安全基线 (Security Baseline)

### 7.1 输入校验
```typescript
// Zod 验证 schemas
const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  grade: z.number().int().min(3).max(12),
  subject: z.enum(['ENGLISH', 'MATHEMATICS', 'HASS', 'SCIENCE']),
  dueAt: z.string().datetime().optional(),
  timeLimit: z.number().int().min(1).max(180).optional(),
  questions: z.array(QuestionSchema).min(1).max(50)
});

// API 路由中的验证
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateAssignmentSchema.parse(body);
    
    // 处理已验证的数据
    return await createAssignment(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### 7.2 速率限制
```typescript
// 速率限制配置
interface RateLimitConfig {
  auth: {
    login: '5 requests per 5 minutes per IP';
    register: '3 requests per hour per IP';
    resetPassword: '3 requests per hour per email';
  };
  api: {
    general: '100 requests per minute per user';
    exercise: '10 submissions per minute per user';
    upload: '5 uploads per hour per user';
  };
  public: {
    general: '50 requests per minute per IP';
  };
}

// 中间件实现
export const withRateLimit = (
  config: { requests: number; window: number; keyGenerator?: (req: Request) => string }
) => {
  return async (req: Request) => {
    const key = config.keyGenerator?.(req) || getClientIP(req);
    const isAllowed = await checkRateLimit(key, config.requests, config.window);
    
    if (!isAllowed) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    
    return null; // Continue to next middleware
  };
};
```

### 7.3 审计日志
```typescript
// 审计日志接口
interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// 审计日志记录函数
export const auditLog = async (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const logEntry: AuditLog = {
    ...entry,
    id: generateId(),
    timestamp: new Date(),
  };
  
  // 记录到数据库
  await db.auditLog.create({ data: logEntry });
  
  // 高风险操作额外记录到外部日志系统
  if (isHighRiskAction(entry.action)) {
    await externalLogger.log(logEntry);
  }
};
```

## 8. 扩展路线 (Scalability Roadmap)

### 8.1 短期扩展 (0-6个月)
- **性能优化**: React Server Components 全面应用
- **缓存策略**: Redis 集成用于会话和频繁查询数据缓存
- **数据库优化**: SQLite → PostgreSQL 迁移准备
- **监控系统**: 应用性能监控 (APM) 集成

### 8.2 中期扩展 (6-18个月)
- **微服务架构**: 按领域拆分服务 (认证、内容、分析)
- **消息队列**: 异步任务处理 (邮件发送、数据导出)
- **CDN集成**: 静态资源和媒体文件的全球分发
- **多租户支持**: 学校级别的数据隔离

### 8.3 长期扩展 (18个月+)
- **机器学习平台**: 个性化推荐和自适应学习
- **实时协作**: WebSocket 支持的实时功能
- **移动应用**: React Native 或原生应用开发
- **国际化**: 多语言和多地区支持

### 8.4 技术债务管理
- **代码质量**: 定期重构和技术债务评估
- **依赖管理**: 自动化的安全更新和版本管理
- **文档维护**: 架构决策记录 (ADR) 和API文档自动化
- **测试覆盖**: 持续提升测试覆盖率和质量