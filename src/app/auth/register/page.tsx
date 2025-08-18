'use client'

// 用户注册页面（管理员创建用户）
// User registration page (Admin creates users)

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserRole } from '@/types'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  displayName: string
  role: UserRole
  yearLevel: number | ''
  birthYear: number | ''
  familyId: string
}

interface Family {
  id: string
  name: string
  members: Array<{
    id: string
    username: string
    displayName: string
    role: string
  }>
}

interface RegisterData {
  families: Family[]
  userStats: Array<{ role: string; _count: { role: number } }>
  config: {
    maxFamilyMembers: number
    supportedRoles: string[]
    yearLevels: number[]
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'STUDENT',
    yearLevel: '',
    birthYear: '',
    familyId: ''
  })
  const [registerData, setRegisterData] = useState<RegisterData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, errors: [] as string[] })

  // 检查管理员权限并获取注册相关数据
  useEffect(() => {
    const fetchRegisterData = async () => {
      try {
        const response = await fetch('/api/auth/register')
        if (response.ok) {
          const data = await response.json()
          setRegisterData(data.data)
        } else if (response.status === 401) {
          router.push('/auth/login')
        } else if (response.status === 403) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Failed to fetch register data:', error)
        setError('获取注册信息失败')
      }
    }

    fetchRegisterData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    let processedValue: any = value
    if (name === 'yearLevel' || name === 'birthYear') {
      processedValue = value === '' ? '' : parseInt(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // 实时密码强度检查
    if (name === 'password') {
      checkPasswordStrength(value)
    }
    
    // 清除错误和成功信息
    if (error) setError('')
    if (success) setSuccess('')
  }

  const checkPasswordStrength = async (password: string) => {
    if (password.length === 0) {
      setPasswordStrength({ score: 0, errors: [] })
      return
    }

    // 简单的前端密码强度检查
    let score = 0
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('密码长度至少需要6位')
    } else {
      score += 20
      if (password.length >= 8) score += 10
      if (password.length >= 12) score += 10
    }

    if (/\d/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 15
    if (/[a-z]/.test(password)) score += 10
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20

    setPasswordStrength({ score: Math.min(100, score), errors })
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score < 30) return 'bg-red-500'
    if (score < 60) return 'bg-yellow-500'
    if (score < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (score: number) => {
    if (score < 30) return '弱'
    if (score < 60) return '中等'
    if (score < 80) return '强'
    return '很强'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // 前端验证
    if (formData.password !== formData.confirmPassword) {
      setError('密码和确认密码不匹配')
      setLoading(false)
      return
    }

    if (formData.role === 'STUDENT' && (!formData.yearLevel || !formData.birthYear)) {
      setError('学生用户必须填写年级和出生年份')
      setLoading(false)
      return
    }

    if (passwordStrength.errors.length > 0) {
      setError('密码不符合要求：' + passwordStrength.errors.join('，'))
      setLoading(false)
      return
    }

    try {
      const submitData = {
        ...formData,
        yearLevel: formData.yearLevel === '' ? undefined : formData.yearLevel,
        birthYear: formData.birthYear === '' ? undefined : formData.birthYear,
        familyId: formData.familyId === '' ? undefined : formData.familyId
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`用户 ${formData.displayName} 创建成功！`)
        // 重置表单
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          displayName: '',
          role: 'STUDENT',
          yearLevel: '',
          birthYear: '',
          familyId: ''
        })
        setPasswordStrength({ score: 0, errors: [] })
      } else {
        setError(data.message || '创建用户失败')
      }
    } catch (error) {
      console.error('Register error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (!registerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              创建新用户
            </h1>
            <p className="text-gray-600">
              管理员创建用户账户
            </p>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              ← 返回仪表板
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="英文用户名"
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称 *
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="中文姓名"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="可选"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  用户角色 *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="STUDENT">学生</option>
                  <option value="PARENT">家长</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>

              {formData.role === 'STUDENT' && (
                <>
                  <div>
                    <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      年级 *
                    </label>
                    <select
                      id="yearLevel"
                      name="yearLevel"
                      value={formData.yearLevel}
                      onChange={handleInputChange}
                      required={formData.role === 'STUDENT'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">选择年级</option>
                      {registerData.config.yearLevels.map(level => (
                        <option key={level} value={level}>Year {level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                      出生年份 *
                    </label>
                    <input
                      type="number"
                      id="birthYear"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleInputChange}
                      min="2000"
                      max={new Date().getFullYear()}
                      required={formData.role === 'STUDENT'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label htmlFor="familyId" className="block text-sm font-medium text-gray-700 mb-2">
                所属家庭
              </label>
              <select
                id="familyId"
                name="familyId"
                value={formData.familyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择家庭（可选）</option>
                {registerData.families.map(family => (
                  <option key={family.id} value={family.id}>
                    {family.name} ({family.members.length} 成员)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </div>
                ) : (
                  '创建用户'
                )}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    displayName: '',
                    role: 'STUDENT',
                    yearLevel: '',
                    birthYear: '',
                    familyId: ''
                  })
                  setPasswordStrength({ score: 0, errors: [] })
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition duration-200"
              >
                重置
              </Button>
            </div>
          </form>

          {/* 用户统计信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">系统用户统计</h3>
            <div className="grid grid-cols-3 gap-4">
              {registerData.userStats.map(stat => (
                <div key={stat.role} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat._count.role}</div>
                  <div className="text-sm text-gray-600">
                    {stat.role === 'STUDENT' ? '学生' : 
                     stat.role === 'PARENT' ? '家长' : '管理员'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}