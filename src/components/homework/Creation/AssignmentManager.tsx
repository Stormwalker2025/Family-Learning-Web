'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  CheckSquare,
  Square,
  User,
  GraduationCap,
} from 'lucide-react'
import { User as UserType } from '@/types'

interface AssignmentManagerProps {
  students: UserType[]
  selectedStudents: string[]
  onUpdateSelection: (studentIds: string[]) => void
}

export default function AssignmentManager({
  students,
  selectedStudents,
  onUpdateSelection,
}: AssignmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    yearLevel: '',
    family: '',
  })
  const [selectAll, setSelectAll] = useState(false)

  // 过滤学生列表
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      !searchTerm ||
      student.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesYearLevel =
      !filters.yearLevel || student.yearLevel?.toString() === filters.yearLevel

    const matchesFamily = !filters.family || student.familyId === filters.family

    return matchesSearch && matchesYearLevel && matchesFamily
  })

  // 检查是否全选
  useEffect(() => {
    const allVisible = filteredStudents.map(s => s.id)
    const allSelected = allVisible.every(id => selectedStudents.includes(id))
    setSelectAll(allSelected && allVisible.length > 0)
  }, [filteredStudents, selectedStudents])

  // 切换学生选择状态
  const toggleStudent = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId]

    onUpdateSelection(newSelection)
  }

  // 切换全选
  const toggleSelectAll = () => {
    if (selectAll) {
      // 取消选择当前可见的所有学生
      const visibleIds = filteredStudents.map(s => s.id)
      const newSelection = selectedStudents.filter(
        id => !visibleIds.includes(id)
      )
      onUpdateSelection(newSelection)
    } else {
      // 选择当前可见的所有学生
      const visibleIds = filteredStudents.map(s => s.id)
      const newSelection = [...new Set([...selectedStudents, ...visibleIds])]
      onUpdateSelection(newSelection)
    }
  }

  // 按年级分组学生
  const groupStudentsByYearLevel = (studentList: UserType[]) => {
    const groups: Record<number, UserType[]> = {}
    studentList.forEach(student => {
      const year = student.yearLevel || 0
      if (!groups[year]) groups[year] = []
      groups[year].push(student)
    })
    return groups
  }

  // 获取年级列表（用于过滤）
  const availableYearLevels = [
    ...new Set(students.map(s => s.yearLevel).filter(Boolean)),
  ].sort((a, b) => a! - b!)

  // 获取家庭列表（用于过滤）
  const availableFamilies = [
    ...new Set(students.map(s => s.familyId).filter(Boolean)),
  ]

  // 渲染学生卡片
  const renderStudentCard = (student: UserType) => {
    const isSelected = selectedStudents.includes(student.id)

    return (
      <Card
        key={student.id}
        className={`p-4 cursor-pointer transition-all ${
          isSelected
            ? 'bg-blue-50 border-blue-200 shadow-md'
            : 'hover:bg-gray-50 hover:shadow-md'
        }`}
        onClick={() => toggleStudent(student.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isSelected ? (
                <CheckSquare className="text-blue-600" size={20} />
              ) : (
                <Square className="text-gray-400" size={20} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">
                  {student.displayName}
                </div>
                <div className="text-sm text-gray-500">@{student.username}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {student.yearLevel && (
              <Badge variant="outline" className="flex items-center gap-1">
                <GraduationCap size={12} />
                Year {student.yearLevel}
              </Badge>
            )}

            {isSelected && (
              <Badge className="bg-blue-100 text-blue-800">已选择</Badge>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 选择摘要 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <span className="font-medium">
              已选择 {selectedStudents.length} 名学生
            </span>
          </div>

          {selectedStudents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateSelection([])}
            >
              <UserMinus size={16} className="mr-2" />
              清空选择
            </Button>
          )}
        </div>

        {selectedStudents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedStudents.map(studentId => {
              const student = students.find(s => s.id === studentId)
              if (!student) return null

              return (
                <Badge
                  key={studentId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {student.displayName}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      toggleStudent(studentId)
                    }}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </Card>

      {/* 搜索和过滤 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <Input
              placeholder="搜索学生姓名或用户名..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filters.yearLevel}
              onChange={e =>
                setFilters(prev => ({ ...prev, yearLevel: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">所有年级</option>
              {availableYearLevels.map(year => (
                <option key={year} value={year?.toString()}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              disabled={filteredStudents.length === 0}
            >
              {selectAll ? (
                <>
                  <Square size={16} className="mr-2" />
                  取消全选
                </>
              ) : (
                <>
                  <CheckSquare size={16} className="mr-2" />
                  全选当前页
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* 学生列表 */}
      {filteredStudents.length === 0 ? (
        <Card className="p-8 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            没有找到学生
          </h3>
          <p className="text-gray-600">
            {searchTerm || Object.values(filters).some(f => f)
              ? '请尝试调整搜索条件或过滤器'
              : '系统中暂无可分配的学生'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 按年级分组显示 */}
          {Object.entries(groupStudentsByYearLevel(filteredStudents))
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([yearLevel, studentsInYear]) => (
              <div key={yearLevel}>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={20} className="text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {yearLevel === '0' ? '未设置年级' : `Year ${yearLevel}`}
                  </h3>
                  <Badge variant="outline">
                    {studentsInYear.length} 名学生
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentsInYear.map(renderStudentCard)}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 快速选择操作 */}
      {filteredStudents.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">快速选择</h4>
          <div className="flex flex-wrap gap-2">
            {availableYearLevels.map(year => {
              const yearStudents = filteredStudents.filter(
                s => s.yearLevel === year
              )
              const allYearSelected = yearStudents.every(s =>
                selectedStudents.includes(s.id)
              )

              return (
                <Button
                  key={year}
                  variant={allYearSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const yearStudentIds = yearStudents.map(s => s.id)
                    if (allYearSelected) {
                      // 取消选择这个年级的所有学生
                      onUpdateSelection(
                        selectedStudents.filter(
                          id => !yearStudentIds.includes(id)
                        )
                      )
                    } else {
                      // 选择这个年级的所有学生
                      onUpdateSelection([
                        ...new Set([...selectedStudents, ...yearStudentIds]),
                      ])
                    }
                  }}
                >
                  {allYearSelected ? '取消' : '选择'} Year {year} (
                  {yearStudents.length})
                </Button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
