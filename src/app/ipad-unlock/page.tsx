'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import IpadUnlockDashboard from '@/components/ipad/IpadUnlockDashboard'
import IpadUnlockConfiguration from '@/components/ipad/IpadUnlockConfiguration'
import { useAuth } from '@/hooks/auth/useAuth'

export default function IpadUnlockPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  const isParentOrAdmin = user?.role === 'PARENT' || user?.role === 'ADMIN'

  return (
    <AuthGuard requiredRoles={['STUDENT', 'PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            iPad时间管理
          </h1>
          <p className="text-gray-600">
            {user?.role === 'STUDENT'
              ? '通过完成作业和练习获得iPad使用时间'
              : '管理孩子的iPad使用时间和解锁规则'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className={`grid w-full ${isParentOrAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}
          >
            <TabsTrigger value="dashboard">iPad时间</TabsTrigger>
            <TabsTrigger value="history">使用记录</TabsTrigger>
            {isParentOrAdmin && (
              <TabsTrigger value="config">解锁规则</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <IpadUnlockDashboard
              userId={user?.id}
              isParentView={user?.role === 'PARENT'}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <IpadUnlockHistory userId={user?.id} />
          </TabsContent>

          {isParentOrAdmin && (
            <TabsContent value="config" className="mt-6">
              <IpadUnlockConfiguration />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthGuard>
  )
}

// iPad使用记录组件
function IpadUnlockHistory({ userId }: { userId?: string }) {
  // 这里可以实现历史记录的详细查看功能
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">使用记录</h3>
      <p className="text-gray-600">功能开发中，敬请期待...</p>
    </Card>
  )
}
