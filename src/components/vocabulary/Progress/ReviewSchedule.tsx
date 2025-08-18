/**
 * Review Schedule Component
 * 复习计划组件 - 基于遗忘曲线的复习安排展示
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Volume2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';

interface ReviewWord {
  id: string;
  wordId: string;
  word: {
    word: string;
    definition: string;
    chineseDefinition?: string;
    pronunciation?: string;
    partOfSpeech: string;
    difficulty: number;
    category?: string;
  };
  phase: string;
  masteryLevel: number;
  nextReviewDate: string;
  priority: number;
  status: 'pending' | 'overdue' | 'today';
}

interface ReviewScheduleData {
  schedule: Record<string, ReviewWord[]>;
  statistics: {
    todayWords: number;
    overdueWords: number;
    tomorrowWords: number;
    totalPending: number;
  };
  recommendations: string[];
}

export function ReviewSchedule() {
  const [scheduleData, setScheduleData] = useState<ReviewScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  // 初始化
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    setCurrentWeekStart(getWeekStart(today));
    fetchScheduleData();
  }, []);

  // 获取复习计划数据
  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vocabulary/review-schedule?days=14&includeOverdue=true');
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
      }
    } catch (error) {
      console.error('Failed to fetch review schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取一周的开始日期
  const getWeekStart = (date: Date): Date => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // 周一为开始
    return new Date(start.setDate(diff));
  };

  // 生成一周的日期
  const generateWeekDates = (startDate: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 批量更新复习状态
  const batchUpdateReviews = async (wordIds: string[], action: string) => {
    try {
      const response = await fetch('/api/vocabulary/review-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordIds, action })
      });

      if (response.ok) {
        await fetchScheduleData();
      }
    } catch (error) {
      console.error('Failed to update reviews:', error);
    }
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

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'today': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'bg-red-500';
    if (priority >= 50) return 'bg-orange-500';
    if (priority >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">暂无复习计划数据</p>
        <Button onClick={fetchScheduleData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新数据
        </Button>
      </div>
    );
  }

  const weekDates = generateWeekDates(currentWeekStart);
  const selectedDateWords = scheduleData.schedule[selectedDate] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          复习计划
        </h2>
        <Button onClick={fetchScheduleData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">过期词汇</p>
              <p className="text-2xl font-bold text-red-600">
                {scheduleData.statistics.overdueWords}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">今日复习</p>
              <p className="text-2xl font-bold text-blue-600">
                {scheduleData.statistics.todayWords}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">明日计划</p>
              <p className="text-2xl font-bold text-green-600">
                {scheduleData.statistics.tomorrowWords}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">待复习总计</p>
              <p className="text-2xl font-bold text-purple-600">
                {scheduleData.statistics.totalPending}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 学习建议 */}
      {scheduleData.recommendations.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">学习建议</h3>
          <div className="space-y-2">
            {scheduleData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 周视图 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">本周复习计划</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newStart = new Date(currentWeekStart);
                newStart.setDate(newStart.getDate() - 7);
                setCurrentWeekStart(newStart);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              {currentWeekStart.toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
              })} - {
                new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
                  .toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
              }
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newStart = new Date(currentWeekStart);
                newStart.setDate(newStart.getDate() + 7);
                setCurrentWeekStart(newStart);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const wordsForDate = scheduleData.schedule[dateKey] || [];
            const isToday = dateKey === new Date().toISOString().split('T')[0];
            const isSelected = dateKey === selectedDate;

            return (
              <div
                key={dateKey}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                onClick={() => setSelectedDate(dateKey)}
              >
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                  </p>
                  <p className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </p>
                  
                  {wordsForDate.length > 0 && (
                    <div className="space-y-1">
                      <div className={`w-full h-1 rounded ${
                        wordsForDate.some(w => w.status === 'overdue') ? 'bg-red-400' :
                        wordsForDate.some(w => w.status === 'today') ? 'bg-blue-400' :
                        'bg-gray-300'
                      }`} />
                      <p className="text-xs text-gray-600">{wordsForDate.length}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 选中日期的详情 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? '今日复习 ' 
              : `${new Date(selectedDate).toLocaleDateString('zh-CN', { 
                  month: 'long', 
                  day: 'numeric' 
                })} 复习 `}
            ({selectedDateWords.length} 个词汇)
          </h3>
          
          {selectedDateWords.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => batchUpdateReviews(
                  selectedDateWords.map(w => w.wordId),
                  'mark_completed'
                )}
              >
                全部标记为已复习
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => batchUpdateReviews(
                  selectedDateWords.map(w => w.wordId),
                  'postpone'
                )}
              >
                推迟到明天
              </Button>
            </div>
          )}
        </div>

        {selectedDateWords.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">这一天没有需要复习的词汇</p>
            <p className="text-sm text-gray-400 mt-2">可以学习新词汇或休息一下！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateWords
              .sort((a, b) => b.priority - a.priority) // 按优先级排序
              .map((reviewWord) => (
                <div 
                  key={reviewWord.id}
                  className={`p-4 border rounded-lg ${getStatusColor(reviewWord.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium">{reviewWord.word.word}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeak(reviewWord.word.word)}
                          className="p-1 h-6 w-6"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        
                        {/* 优先级指示器 */}
                        <div 
                          className={`w-2 h-2 rounded-full ${getPriorityColor(reviewWord.priority)}`}
                          title={`优先级: ${reviewWord.priority}`}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline">{reviewWord.word.partOfSpeech}</Badge>
                        <Badge variant="outline">难度 {reviewWord.word.difficulty}</Badge>
                        <Badge variant="outline">{reviewWord.phase}</Badge>
                        {reviewWord.word.category && (
                          <Badge variant="secondary">{reviewWord.word.category}</Badge>
                        )}
                      </div>

                      <p className="text-sm mb-1">{reviewWord.word.definition}</p>
                      {reviewWord.word.chineseDefinition && (
                        <p className="text-sm text-gray-600 mb-2">
                          {reviewWord.word.chineseDefinition}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>掌握度: {reviewWord.masteryLevel}%</span>
                        <span>优先级: {reviewWord.priority}</span>
                        {reviewWord.status === 'overdue' && (
                          <Badge variant="destructive" className="text-xs">
                            已过期
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 掌握度进度条 */}
                    <div className="w-24 ml-4">
                      <Progress value={reviewWord.masteryLevel} className="h-2 mb-2" />
                      <p className="text-xs text-gray-500 text-center">
                        {reviewWord.masteryLevel}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}