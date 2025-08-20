'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import HomeworkDashboard from '@/components/homework/HomeworkDashboard'

export default function HomeworkPage() {
  return (
    <AuthGuard requiredRoles={['STUDENT', 'PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <HomeworkDashboard />
      </div>
    </AuthGuard>
  )
}
