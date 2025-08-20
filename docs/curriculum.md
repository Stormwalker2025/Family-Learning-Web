# Queensland Curriculum Constraints and Implementation Guide

## 1. 术语定义 (Terms and Definitions)

### 1.1 核心术语

- **Year Level**: 澳洲教育年级 (Year 3, Year 6为重点)
- **Learning Area**: 学习领域 (English, Mathematics, HASS等)
- **Achievement Standard**: 成就标准
- **Content Descriptor**: 内容描述符
- **Assessment**: 评估方式
- **Differentiation**: 差异化教学

### 1.2 QLD特色术语

- **C2C (Curriculum to Classroom)**: QLD官方课程实施指南
- **NAPLAN**: 全国读写算能力评估计划
- **ACARA**: 澳大利亚课程、评估和报告局
- **Indigenous Perspectives**: 原住民视角

## 2. 年级-知识点映射 (Year Level Knowledge Mapping)

### 2.1 Year 3 重点领域

#### English

**Reading and Viewing:**

- 阅读理解策略
- 文本结构识别 (narrative, informative, persuasive)
- 词汇理解和扩展
- 视觉元素解读

**Writing:**

- 文本类型写作 (stories, information reports, procedures)
- 语法和标点符号
- 句子结构多样化
- 拼写规则

**Speaking and Listening:**

- 口头表达技巧
- 积极倾听
- 讨论参与

#### Mathematics

**Number and Algebra:**

- 整数到10000
- 加减乘除运算
- 分数基础概念
- 模式和关系

**Measurement and Geometry:**

- 长度、面积、体积、时间
- 2D和3D图形
- 对称性

**Statistics and Probability:**

- 数据收集和显示
- 概率基础概念

#### HASS (Humanities and Social Sciences)

**History:**

- 社区历史
- 过去与现在的比较
- 历史资源的使用

**Geography:**

- 地点和空间
- 环境特征
- 人与环境的相互作用

**Civics and Citizenship:**

- 社区角色和责任
- 规则和法律的重要性

**Economics and Business:**

- 需求和想要
- 资源的使用

### 2.2 Year 6 重点领域

#### English

**Reading and Viewing:**

- 复杂文本理解
- 推理和预测技能
- 多媒体文本分析
- 文学技巧识别

**Writing:**

- 复杂文本类型创作
- 高级语法和标点符号
- 编辑和修订技能
- 数字工具使用

#### Mathematics

**Number and Algebra:**

- 整数、分数、小数计算
- 百分比概念
- 简单代数表达式
- 问题解决策略

**Measurement and Geometry:**

- 复杂测量任务
- 角度和坐标
- 变换和对称

**Statistics and Probability:**

- 数据分析和解释
- 概率实验和预测

#### HASS

**History:**

- 澳大利亚历史
- 历史事件的意义
- 多元历史观点

**Geography:**

- 澳大利亚的地理特征
- 全球连接
- 可持续发展

## 3. 题型规范 (Question Type Specifications)

### 3.1 Multiple Choice Questions (MCQ)

```json
{
  "type": "mcq",
  "stem": "问题主干",
  "options": [
    {"id": "A", "text": "选项A", "correct": false},
    {"id": "B", "text": "选项B", "correct": true},
    {"id": "C", "text": "选项C", "correct": false},
    {"id": "D", "text": "选项D", "correct": false}
  ],
  "explanation": "答案解释",
  "difficulty": "easy|medium|hard",
  "learningArea": "english|mathematics|hass",
  "yearLevel": 3|6,
  "contentDescriptor": "ACARA代码"
}
```

### 3.2 True/False Questions

```json
{
  "type": "tf",
  "statement": "判断陈述",
  "correct": true|false,
  "explanation": "答案解释",
  "difficulty": "easy|medium|hard",
  "learningArea": "english|mathematics|hass",
  "yearLevel": 3|6
}
```

### 3.3 Matching Questions

```json
{
  "type": "matching",
  "instructions": "匹配指令",
  "leftColumn": [
    {"id": "1", "content": "左侧项目1"},
    {"id": "2", "content": "左侧项目2"}
  ],
  "rightColumn": [
    {"id": "A", "content": "右侧项目A"},
    {"id": "B", "content": "右侧项目B"}
  ],
  "correctMatches": [
    {"left": "1", "right": "A"},
    {"left": "2", "right": "B"}
  ],
  "difficulty": "easy|medium|hard",
  "learningArea": "english|mathematics|hass",
  "yearLevel": 3|6
}
```

### 3.4 Fill-in-the-Blank Questions

```json
{
  "type": "fill",
  "text": "完成句子，包含_空格_标记",
  "blanks": [
    {
      "id": 1,
      "position": "空格位置索引",
      "acceptedAnswers": ["答案1", "答案2"],
      "caseSensitive": false,
      "partialCredit": true
    }
  ],
  "difficulty": "easy|medium|hard",
  "learningArea": "english|mathematics|hass",
  "yearLevel": 3|6
}
```

## 4. 功能优先级 (MoSCoW Prioritization)

### Must Have (M)

- Year 3和Year 6核心学科练习
- 基本题型支持 (MCQ, T/F, Matching, Fill-in)
- 成绩跟踪和进度报告
- 家长访问控制
- iPad解锁规则引擎
- 错题本功能

### Should Have (S)

- 多媒体内容支持
- 自适应难度调整
- 详细学习分析
- 批量内容导入
- 离线模式支持

### Could Have (C)

- 协作学习功能
- 游戏化元素
- 语音识别评估
- 个性化学习路径
- 社交分享功能

### Won't Have (W)

- 实时视频聊天
- 社交媒体集成
- 广告系统
- 第三方支付系统

## 5. 成绩解锁规则配置 (Achievement Unlock Rules)

### 5.1 基础规则Schema

```json
{
  "rules": [
    {
      "id": "rule_01",
      "name": "English Excellence",
      "description": "英语练习优秀表现",
      "criteria": {
        "subject": "english",
        "minScore": 90,
        "yearLevel": [3, 6],
        "consecutive": false,
        "timeframe": "daily"
      },
      "action": {
        "unlockMinutes": 30,
        "message": "恭喜！你的英语表现优异，获得30分钟iPad时间！"
      },
      "stackable": true,
      "maxDaily": 120
    }
  ]
}
```

### 5.2 规则类型

1. **单科目成绩规则**: 基于特定学科表现
2. **跨科目综合规则**: 需要多个学科达标
3. **连续学习规则**: 连续多天完成任务
4. **改进奖励规则**: 基于进步幅度
5. **挑战完成规则**: 特定难题或任务完成

### 5.3 时间管理

- 每日最大解锁时间限制
- 规则叠加策略 (累加/取最大值)
- 时间银行系统 (未使用时间可否累积)
- 家长紧急重置权限

## 6. 质量标准 (Quality Standards)

### 6.1 内容质量

- 所有内容必须对齐ACARA标准
- 定期内容审核和更新
- 文化敏感性检查
- 年龄适宜性评估

### 6.2 技术质量

- 响应时间 < 2秒
- 99.9%可用性
- 跨设备兼容性
- 无障碍性遵循WCAG 2.1 AA

### 6.3 教育效果

- 学习目标明确性
- 即时反馈质量
- 学习路径连贯性
- 差异化教学支持

## 7. 实施路线图 (Implementation Roadmap)

### Phase 1: Foundation (Month 1-2)

- 基础架构搭建
- 核心题型实现
- 用户认证系统
- 基本UI/UX

### Phase 2: Core Features (Month 3-4)

- 完整学习模块
- 成绩跟踪系统
- iPad解锁功能
- 错题本实现

### Phase 3: Enhancement (Month 5-6)

- 高级分析功能
- 内容管理系统
- 家长面板完善
- 性能优化

### Phase 4: Scale & Optimize (Month 7+)

- 多校区支持
- 高级个性化
- 机器学习集成
- 持续改进
