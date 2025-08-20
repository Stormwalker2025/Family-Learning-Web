'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { TimelineData, TimelineEvent } from '@/types'

interface TimelineProps {
  timelineId: string
}

// Mock timeline data
const getMockTimelineData = (timelineId: string): TimelineData => {
  const timelineConfigs = {
    'federation-timeline': {
      id: 'federation-timeline',
      title: 'Australian Federation Timeline',
      description: 'Key events leading to the Federation of Australia in 1901',
      scale: 'year' as const,
      dateRange: {
        start: new Date('1850-01-01'),
        end: new Date('1910-01-01'),
      },
      events: [
        {
          id: 'gold-rush',
          title: 'Gold Rush Begins',
          date: new Date('1851-01-01'),
          description:
            'The discovery of gold in Victoria and NSW leads to massive population growth and economic development.',
          significance: 'major' as const,
          category: 'Economic',
          images: ['/images/gold-rush.jpg'],
          sources: ['Australian Dictionary of Biography'],
        },
        {
          id: 'eureka-stockade',
          title: 'Eureka Stockade',
          date: new Date('1854-12-03'),
          description:
            'Miners revolt against government authority at Ballarat goldfields, becoming a symbol of Australian democracy.',
          significance: 'major' as const,
          category: 'Political',
          images: ['/images/eureka-stockade.jpg'],
        },
        {
          id: 'parkes-speech',
          title: "Henry Parkes' Tenterfield Speech",
          date: new Date('1889-10-24'),
          description:
            'Sir Henry Parkes delivers his famous speech calling for the federation of the Australian colonies.',
          significance: 'major' as const,
          category: 'Political',
          images: ['/images/parkes-speech.jpg'],
          sources: ['National Library of Australia'],
        },
        {
          id: 'constitutional-conventions',
          title: 'Constitutional Conventions Begin',
          date: new Date('1891-03-02'),
          description:
            'The first National Australasian Convention meets in Sydney to draft a constitution.',
          significance: 'important' as const,
          category: 'Political',
        },
        {
          id: 'peoples-conventions',
          title: "People's Constitutional Conventions",
          date: new Date('1897-03-22'),
          description:
            'Second series of conventions with elected delegates to refine the constitution.',
          significance: 'important' as const,
          category: 'Political',
        },
        {
          id: 'referendums',
          title: 'Federation Referendums',
          date: new Date('1899-07-31'),
          description:
            'Referendums held in all colonies except Western Australia to approve the Constitution.',
          significance: 'major' as const,
          category: 'Political',
        },
        {
          id: 'commonwealth-bill',
          title: 'Commonwealth of Australia Constitution Act',
          date: new Date('1900-07-09'),
          description:
            'British Parliament passes the act creating the Commonwealth of Australia.',
          significance: 'major' as const,
          category: 'Legal',
        },
        {
          id: 'federation-day',
          title: 'Federation Day',
          date: new Date('1901-01-01'),
          description:
            'The Commonwealth of Australia comes into being with Edmund Barton as first Prime Minister.',
          significance: 'major' as const,
          category: 'Political',
          images: ['/images/federation-ceremony.jpg'],
          sources: ['National Archives of Australia'],
        },
        {
          id: 'first-parliament',
          title: 'First Federal Parliament Opens',
          date: new Date('1901-05-09'),
          description: 'The first Parliament of Australia opens in Melbourne.',
          significance: 'important' as const,
          category: 'Political',
        },
      ],
    },
  }

  return (
    timelineConfigs[timelineId as keyof typeof timelineConfigs] ||
    timelineConfigs['federation-timeline']
  )
}

export function Timeline({ timelineId }: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [viewStart, setViewStart] = useState(0)

  React.useEffect(() => {
    const data = getMockTimelineData(timelineId)
    setTimelineData(data)
  }, [timelineId])

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && timelineData) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1
          if (next >= timelineData.events.length) {
            setIsPlaying(false)
            return prev
          }
          return next
        })
      }, 2000) // Change event every 2 seconds
    }
    return () => clearInterval(interval)
  }, [isPlaying, timelineData])

  const sortedEvents = useMemo(() => {
    if (!timelineData) return []
    return [...timelineData.events].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
  }, [timelineData])

  const getEventPosition = (event: TimelineEvent) => {
    if (!timelineData) return 0
    const totalRange =
      timelineData.dateRange.end.getTime() -
      timelineData.dateRange.start.getTime()
    const eventPosition =
      event.date.getTime() - timelineData.dateRange.start.getTime()
    return (eventPosition / totalRange) * 100
  }

  const getSignificanceColor = (
    significance: TimelineEvent['significance']
  ) => {
    switch (significance) {
      case 'major':
        return 'bg-red-500 border-red-600'
      case 'important':
        return 'bg-blue-500 border-blue-600'
      case 'minor':
        return 'bg-gray-500 border-gray-600'
      default:
        return 'bg-blue-500 border-blue-600'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Political:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Economic:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Legal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Social:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    return colors[category as keyof typeof colors] || colors.Political
  }

  const goToEvent = (index: number) => {
    setCurrentIndex(index)
    setSelectedEvent(sortedEvents[index])
  }

  const nextEvent = () => {
    if (currentIndex < sortedEvents.length - 1) {
      goToEvent(currentIndex + 1)
    }
  }

  const previousEvent = () => {
    if (currentIndex > 0) {
      goToEvent(currentIndex - 1)
    }
  }

  const resetTimeline = () => {
    setCurrentIndex(0)
    setSelectedEvent(null)
    setIsPlaying(false)
    setZoom(1)
    setViewStart(0)
  }

  if (!timelineData) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading timeline...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentEvent = sortedEvents[currentIndex]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {timelineData.title}
            </CardTitle>
            {timelineData.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {timelineData.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(3, zoom + 0.5))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button size="sm" variant="outline" onClick={resetTimeline}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={previousEvent}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Event {currentIndex + 1} of {sortedEvents.length}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={nextEvent}
            disabled={currentIndex === sortedEvents.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline Visualization */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="relative h-24 bg-muted rounded-lg overflow-hidden">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-primary transform -translate-y-1/2" />

            {/* Events */}
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${4 + getEventPosition(event) * 0.92}%`,
                  transform: `translateY(-50%) scale(${zoom})`,
                }}
                onClick={() => goToEvent(index)}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${getSignificanceColor(event.significance)} ${
                    index === currentIndex
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                />

                {/* Event Label */}
                <div
                  className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                    index === currentIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  {event.date.getFullYear()}
                </div>
              </div>
            ))}

            {/* Progress Indicator */}
            <div
              className="absolute top-0 bottom-0 bg-primary/20 transition-all duration-500"
              style={{
                left: '4%',
                width: `${((currentIndex + 1) / sortedEvents.length) * 92}%`,
              }}
            />
          </div>

          {/* Date Range Labels */}
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{timelineData.dateRange.start.getFullYear()}</span>
            <span>{timelineData.dateRange.end.getFullYear()}</span>
          </div>
        </div>

        {/* Current Event Details */}
        {currentEvent && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {currentEvent.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(currentEvent.category)}>
                      {currentEvent.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      {currentEvent.date.toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Badge>
                    <Badge
                      variant={
                        currentEvent.significance === 'major'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {currentEvent.significance}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {currentEvent.description}
              </p>

              {/* Sources */}
              {currentEvent.sources && currentEvent.sources.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm mb-2">Sources:</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {currentEvent.sources.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Events */}
              {currentEvent.relatedEvents &&
                currentEvent.relatedEvents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">
                      Related Events:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentEvent.relatedEvents.map(relatedId => {
                        const relatedEvent = sortedEvents.find(
                          e => e.id === relatedId
                        )
                        const relatedIndex = sortedEvents.findIndex(
                          e => e.id === relatedId
                        )
                        if (!relatedEvent) return null

                        return (
                          <Button
                            key={relatedId}
                            size="sm"
                            variant="outline"
                            onClick={() => goToEvent(relatedIndex)}
                            className="text-xs"
                          >
                            {relatedEvent.title}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* All Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sortedEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    index === currentIndex
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => goToEvent(index)}
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{event.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <div
                      className={`w-2 h-2 rounded-full ${getSignificanceColor(event.significance)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
