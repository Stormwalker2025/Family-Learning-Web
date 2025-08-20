'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import HomeworkViewer from '@/components/homework/Submission/HomeworkViewer'

export default function HomeworkDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const handleSubmit = (submission: any) => {
    // 提交成功后跳转到结果页
    window.location.href = `/homework/results/${submission.id}`
  }

  const handleSave = (submission: any) => {
    // 自动保存，不需要特别处理
    console.log('作业已自动保存')
  }

  return (
    <AuthGuard requiredRoles={['STUDENT', 'PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <HomeworkViewer
          homeworkId={params.id}
          onSubmit={handleSubmit}
          onSave={handleSave}
        />
      </div>
    </AuthGuard>
  )
}
