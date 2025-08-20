# HASS (Humanities and Social Sciences) Exercise System

这是一个完整的HASS教育模块，专为澳大利亚家庭学习环境设计，支持Year 3和Year 6学生的人文社科学习。

## 📚 学科覆盖

### 1. History (历史)

- **Year 3**: 澳洲早期殖民历史，原住民文化基础
- **Year 6**: 澳大利亚联邦成立，移民历史，重要历史事件

### 2. Geography (地理)

- **Year 3**: 澳洲地形特征，州和领地，主要城市
- **Year 6**: 自然灾害，气候变化，环境保护

### 3. Civics and Citizenship (公民教育)

- **Year 3**: 社区生活，规则和法律基础
- **Year 6**: 澳洲政府体系，民主价值观，公民权利

### 4. Economics and Business (经济商业)

- **Year 3**: 需求和愿望，货币和交换
- **Year 6**: 资源分配，消费选择，创业精神

## 🏗️ 系统架构

```
src/components/exercises/hass/
├── HassExercise.tsx              # 主要练习组件
├── ArticleReader/                # 文章阅读器
│   ├── ArticleDisplay.tsx        # 文章内容显示
│   ├── MultimediaViewer.tsx      # 多媒体查看器
│   ├── NoteTaking.tsx           # 笔记工具
│   └── Glossary.tsx             # 词汇表
├── InteractiveElements/          # 交互元素
│   ├── InteractiveMap.tsx        # 交互式地图
│   ├── Timeline.tsx             # 时间线组件
│   ├── ImageGallery.tsx         # 图片画廊
│   └── VideoPlayer.tsx          # 视频播放器
├── QuestionTypes/               # HASS题型
│   ├── Comprehension.tsx        # 理解题
│   ├── Analysis.tsx             # 分析题
│   ├── Evaluation.tsx           # 评价题
│   ├── Application.tsx          # 应用题
│   ├── Creative.tsx             # 创造题
│   └── MultipleChoice.tsx       # 选择题
└── LearningSupport/             # 学习支持
    ├── VocabularyHelper.tsx     # 词汇助手
    ├── BackgroundInfo.tsx       # 背景信息
    └── DiscussionGuide.tsx      # 讨论指南
```

## ✨ 核心功能

### 📖 智能阅读体验

- **分级文章**: 适合不同年级的内容长度和词汇复杂度
- **互动标注**: 点击词汇查看定义，重点内容高亮
- **多媒体支持**: 集成地图、时间线、图片和视频
- **实时笔记**: 段落级别笔记和书签功能

### 🧠 多样化问题类型

- **Comprehension (理解题)**: 基于文章内容的理解判断
- **Analysis (分析题)**: 结构化分析框架，支持多点论证
- **Evaluation (评价题)**: 批判性思维和观点评判
- **Application (应用题)**: 知识应用到新情境
- **Creative (创造题)**: 角色扮演、方案设计
- **Multiple Choice**: 标准选择题

### 🗺️ 交互式学习元素

- **智能地图**: 澳洲州领地、原住民区域等可视化
- **动态时间线**: 历史事件的时序展示和导航
- **多媒体画廊**: 历史照片、地理图像展示
- **视频播放器**: 支持章节、字幕、书签功能

### 🎯 智能评估系统

- **多维度评分**: 基于答案质量、置信度和用时
- **技能分析**: 追踪批判性思维、分析能力发展
- **澳洲课程对接**: 自动匹配Australian Curriculum标准
- **个性化反馈**: 针对性的学习建议和下一步指导

## 📊 数据结构

### HassExercise 练习结构

```typescript
interface HassExercise {
  id: string
  title: string
  subject: 'history' | 'geography' | 'civics' | 'economics'
  yearLevel: number
  difficulty: 'foundation' | 'developing' | 'proficient' | 'advanced'

  article: HassArticle // 文章内容
  questions: HassQuestion[] // 问题列表
  learningObjectives: string[] // 学习目标
  totalPoints: number // 总分
  estimatedDuration: number // 预估时间
}
```

### HassArticle 文章结构

```typescript
interface HassArticle {
  title: string
  content: string // Markdown格式
  keyVocabulary: HassVocabulary[]
  mediaResources: MediaResource[]
  australianCurriculum: string[] // 课程标准代码
  discussionPrompts: string[] // 讨论话题
}
```

## 🎨 用户体验特色

### 🌟 Australian Focus

- **本土化内容**: 100%澳洲历史、地理、政治、经济内容
- **多元文化**: 反映澳洲多元文化社会特色
- **原住民视角**: 尊重原住民和托雷斯海峡岛民文化

### 👨‍👩‍👧‍👦 家庭学习支持

- **讨论指南**: 家庭对话话题建议
- **难度分级**: 适合不同年龄的内容呈现
- **进度追踪**: 学习轨迹和成就可视化

### 📱 现代化界面

- **响应式设计**: 适配桌面、平板、手机
- **暗色模式**: 保护视力，舒适阅读
- **无障碍**: 键盘导航、屏幕阅读器支持

## 🚀 使用方式

### 访问练习

```typescript
// 导航到HASS练习页面
//localhost:3000/exercises/hass

// 或直接导入组件使用
http: import { HassExercise } from '@/components/exercises/hass'
```

### API接口

```typescript
// 获取练习列表
GET /api/exercises/hass?subject=history&yearLevel=3

// 提交答案
POST /api/exercises/hass/submit
{
  exerciseId: string,
  answers: Record<string, HassAnswer>,
  notes: Record<string, string>,
  timeSpent: number
}
```

## 📈 学习分析

系统提供详细的学习分析：

- **技能掌握度**: 按技能类型分析表现
- **概念理解**: 知识点掌握情况
- **批判思维**: 高阶思维能力评估
- **时间效率**: 答题效率分析
- **学习建议**: 个性化的下一步学习方向

## 🔧 技术实现

- **前端框架**: React + TypeScript
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: React Hooks
- **Markdown渲染**: react-markdown
- **多媒体**: 自定义播放器组件
- **评分算法**: 智能NLP分析（可扩展）

## 📋 内容示例

目前包含的示例练习：

### Year 3

- 原住民传统生活和文化
- 澳洲州和领地地理
- 社区规则和法律基础

### Year 6

- 澳大利亚联邦成立历史
- 气候变化对澳洲的影响
- 澳洲资源与全球贸易

## 🎯 教育目标

- 培养批判性思维能力
- 增强澳洲公民意识
- 发展跨学科连接能力
- 提高读写分析技能
- 促进家庭教育参与

这个HASS模块为澳洲学生提供了一个全面、互动、符合本地课程标准的人文社科学习平台。
