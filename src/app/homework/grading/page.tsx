'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GradingQueue } from '@/components/homework/Grading'
import { PerformanceStats } from '@/components/homework/Analytics'
import { HomeworkSubmissionSummary } from '@/types'

export default function GradingPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmissionSummary | null>(null)
  const [activeTab, setActiveTab] = useState('queue')

  const handleSelectSubmission = (submission: HomeworkSubmissionSummary) => {
    setSelectedSubmission(submission)
    // 可以在这里打开详细查看模态框或跳转到详情页
    window.location.href = `/homework/grading/${submission.id}`
  }

  return (
    <AuthGuard requiredRoles={['PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">作业批改中心</h1>
          <p className="text-gray-600">管理和批改学生作业提交</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">批改队列</TabsTrigger>
            <TabsTrigger value="analytics">批改统计</TabsTrigger>
            <TabsTrigger value="settings">批改设置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="mt-6">
            <GradingQueue onSelectSubmission={handleSelectSubmission} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <PerformanceStats type="overview" />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">批改设置</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">自动批改设置</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>启用选择题自动批改</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>启用判断题自动批改</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span>启用计算题自动批改</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span>启用简答题智能批改</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">批改阈值设置</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        需要人工复查的置信度阈值
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue="80" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        自动批改延迟 (秒)
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="300" 
                        defaultValue="10" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">通知设置</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>批改完成后通知学生</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>需要人工复查时通知管理员</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span>每日批改统计报告</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button>保存设置</Button>
                  <Button variant="outline">重置为默认</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}