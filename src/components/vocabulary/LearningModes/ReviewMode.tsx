/**
 * Review Mode Component
 * 复习模式组件 - 基于遗忘曲线的科学复习
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ReviewModeProps {
  onProgressUpdate?: () => void;
}

interface ReviewWord {
  id: string;
  word: VocabularyWord;
  phase: string;
  masteryLevel: number;
  nextReviewDate: string;
  needsReview: boolean;
  streakCount: number;
  attempts: number;
  correctAttempts: number;
}

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  chineseDefinition?: string;
  pronunciation?: string;
  partOfSpeech: string;
  difficulty: number;
  yearLevel?: number;
  category?: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface ReviewSession {
  words: ReviewWord[];
  currentIndex: number;
  completedWords: string[];
  sessionStats: {
    startTime: Date;
    totalWords: number;
    correctAnswers: number;
    reviewedCount: number;
  };
}

const PRACTICE_TYPES = [
  {
    id: 'recognition',
    name: '词义识别',
    description: '看英文选择中文释义'
  },
  {
    id: 'translation',
    name: '英译中',
    description: '根据释义选择英文单词'
  },
  {
    id: 'context',
    name: '语境理解',
    description: '在句子中理解单词含义'
  }
];

export function ReviewMode({ onProgressUpdate }: ReviewModeProps) {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPracticeType, setCurrentPracticeType] = useState<string>('recognition');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [reviewStats, setReviewStats] = useState<any>(null);

  // 获取需要复习的词汇
  const startReviewSession = useCallback(async () => {
    setLoading(true);
    try {
      // 获取复习计划
      const scheduleResponse = await fetch('/api/vocabulary/review-schedule?includeOverdue=true');
      
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setReviewStats(scheduleData.statistics);
        
        // 获取今天需要复习的词汇
        const today = new Date().toISOString().split('T')[0];
        const todayWords = scheduleData.schedule[today] || [];
        
        // 获取过期的词汇
        const overdueWords: ReviewWord[] = [];
        const currentDate = new Date();
        
        Object.entries(scheduleData.schedule).forEach(([date, words]: [string, any]) => {
          if (new Date(date) < currentDate) {
            overdueWords.push(...words);
          }
        });
        
        // 合并今天和过期的词汇，按优先级排序
        const allReviewWords = [...overdueWords, ...todayWords]
          .sort((a: any, b: any) => b.priority - a.priority)
          .slice(0, 20); // 限制最多20个词汇

        if (allReviewWords.length === 0) {
          alert('太棒了！目前没有需要复习的词汇。');
          return;
        }

        initializeSession(allReviewWords);
      }
    } catch (error) {
      console.error('Failed to start review session:', error);
      alert('获取复习内容失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化复习会话
  const initializeSession = (words: ReviewWord[]) => {
    const newSession: ReviewSession = {
      words: words,
      currentIndex: 0,
      completedWords: [],
      sessionStats: {
        startTime: new Date(),
        totalWords: words.length,
        correctAnswers: 0,
        reviewedCount: 0
      }
    };
    
    setSession(newSession);
    setCurrentPracticeType('recognition');
    setShowResult(false);
    setUserAnswer('');
  };

  // 初始加载
  useEffect(() => {
    startReviewSession();
  }, [startReviewSession]);

  // 生成练习选项
  const generateOptions = (correctAnswer: string, type: 'chinese' | 'english' | 'context') => {
    if (!session) return [];
    
    const currentWord = session.words[session.currentIndex];
    const allWords = session.words.map(w => w.word);
    const options = [correctAnswer];
    
    // 添加错误选项
    while (options.length < 4) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      let option: string;
      
      switch (type) {
        case 'chinese':
          option = randomWord.chineseDefinition || randomWord.definition;
          break;
        case 'english':
          option = randomWord.word;
          break;
        case 'context':
          option = randomWord.word;
          break;
        default:
          option = randomWord.word;
      }
      
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    
    // 随机排序
    return options.sort(() => Math.random() - 0.5);
  };

  // 提交答案
  const submitAnswer = async (answer: string) => {
    if (!session) return;

    const currentReviewWord = session.words[session.currentIndex];
    const correctAnswer = getCorrectAnswer(currentReviewWord, currentPracticeType);
    const isAnswerCorrect = answer === correctAnswer;
    
    setUserAnswer(answer);
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // 更新学习进度
    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentReviewWord.word.id,
          isCorrect: isAnswerCorrect,
          timeSpent: 30, // 假设每题用时30秒
          practiceType: currentPracticeType
        })
      });
      
      onProgressUpdate?.();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }

    // 更新会话统计
    setSession(prev => prev ? {
      ...prev,
      sessionStats: {
        ...prev.sessionStats,
        correctAnswers: isAnswerCorrect ? prev.sessionStats.correctAnswers + 1 : prev.sessionStats.correctAnswers,
        reviewedCount: prev.sessionStats.reviewedCount + 1
      }
    } : null);
  };

  // 获取正确答案
  const getCorrectAnswer = (reviewWord: ReviewWord, practiceType: string): string => {
    switch (practiceType) {
      case 'recognition':
        return reviewWord.word.chineseDefinition || reviewWord.word.definition;
      case 'translation':
        return reviewWord.word.word;
      case 'context':
        return reviewWord.word.word;
      default:
        return reviewWord.word.word;
    }
  };

  // 下一个词汇
  const nextWord = () => {
    if (!session) return;

    const currentWord = session.words[session.currentIndex];
    
    if (session.currentIndex < session.words.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        completedWords: [...prev.completedWords, currentWord.id]
      } : null);
      
      // 根据掌握度选择练习类型
      const nextReviewWord = session.words[session.currentIndex + 1];
      if (nextReviewWord.masteryLevel < 50) {
        setCurrentPracticeType('recognition');
      } else if (nextReviewWord.masteryLevel < 80) {
        setCurrentPracticeType('translation');
      } else {
        setCurrentPracticeType('context');
      }
      
      setShowResult(false);
      setUserAnswer('');
    } else {
      completeSession();
    }
  };

  // 完成复习会话
  const completeSession = () => {
    if (!session) return;
    
    const accuracy = (session.sessionStats.correctAnswers / session.sessionStats.reviewedCount) * 100;
    const totalTime = Math.floor((new Date().getTime() - session.sessionStats.startTime.getTime()) / 1000);

    alert(`复习完成！\n复习词汇: ${session.sessionStats.reviewedCount} 个\n正确率: ${accuracy.toFixed(1)}%\n总用时: ${Math.floor(totalTime / 60)}分${totalTime % 60}秒`);
    
    // 重新开始复习
    startReviewSession();
  };

  // 文本转语音
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-AU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentReviewWord = session.words[session.currentIndex];
  const currentWord = currentReviewWord.word;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 复习统计概览 */}
      {reviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">今日复习</p>
                <p className="text-2xl font-bold">{reviewStats.todayWords || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">过期词汇</p>
                <p className="text-2xl font-bold text-red-600">{reviewStats.overdueWords || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">当前进度</p>
                <p className="text-2xl font-bold">{session.currentIndex + 1}/{session.words.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">正确率</p>
                <p className="text-2xl font-bold">
                  {session.sessionStats.reviewedCount > 0 
                    ? Math.round((session.sessionStats.correctAnswers / session.sessionStats.reviewedCount) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 进度条 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">复习进度</span>
          <span className="text-sm text-gray-600">
            {session.currentIndex + 1} / {session.words.length}
          </span>
        </div>
        <Progress 
          value={((session.currentIndex + 1) / session.words.length) * 100} 
          className="h-3"
        />
      </Card>

      {/* 当前词汇信息 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">{currentWord.word}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeak(currentWord.word)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Badge variant="outline">{currentWord.partOfSpeech}</Badge>
            <Badge className={`${
              currentReviewWord.masteryLevel >= 80 ? 'bg-green-100 text-green-800' :
              currentReviewWord.masteryLevel >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              掌握度 {currentReviewWord.masteryLevel}%
            </Badge>
          </div>
        </div>

        {currentWord.pronunciation && (
          <p className="text-gray-600 mb-4">/{currentWord.pronunciation}/</p>
        )}

        {/* 词汇状态信息 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">学习阶段:</span>
              <p className="font-medium">{currentReviewWord.phase}</p>
            </div>
            <div>
              <span className="text-gray-600">复习次数:</span>
              <p className="font-medium">{currentReviewWord.attempts}</p>
            </div>
            <div>
              <span className="text-gray-600">连续正确:</span>
              <p className="font-medium">{currentReviewWord.streakCount}</p>
            </div>
            <div>
              <span className="text-gray-600">下次复习:</span>
              <p className="font-medium">
                {new Date(currentReviewWord.nextReviewDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 练习内容 */}
        <div className="text-center space-y-6">
          {/* 练习类型指示 */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              {PRACTICE_TYPES.find(t => t.id === currentPracticeType)?.name}
            </Badge>
          </div>

          {/* 根据练习类型显示不同内容 */}
          {currentPracticeType === 'recognition' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">选择正确的中文释义</h3>
              
              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(
                    currentWord.chineseDefinition || currentWord.definition, 
                    'chinese'
                  ).map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left"
                      onClick={() => submitAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentPracticeType === 'translation' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">根据释义选择正确的单词</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg">{currentWord.definition}</p>
                  {currentWord.chineseDefinition && (
                    <p className="text-gray-700 mt-2">{currentWord.chineseDefinition}</p>
                  )}
                </div>
              </div>
              
              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(currentWord.word, 'english').map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto"
                      onClick={() => submitAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentPracticeType === 'context' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">语境理解</h3>
              
              {currentWord.example && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-lg mb-4">
                    {currentWord.example.replace(
                      new RegExp(currentWord.word, 'gi'), 
                      '______'
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    选择最适合的单词填入空白处
                  </p>
                </div>
              )}
              
              {!showResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generateOptions(currentWord.word, 'context').map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto"
                      onClick={() => submitAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 答案结果 */}
          {showResult && (
            <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {isCorrect ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <span className={`text-xl font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '正确！' : '错误'}
                </span>
              </div>
              
              {!isCorrect && (
                <div className="mb-4 text-center">
                  <p className="text-red-700 mb-2">正确答案:</p>
                  <p className="text-xl font-semibold">
                    {getCorrectAnswer(currentReviewWord, currentPracticeType)}
                  </p>
                </div>
              )}

              <div className="bg-white p-4 rounded border mb-4">
                <p><strong>英文:</strong> {currentWord.definition}</p>
                {currentWord.chineseDefinition && (
                  <p className="mt-2"><strong>中文:</strong> {currentWord.chineseDefinition}</p>
                )}
                {currentWord.example && (
                  <p className="mt-2"><strong>例句:</strong> {currentWord.example}</p>
                )}
              </div>
              
              <Button onClick={nextWord} className="px-8">
                {session.currentIndex < session.words.length - 1 ? '下一个词汇' : '完成复习'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 重新开始复习 */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={startReviewSession}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重新开始复习</span>
        </Button>
      </div>
    </div>
  );
}