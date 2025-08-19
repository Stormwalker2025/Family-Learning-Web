'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Share2,
  X,
  Maximize2,
  Grid3X3,
  List
} from 'lucide-react'

interface ImageItem {
  id: string
  src: string
  title: string
  description?: string
  caption?: string
  date?: string
  category?: string
  metadata?: Record<string, string>
}

interface ImageGalleryProps {
  images: ImageItem[]
  title?: string
  description?: string
}

type ViewMode = 'grid' | 'list' | 'slideshow'

export function ImageGallery({ 
  images, 
  title = "Image Gallery", 
  description 
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentImage = images[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openImage = (image: ImageItem, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
    setZoom(1)
    setRotation(0)
  }

  const closeImage = () => {
    setSelectedImage(null)
    setIsFullscreen(false)
  }

  const downloadImage = (image: ImageItem) => {
    const link = document.createElement('a')
    link.href = image.src
    link.download = `${image.title}.jpg`
    link.click()
  }

  const shareImage = (image: ImageItem) => {
    if (navigator.share) {
      navigator.share({
        title: image.title,
        text: image.description,
        url: image.src
      })
    } else {
      navigator.clipboard.writeText(image.src)
    }
  }

  const GridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="group relative bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => openImage(image, index)}
        >
          <div className="aspect-square relative">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium truncate">{image.title}</p>
              {image.date && (
                <p className="text-white/80 text-xs">{image.date}</p>
              )}
            </div>
          </div>
          {image.category && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {image.category}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => openImage(image, index)}
        >
          <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-medium truncate">{image.title}</h4>
              {image.category && (
                <Badge variant="outline" className="ml-2">
                  {image.category}
                </Badge>
              )}
            </div>
            {image.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {image.description}
              </p>
            )}
            {image.date && (
              <p className="text-xs text-muted-foreground mt-2">{image.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const SlideshowView = () => (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={currentImage.src}
          alt={currentImage.title}
          className="w-full h-full object-contain"
        />
        
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
          onClick={previousImage}
          disabled={images.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
          onClick={nextImage}
          disabled={images.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Zoom to View */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          onClick={() => openImage(currentImage, currentIndex)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{currentImage.title}</h4>
              {currentImage.description && (
                <p className="text-muted-foreground mt-1">{currentImage.description}</p>
              )}
              {currentImage.date && (
                <p className="text-sm text-muted-foreground mt-2">{currentImage.date}</p>
              )}
            </div>
            {currentImage.category && (
              <Badge variant="outline">{currentImage.category}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 cursor-pointer overflow-hidden transition-colors ${
              index === currentIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {title} ({images.length} images)
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'slideshow' ? 'default' : 'outline'}
                onClick={() => setViewMode('slideshow')}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'grid' && <GridView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'slideshow' && <SlideshowView />}
        </CardContent>
      </Card>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 ${
          isFullscreen ? 'bg-black' : ''
        }`}>
          <div className={`relative max-w-full max-h-full ${
            isFullscreen ? 'w-full h-full' : 'w-auto h-auto'
          }`}>
            {/* Image */}
            <div className="relative overflow-auto">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadImage(selectedImage)}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => shareImage(selectedImage)}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={closeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    previousImage()
                    setSelectedImage(images[(currentIndex - 1 + images.length) % images.length])
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    nextImage()
                    setSelectedImage(images[(currentIndex + 1) % images.length])
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
              <h4 className="font-semibold text-lg">{selectedImage.title}</h4>
              {selectedImage.description && (
                <p className="text-sm opacity-90 mt-1">{selectedImage.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                {selectedImage.date && (
                  <span className="text-xs opacity-75">{selectedImage.date}</span>
                )}
                <span className="text-xs opacity-75">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}