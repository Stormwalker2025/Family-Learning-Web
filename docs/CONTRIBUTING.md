# Contributing to Family Learning Web

## 🎯 项目概述

Family Learning Web 是一个为澳洲学生和家庭设计的本地化教育平台，支持 Queensland Curriculum 标准，包含作业管理、智能练习、iPad 解锁规则和错题本等核心功能。

## 📋 分支策略 (Branching Strategy)

### 分支模型
我们使用基于 **Git Flow** 的简化版本：

```
master (main)           ←─ 生产分支，受保护
├── develop            ←─ 开发主分支  
├── feature/*          ←─ 功能开发分支
├── bugfix/*           ←─ Bug 修复分支
├── hotfix/*           ←─ 紧急修复分支
└── release/*          ←─ 发版准备分支
```

### 分支命名规范

#### 功能分支 (Feature Branches)
```bash
feature/hw-system-core          # 作业系统核心
feature/ipad-unlock-rules       # iPad解锁规则
feature/mistake-book           # 错题本功能
feature/csv-import-tool        # CSV导入工具
feature/auth-parent-child      # 家长-学生认证
```

#### 修复分支 (Bugfix Branches)
```bash
bugfix/login-validation-error   # 登录验证错误
bugfix/exercise-timer-issue     # 练习计时器问题
bugfix/responsive-layout        # 响应式布局修复
```

#### 紧急修复分支 (Hotfix Branches)
```bash
hotfix/security-patch-2024-01   # 安全补丁
hotfix/data-corruption-fix      # 数据损坏修复
```

### 分支操作流程

#### 1. 创建功能分支
```bash
# 从 develop 分支创建新功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 开发完成后推送分支
git add .
git commit -m "feat: implement core homework system functionality"
git push -u origin feature/your-feature-name
```

#### 2. 提交代码规范
```bash
# 遵循 Conventional Commits 规范
git commit -m "type(scope): description"

# 类型说明
feat:     新功能
fix:      Bug修复  
docs:     文档更新
style:    代码格式调整（不影响功能）
refactor: 重构代码
test:     测试相关
chore:    构建/工具配置等

# 示例
git commit -m "feat(homework): add assignment creation wizard"
git commit -m "fix(auth): resolve parent-child relationship validation"
git commit -m "docs(api): update homework endpoints documentation"
git commit -m "test(exercises): add unit tests for question types"
```

#### 3. Pull Request 创建
```bash
# 确保分支是最新的
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git rebase develop  # 或使用 merge

# 推送更新并创建 PR
git push origin feature/your-feature-name
# 然后在 GitHub 上创建 Pull Request
```

## 🔍 代码审核清单 (Code Review Checklist)

### 功能审核 ✅
- [ ] **功能完整性**: 功能是否按需求文档完整实现？
- [ ] **边界条件**: 是否处理了异常输入和边界情况？
- [ ] **用户体验**: 界面交互是否符合 UX 设计文档？
- [ ] **无障碍性**: 是否遵循 WCAG 2.1 AA 标准？
- [ ] **响应式设计**: 在不同设备上是否正常显示？

### 代码质量 ✅
- [ ] **代码规范**: 是否遵循 ESLint 和 Prettier 规则？
- [ ] **类型安全**: TypeScript 类型是否正确定义？
- [ ] **组件设计**: 组件是否可复用且职责单一？
- [ ] **性能考虑**: 是否存在性能瓶颈（大量重新渲染、内存泄漏等）？
- [ ] **错误处理**: 是否有适当的错误边界和异常处理？

### 安全审核 ✅
- [ ] **输入验证**: 所有用户输入是否经过验证？
- [ ] **权限检查**: 是否正确实现了权限控制？
- [ ] **数据脱敏**: 敏感数据是否被适当保护？
- [ ] **注入攻击防护**: 是否防范了 XSS、SQL 注入等攻击？
- [ ] **HTTPS/安全头**: 是否配置了适当的安全头？

### 测试覆盖 ✅
- [ ] **单元测试**: 核心逻辑是否有单元测试覆盖？
- [ ] **集成测试**: API 接口是否有集成测试？
- [ ] **端到端测试**: 关键用户流程是否有 E2E 测试？
- [ ] **测试覆盖率**: 代码覆盖率是否达到 80% 以上？
- [ ] **测试数据**: 测试是否使用了适当的模拟数据？

### 文档更新 ✅
- [ ] **API 文档**: 新增/修改的 API 是否更新了文档？
- [ ] **README**: 是否更新了相关的安装和使用说明？
- [ ] **CHANGELOG**: 是否记录了重要的变更信息？
- [ ] **类型定义**: 是否导出了必要的 TypeScript 类型？

## 🧪 测试要求 (Testing Requirements)

### 测试金字塔结构
```
        /\
       /  \     E2E Tests (少量)
      /____\    
     /      \   Integration Tests (适量)
    /_______\  
   /          \ Unit Tests (大量)
  /___________ \
```

### 单元测试规范
```typescript
// 测试文件命名: *.test.ts 或 *.spec.ts
// 位置: 与源文件同目录或 __tests__ 文件夹

describe('HomeworkService', () => {
  describe('createAssignment', () => {
    it('should create assignment with valid data', async () => {
      // Arrange
      const assignmentData = createValidAssignmentData();
      const mockPrisma = createMockPrismaClient();
      
      // Act
      const result = await homeworkService.createAssignment(assignmentData);
      
      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        title: assignmentData.title,
        status: 'draft'
      });
      expect(mockPrisma.assignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining(assignmentData)
      });
    });

    it('should throw error for invalid grade level', async () => {
      // Arrange
      const invalidData = { ...validData, grade: 13 };
      
      // Act & Assert
      await expect(homeworkService.createAssignment(invalidData))
        .rejects.toThrow('Invalid grade level');
    });
  });
});
```

### 集成测试规范
```typescript
// 测试 API 端点
describe('/api/homework/assignments', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await seedTestData();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/homework/assignments', () => {
    it('should create assignment for authenticated teacher', async () => {
      const response = await request(app)
        .post('/api/homework/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validAssignmentData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          title: validAssignmentData.title
        })
      });
    });
  });
});
```

### E2E 测试规范
```typescript
// tests/e2e/homework-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homework Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await loginAsTeacher(page);
  });

  test('teacher can create and publish homework assignment', async ({ page }) => {
    // Navigate to homework creation
    await page.click('[data-testid="create-homework-btn"]');
    await expect(page.locator('h1')).toContainText('Create New Assignment');

    // Fill form
    await page.fill('[data-testid="assignment-title"]', 'Year 3 Math Practice');
    await page.selectOption('[data-testid="grade-select"]', '3');
    await page.selectOption('[data-testid="subject-select"]', 'mathematics');
    
    // Add questions
    await page.click('[data-testid="add-question-btn"]');
    await page.fill('[data-testid="question-text"]', 'What is 2 + 2?');
    
    // Publish assignment
    await page.click('[data-testid="publish-btn"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Assignment published successfully');
  });
});
```

## 🚀 部署流程 (Deployment Process)

### 环境分层
```
Development   ←─ feature branches
      ↓
Staging       ←─ develop branch  
      ↓
Production    ←─ master branch
```

### 部署检查清单
- [ ] **测试通过**: 所有自动化测试通过
- [ ] **代码审核**: 至少一位资深开发者审核通过
- [ ] **安全扫描**: 安全漏洞扫描通过
- [ ] **性能测试**: 关键页面性能符合要求
- [ ] **数据库迁移**: 数据库变更脚本已准备
- [ ] **回滚计划**: 制定了回滚策略
- [ ] **监控配置**: 配置了适当的监控和告警

## 📊 质量指标 (Quality Metrics)

### 代码质量目标
- **测试覆盖率**: ≥ 80%
- **类型覆盖率**: ≥ 95%
- **ESLint 错误**: 0 errors, < 5 warnings
- **Lighthouse 性能**: ≥ 90 分
- **无障碍性**: WCAG 2.1 AA 合规
- **安全评分**: A 级

### 性能指标
- **首屏加载时间**: < 2 秒
- **交互就绪时间**: < 3 秒
- **API 响应时间**: < 500ms (95th percentile)
- **错误率**: < 1%
- **可用性**: ≥ 99.9%

## 🐛 Bug 报告模板

### Issue 模板
```markdown
## 🐛 Bug 描述
简要描述遇到的问题

## 🔄 重现步骤
1. 进入...
2. 点击...
3. 看到错误...

## 📱 环境信息
- **设备**: [Desktop/Mobile/Tablet]
- **浏览器**: [Chrome 120/Safari 17/Firefox 118]
- **操作系统**: [Windows 11/macOS 14/iOS 17]
- **屏幕尺寸**: [1920x1080/iPhone 14 Pro]
- **用户角色**: [Student/Parent/Admin]

## 📸 截图/视频
如果可能，提供截图或录屏

## 📋 预期行为
描述应该发生什么

## 📋 实际行为  
描述实际发生了什么

## 🔍 额外信息
- **错误日志**: [粘贴控制台错误]
- **网络请求**: [相关的失败请求]
- **相关Issue**: [#123]

## 🚨 优先级
- [ ] Critical (系统崩溃/数据丢失)
- [ ] High (核心功能无法使用)
- [ ] Medium (功能受限但有变通方案)  
- [ ] Low (UI问题/优化建议)
```

## 🎯 Feature Request 模板

```markdown
## 🎯 功能描述
简要描述建议的新功能

## 🧑‍🎓 用户故事
作为 [用户角色]，我希望 [功能]，这样我就可以 [价值]

## 📋 接受标准
- [ ] 功能要求 1
- [ ] 功能要求 2
- [ ] 功能要求 3

## 🎨 设计建议
如果有设计想法，请提供线框图或描述

## 🔧 技术考虑
- **复杂度**: [Low/Medium/High]
- **依赖项**: [需要的技术栈或外部服务]
- **影响范围**: [涉及的模块]

## 📊 业务价值
- **用户痛点**: 解决什么问题
- **商业影响**: 对业务的预期影响
- **成功指标**: 如何衡量成功

## 🚨 优先级
- [ ] Must Have (核心功能，必须实现)
- [ ] Should Have (重要功能，优先实现)  
- [ ] Could Have (有用功能，资源允许时实现)
- [ ] Won't Have (当前版本不考虑)
```

## 📚 资源和参考

### 重要文档
- [Queensland Curriculum Guidelines](docs/curriculum.md)
- [System Architecture](docs/architecture.md)  
- [UX/UI Design Guidelines](docs/ux/wireframes.md)
- [API Documentation](docs/api/)

### 开发工具
- **代码编辑器**: VS Code + 推荐插件
- **调试工具**: React DevTools, Prisma Studio
- **设计工具**: Figma, Excalidraw
- **测试工具**: Playwright, Vitest

### 学习资源
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 获取帮助

### 沟通渠道
- **技术问题**: 在 GitHub Issues 中创建问题
- **设计讨论**: 在 PR 中进行评审讨论
- **紧急问题**: 联系项目维护者

### 代码审核
- 所有 PR 需要至少一位核心贡献者审核
- 复杂功能需要架构师审核
- UI 改动需要设计师审核

---

感谢您为 Family Learning Web 项目做出贡献！🚀