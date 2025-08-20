'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import HomeworkBuilder from '@/components/homework/Creation/HomeworkBuilder'

export default function CreateHomeworkPage() {
  const handleSave = (assignment: any) => {
    // 保存成功后跳转到作业详情页
    window.location.href = `/homework/assignments/${assignment.id}`
  }

  const handleCancel = () => {
    // 返回作业列表页
    window.location.href = '/homework'
  }

  return (
    <AuthGuard requiredRoles={['PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <HomeworkBuilder onSave={handleSave} onCancel={handleCancel} />
      </div>
    </AuthGuard>
  )
}
