'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Maximize2, Minimize2, Download, Share2 } from 'lucide-react'
import { MediaResource } from '@/types'
import { InteractiveMap } from '../InteractiveElements/InteractiveMap'
import { Timeline } from '../InteractiveElements/Timeline'
import { ImageGallery } from '../InteractiveElements/ImageGallery'
import { VideoPlayer } from '../InteractiveElements/VideoPlayer'

interface MultimediaViewerProps {
  media: MediaResource
  onClose: () => void
}

export function MultimediaViewer({ media, onClose }: MultimediaViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderMediaContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="relative group">
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
            />
            {media.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm">{media.description}</p>
              </div>
            )}
          </div>
        )

      case 'video':
        return <VideoPlayer url={media.url} title={media.title} />

      case 'audio':
        return (
          <div className="p-8 text-center">
            <audio controls className="w-full max-w-md mx-auto">
              <source src={media.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )

      case 'interactive-map':
        return <InteractiveMap mapId={media.url} />

      case 'timeline':
        return <Timeline timelineId={media.url} />

      case 'chart':
        return (
          <div className="relative">
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
            />
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Chart Information</h4>
              <p className="text-sm text-muted-foreground">{media.description}</p>
            </div>
          </div>
        )

      case 'diagram':
        return (
          <div className="relative">
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg bg-white"
            />
            {media.description && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Diagram Explanation</h4>
                <p className="text-sm text-muted-foreground">{media.description}</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <p className="text-muted-foreground">Media type not supported</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-4xl max-h-[90vh] overflow-auto ${isFullscreen ? 'max-w-full max-h-full' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>{media.title}</CardTitle>
              <Badge variant="outline">{media.type}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Media Controls */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Simple download functionality - in production would handle different media types
                  const link = document.createElement('a')
                  link.href = media.url
                  link.download = media.title
                  link.click()
                }}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: media.title,
                      text: media.description,
                      url: media.url
                    })
                  } else {
                    navigator.clipboard.writeText(media.url)
                  }
                }}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {renderMediaContent()}
          
          {/* Media Metadata */}
          {(media.duration || media.metadata) && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Media Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {media.duration && (
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">
                      {Math.floor(media.duration / 60)}m {media.duration % 60}s
                    </p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="text-muted-foreground capitalize">{media.type.replace('-', ' ')}</p>
                </div>
                
                {media.interactive && (
                  <div>
                    <span className="font-medium">Interactive:</span>
                    <p className="text-muted-foreground">Yes</p>
                  </div>
                )}
                
                {media.metadata && Object.entries(media.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <p className="text-muted-foreground">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Interactive Elements Help */}
          {media.interactive && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Interactive Elements</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This media contains interactive elements. Click, hover, or use the controls to explore the content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}