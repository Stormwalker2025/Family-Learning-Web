export interface UnlockRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  criteria: RuleCriteria;
  action: RuleAction;
  limits?: RuleLimits;
  stackable: boolean;
  validFrom?: string;
  validTo?: string;
  createdBy: string;
  appliesTo?: string[]; // User IDs, empty means all users
  metadata?: RuleMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCriteria {
  subject: Subject[];
  yearLevel?: number[];
  minScore?: number;
  maxScore?: number;
  consecutiveSuccess?: number;
  timeLimit?: {
    maxSeconds?: number;
    bonusUnderSeconds?: number;
  };
  exerciseType?: ExerciseType[];
  difficulty?: Difficulty[];
  timeOfDay?: {
    startHour: number;
    endHour: number;
  };
  dayOfWeek?: DayOfWeek[];
  behaviorModifiers?: {
    completionStreak?: number;
    mistakeReduction?: number;
    improvementRate?: number;
  };
  customConditions?: CustomCondition[];
}

export interface RuleAction {
  unlockMinutes: number;
  bonusMinutes?: number;
  message?: string;
  achievements?: string[];
  parentNotification?: boolean;
  restrictions?: {
    allowedApps?: string[];
    blockedApps?: string[];
    timeWindows?: TimeWindow[];
  };
}

export interface RuleLimits {
  maxDaily?: number;
  maxWeekly?: number;
  cooldownMinutes?: number;
  maxTriggers?: number;
  requiresParentalApproval?: boolean;
}

export interface RuleMetadata {
  tags?: string[];
  category?: RuleCategory;
  version?: string;
  notes?: string;
}

export interface CustomCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'between';
  value: any;
}

export interface TimeWindow {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export type Subject = 'english' | 'mathematics' | 'hass' | 'science' | 'all';
export type ExerciseType = 'homework' | 'practice' | 'test' | 'review';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type RuleCategory = 'academic' | 'behavioral' | 'bonus' | 'penalty' | 'emergency';

// Evaluation Context
export interface EvaluationContext {
  userId: string;
  attemptId?: string;
  score: number;
  subject: Subject;
  yearLevel: number;
  exerciseType: ExerciseType;
  difficulty: Difficulty;
  timeTaken: number; // seconds
  completedAt: string;
  isCorrect: boolean;
  consecutiveSuccesses?: number;
  recentPerformance?: PerformanceHistory[];
  currentStreak?: number;
  todayAttempts?: number;
  weeklyStats?: WeeklyStats;
}

export interface PerformanceHistory {
  attemptId: string;
  score: number;
  subject: Subject;
  completedAt: string;
  timeTaken: number;
}

export interface WeeklyStats {
  totalAttempts: number;
  averageScore: number;
  subjectBreakdown: Record<Subject, {
    attempts: number;
    averageScore: number;
  }>;
  streakDays: number;
}

// Evaluation Result
export interface RuleEvaluationResult {
  ruleId: string;
  triggered: boolean;
  reason?: string;
  confidence: number; // 0-1, how confident we are in this evaluation
  unlockMinutes: number;
  bonusMinutes?: number;
  message?: string;
  achievements?: string[];
  restrictions?: RuleAction['restrictions'];
  parentNotification?: boolean;
  metadata: {
    evaluatedAt: string;
    processingTime: number; // milliseconds
    criteriaMatched: string[];
    criteriaFailed: string[];
  };
}

export interface UnlockEvaluationRequest {
  userId: string;
  context: EvaluationContext;
  rules?: string[]; // Specific rule IDs to evaluate, empty means all active rules
}

export interface UnlockEvaluationResponse {
  userId: string;
  totalUnlockMinutes: number;
  totalBonusMinutes: number;
  triggeredRules: RuleEvaluationResult[];
  combinedMessage: string;
  achievements: string[];
  restrictions: CombinedRestrictions;
  parentNotifications: ParentNotification[];
  summary: EvaluationSummary;
}

export interface CombinedRestrictions {
  allowedApps: string[];
  blockedApps: string[];
  timeWindows: TimeWindow[];
  effectiveUntil: string;
}

export interface ParentNotification {
  ruleId: string;
  ruleName: string;
  message: string;
  unlockMinutes: number;
  timestamp: string;
}

export interface EvaluationSummary {
  rulesEvaluated: number;
  rulesTriggered: number;
  rulesBlocked: number; // Due to limits or cooldowns
  highestPriorityRule?: string;
  evaluationTime: number;
  nextEligibleEvaluation?: string;
}

// Usage Tracking
export interface UnlockUsage {
  id: string;
  userId: string;
  ruleId: string;
  unlockMinutes: number;
  bonusMinutes?: number;
  usedMinutes: number;
  remainingMinutes: number;
  startedAt?: string;
  completedAt?: string;
  restrictions?: RuleAction['restrictions'];
  createdAt: string;
}

export interface DailyUsageSummary {
  userId: string;
  date: string;
  totalUnlocked: number;
  totalUsed: number;
  totalRemaining: number;
  ruleBreakdown: Array<{
    ruleId: string;
    ruleName: string;
    unlocked: number;
    used: number;
  }>;
  achievements: string[];
}

// Rule Management
export interface RuleTemplate {
  name: string;
  description: string;
  criteria: Partial<RuleCriteria>;
  action: Partial<RuleAction>;
  limits?: Partial<RuleLimits>;
  metadata?: {
    category: RuleCategory;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    recommendedFor: string[];
  };
}

export interface RuleValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// Analytics and Reporting
export interface RuleAnalytics {
  ruleId: string;
  ruleName: string;
  period: {
    start: string;
    end: string;
  };
  triggerCount: number;
  uniqueUsers: number;
  totalUnlockMinutes: number;
  averageUnlockPerTrigger: number;
  usageRate: number; // Percentage of unlocked time that was actually used
  userSatisfaction?: number; // If we collect feedback
  effectiveness: {
    behaviorChange: number; // Improvement in targeted behavior
    engagementIncrease: number; // Increase in learning engagement
    parentSatisfaction: number; // Parent feedback scores
  };
  topPerformers: Array<{
    userId: string;
    triggerCount: number;
    totalUnlocked: number;
  }>;
}

// Prebuilt Rule Templates
export const RULE_TEMPLATES: Record<string, RuleTemplate> = {
  EXCELLENCE_REWARD: {
    name: 'Academic Excellence Reward',
    description: 'Unlock iPad time for scoring 90%+ on exercises',
    criteria: {
      minScore: 90,
      exerciseType: ['homework', 'practice']
    },
    action: {
      unlockMinutes: 30,
      message: 'Excellent work! You\'ve earned iPad time for your outstanding performance! 🎉',
      achievements: ['high-achiever'],
      parentNotification: true
    },
    limits: {
      maxDaily: 120,
      maxTriggers: 4,
      cooldownMinutes: 60
    },
    metadata: {
      category: 'academic',
      tags: ['high-performance', 'daily-reward'],
      difficulty: 'beginner',
      recommendedFor: ['all-students']
    }
  },
  
  CONSISTENCY_BONUS: {
    name: 'Consistency Champion',
    description: 'Bonus time for maintaining learning streaks',
    criteria: {
      behaviorModifiers: {
        completionStreak: 5
      }
    },
    action: {
      unlockMinutes: 60,
      bonusMinutes: 30,
      message: 'Amazing consistency! Your learning streak has earned you bonus iPad time! 🏆',
      achievements: ['consistency-champion'],
      parentNotification: true
    },
    limits: {
      maxWeekly: 120,
      cooldownMinutes: 10080 // 1 week
    },
    metadata: {
      category: 'behavioral',
      tags: ['consistency', 'habit-building'],
      difficulty: 'intermediate',
      recommendedFor: ['regular-users']
    }
  },
  
  SPEED_BONUS: {
    name: 'Speed and Accuracy Bonus',
    description: 'Extra time for quick and correct completion',
    criteria: {
      minScore: 80,
      timeLimit: {
        bonusUnderSeconds: 300 // 5 minutes
      }
    },
    action: {
      unlockMinutes: 15,
      message: 'Lightning fast and accurate! ⚡ Speed bonus earned!',
      achievements: ['speed-demon']
    },
    limits: {
      maxDaily: 60,
      maxTriggers: 8
    },
    metadata: {
      category: 'bonus',
      tags: ['speed', 'accuracy', 'micro-reward'],
      difficulty: 'advanced',
      recommendedFor: ['high-performers']
    }
  },
  
  IMPROVEMENT_REWARD: {
    name: 'Improvement Recognition',
    description: 'Reward students for showing improvement over time',
    criteria: {
      behaviorModifiers: {
        improvementRate: 10 // 10% improvement
      }
    },
    action: {
      unlockMinutes: 20,
      message: 'Great improvement! Your hard work is paying off! 📈',
      achievements: ['improver'],
      parentNotification: true
    },
    limits: {
      maxDaily: 40,
      cooldownMinutes: 1440 // 24 hours
    },
    metadata: {
      category: 'behavioral',
      tags: ['improvement', 'growth-mindset'],
      difficulty: 'intermediate',
      recommendedFor: ['struggling-students', 'new-users']
    }
  }
};