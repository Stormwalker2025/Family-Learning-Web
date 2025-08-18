'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MathTopic, MathExercise } from '@/types'

interface TopicInfo {
  topic: MathTopic
  name: string
  description: string
  icon: string
  year3Count: number
  year6Count: number
  difficulty: string[]
  skills: string[]
  realWorldUses: string[]
}

interface TopicSelectorProps {
  onTopicSelect: (topic: MathTopic, yearLevel?: number, difficulty?: string) => void
  availableExercises?: MathExercise[]
  selectedYear?: number
  className?: string
}

const topicData: TopicInfo[] = [
  {
    topic: 'place-value',
    name: 'Place Value',
    description: 'Understanding the value of digits in numbers and working with large numbers and decimals',
    icon: '🔢',
    year3Count: 1,
    year6Count: 1,
    difficulty: ['foundation', 'developing', 'proficient'],
    skills: ['Number recognition', 'Digit value', 'Expanded form', 'Rounding'],
    realWorldUses: ['Reading population statistics', 'Understanding distances', 'Working with money amounts']
  },
  {
    topic: 'fractions',
    name: 'Fractions',
    description: 'Learning about parts of a whole, equivalent fractions, and fraction operations',
    icon: '🍕',
    year3Count: 1,
    year6Count: 1,
    difficulty: ['foundation', 'developing', 'proficient', 'advanced'],
    skills: ['Visual fractions', 'Equivalence', 'Comparing', 'Adding/subtracting'],
    realWorldUses: ['Cooking and recipes', 'Sharing equally', 'Understanding percentages', 'Time divisions']
  },
  {
    topic: 'area',
    name: 'Area & Perimeter',
    description: 'Measuring and calculating area and perimeter of shapes in practical contexts',
    icon: '📐',
    year3Count: 0,
    year6Count: 1,
    difficulty: ['foundation', 'developing', 'proficient', 'advanced'],
    skills: ['Rectangle area', 'Triangle area', 'Perimeter calculation', 'Composite shapes'],
    realWorldUses: ['Garden planning', 'Room decoration', 'Sports field design', 'Material purchasing']
  },
  {
    topic: 'decimals',
    name: 'Decimals & Money',
    description: 'Working with decimal numbers and Australian currency calculations',
    icon: '💰',
    year3Count: 1,
    year6Count: 0,
    difficulty: ['foundation', 'developing', 'proficient'],
    skills: ['Decimal place value', 'Money counting', 'Adding/subtracting', 'Making change'],
    realWorldUses: ['Shopping and budgeting', 'Measuring precisely', 'Understanding prices', 'Saving money']
  },
  {
    topic: 'measurement',
    name: 'Measurement',
    description: 'Understanding units of measurement and converting between different units',
    icon: '📏',
    year3Count: 0,
    year6Count: 0,
    difficulty: ['foundation', 'developing', 'proficient'],
    skills: ['Unit recognition', 'Converting units', 'Measuring length', 'Measuring mass'],
    realWorldUses: ['Building and construction', 'Cooking measurements', 'Sports records', 'Scientific experiments']
  },
  {
    topic: 'perimeter',
    name: 'Perimeter',
    description: 'Measuring the distance around shapes and solving perimeter problems',
    icon: '⭕',
    year3Count: 0,
    year6Count: 0,
    difficulty: ['foundation', 'developing', 'proficient'],
    skills: ['Perimeter calculation', 'Irregular shapes', 'Problem solving', 'Units of measure'],
    realWorldUses: ['Fencing properties', 'Running tracks', 'Picture frames', 'Garden borders']
  }
]

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  onTopicSelect,
  availableExercises = [],
  selectedYear,
  className = ''
}) => {
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null)
  const [hoveredTopic, setHoveredTopic] = useState<MathTopic | null>(null)

  const getExerciseCount = (topic: MathTopic, yearLevel?: number) => {
    return availableExercises.filter(ex => 
      ex.topic === topic && (!yearLevel || ex.yearLevel === yearLevel)
    ).length
  }

  const getDifficultyLevels = (topic: MathTopic) => {
    const exercises = availableExercises.filter(ex => ex.topic === topic)
    return [...new Set(exercises.map(ex => ex.difficulty))]
  }

  const handleTopicClick = (topicInfo: TopicInfo) => {
    setSelectedTopic(topicInfo.topic)
  }

  const handleStartExercise = (difficulty?: string) => {
    if (selectedTopic) {
      onTopicSelect(selectedTopic, selectedYear, difficulty)
    }
  }

  const renderTopicCard = (topicInfo: TopicInfo) => {
    const isSelected = selectedTopic === topicInfo.topic
    const isHovered = hoveredTopic === topicInfo.topic
    const totalCount = getExerciseCount(topicInfo.topic)
    const year3Count = getExerciseCount(topicInfo.topic, 3)
    const year6Count = getExerciseCount(topicInfo.topic, 6)
    const hasExercises = totalCount > 0

    return (
      <Card
        key={topicInfo.topic}
        className={`
          p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isHovered ? 'shadow-md transform scale-105' : ''}
          ${!hasExercises ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        onClick={() => hasExercises && handleTopicClick(topicInfo)}
        onMouseEnter={() => setHoveredTopic(topicInfo.topic)}
        onMouseLeave={() => setHoveredTopic(null)}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{topicInfo.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {topicInfo.name}
          </h3>
          
          <div className="flex justify-center gap-2 mb-3">
            {year3Count > 0 && (
              <Badge variant="outline" className="text-xs">
                Year 3: {year3Count}
              </Badge>
            )}
            {year6Count > 0 && (
              <Badge variant="outline" className="text-xs">
                Year 6: {year6Count}
              </Badge>
            )}
            {totalCount === 0 && (
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {topicInfo.description}
          </p>
        </div>

        {hasExercises && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {topicInfo.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Real-world Uses:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {topicInfo.realWorldUses.slice(0, 2).map((use, index) => (
                  <li key={index}>• {use}</li>
                ))}
              </ul>
            </div>

            {isSelected && (
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Choose Difficulty:</h4>
                  {getDifficultyLevels(topicInfo.topic).map(difficulty => (
                    <Button
                      key={difficulty}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartExercise(difficulty)
                      }}
                      className="w-full justify-start"
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Button>
                  ))}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartExercise()
                    }}
                    className="w-full mt-2"
                  >
                    Start All Exercises
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🧮 Choose Your Math Topic
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Select a topic to start practicing Australian curriculum-aligned math concepts
        </p>
        
        {selectedYear && (
          <Badge variant="outline" className="text-lg px-4 py-2 mb-6">
            Year {selectedYear} Level
          </Badge>
        )}
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topicData
          .filter(topic => {
            if (!selectedYear) return true
            return getExerciseCount(topic.topic, selectedYear) > 0 || getExerciseCount(topic.topic) > 0
          })
          .map(renderTopicCard)}
      </div>

      {/* Selected Topic Details */}
      {selectedTopic && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Ready to start {topicData.find(t => t.topic === selectedTopic)?.name}?
            </h3>
            <p className="text-blue-700 mb-6">
              You'll practice real Australian math problems and learn with interactive tools.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {getExerciseCount(selectedTopic)}
                </div>
                <div className="text-sm text-blue-700">Exercises Available</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {getDifficultyLevels(selectedTopic).length}
                </div>
                <div className="text-sm text-green-700">Difficulty Levels</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  🎯
                </div>
                <div className="text-sm text-purple-700">Interactive Learning</div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={() => handleStartExercise()}
              className="px-8"
            >
              🚀 Start Learning Now!
            </Button>
          </div>
        </Card>
      )}

      {/* Learning Path Suggestion */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          🗺️ Recommended Learning Path
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {['place-value', 'fractions', 'decimals', 'area'].map((topic, index) => (
            <div key={topic} className="flex items-center">
              <Badge variant="outline" className="capitalize">
                {topic.replace('-', ' ')}
              </Badge>
              {index < 3 && <span className="mx-2 text-gray-400">→</span>}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Follow this path to build strong mathematical foundations step by step
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {availableExercises.length}
          </div>
          <div className="text-sm text-gray-600">Total Exercises</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {availableExercises.filter(ex => ex.yearLevel === 3).length}
          </div>
          <div className="text-sm text-gray-600">Year 3 Exercises</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {availableExercises.filter(ex => ex.yearLevel === 6).length}
          </div>
          <div className="text-sm text-gray-600">Year 6 Exercises</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {topicData.filter(topic => getExerciseCount(topic.topic) > 0).length}
          </div>
          <div className="text-sm text-gray-600">Available Topics</div>
        </Card>
      </div>
    </div>
  )
}