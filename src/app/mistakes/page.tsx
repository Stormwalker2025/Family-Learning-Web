'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import MistakeBookDashboard from '@/components/mistakes/MistakeBookDashboard'
import { useAuth } from '@/hooks/auth/useAuth'

export default function MistakesPage() {
  const { user } = useAuth()

  return (
    <AuthGuard requiredRoles={['STUDENT', 'PARENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">错题本</h1>
          <p className="text-gray-600">
            {user?.role === 'STUDENT' 
              ? '复习和掌握你的错题，提高学习效率'
              : '查看和帮助孩子复习错题'
            }
          </p>
        </div>

        <MistakeBookDashboard 
          userId={user?.id}
          isParentView={user?.role === 'PARENT'}
        />
      </div>
    </AuthGuard>
  )
}