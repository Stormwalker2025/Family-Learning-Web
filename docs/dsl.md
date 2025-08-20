# Question DSL and Grading Engine Documentation

## 1. 题目DSL概述 (Question DSL Overview)

本系统使用JSON格式的DSL (Domain Specific Language) 来定义各种类型的题目。DSL设计遵循以下原则：

- **类型安全**: 每种题型都有明确的数据结构
- **扩展性**: 支持未来新增题型和属性
- **本地化**: 支持多语言和澳洲教育标准
- **无障碍**: 包含无障碍性支持的元数据

## 2. 通用题目结构 (Common Question Structure)

```typescript
interface BaseQuestion {
  id: string
  type: QuestionType
  title?: string
  instruction: string
  content: QuestionContent // 题型特定内容
  answerKey: AnswerKey // 正确答案
  metadata: QuestionMetadata
  scoring: ScoringConfig
  accessibility?: AccessibilityConfig
}

interface QuestionMetadata {
  difficulty: 'easy' | 'medium' | 'hard' | 'challenge'
  yearLevel: number // 3-12
  subject: 'english' | 'mathematics' | 'hass' | 'science'
  topic?: string
  curriculum: {
    framework: 'ACARA' | 'QLD'
    contentDescriptor: string // e.g., "ACELY1672"
    achievementStandard?: string
  }
  tags: string[]
  estimatedTime: number // seconds
  maxAttempts?: number
  createdAt: string
  updatedAt: string
}

interface ScoringConfig {
  maxPoints: number
  partialCredit: boolean
  penaltyForWrong?: number
  bonusForSpeed?: number
  rubric?: ScoringRubric[]
}

interface AccessibilityConfig {
  screenReader: {
    alt: string
    longDescription?: string
  }
  visualSupport: {
    highContrast?: boolean
    largeText?: boolean
    images?: ImageDescription[]
  }
  audioSupport?: {
    textToSpeech: boolean
    audioClues?: string[]
  }
}
```

## 3. 题型特定结构 (Question Type Specific Structures)

### 3.1 多选题 (Multiple Choice Questions)

```typescript
interface MCQQuestion extends BaseQuestion {
  type: 'multiple_choice'
  content: {
    stem: string
    stimulus?: {
      type: 'text' | 'image' | 'audio' | 'video'
      content: string | MediaContent
    }
    options: MCQOption[]
    randomizeOptions?: boolean
  }
  answerKey: {
    correct: string[] // Option IDs (support multiple correct answers)
    explanation?: string
    workingOut?: string // For mathematics
  }
}

interface MCQOption {
  id: string
  text: string
  media?: MediaContent
  isDistractor?: boolean // Common wrong answer
}

// 示例
const mathMCQExample: MCQQuestion = {
  id: 'math_y3_001',
  type: 'multiple_choice',
  instruction: 'Choose the correct answer',
  content: {
    stem: 'What is 24 ÷ 6?',
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '4' },
      { id: 'c', text: '5' },
      { id: 'd', text: '6' },
    ],
    randomizeOptions: true,
  },
  answerKey: {
    correct: ['b'],
    explanation: '24 ÷ 6 = 4 because 6 × 4 = 24',
    workingOut: '24 ÷ 6 = 4\nCheck: 6 × 4 = 24 ✓',
  },
  metadata: {
    difficulty: 'easy',
    yearLevel: 3,
    subject: 'mathematics',
    topic: 'Division',
    curriculum: {
      framework: 'ACARA',
      contentDescriptor: 'ACMNA055',
    },
    tags: ['division', 'basic-facts', 'mental-math'],
    estimatedTime: 30,
  },
  scoring: {
    maxPoints: 1,
    partialCredit: false,
  },
}
```

### 3.2 判断题 (True/False Questions)

```typescript
interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false'
  content: {
    statement: string
    stimulus?: MediaContent
    context?: string // Additional context for the statement
  }
  answerKey: {
    correct: boolean
    explanation: string
    reasoning?: string // Why this answer is correct
  }
}

// 示例
const englishTFExample: TrueFalseQuestion = {
  id: 'eng_y3_002',
  type: 'true_false',
  instruction: 'Read the statement and decide if it is true or false',
  content: {
    statement: 'Australia is the largest country in the world by land area.',
    context: 'Think about what you know about world geography.',
  },
  answerKey: {
    correct: false,
    explanation:
      'Russia is the largest country in the world by land area. Australia is the 6th largest.',
    reasoning: 'While Australia is very large, Russia covers more land area.',
  },
  metadata: {
    difficulty: 'medium',
    yearLevel: 3,
    subject: 'hass',
    topic: 'Geography',
    curriculum: {
      framework: 'ACARA',
      contentDescriptor: 'ACHASSK066',
    },
    tags: ['geography', 'world-knowledge', 'australia'],
    estimatedTime: 20,
  },
  scoring: {
    maxPoints: 1,
    partialCredit: false,
  },
}
```

### 3.3 匹配题 (Matching Questions)

```typescript
interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  content: {
    instruction: string
    leftColumn: MatchingItem[]
    rightColumn: MatchingItem[]
    matchType: 'one_to_one' | 'one_to_many' | 'many_to_many'
    allowPartialMatching?: boolean
  }
  answerKey: {
    matches: MatchPair[]
    explanation?: string
  }
}

interface MatchingItem {
  id: string
  content: string | MediaContent
  type?: 'text' | 'image' | 'audio'
}

interface MatchPair {
  left: string // Left item ID
  right: string // Right item ID
  points?: number // Specific points for this match
}

// 示例
const scienceMatchingExample: MatchingQuestion = {
  id: 'sci_y6_003',
  type: 'matching',
  instruction: 'Match each animal to its habitat',
  content: {
    instruction:
      'Drag each animal from the left to its correct habitat on the right',
    leftColumn: [
      { id: 'kangaroo', content: 'Kangaroo' },
      { id: 'fish', content: 'Fish' },
      { id: 'bird', content: 'Eagle' },
      { id: 'koala', content: 'Koala' },
    ],
    rightColumn: [
      { id: 'ocean', content: 'Ocean' },
      { id: 'forest', content: 'Forest' },
      { id: 'grassland', content: 'Grassland' },
      { id: 'sky', content: 'Sky' },
    ],
    matchType: 'one_to_one',
  },
  answerKey: {
    matches: [
      { left: 'kangaroo', right: 'grassland' },
      { left: 'fish', right: 'ocean' },
      { left: 'bird', right: 'sky' },
      { left: 'koala', right: 'forest' },
    ],
    explanation:
      'Each animal lives in a specific habitat that provides food and shelter.',
  },
  metadata: {
    difficulty: 'easy',
    yearLevel: 6,
    subject: 'science',
    topic: 'Animal Habitats',
    curriculum: {
      framework: 'ACARA',
      contentDescriptor: 'ACSSU094',
    },
    tags: ['animals', 'habitats', 'environment'],
    estimatedTime: 60,
  },
  scoring: {
    maxPoints: 4,
    partialCredit: true,
  },
}
```

### 3.4 填空题 (Fill-in-the-Blank Questions)

```typescript
interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank'
  content: {
    text: string // Text with {blank1}, {blank2} markers
    blanks: BlankDefinition[]
    caseSensitive?: boolean
    preserveOrder?: boolean // Must fill blanks in order
  }
  answerKey: {
    answers: BlankAnswer[]
    explanation?: string
  }
}

interface BlankDefinition {
  id: string
  placeholder: string // Shown in the blank field
  wordLimit?: number
  inputType: 'text' | 'number' | 'select'
  options?: string[] // For select type
  width?: number // Visual width hint
}

interface BlankAnswer {
  blankId: string
  acceptedAnswers: string[]
  caseSensitive?: boolean
  acceptSynonyms?: boolean
  points?: number
  feedback?: string
}

// 示例
const englishFillBlankExample: FillBlankQuestion = {
  id: 'eng_y3_004',
  type: 'fill_blank',
  instruction: 'Complete the sentences by filling in the blanks',
  content: {
    text: 'The {animal} hopped across the {surface} to reach the {destination}.',
    blanks: [
      {
        id: 'animal',
        placeholder: 'animal',
        inputType: 'text',
        wordLimit: 1,
      },
      {
        id: 'surface',
        placeholder: 'ground type',
        inputType: 'text',
        wordLimit: 1,
      },
      {
        id: 'destination',
        placeholder: 'place',
        inputType: 'text',
        wordLimit: 1,
      },
    ],
    caseSensitive: false,
  },
  answerKey: {
    answers: [
      {
        blankId: 'animal',
        acceptedAnswers: ['kangaroo', 'rabbit', 'frog', 'bunny'],
        acceptSynonyms: true,
        points: 1,
        feedback:
          'Good! Animals that hop include kangaroos, rabbits, and frogs.',
      },
      {
        blankId: 'surface',
        acceptedAnswers: ['grass', 'ground', 'field', 'lawn', 'yard'],
        acceptSynonyms: true,
        points: 1,
      },
      {
        blankId: 'destination',
        acceptedAnswers: ['pond', 'tree', 'bush', 'water', 'home'],
        acceptSynonyms: true,
        points: 1,
      },
    ],
    explanation:
      'This sentence describes an animal moving across a surface to reach a destination.',
  },
  metadata: {
    difficulty: 'medium',
    yearLevel: 3,
    subject: 'english',
    topic: 'Sentence Completion',
    curriculum: {
      framework: 'ACARA',
      contentDescriptor: 'ACELA1459',
    },
    tags: ['grammar', 'vocabulary', 'sentence-structure'],
    estimatedTime: 90,
  },
  scoring: {
    maxPoints: 3,
    partialCredit: true,
  },
}
```

## 4. 判分引擎算法 (Grading Engine Algorithms)

### 4.1 基础判分逻辑

```typescript
interface GradingResult {
  score: number // 0-100 percentage
  points: number // Raw points earned
  maxPoints: number // Maximum possible points
  isCorrect: boolean // Overall correctness
  partialCredit: number // Partial credit earned (0-1)
  feedback: string[] // Feedback messages
  detailedResults: DetailedResult[]
  timeBonus?: number // Bonus for quick completion
  penalty?: number // Penalty for wrong answers
}

interface DetailedResult {
  questionPart: string // Which part of the question
  userAnswer: any // What the user answered
  correctAnswer: any // What was correct
  isCorrect: boolean // Correctness for this part
  points: number // Points for this part
  feedback?: string // Specific feedback
}

class GradingEngine {
  grade(question: BaseQuestion, userAnswer: any): GradingResult {
    switch (question.type) {
      case 'multiple_choice':
        return this.gradeMCQ(question as MCQQuestion, userAnswer)
      case 'true_false':
        return this.gradeTrueFalse(question as TrueFalseQuestion, userAnswer)
      case 'matching':
        return this.gradeMatching(question as MatchingQuestion, userAnswer)
      case 'fill_blank':
        return this.gradeFillBlank(question as FillBlankQuestion, userAnswer)
      default:
        throw new Error(`Unsupported question type: ${question.type}`)
    }
  }
}
```

### 4.2 多选题判分

```typescript
gradeMCQ(question: MCQQuestion, userAnswer: string[]): GradingResult {
  const correctAnswers = new Set(question.answerKey.correct);
  const userAnswers = new Set(userAnswer || []);

  // Calculate correctness
  const correctSelected = [...userAnswers].filter(ans => correctAnswers.has(ans));
  const incorrectSelected = [...userAnswers].filter(ans => !correctAnswers.has(ans));
  const correctMissed = [...correctAnswers].filter(ans => !userAnswers.has(ans));

  let points = 0;
  let isCorrect = false;

  if (question.scoring.partialCredit) {
    // Partial credit: correct selections minus incorrect selections
    const correctWeight = 1.0 / correctAnswers.size;
    const incorrectPenalty = 0.25; // 25% penalty for wrong answers

    points = Math.max(0,
      (correctSelected.length * correctWeight) -
      (incorrectSelected.length * incorrectPenalty)
    );

    isCorrect = points >= 0.8; // 80% threshold for "correct"
  } else {
    // All or nothing
    isCorrect = correctSelected.length === correctAnswers.size &&
                incorrectSelected.length === 0;
    points = isCorrect ? 1 : 0;
  }

  const finalPoints = points * question.scoring.maxPoints;

  return {
    score: (finalPoints / question.scoring.maxPoints) * 100,
    points: finalPoints,
    maxPoints: question.scoring.maxPoints,
    isCorrect,
    partialCredit: points,
    feedback: this.generateMCQFeedback(question, userAnswers, correctAnswers),
    detailedResults: [{
      questionPart: "main",
      userAnswer: [...userAnswers],
      correctAnswer: [...correctAnswers],
      isCorrect,
      points: finalPoints
    }]
  };
}

private generateMCQFeedback(
  question: MCQQuestion,
  userAnswers: Set<string>,
  correctAnswers: Set<string>
): string[] {
  const feedback: string[] = [];

  if (userAnswers.size === 0) {
    feedback.push("Please select an answer.");
    return feedback;
  }

  const isFullyCorrect =
    userAnswers.size === correctAnswers.size &&
    [...userAnswers].every(ans => correctAnswers.has(ans));

  if (isFullyCorrect) {
    feedback.push("✅ Excellent! Your answer is correct.");
    if (question.answerKey.explanation) {
      feedback.push(`💡 ${question.answerKey.explanation}`);
    }
  } else {
    const correctSelected = [...userAnswers].filter(ans => correctAnswers.has(ans));
    const incorrectSelected = [...userAnswers].filter(ans => !correctAnswers.has(ans));

    if (correctSelected.length > 0) {
      feedback.push(`✅ You correctly identified: ${correctSelected.join(', ')}`);
    }

    if (incorrectSelected.length > 0) {
      feedback.push(`❌ These answers are incorrect: ${incorrectSelected.join(', ')}`);
    }

    const missed = [...correctAnswers].filter(ans => !userAnswers.has(ans));
    if (missed.length > 0) {
      feedback.push(`📝 You missed: ${missed.join(', ')}`);
    }

    if (question.answerKey.explanation) {
      feedback.push(`💡 Explanation: ${question.answerKey.explanation}`);
    }
  }

  return feedback;
}
```

### 4.3 填空题智能判分

```typescript
gradeFillBlank(question: FillBlankQuestion, userAnswer: Record<string, string>): GradingResult {
  const detailedResults: DetailedResult[] = [];
  let totalPoints = 0;
  let maxTotalPoints = 0;

  for (const blank of question.content.blanks) {
    const answerDef = question.answerKey.answers.find(a => a.blankId === blank.id);
    if (!answerDef) continue;

    const userInput = userAnswer[blank.id] || '';
    const maxPoints = answerDef.points || 1;
    maxTotalPoints += maxPoints;

    const gradeResult = this.gradeBlankAnswer(userInput, answerDef, question.content.caseSensitive);

    detailedResults.push({
      questionPart: blank.id,
      userAnswer: userInput,
      correctAnswer: answerDef.acceptedAnswers,
      isCorrect: gradeResult.isCorrect,
      points: gradeResult.points * maxPoints,
      feedback: gradeResult.feedback
    });

    totalPoints += gradeResult.points * maxPoints;
  }

  const finalScore = maxTotalPoints > 0 ? (totalPoints / maxTotalPoints) * 100 : 0;
  const isOverallCorrect = detailedResults.every(r => r.isCorrect);

  return {
    score: finalScore,
    points: totalPoints,
    maxPoints: maxTotalPoints,
    isCorrect: isOverallCorrect,
    partialCredit: totalPoints / maxTotalPoints,
    feedback: this.generateFillBlankFeedback(detailedResults),
    detailedResults
  };
}

private gradeBlankAnswer(
  userInput: string,
  answerDef: BlankAnswer,
  caseSensitive: boolean = false
): { isCorrect: boolean; points: number; feedback?: string } {

  if (!userInput.trim()) {
    return {
      isCorrect: false,
      points: 0,
      feedback: "This blank was not filled in."
    };
  }

  const normalizedInput = caseSensitive ?
    userInput.trim() :
    userInput.trim().toLowerCase();

  // Check exact matches
  const exactMatch = answerDef.acceptedAnswers.some(accepted => {
    const normalizedAccepted = caseSensitive ?
      accepted.trim() :
      accepted.trim().toLowerCase();
    return normalizedInput === normalizedAccepted;
  });

  if (exactMatch) {
    return {
      isCorrect: true,
      points: 1,
      feedback: answerDef.feedback || "✅ Correct!"
    };
  }

  // Check for close matches (for partial credit)
  if (answerDef.acceptSynonyms) {
    const similarity = this.calculateSimilarity(normalizedInput, answerDef.acceptedAnswers);

    if (similarity >= 0.8) { // 80% similarity threshold
      return {
        isCorrect: true,
        points: 0.8, // Partial credit for close match
        feedback: "✅ Very close! This is an acceptable answer."
      };
    } else if (similarity >= 0.6) { // 60% similarity threshold
      return {
        isCorrect: false,
        points: 0.5, // Some credit for reasonable attempt
        feedback: `⚠️ Close, but not quite right. You wrote "${userInput}". Try something like "${answerDef.acceptedAnswers[0]}".`
      };
    }
  }

  return {
    isCorrect: false,
    points: 0,
    feedback: `❌ "${userInput}" is not correct. The answer should be something like "${answerDef.acceptedAnswers[0]}".`
  };
}

// Simple string similarity calculation
private calculateSimilarity(input: string, acceptedAnswers: string[]): number {
  return Math.max(...acceptedAnswers.map(accepted =>
    this.levenshteinSimilarity(input.toLowerCase(), accepted.toLowerCase())
  ));
}

private levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[b.length][a.length]) / maxLength;
}
```

### 4.4 时间奖励和惩罚系统

```typescript
interface TimingConfig {
  expectedTime: number;    // Expected time in seconds
  speedBonusThreshold: number; // Bonus if completed faster than this
  timeoutPenalty: number;  // Penalty for taking too long
  maxBonus: number;        // Maximum bonus percentage
  maxPenalty: number;      // Maximum penalty percentage
}

calculateTimeAdjustment(
  timeTaken: number,
  config: TimingConfig
): { bonus: number; penalty: number; message?: string } {

  let bonus = 0;
  let penalty = 0;
  let message: string | undefined;

  if (timeTaken <= config.speedBonusThreshold) {
    // Speed bonus: more bonus for faster completion
    const speedRatio = config.speedBonusThreshold / timeTaken;
    bonus = Math.min(config.maxBonus, (speedRatio - 1) * 0.1); // 10% per speed unit
    message = `🚀 Speed bonus! You completed this ${Math.round((speedRatio - 1) * 100)}% faster than expected.`;
  } else if (timeTaken > config.expectedTime * 2) {
    // Time penalty: penalty for taking much longer than expected
    const timeRatio = timeTaken / config.expectedTime;
    penalty = Math.min(config.maxPenalty, (timeRatio - 2) * 0.05); // 5% penalty per extra time unit
    message = `⏰ This took longer than expected. Try to work more quickly next time.`;
  }

  return { bonus, penalty, message };
}
```

## 5. 错误诊断系统 (Error Diagnosis System)

```typescript
interface ErrorDiagnosis {
  errorType: string
  confidence: number // 0-1, how confident we are in this diagnosis
  description: string
  remediation: string // Suggested action for improvement
  relatedConcepts: string[]
}

class ErrorDiagnosisEngine {
  diagnoseMCQError(
    question: MCQQuestion,
    userAnswer: string[],
    correctAnswer: string[]
  ): ErrorDiagnosis[] {
    const diagnoses: ErrorDiagnosis[] = []

    // Check for common error patterns
    if (userAnswer.length === 0) {
      diagnoses.push({
        errorType: 'no_attempt',
        confidence: 1.0,
        description: 'Student did not attempt to answer',
        remediation:
          'Encourage the student to read the question carefully and make their best guess',
        relatedConcepts: ['test-taking-strategies', 'reading-comprehension'],
      })
    } else if (
      userAnswer.length > correctAnswer.length &&
      correctAnswer.length === 1
    ) {
      diagnoses.push({
        errorType: 'over_selection',
        confidence: 0.8,
        description:
          'Student selected too many options for a single-answer question',
        remediation:
          'Review instructions and look for keywords like "choose the best answer"',
        relatedConcepts: ['instruction-following', 'test-taking-strategies'],
      })
    }

    // Subject-specific error patterns
    if (question.metadata.subject === 'mathematics') {
      diagnoses.push(
        ...this.diagnoseMathErrors(question, userAnswer, correctAnswer)
      )
    }

    return diagnoses.filter(d => d.confidence >= 0.5).slice(0, 3) // Top 3 most likely errors
  }

  private diagnoseMathErrors(
    question: MCQQuestion,
    userAnswer: string[],
    correctAnswer: string[]
  ): ErrorDiagnosis[] {
    const diagnoses: ErrorDiagnosis[] = []

    // Look for common mathematical misconceptions
    if (
      question.metadata.tags.includes('division') &&
      userAnswer.includes('a')
    ) {
      // Check if they might have done multiplication instead of division
      const stem = question.content.stem
      const divisionMatch = stem.match(/(\d+)\s*÷\s*(\d+)/)

      if (divisionMatch) {
        const [, dividend, divisor] = divisionMatch
        const multiplicationResult = parseInt(dividend) * parseInt(divisor)

        if (
          question.content.options.some(
            opt =>
              opt.text === multiplicationResult.toString() &&
              userAnswer.includes(opt.id)
          )
        ) {
          diagnoses.push({
            errorType: 'operation_confusion',
            confidence: 0.9,
            description: 'Student may have multiplied instead of dividing',
            remediation:
              'Review the difference between × and ÷ symbols. Practice identifying which operation to use.',
            relatedConcepts: [
              'division',
              'multiplication',
              'operation-symbols',
            ],
          })
        }
      }
    }

    return diagnoses
  }
}
```

这个完整的DSL文档和判分引擎涵盖了所有主要题型的数据结构定义、智能判分算法、时间管理、错误诊断等核心功能，为澳洲本地化教育系统提供了强大的题目管理和自动评分能力。
