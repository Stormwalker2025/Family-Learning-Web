'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Download,
  Share2,
  Bookmark,
  MessageSquare,
} from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title: string
  description?: string
  thumbnail?: string
  chapters?: VideoChapter[]
  transcript?: string[]
  relatedVideos?: RelatedVideo[]
}

interface VideoChapter {
  id: string
  title: string
  startTime: number // seconds
  duration: number
  description?: string
}

interface RelatedVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  url: string
}

export function VideoPlayer({
  url,
  title,
  description,
  thumbnail,
  chapters = [],
  transcript = [],
  relatedVideos = [],
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [activeChapter, setActiveChapter] = useState<VideoChapter | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      updateBuffered()
      updateActiveChapter(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  const updateBuffered = () => {
    const video = videoRef.current
    if (!video || !video.buffered.length) return

    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
    const bufferedPercent = (bufferedEnd / video.duration) * 100
    setBuffered(bufferedPercent)
  }

  const updateActiveChapter = (time: number) => {
    const chapter = chapters.find(
      c => time >= c.startTime && time < c.startTime + c.duration
    )
    setActiveChapter(chapter || null)
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds)
    )
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const jumpToChapter = (chapter: VideoChapter) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = chapter.startTime
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const addBookmark = () => {
    if (!bookmarks.includes(currentTime)) {
      setBookmarks([...bookmarks, currentTime].sort())
    }
  }

  const jumpToBookmark = (time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>

        <CardContent>
          <div
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden group"
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={url}
              poster={thumbnail}
              className="w-full aspect-video object-contain"
              onClick={togglePlayPause}
            />

            {/* Video Controls Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-16 h-16 rounded-full"
                    onClick={togglePlayPause}
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-20 left-4 right-4">
                <div className="relative">
                  {/* Buffer Bar */}
                  <div
                    className="absolute h-1 bg-white/30 rounded-full"
                    style={{ width: `${buffered}%` }}
                  />

                  {/* Progress Bar */}
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="relative"
                  />

                  {/* Chapter Markers */}
                  {chapters.map(chapter => (
                    <div
                      key={chapter.id}
                      className="absolute w-2 h-2 bg-yellow-500 rounded-full transform -translate-x-1/2 cursor-pointer"
                      style={{
                        left: `${(chapter.startTime / duration) * 100}%`,
                        top: '-2px',
                      }}
                      onClick={() => jumpToChapter(chapter)}
                      title={chapter.title}
                    />
                  ))}

                  {/* Bookmarks */}
                  {bookmarks.map(time => (
                    <div
                      key={time}
                      className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 cursor-pointer"
                      style={{
                        left: `${(time / duration) * 100}%`,
                        top: '-6px',
                      }}
                      onClick={() => jumpToBookmark(time)}
                      title={`Bookmark at ${formatTime(time)}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2 text-white text-sm">
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  {activeChapter && (
                    <Badge
                      variant="secondary"
                      className="bg-black/50 text-white"
                    >
                      {activeChapter.title}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => skipTime(-10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => skipTime(10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={addBookmark}
                      className="text-white hover:bg-white/20"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>

                    {/* Playback Speed */}
                    <select
                      value={playbackRate}
                      onChange={e => changePlaybackRate(Number(e.target.value))}
                      className="bg-black/50 text-white text-sm rounded px-2 py-1 border-0"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-white hover:bg-white/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chapters */}
        {chapters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chapters</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeChapter?.id === chapter.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => jumpToChapter(chapter)}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-sm">{chapter.title}</h5>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chapter.startTime)}
                      </span>
                    </div>
                    {chapter.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        {transcript.length > 0 && showTranscript && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transcript</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <div className="space-y-2 text-sm">
                {transcript.map((line, index) => (
                  <p key={index} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bookmarks</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {bookmarks.map(time => (
                  <div
                    key={time}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => jumpToBookmark(time)}
                  >
                    <span className="text-sm font-medium">
                      Bookmark {bookmarks.indexOf(time) + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(time)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedVideos.map(video => (
                <div
                  key={video.id}
                  className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {video.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
