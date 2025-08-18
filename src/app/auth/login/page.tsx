'use client'

// 登录页面
// Login page component

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LoginFormData {
  username: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  success: boolean
  user?: any
  accessToken?: string
  message?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)

  // 检查是否已登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          // 已登录，重定向到仪表板
          router.push('/dashboard')
        }
      } catch (error) {
        // 未登录，继续显示登录页面
      }
    }
    
    checkAuthStatus()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // 清除错误信息
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data: LoginResponse = await response.json()

      if (data.success) {
        // 登录成功，重定向到仪表板
        router.push('/dashboard')
      } else {
        setError(data.message || '登录失败')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            家庭学习平台
          </h1>
          <p className="text-gray-600">
            欢迎回来，请登录您的账户
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="请输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                记住登录状态
              </label>
            </div>

            <Link
              href="/auth/reset-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              忘记密码？
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                登录中...
              </div>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            需要帮助？
            <Link href="/help" className="text-blue-600 hover:text-blue-500 ml-1">
              联系支持
            </Link>
          </p>
        </div>

        {/* 开发环境快速登录按钮 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">开发环境快速登录</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormData({ username: 'august', password: 'password123', rememberMe: false })}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
              >
                August (学生)
              </button>
              <button
                onClick={() => setFormData({ username: 'michael', password: 'password123', rememberMe: false })}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
              >
                Michael (学生)
              </button>
              <button
                onClick={() => setFormData({ username: 'grace', password: 'password123', rememberMe: false })}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
              >
                Grace (家长)
              </button>
              <button
                onClick={() => setFormData({ username: 'dan', password: 'admin123', rememberMe: false })}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded col-span-3"
              >
                Dan (管理员)
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}