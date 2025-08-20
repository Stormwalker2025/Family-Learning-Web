import {
  UnlockRule,
  RuleCriteria,
  EvaluationContext,
  RuleEvaluationResult,
  UnlockEvaluationRequest,
  UnlockEvaluationResponse,
  CombinedRestrictions,
  ParentNotification,
  EvaluationSummary,
  CustomCondition,
  TimeWindow,
  DayOfWeek,
} from './types'

export class RuleEvaluator {
  private version = '2.0.0'

  /**
   * Evaluate unlock rules for a given context
   */
  async evaluateRules(
    request: UnlockEvaluationRequest,
    rules: UnlockRule[]
  ): Promise<UnlockEvaluationResponse> {
    const startTime = Date.now()
    const evaluationResults: RuleEvaluationResult[] = []

    // Filter rules based on request and active status
    const applicableRules = this.filterApplicableRules(rules, request)

    // Sort rules by priority (higher priority first)
    const sortedRules = applicableRules.sort((a, b) => b.priority - a.priority)

    // Evaluate each rule
    for (const rule of sortedRules) {
      const result = await this.evaluateRule(rule, request.context)
      evaluationResults.push(result)
    }

    // Filter triggered rules and apply limits/cooldowns
    const triggeredRules = evaluationResults.filter(r => r.triggered)
    const finalRules = await this.applyLimitsAndCooldowns(
      triggeredRules,
      request.userId,
      sortedRules
    )

    // Combine results
    const response = this.combineResults(
      finalRules,
      request.userId,
      Date.now() - startTime,
      evaluationResults.length
    )

    return response
  }

  /**
   * Evaluate a single rule against the context
   */
  private async evaluateRule(
    rule: UnlockRule,
    context: EvaluationContext
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now()
    const criteriaMatched: string[] = []
    const criteriaFailed: string[] = []

    try {
      // Check each criteria
      const checks = [
        () =>
          this.checkSubjectCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkYearLevelCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkScoreCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkTimeCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkExerciseTypeCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkDifficultyCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkTimeOfDayCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkDayOfWeekCriteria(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkBehaviorModifiers(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
        () =>
          this.checkCustomConditions(
            rule.criteria,
            context,
            criteriaMatched,
            criteriaFailed
          ),
      ]

      // Execute all checks
      const results = checks.map(check => check())
      const allPassed = results.every(result => result)

      if (allPassed) {
        return {
          ruleId: rule.id,
          triggered: true,
          confidence: this.calculateConfidence(criteriaMatched, rule.criteria),
          unlockMinutes: rule.action.unlockMinutes,
          bonusMinutes: rule.action.bonusMinutes,
          message: rule.action.message,
          achievements: rule.action.achievements,
          restrictions: rule.action.restrictions,
          parentNotification: rule.action.parentNotification,
          metadata: {
            evaluatedAt: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            criteriaMatched,
            criteriaFailed,
          },
        }
      } else {
        return {
          ruleId: rule.id,
          triggered: false,
          reason: `Criteria not met: ${criteriaFailed.join(', ')}`,
          confidence: 0,
          unlockMinutes: 0,
          metadata: {
            evaluatedAt: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            criteriaMatched,
            criteriaFailed,
          },
        }
      }
    } catch (error) {
      return {
        ruleId: rule.id,
        triggered: false,
        reason: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        unlockMinutes: 0,
        metadata: {
          evaluatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          criteriaMatched,
          criteriaFailed: [...criteriaFailed, 'evaluation-error'],
        },
      }
    }
  }

  /**
   * Individual criteria checking methods
   */
  private checkSubjectCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.subject || criteria.subject.length === 0) return true

    const subjectMatches =
      criteria.subject.includes(context.subject) ||
      criteria.subject.includes('all')

    if (subjectMatches) {
      matched.push(`subject:${context.subject}`)
    } else {
      failed.push(
        `subject:${context.subject}_not_in_${criteria.subject.join(',')}`
      )
    }

    return subjectMatches
  }

  private checkYearLevelCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.yearLevel || criteria.yearLevel.length === 0) return true

    const yearLevelMatches = criteria.yearLevel.includes(context.yearLevel)

    if (yearLevelMatches) {
      matched.push(`yearLevel:${context.yearLevel}`)
    } else {
      failed.push(
        `yearLevel:${context.yearLevel}_not_in_${criteria.yearLevel.join(',')}`
      )
    }

    return yearLevelMatches
  }

  private checkScoreCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    let minScoreCheck = true
    let maxScoreCheck = true

    if (criteria.minScore !== undefined) {
      minScoreCheck = context.score >= criteria.minScore
      if (minScoreCheck) {
        matched.push(`minScore:${context.score}>=${criteria.minScore}`)
      } else {
        failed.push(`minScore:${context.score}<${criteria.minScore}`)
      }
    }

    if (criteria.maxScore !== undefined) {
      maxScoreCheck = context.score <= criteria.maxScore
      if (maxScoreCheck) {
        matched.push(`maxScore:${context.score}<=${criteria.maxScore}`)
      } else {
        failed.push(`maxScore:${context.score}>${criteria.maxScore}`)
      }
    }

    return minScoreCheck && maxScoreCheck
  }

  private checkTimeCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.timeLimit) return true

    let maxTimeCheck = true
    let bonusTimeCheck = true

    if (criteria.timeLimit.maxSeconds !== undefined) {
      maxTimeCheck = context.timeTaken <= criteria.timeLimit.maxSeconds
      if (maxTimeCheck) {
        matched.push(
          `maxTime:${context.timeTaken}<=${criteria.timeLimit.maxSeconds}`
        )
      } else {
        failed.push(
          `maxTime:${context.timeTaken}>${criteria.timeLimit.maxSeconds}`
        )
      }
    }

    if (criteria.timeLimit.bonusUnderSeconds !== undefined) {
      bonusTimeCheck = context.timeTaken <= criteria.timeLimit.bonusUnderSeconds
      if (bonusTimeCheck) {
        matched.push(
          `bonusTime:${context.timeTaken}<=${criteria.timeLimit.bonusUnderSeconds}`
        )
      } else {
        // Note: This doesn't fail the rule, it just doesn't get the bonus
        matched.push(
          `bonusTime:not_eligible:${context.timeTaken}>${criteria.timeLimit.bonusUnderSeconds}`
        )
      }
    }

    return maxTimeCheck // Only maxTime can fail the rule
  }

  private checkExerciseTypeCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.exerciseType || criteria.exerciseType.length === 0)
      return true

    const exerciseTypeMatches = criteria.exerciseType.includes(
      context.exerciseType
    )

    if (exerciseTypeMatches) {
      matched.push(`exerciseType:${context.exerciseType}`)
    } else {
      failed.push(
        `exerciseType:${context.exerciseType}_not_in_${criteria.exerciseType.join(',')}`
      )
    }

    return exerciseTypeMatches
  }

  private checkDifficultyCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.difficulty || criteria.difficulty.length === 0) return true

    const difficultyMatches = criteria.difficulty.includes(context.difficulty)

    if (difficultyMatches) {
      matched.push(`difficulty:${context.difficulty}`)
    } else {
      failed.push(
        `difficulty:${context.difficulty}_not_in_${criteria.difficulty.join(',')}`
      )
    }

    return difficultyMatches
  }

  private checkTimeOfDayCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.timeOfDay) return true

    const now = new Date(context.completedAt)
    const currentHour = now.getHours()

    const timeMatches =
      currentHour >= criteria.timeOfDay.startHour &&
      currentHour <= criteria.timeOfDay.endHour

    if (timeMatches) {
      matched.push(
        `timeOfDay:${currentHour}_in_${criteria.timeOfDay.startHour}-${criteria.timeOfDay.endHour}`
      )
    } else {
      failed.push(
        `timeOfDay:${currentHour}_not_in_${criteria.timeOfDay.startHour}-${criteria.timeOfDay.endHour}`
      )
    }

    return timeMatches
  }

  private checkDayOfWeekCriteria(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.dayOfWeek || criteria.dayOfWeek.length === 0) return true

    const now = new Date(context.completedAt)
    const dayNames: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    const currentDay = dayNames[now.getDay()]

    const dayMatches = criteria.dayOfWeek.includes(currentDay)

    if (dayMatches) {
      matched.push(`dayOfWeek:${currentDay}`)
    } else {
      failed.push(
        `dayOfWeek:${currentDay}_not_in_${criteria.dayOfWeek.join(',')}`
      )
    }

    return dayMatches
  }

  private checkBehaviorModifiers(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.behaviorModifiers) return true

    let allBehaviorChecks = true

    // Check completion streak
    if (criteria.behaviorModifiers.completionStreak !== undefined) {
      const streakMatches =
        (context.currentStreak || 0) >=
        criteria.behaviorModifiers.completionStreak
      if (streakMatches) {
        matched.push(
          `completionStreak:${context.currentStreak}>=${criteria.behaviorModifiers.completionStreak}`
        )
      } else {
        failed.push(
          `completionStreak:${context.currentStreak || 0}<${criteria.behaviorModifiers.completionStreak}`
        )
        allBehaviorChecks = false
      }
    }

    // Check improvement rate
    if (criteria.behaviorModifiers.improvementRate !== undefined) {
      const improvement = this.calculateImprovementRate(
        context.recentPerformance || []
      )
      const improvementMatches =
        improvement >= criteria.behaviorModifiers.improvementRate
      if (improvementMatches) {
        matched.push(
          `improvementRate:${improvement.toFixed(1)}>=${criteria.behaviorModifiers.improvementRate}`
        )
      } else {
        failed.push(
          `improvementRate:${improvement.toFixed(1)}<${criteria.behaviorModifiers.improvementRate}`
        )
        allBehaviorChecks = false
      }
    }

    // Check mistake reduction
    if (criteria.behaviorModifiers.mistakeReduction !== undefined) {
      const mistakeReduction = this.calculateMistakeReduction(
        context.recentPerformance || []
      )
      const reductionMatches =
        mistakeReduction >= criteria.behaviorModifiers.mistakeReduction
      if (reductionMatches) {
        matched.push(
          `mistakeReduction:${mistakeReduction.toFixed(2)}>=${criteria.behaviorModifiers.mistakeReduction}`
        )
      } else {
        failed.push(
          `mistakeReduction:${mistakeReduction.toFixed(2)}<${criteria.behaviorModifiers.mistakeReduction}`
        )
        allBehaviorChecks = false
      }
    }

    return allBehaviorChecks
  }

  private checkCustomConditions(
    criteria: RuleCriteria,
    context: EvaluationContext,
    matched: string[],
    failed: string[]
  ): boolean {
    if (!criteria.customConditions || criteria.customConditions.length === 0)
      return true

    for (const condition of criteria.customConditions) {
      const conditionMet = this.evaluateCustomCondition(condition, context)
      if (conditionMet) {
        matched.push(
          `custom:${condition.field}_${condition.operator}_${condition.value}`
        )
      } else {
        failed.push(
          `custom:${condition.field}_${condition.operator}_${condition.value}`
        )
        return false // All custom conditions must pass
      }
    }

    return true
  }

  /**
   * Helper methods for behavior calculations
   */
  private calculateImprovementRate(recentPerformance: any[]): number {
    if (recentPerformance.length < 2) return 0

    const sorted = recentPerformance.sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    const earliest = sorted[0]
    const latest = sorted[sorted.length - 1]

    if (earliest.score === 0) return latest.score > 0 ? 100 : 0

    return ((latest.score - earliest.score) / earliest.score) * 100
  }

  private calculateMistakeReduction(recentPerformance: any[]): number {
    if (recentPerformance.length < 2) return 0

    const sorted = recentPerformance.sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2))
    const secondHalf = sorted.slice(Math.ceil(sorted.length / 2))

    const firstHalfMistakeRate =
      1 -
      firstHalf.reduce((sum, p) => sum + p.score, 0) / firstHalf.length / 100
    const secondHalfMistakeRate =
      1 -
      secondHalf.reduce((sum, p) => sum + p.score, 0) / secondHalf.length / 100

    return Math.max(0, firstHalfMistakeRate - secondHalfMistakeRate)
  }

  private evaluateCustomCondition(
    condition: CustomCondition,
    context: any
  ): boolean {
    const fieldValue = this.getNestedProperty(context, condition.field)

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'greaterThan':
        return typeof fieldValue === 'number' && fieldValue > condition.value
      case 'lessThan':
        return typeof fieldValue === 'number' && fieldValue < condition.value
      case 'contains':
        return Array.isArray(fieldValue)
          ? fieldValue.includes(condition.value)
          : String(fieldValue).includes(String(condition.value))
      case 'between':
        return (
          typeof fieldValue === 'number' &&
          Array.isArray(condition.value) &&
          fieldValue >= condition.value[0] &&
          fieldValue <= condition.value[1]
        )
      default:
        return false
    }
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private calculateConfidence(
    matchedCriteria: string[],
    criteria: RuleCriteria
  ): number {
    // Simple confidence calculation based on how many criteria were matched
    const totalPossibleCriteria = Object.keys(criteria).length
    const matchedCount = matchedCriteria.length

    return Math.min(1, matchedCount / Math.max(1, totalPossibleCriteria))
  }

  /**
   * Filter rules that apply to the current request
   */
  private filterApplicableRules(
    rules: UnlockRule[],
    request: UnlockEvaluationRequest
  ): UnlockRule[] {
    const now = new Date()

    return rules.filter(rule => {
      // Check if rule is active
      if (!rule.isActive) return false

      // Check if rule is within valid date range
      if (rule.validFrom && new Date(rule.validFrom) > now) return false
      if (rule.validTo && new Date(rule.validTo) < now) return false

      // Check if rule applies to this user
      if (rule.appliesTo && rule.appliesTo.length > 0) {
        if (!rule.appliesTo.includes(request.userId)) return false
      }

      // Check if specific rules were requested
      if (request.rules && request.rules.length > 0) {
        return request.rules.includes(rule.id)
      }

      return true
    })
  }

  /**
   * Apply daily limits, cooldowns, and other restrictions
   */
  private async applyLimitsAndCooldowns(
    triggeredRules: RuleEvaluationResult[],
    userId: string,
    rules: UnlockRule[]
  ): Promise<RuleEvaluationResult[]> {
    // This would typically check against database records
    // For now, we'll implement basic logic

    const finalRules: RuleEvaluationResult[] = []

    for (const result of triggeredRules) {
      const rule = rules.find(r => r.id === result.ruleId)
      if (!rule?.limits) {
        finalRules.push(result)
        continue
      }

      // TODO: Implement actual database checks for:
      // - Daily usage limits
      // - Weekly usage limits
      // - Cooldown periods
      // - Maximum triggers per day
      // - Parental approval requirements

      // For now, assume all limits pass
      finalRules.push(result)
    }

    return finalRules
  }

  /**
   * Combine multiple rule results into a single response
   */
  private combineResults(
    triggeredRules: RuleEvaluationResult[],
    userId: string,
    processingTime: number,
    totalRulesEvaluated: number
  ): UnlockEvaluationResponse {
    // Calculate totals
    let totalUnlockMinutes = 0
    let totalBonusMinutes = 0
    const allAchievements: string[] = []
    const parentNotifications: ParentNotification[] = []
    const messages: string[] = []

    // Combine restrictions
    const combinedRestrictions: CombinedRestrictions = {
      allowedApps: [],
      blockedApps: [],
      timeWindows: [],
      effectiveUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }

    for (const result of triggeredRules) {
      totalUnlockMinutes += result.unlockMinutes
      totalBonusMinutes += result.bonusMinutes || 0

      if (result.achievements) {
        allAchievements.push(
          ...result.achievements.filter(a => !allAchievements.includes(a))
        )
      }

      if (result.message) {
        messages.push(result.message)
      }

      if (result.parentNotification && result.message) {
        parentNotifications.push({
          ruleId: result.ruleId,
          ruleName: result.ruleId, // Would get actual name from rule
          message: result.message,
          unlockMinutes: result.unlockMinutes,
          timestamp: result.metadata.evaluatedAt,
        })
      }

      // Combine restrictions
      if (result.restrictions) {
        if (result.restrictions.allowedApps) {
          combinedRestrictions.allowedApps.push(
            ...result.restrictions.allowedApps
          )
        }
        if (result.restrictions.blockedApps) {
          combinedRestrictions.blockedApps.push(
            ...result.restrictions.blockedApps
          )
        }
        if (result.restrictions.timeWindows) {
          combinedRestrictions.timeWindows.push(
            ...result.restrictions.timeWindows
          )
        }
      }
    }

    // Remove duplicates from restrictions
    combinedRestrictions.allowedApps = [
      ...new Set(combinedRestrictions.allowedApps),
    ]
    combinedRestrictions.blockedApps = [
      ...new Set(combinedRestrictions.blockedApps),
    ]

    // Generate combined message
    const combinedMessage =
      messages.length > 0
        ? messages.join(' ')
        : totalUnlockMinutes > 0
          ? `Great work! You've earned ${totalUnlockMinutes} minutes of iPad time!`
          : 'Keep up the good work!'

    // Create summary
    const summary: EvaluationSummary = {
      rulesEvaluated: totalRulesEvaluated,
      rulesTriggered: triggeredRules.length,
      rulesBlocked: 0, // Would be calculated based on limits
      highestPriorityRule:
        triggeredRules.length > 0 ? triggeredRules[0].ruleId : undefined,
      evaluationTime: processingTime,
      nextEligibleEvaluation: new Date(Date.now() + 60 * 1000).toISOString(), // 1 minute from now
    }

    return {
      userId,
      totalUnlockMinutes,
      totalBonusMinutes,
      triggeredRules,
      combinedMessage,
      achievements: allAchievements,
      restrictions: combinedRestrictions,
      parentNotifications,
      summary,
    }
  }

  /**
   * Validate a rule configuration
   */
  validateRule(rule: Partial<UnlockRule>): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!rule.name) errors.push('Rule name is required')
    if (!rule.criteria) errors.push('Rule criteria is required')
    if (!rule.action) errors.push('Rule action is required')

    // Validate criteria
    if (rule.criteria) {
      if (!rule.criteria.subject || rule.criteria.subject.length === 0) {
        errors.push('At least one subject must be specified')
      }

      if (
        rule.criteria.minScore !== undefined &&
        (rule.criteria.minScore < 0 || rule.criteria.minScore > 100)
      ) {
        errors.push('Minimum score must be between 0 and 100')
      }

      if (
        rule.criteria.maxScore !== undefined &&
        (rule.criteria.maxScore < 0 || rule.criteria.maxScore > 100)
      ) {
        errors.push('Maximum score must be between 0 and 100')
      }

      if (
        rule.criteria.minScore !== undefined &&
        rule.criteria.maxScore !== undefined &&
        rule.criteria.minScore > rule.criteria.maxScore
      ) {
        errors.push('Minimum score cannot be greater than maximum score')
      }
    }

    // Validate action
    if (rule.action) {
      if (
        rule.action.unlockMinutes === undefined ||
        rule.action.unlockMinutes < 0
      ) {
        errors.push('Unlock minutes must be specified and non-negative')
      }

      if (rule.action.unlockMinutes > 480) {
        warnings.push('Unlock minutes exceeds 8 hours - this may be excessive')
      }
    }

    // Validate limits
    if (rule.limits) {
      if (rule.limits.maxDaily !== undefined && rule.limits.maxDaily < 0) {
        errors.push('Daily limit cannot be negative')
      }

      if (rule.limits.maxWeekly !== undefined && rule.limits.maxWeekly < 0) {
        errors.push('Weekly limit cannot be negative')
      }

      if (
        rule.limits.maxDaily !== undefined &&
        rule.limits.maxWeekly !== undefined &&
        rule.limits.maxDaily * 7 > rule.limits.maxWeekly
      ) {
        warnings.push('Daily limit * 7 exceeds weekly limit')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
