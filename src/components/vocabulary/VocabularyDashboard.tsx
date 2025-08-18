/**
 * Vocabulary Dashboard Component
 * 词汇学习主仪表板 - 提供完整的词汇学习管理界面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  BarChart3, 
  Clock, 
  Star,
  Target,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { WordList } from './WordManagement/WordList';
import { CSVImporter } from './WordManagement/CSVImporter';
import { WordEditor } from './WordManagement/WordEditor';
import { NewWordLearning } from './LearningModes/NewWordLearning';
import { ReviewMode } from './LearningModes/ReviewMode';
import { TestMode } from './LearningModes/TestMode';
import { LearningStats } from './Progress/LearningStats';
import { ReviewSchedule } from './Progress/ReviewSchedule';

interface VocabularyStats {
  totalWords: number;
  learnedWords: number;
  reviewWords: number;
  masteredWords: number;
  todayStudyTime: number;
  weeklyProgress: number;
  streak: number;
}

interface ReviewScheduleData {
  todayWords: number;
  overdueWords: number;
  tomorrowWords: number;
  weekWords: number;
}

export function VocabularyDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [reviewSchedule, setReviewSchedule] = useState<ReviewScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取统计数据
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 并行获取统计数据
      const [statsResponse, scheduleResponse] = await Promise.all([
        fetch('/api/vocabulary/progress'),
        fetch('/api/vocabulary/review-schedule')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // 处理统计数据
        const processedStats: VocabularyStats = {
          totalWords: statsData.statistics?.phaseDistribution ? 
            Object.values(statsData.statistics.phaseDistribution).reduce((a: number, b: number) => a + b, 0) : 0,
          learnedWords: statsData.progress?.length || 0,
          reviewWords: statsData.statistics?.reviewSchedule?.totalPending || 0,
          masteredWords: statsData.statistics?.phaseDistribution?.MASTERY || 0,
          todayStudyTime: 0, // 从其他API获取
          weeklyProgress: 75, // 从其他API获取
          streak: 5 // 从其他API获取
        };
        
        setStats(processedStats);
      }

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setReviewSchedule({
          todayWords: scheduleData.statistics?.todayWords || 0,
          overdueWords: scheduleData.statistics?.overdueWords || 0,
          tomorrowWords: scheduleData.statistics?.tomorrowWords || 0,
          weekWords: scheduleData.statistics?.totalReviewWords || 0
        });
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'word-management':
        return <WordList onWordUpdate={fetchDashboardData} />;
      case 'csv-import':
        return <CSVImporter onImportComplete={fetchDashboardData} />;
      case 'add-word':
        return <WordEditor onWordSaved={fetchDashboardData} />;
      case 'new-learning':
        return <NewWordLearning onProgressUpdate={fetchDashboardData} />;
      case 'review':
        return <ReviewMode onProgressUpdate={fetchDashboardData} />;
      case 'test':
        return <TestMode onProgressUpdate={fetchDashboardData} />;
      case 'statistics':
        return <LearningStats />;
      case 'schedule':
        return <ReviewSchedule />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">总词汇量</p>
              <p className="text-2xl font-bold">{stats?.totalWords || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">已学习</p>
              <p className="text-2xl font-bold">{stats?.learnedWords || 0}</p>
              <Progress 
                value={stats ? (stats.learnedWords / stats.totalWords) * 100 : 0} 
                className="h-2 mt-2" 
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">待复习</p>
              <p className="text-2xl font-bold text-orange-600">{reviewSchedule?.todayWords || 0}</p>
              {(reviewSchedule?.overdueWords || 0) > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {reviewSchedule?.overdueWords} 过期
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">已掌握</p>
              <p className="text-2xl font-bold">{stats?.masteredWords || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                连续学习 {stats?.streak || 0} 天
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => setActiveTab('new-learning')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <BookOpen className="h-6 w-6 mb-2" />
            <span>学习新词汇</span>
            <span className="text-xs text-gray-500">开始学习新单词</span>
          </Button>

          <Button 
            onClick={() => setActiveTab('review')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Clock className="h-6 w-6 mb-2" />
            <span>复习模式</span>
            <span className="text-xs text-gray-500">
              {reviewSchedule?.todayWords || 0} 个词汇待复习
            </span>
          </Button>

          <Button 
            onClick={() => setActiveTab('test')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Target className="h-6 w-6 mb-2" />
            <span>测试模式</span>
            <span className="text-xs text-gray-500">检测学习效果</span>
          </Button>
        </div>
      </Card>

      {/* 学习进度概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 周学习进度 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">本周学习进度</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>目标完成度</span>
              <span>{stats?.weeklyProgress || 0}%</span>
            </div>
            <Progress value={stats?.weeklyProgress || 0} className="h-3" />
            <p className="text-xs text-gray-500">
              本周已学习 {stats?.todayStudyTime || 0} 分钟
            </p>
          </div>
        </Card>

        {/* 复习计划 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">复习计划</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">今天</span>
              <Badge variant={reviewSchedule?.todayWords ? "default" : "secondary"}>
                {reviewSchedule?.todayWords || 0} 个词汇
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">明天</span>
              <Badge variant="outline">
                {reviewSchedule?.tomorrowWords || 0} 个词汇
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">本周</span>
              <Badge variant="outline">
                {reviewSchedule?.weekWords || 0} 个词汇
              </Badge>
            </div>
            {(reviewSchedule?.overdueWords || 0) > 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-red-600">过期未复习</span>
                <Badge variant="destructive">
                  {reviewSchedule?.overdueWords} 个词汇
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">词汇学习中心</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('csv-import')}>
            <Upload className="h-4 w-4 mr-2" />
            导入词汇
          </Button>
          <Button onClick={() => setActiveTab('add-word')}>
            <Plus className="h-4 w-4 mr-2" />
            添加词汇
          </Button>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { id: 'overview', label: '概览', icon: BarChart3 },
          { id: 'new-learning', label: '新词学习', icon: BookOpen },
          { id: 'review', label: '复习模式', icon: Clock },
          { id: 'test', label: '测试模式', icon: Target },
          { id: 'word-management', label: '词汇管理', icon: Filter },
          { id: 'statistics', label: '学习统计', icon: TrendingUp },
          { id: 'schedule', label: '复习计划', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-1"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
}