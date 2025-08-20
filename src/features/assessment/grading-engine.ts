import {
  BaseQuestion,
  UserAnswer,
  GradingResult,
  DetailedResult,
  MCQQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
  FillBlankQuestion,
  ErrorDiagnosis,
  TimingConfig,
  BlankAnswer,
  MatchPair,
  GradingMetadata
} from './types';

export class GradingEngine {
  private version = '1.0.0';

  /**
   * Main grading method that routes to specific graders based on question type
   */
  async grade(
    question: BaseQuestion,
    userAnswer: UserAnswer,
    timeTaken?: number
  ): Promise<GradingResult> {
    const startTime = Date.now();
    
    let result: Omit<GradingResult, 'gradingMetadata'>;
    
    try {
      switch (question.type) {
        case 'multiple_choice':
          result = await this.gradeMCQ(question as MCQQuestion, userAnswer as string[]);
          break;
        case 'true_false':
          result = await this.gradeTrueFalse(question as TrueFalseQuestion, userAnswer as boolean);
          break;
        case 'matching':
          result = await this.gradeMatching(question as MatchingQuestion, userAnswer as MatchPair[]);
          break;
        case 'fill_blank':
          result = await this.gradeFillBlank(question as FillBlankQuestion, userAnswer as Record<string, string>);
          break;
        case 'short_answer':
          result = await this.gradeShortAnswer(question, userAnswer as string);
          break;
        case 'essay':
          result = await this.gradeEssay(question, userAnswer as string);
          break;
        default:
          throw new Error(`Unsupported question type: ${(question as any).type}`);
      }
    } catch (error) {
      // Return error result
      result = {
        score: 0,
        points: 0,
        maxPoints: question.scoring.maxPoints,
        isCorrect: false,
        partialCredit: 0,
        feedback: [`Error processing your answer: ${error instanceof Error ? error.message : 'Unknown error'}`],
        detailedResults: []
      };
    }

    // Apply time adjustments if configured
    if (timeTaken && question.scoring.bonusForSpeed) {
      const timeAdjustment = this.calculateTimeAdjustment(timeTaken, {
        expectedTime: question.metadata.estimatedTime,
        speedBonusThreshold: question.metadata.estimatedTime * 0.7,
        timeoutPenalty: 0.1,
        maxBonus: 0.2,
        maxPenalty: 0.3
      });
      
      result.timeBonus = timeAdjustment.bonus;
      result.penalty = timeAdjustment.penalty;
      
      // Adjust final score
      const adjustedScore = Math.max(0, Math.min(100, 
        result.score + (timeAdjustment.bonus * 100) - (timeAdjustment.penalty * 100)
      ));
      result.score = adjustedScore;
      
      if (timeAdjustment.message) {
        result.feedback.push(timeAdjustment.message);
      }
    }

    const processingTime = Date.now() - startTime;

    const gradingMetadata: GradingMetadata = {
      gradedAt: new Date().toISOString(),
      gradingVersion: this.version,
      processingTime,
      errorDiagnosis: await this.diagnoseErrors(question, userAnswer, result),
      suggestions: this.generateSuggestions(question, result)
    };

    return {
      ...result,
      gradingMetadata
    };
  }

  /**
   * Grade Multiple Choice Questions
   */
  private async gradeMCQ(question: MCQQuestion, userAnswer: string[]): Promise<Omit<GradingResult, 'gradingMetadata'>> {
    const correctAnswers = new Set(question.answerKey.correct);
    const userAnswers = new Set(userAnswer || []);
    
    // Calculate correctness metrics
    const correctSelected = [...userAnswers].filter(ans => correctAnswers.has(ans));
    const incorrectSelected = [...userAnswers].filter(ans => !correctAnswers.has(ans));
    const correctMissed = [...correctAnswers].filter(ans => !userAnswers.has(ans));
    
    let points = 0;
    let isCorrect = false;
    let partialCredit = 0;
    
    if (question.scoring.partialCredit && correctAnswers.size > 1) {
      // Partial credit scoring for multiple correct answers
      const correctWeight = 1.0 / correctAnswers.size;
      const incorrectPenalty = question.scoring.penaltyForWrong || 0.25;
      
      partialCredit = Math.max(0, 
        (correctSelected.length * correctWeight) - 
        (incorrectSelected.length * incorrectPenalty)
      );
      
      points = partialCredit;
      isCorrect = partialCredit >= 0.8; // 80% threshold
    } else {
      // All-or-nothing scoring
      isCorrect = correctSelected.length === correctAnswers.size && 
                  incorrectSelected.length === 0;
      points = isCorrect ? 1 : 0;
      partialCredit = points;
    }
    
    const finalPoints = points * question.scoring.maxPoints;
    const score = (finalPoints / question.scoring.maxPoints) * 100;
    
    const feedback = this.generateMCQFeedback(question, userAnswers, correctAnswers);
    
    const detailedResults: DetailedResult[] = [{
      questionPart: 'main',
      userAnswer: [...userAnswers],
      correctAnswer: [...correctAnswers],
      isCorrect,
      points: finalPoints,
      maxPoints: question.scoring.maxPoints,
      feedback: feedback.join(' ')
    }];

    return {
      score,
      points: finalPoints,
      maxPoints: question.scoring.maxPoints,
      isCorrect,
      partialCredit,
      feedback,
      detailedResults
    };
  }

  /**
   * Grade True/False Questions
   */
  private async gradeTrueFalse(question: TrueFalseQuestion, userAnswer: boolean): Promise<Omit<GradingResult, 'gradingMetadata'>> {
    const isCorrect = userAnswer === question.answerKey.correct;
    const points = isCorrect ? question.scoring.maxPoints : 0;
    const score = (points / question.scoring.maxPoints) * 100;
    
    const feedback: string[] = [];
    if (isCorrect) {
      feedback.push('✅ Correct!');
    } else {
      feedback.push(`❌ Incorrect. The correct answer is ${question.answerKey.correct ? 'True' : 'False'}.`);
    }
    
    if (question.answerKey.explanation) {
      feedback.push(`💡 ${question.answerKey.explanation}`);
    }
    
    const detailedResults: DetailedResult[] = [{
      questionPart: 'main',
      userAnswer,
      correctAnswer: question.answerKey.correct,
      isCorrect,
      points,
      maxPoints: question.scoring.maxPoints
    }];

    return {
      score,
      points,
      maxPoints: question.scoring.maxPoints,
      isCorrect,
      partialCredit: isCorrect ? 1 : 0,
      feedback,
      detailedResults
    };
  }

  /**
   * Grade Matching Questions
   */
  private async gradeMatching(question: MatchingQuestion, userAnswer: MatchPair[]): Promise<Omit<GradingResult, 'gradingMetadata'>> {
    const correctMatches = new Map(
      question.answerKey.matches.map(match => [`${match.left}-${match.right}`, match])
    );
    
    const userMatches = new Map(
      (userAnswer || []).map(match => [`${match.left}-${match.right}`, match])
    );
    
    let totalPoints = 0;
    let maxTotalPoints = 0;
    const detailedResults: DetailedResult[] = [];
    
    // Check each correct match
    for (const [key, correctMatch] of correctMatches) {
      const points = correctMatch.points || 1;
      maxTotalPoints += points;
      
      const isCorrect = userMatches.has(key);
      const earnedPoints = isCorrect ? points : 0;
      totalPoints += earnedPoints;
      
      detailedResults.push({
        questionPart: `${correctMatch.left}-${correctMatch.right}`,
        userAnswer: isCorrect ? correctMatch : null,
        correctAnswer: correctMatch,
        isCorrect,
        points: earnedPoints,
        maxPoints: points
      });
    }
    
    // Check for incorrect matches (penalties)
    for (const [key, userMatch] of userMatches) {
      if (!correctMatches.has(key)) {
        detailedResults.push({
          questionPart: `${userMatch.left}-${userMatch.right}`,
          userAnswer: userMatch,
          correctAnswer: null,
          isCorrect: false,
          points: 0,
          maxPoints: 0,
          feedback: 'Incorrect match'
        });
      }
    }
    
    const score = maxTotalPoints > 0 ? (totalPoints / maxTotalPoints) * 100 : 0;
    const isOverallCorrect = totalPoints === maxTotalPoints;
    const partialCredit = maxTotalPoints > 0 ? totalPoints / maxTotalPoints : 0;
    
    const correctCount = detailedResults.filter(r => r.isCorrect).length;
    const totalExpected = correctMatches.size;
    
    const feedback: string[] = [];
    if (isOverallCorrect) {
      feedback.push('✅ Perfect! All matches are correct.');
    } else {
      feedback.push(`You got ${correctCount} out of ${totalExpected} matches correct.`);
    }
    
    if (question.answerKey.explanation) {
      feedback.push(`💡 ${question.answerKey.explanation}`);
    }

    return {
      score,
      points: totalPoints,
      maxPoints: maxTotalPoints,
      isCorrect: isOverallCorrect,
      partialCredit,
      feedback,
      detailedResults
    };
  }

  /**
   * Grade Fill-in-the-Blank Questions
   */
  private async gradeFillBlank(question: FillBlankQuestion, userAnswer: Record<string, string>): Promise<Omit<GradingResult, 'gradingMetadata'>> {
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
        maxPoints,
        feedback: gradeResult.feedback
      });
      
      totalPoints += gradeResult.points * maxPoints;
    }
    
    const score = maxTotalPoints > 0 ? (totalPoints / maxTotalPoints) * 100 : 0;
    const isOverallCorrect = detailedResults.every(r => r.isCorrect);
    const partialCredit = maxTotalPoints > 0 ? totalPoints / maxTotalPoints : 0;
    
    const feedback = this.generateFillBlankFeedback(detailedResults);

    return {
      score,
      points: totalPoints,
      maxPoints: maxTotalPoints,
      isCorrect: isOverallCorrect,
      partialCredit,
      feedback,
      detailedResults
    };
  }

  /**
   * Grade Short Answer Questions (placeholder implementation)
   */
  private async gradeShortAnswer(question: BaseQuestion, userAnswer: string): Promise<Omit<GradingResult, 'gradingMetadata'>> {
    // This would typically use NLP or keyword matching
    // For now, return a basic implementation
    const hasContent = userAnswer.trim().length > 0;
    const points = hasContent ? question.scoring.maxPoints * 0.5 : 0; // Partial credit for attempt
    
    return {
      score: (points / question.scoring.maxPoints) * 100,
      points,
      maxPoints: question.scoring.maxPoints,
      isCorrect: false, // Would need manual grading
      partialCredit: hasContent ? 0.5 : 0,
      feedback: [
        hasContent 
          ? '📝 Your answer has been submitted and will be reviewed by your teacher.' 
          : '❌ Please provide an answer.'
      ],
      detailedResults: [{
        questionPart: 'main',
        userAnswer,
        correctAnswer: 'Requires manual grading',
        isCorrect: false,
        points,
        maxPoints: question.scoring.maxPoints,
        confidence: 0.1
      }]
    };
  }

  /**
   * Grade Essay Questions (placeholder implementation)
   */
  private async gradeEssay(question: BaseQuestion, userAnswer: string): Promise<Omit<GradingResult, 'gradingMetadata'>> {
    // Similar to short answer, would need sophisticated NLP
    const wordCount = userAnswer.trim().split(/\s+/).length;
    const hasMinimalContent = wordCount >= 10;
    
    return {
      score: 0, // Requires manual grading
      points: 0,
      maxPoints: question.scoring.maxPoints,
      isCorrect: false,
      partialCredit: 0,
      feedback: [
        hasMinimalContent 
          ? `📝 Your essay (${wordCount} words) has been submitted for review.`
          : '❌ Please write a more substantial response.'
      ],
      detailedResults: [{
        questionPart: 'main',
        userAnswer,
        correctAnswer: 'Requires manual grading',
        isCorrect: false,
        points: 0,
        maxPoints: question.scoring.maxPoints,
        confidence: 0
      }]
    };
  }

  /**
   * Helper methods
   */
  private generateMCQFeedback(
    question: MCQQuestion,
    userAnswers: Set<string>,
    correctAnswers: Set<string>
  ): string[] {
    const feedback: string[] = [];
    
    if (userAnswers.size === 0) {
      feedback.push('❌ Please select an answer.');
      return feedback;
    }
    
    const isFullyCorrect = 
      userAnswers.size === correctAnswers.size &&
      [...userAnswers].every(ans => correctAnswers.has(ans));
      
    if (isFullyCorrect) {
      feedback.push('✅ Excellent! Your answer is correct.');
    } else {
      const correctSelected = [...userAnswers].filter(ans => correctAnswers.has(ans));
      const incorrectSelected = [...userAnswers].filter(ans => !correctAnswers.has(ans));
      
      if (correctSelected.length > 0) {
        const correctOptions = correctSelected.map(id => 
          question.content.options.find(opt => opt.id === id)?.text || id
        ).join(', ');
        feedback.push(`✅ You correctly identified: ${correctOptions}`);
      }
      
      if (incorrectSelected.length > 0) {
        const incorrectOptions = incorrectSelected.map(id => 
          question.content.options.find(opt => opt.id === id)?.text || id
        ).join(', ');
        feedback.push(`❌ These answers are incorrect: ${incorrectOptions}`);
      }
      
      const missed = [...correctAnswers].filter(ans => !userAnswers.has(ans));
      if (missed.length > 0) {
        const missedOptions = missed.map(id => 
          question.content.options.find(opt => opt.id === id)?.text || id
        ).join(', ');
        feedback.push(`📝 You missed: ${missedOptions}`);
      }
    }
    
    if (question.answerKey.explanation) {
      feedback.push(`💡 ${question.answerKey.explanation}`);
    }
    
    return feedback;
  }

  private gradeBlankAnswer(
    userInput: string,
    answerDef: BlankAnswer,
    caseSensitive = false
  ): { isCorrect: boolean; points: number; feedback?: string } {
    
    if (!userInput.trim()) {
      return {
        isCorrect: false,
        points: 0,
        feedback: 'This blank was not filled in.'
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
        feedback: answerDef.feedback || '✅ Correct!'
      };
    }
    
    // Check for close matches (for partial credit)
    if (answerDef.acceptSynonyms) {
      const similarity = this.calculateMaxSimilarity(normalizedInput, answerDef.acceptedAnswers);
      
      if (similarity >= 0.8) {
        return {
          isCorrect: true,
          points: 0.8,
          feedback: '✅ Very close! This is an acceptable answer.'
        };
      } else if (similarity >= 0.6) {
        return {
          isCorrect: false,
          points: 0.5,
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

  private generateFillBlankFeedback(detailedResults: DetailedResult[]): string[] {
    const feedback: string[] = [];
    const correctCount = detailedResults.filter(r => r.isCorrect).length;
    const totalCount = detailedResults.length;
    
    if (correctCount === totalCount) {
      feedback.push('✅ Perfect! All blanks are filled correctly.');
    } else if (correctCount > 0) {
      feedback.push(`You got ${correctCount} out of ${totalCount} blanks correct.`);
    } else {
      feedback.push('❌ None of the blanks were filled correctly. Please review your answers.');
    }
    
    // Add specific feedback for incorrect answers
    detailedResults
      .filter(r => !r.isCorrect && r.feedback)
      .slice(0, 3) // Limit to first 3 to avoid overwhelming feedback
      .forEach(r => feedback.push(r.feedback!));
    
    return feedback;
  }

  private calculateMaxSimilarity(input: string, acceptedAnswers: string[]): number {
    return Math.max(...acceptedAnswers.map(accepted => 
      this.levenshteinSimilarity(input.toLowerCase(), accepted.toLowerCase())
    ));
  }

  private levenshteinSimilarity(a: string, b: string): number {
    if (a.length === 0) return b.length === 0 ? 1 : 0;
    if (b.length === 0) return 0;
    
    const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,     // deletion
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    const maxLength = Math.max(a.length, b.length);
    return (maxLength - matrix[b.length][a.length]) / maxLength;
  }

  private calculateTimeAdjustment(
    timeTaken: number,
    config: TimingConfig
  ): { bonus: number; penalty: number; message?: string } {
    let bonus = 0;
    let penalty = 0;
    let message: string | undefined;
    
    if (timeTaken <= config.speedBonusThreshold) {
      const speedRatio = config.speedBonusThreshold / timeTaken;
      bonus = Math.min(config.maxBonus, (speedRatio - 1) * 0.1);
      message = `🚀 Speed bonus! You completed this ${Math.round((speedRatio - 1) * 100)}% faster than expected.`;
    } else if (timeTaken > config.expectedTime * 2) {
      const timeRatio = timeTaken / config.expectedTime;
      penalty = Math.min(config.maxPenalty, (timeRatio - 2) * 0.05);
      message = '⏰ This took longer than expected. Try to work more quickly next time.';
    }
    
    return { bonus, penalty, message };
  }

  private async diagnoseErrors(
    question: BaseQuestion,
    userAnswer: UserAnswer,
    result: Omit<GradingResult, 'gradingMetadata'>
  ): Promise<ErrorDiagnosis[]> {
    const diagnoses: ErrorDiagnosis[] = [];
    
    // Only diagnose errors if the answer was incorrect
    if (result.isCorrect) {
      return diagnoses;
    }
    
    // Common error patterns based on question type
    switch (question.type) {
      case 'multiple_choice':
        diagnoses.push(...this.diagnoseMCQErrors(question as MCQQuestion, userAnswer as string[]));
        break;
      case 'fill_blank':
        diagnoses.push(...this.diagnoseFillBlankErrors(question as FillBlankQuestion, userAnswer as Record<string, string>));
        break;
    }
    
    return diagnoses
      .filter(d => d.confidence >= 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  private diagnoseMCQErrors(question: MCQQuestion, userAnswer: string[]): ErrorDiagnosis[] {
    const diagnoses: ErrorDiagnosis[] = [];
    
    if (!userAnswer || userAnswer.length === 0) {
      diagnoses.push({
        errorType: 'no_attempt',
        confidence: 1.0,
        description: 'No answer was selected',
        remediation: 'Make sure to read the question carefully and select the best answer',
        relatedConcepts: ['test-taking-strategies', 'reading-comprehension'],
        priority: 'high'
      });
    } else if (userAnswer.length > 1 && !question.content.selectMultiple) {
      diagnoses.push({
        errorType: 'over_selection',
        confidence: 0.9,
        description: 'Multiple options selected for single-answer question',
        remediation: 'Look for keywords like "choose the best answer" or "select one"',
        relatedConcepts: ['instruction-following', 'test-taking-strategies'],
        priority: 'medium'
      });
    }
    
    // Subject-specific diagnoses
    if (question.metadata.subject === 'mathematics') {
      diagnoses.push(...this.diagnoseMathErrors(question, userAnswer));
    }
    
    return diagnoses;
  }

  private diagnoseMathErrors(question: MCQQuestion, userAnswer: string[]): ErrorDiagnosis[] {
    const diagnoses: ErrorDiagnosis[] = [];
    
    // Look for operation confusion in division problems
    if (question.metadata.tags.includes('division')) {
      const stem = question.content.stem;
      const divisionMatch = stem.match(/(\d+)\s*÷\s*(\d+)/);
      
      if (divisionMatch) {
        const [, dividend, divisor] = divisionMatch;
        const multiplicationResult = parseInt(dividend) * parseInt(divisor);
        
        const selectedMultiplication = question.content.options.find(opt => 
          opt.text === multiplicationResult.toString() && userAnswer.includes(opt.id)
        );
        
        if (selectedMultiplication) {
          diagnoses.push({
            errorType: 'operation_confusion',
            confidence: 0.9,
            description: 'May have multiplied instead of dividing',
            remediation: 'Review the difference between × and ÷ symbols. Practice identifying which operation to use.',
            relatedConcepts: ['division', 'multiplication', 'operation-symbols'],
            priority: 'high'
          });
        }
      }
    }
    
    return diagnoses;
  }

  private diagnoseFillBlankErrors(question: FillBlankQuestion, userAnswer: Record<string, string>): ErrorDiagnosis[] {
    const diagnoses: ErrorDiagnosis[] = [];
    
    const emptyBlanks = question.content.blanks.filter(blank => !userAnswer[blank.id]?.trim()).length;
    
    if (emptyBlanks > 0) {
      diagnoses.push({
        errorType: 'incomplete_response',
        confidence: 1.0,
        description: `${emptyBlanks} blank(s) were not filled in`,
        remediation: 'Make sure to complete all parts of the question',
        relatedConcepts: ['attention-to-detail', 'task-completion'],
        priority: 'high'
      });
    }
    
    return diagnoses;
  }

  private generateSuggestions(question: BaseQuestion, result: Omit<GradingResult, 'gradingMetadata'>): string[] {
    const suggestions: string[] = [];
    
    if (result.score < 50) {
      suggestions.push(`Review the ${question.metadata.subject} topic: ${question.metadata.topic}`);
      suggestions.push('Consider asking your teacher for additional help with this concept');
    } else if (result.score < 80) {
      suggestions.push('Good effort! A little more practice will help you master this topic');
      suggestions.push('Try similar questions to reinforce your understanding');
    } else {
      suggestions.push('Great work! You have a solid understanding of this concept');
      if (result.score < 100) {
        suggestions.push('Pay attention to small details to achieve perfect scores');
      }
    }
    
    return suggestions;
  }
}