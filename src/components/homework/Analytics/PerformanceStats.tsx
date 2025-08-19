'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Award,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface PerformanceStatsProps {
  type: 'homework' | 'student' | 'subject' | 'overview'
  targetId?: string // homework ID, student ID, or subject name
  dateRange?: {
    start: Date
    end: Date
  }
}

interface StatsData {
  overview: {
    totalAssignments: number
    completedAssignments: number
    averageScore: number
    totalTimeSpent: number
    improvementTrend: number
  }
  subjects: {
    subject: string
    averageScore: number
    completionRate: number
    timeSpent: number
    trend: number
  }[]
  recentPerformance: {
    date: string
    score: number
    assignment: string
    timeSpent: number
  }[]
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}

export default function PerformanceStats({ 
  type, 
  targetId, 
  dateRange 
}: PerformanceStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  useEffect(() => {
    fetchStats()
  }, [type, targetId, selectedPeriod])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type,
        period: selectedPeriod,
        ...(targetId && { [`${type}Id`]: targetId })
      })

      const response = await fetch(`/api/homework/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverviewStats = () => {
    if (!stats) return null

    const { overview } = stats
    const completionRate = overview.totalAssignments > 0 
      ? (overview.completedAssignments / overview.totalAssignments) * 100 
      : 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 完成率 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className={completionRate >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {completionRate >= 80 ? '优秀' : '良好'}
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {completionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">完成率</p>
            <p className="text-xs text-gray-500 mt-1">
              {overview.completedAssignments}/{overview.totalAssignments} 个作业
            </p>
          </div>
        </Card>

        {/* 平均分 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              {overview.improvementTrend > 0 ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : overview.improvementTrend < 0 ? (
                <TrendingDown size={16} className="text-red-600" />
              ) : null}
              <span className={`text-xs ${
                overview.improvementTrend > 0 ? 'text-green-600' :
                overview.improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {overview.improvementTrend > 0 ? '+' : ''}{overview.improvementTrend.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {overview.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">平均分</p>
          </div>
        </Card>

        {/* 用时统计 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(overview.totalTimeSpent / 60)}
            </p>
            <p className="text-sm text-gray-600">总用时 (分钟)</p>
            <p className="text-xs text-gray-500 mt-1">
              平均 {Math.round(overview.totalTimeSpent / overview.completedAssignments / 60)} 分钟/作业
            </p>
          </div>
        </Card>

        {/* 作业数量 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {overview.totalAssignments}
            </p>
            <p className="text-sm text-gray-600">总作业数</p>
          </div>
        </Card>
      </div>
    )
  }

  const renderSubjectBreakdown = () => {
    if (!stats?.subjects) return null

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          学科表现分析
        </h3>
        
        <div className="space-y-4">
          {stats.subjects.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{subject.subject}</span>
                  <Badge variant="outline">
                    完成率 {subject.completionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {subject.averageScore.toFixed(1)} 分
                  </span>
                  {subject.trend !== 0 && (
                    <div className="flex items-center gap-1">
                      {subject.trend > 0 ? (
                        <TrendingUp size={14} className="text-green-600" />
                      ) : (
                        <TrendingDown size={14} className="text-red-600" />
                      )}
                      <span className={`text-xs ${subject.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {subject.trend > 0 ? '+' : ''}{subject.trend.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Progress 
                value={subject.averageScore} 
                className="h-2"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>用时: {Math.round(subject.timeSpent / 60)} 分钟</span>
                <span>{subject.averageScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const renderRecentPerformance = () => {
    if (!stats?.recentPerformance?.length) return null

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">最近表现</h3>
        
        <div className="space-y-3">
          {stats.recentPerformance.slice(0, 5).map((performance, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{performance.assignment}</p>
                <p className="text-sm text-gray-600">{performance.date}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{performance.score}</p>
                  <p className="text-xs text-gray-500">得分</p>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(performance.timeSpent / 60)}
                  </p>
                  <p className="text-xs text-gray-500">分钟</p>
                </div>
                
                <Badge className={
                  performance.score >= 90 ? 'bg-green-100 text-green-800' :
                  performance.score >= 80 ? 'bg-blue-100 text-blue-800' :
                  performance.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {performance.score >= 90 ? '优秀' :
                   performance.score >= 80 ? '良好' :
                   performance.score >= 70 ? '及格' : '需改进'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const renderInsights = () => {
    if (!stats) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 优势领域 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
            <Award size={20} />
            优势领域
          </h3>
          <div className="space-y-2">
            {stats.strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 改进空间 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-700">
            <Target size={20} />
            改进空间
          </h3>
          <div className="space-y-2">
            {stats.improvements.map((improvement, index) => (
              <div key={index} className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="text-sm">{improvement}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 学习建议 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
            <BookOpen size={20} />
            学习建议
          </h3>
          <div className="space-y-2">
            {stats.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无统计数据</h3>
        <p className="text-gray-600">当前时间段内没有足够的数据进行分析。</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 时间段选择 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">学习表现分析</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7days">最近7天</option>
          <option value="30days">最近30天</option>
          <option value="90days">最近3个月</option>
          <option value="1year">最近1年</option>
        </select>
      </div>

      {/* 总览统计 */}
      {renderOverviewStats()}

      {/* 学科分析 */}
      {renderSubjectBreakdown()}

      {/* 最近表现 */}
      {renderRecentPerformance()}

      {/* 分析洞察 */}
      {renderInsights()}
    </div>
  )
}