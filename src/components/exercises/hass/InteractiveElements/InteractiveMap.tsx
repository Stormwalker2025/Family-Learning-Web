'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Eye,
  EyeOff,
  Maximize2,
} from 'lucide-react'
import { InteractiveMapData, MapLayer, MapMarker, MapRegion } from '@/types'

interface InteractiveMapProps {
  mapId: string
}

// Mock map data - in production this would come from API
const getMockMapData = (mapId: string): InteractiveMapData => {
  const mapConfigs = {
    'australia-states-map': {
      id: 'australia-states-map',
      title: 'Australian States and Territories',
      baseMap: 'australia' as const,
      initialView: {
        center: [-25.0, 135.0] as [number, number],
        zoom: 4,
      },
      layers: [
        {
          id: 'political-layer',
          name: 'Political Boundaries',
          type: 'political' as const,
          visible: true,
          opacity: 1,
        },
        {
          id: 'physical-layer',
          name: 'Physical Features',
          type: 'physical' as const,
          visible: false,
          opacity: 0.7,
        },
      ],
      markers: [
        {
          id: 'sydney',
          position: [-33.8688, 151.2093] as [number, number],
          title: 'Sydney',
          description: 'Capital of New South Wales',
          category: 'capital',
          popup:
            "Sydney is Australia's largest city and the capital of New South Wales. Home to the iconic Sydney Opera House and Harbour Bridge.",
        },
        {
          id: 'melbourne',
          position: [-37.8136, 144.9631] as [number, number],
          title: 'Melbourne',
          description: 'Capital of Victoria',
          category: 'capital',
          popup:
            "Melbourne is the capital of Victoria and Australia's cultural capital, known for its coffee culture and street art.",
        },
        {
          id: 'brisbane',
          position: [-27.4698, 153.0251] as [number, number],
          title: 'Brisbane',
          description: 'Capital of Queensland',
          category: 'capital',
          popup:
            'Brisbane is the capital of Queensland and gateway to the Gold Coast and Sunshine Coast.',
        },
        {
          id: 'perth',
          position: [-31.9505, 115.8605] as [number, number],
          title: 'Perth',
          description: 'Capital of Western Australia',
          category: 'capital',
          popup:
            'Perth is the capital of Western Australia and one of the most isolated major cities in the world.',
        },
        {
          id: 'adelaide',
          position: [-34.9285, 138.6007] as [number, number],
          title: 'Adelaide',
          description: 'Capital of South Australia',
          category: 'capital',
          popup:
            'Adelaide is the capital of South Australia, known as the "City of Churches" and famous for its wine regions.',
        },
        {
          id: 'hobart',
          position: [-42.8821, 147.3272] as [number, number],
          title: 'Hobart',
          description: 'Capital of Tasmania',
          category: 'capital',
          popup:
            "Hobart is the capital of Tasmania and Australia's second-oldest capital city.",
        },
        {
          id: 'canberra',
          position: [-35.2809, 149.13] as [number, number],
          title: 'Canberra',
          description: 'National Capital',
          category: 'national-capital',
          popup:
            "Canberra is Australia's national capital and home to Parliament House and many national institutions.",
        },
        {
          id: 'darwin',
          position: [-12.4634, 130.8456] as [number, number],
          title: 'Darwin',
          description: 'Capital of Northern Territory',
          category: 'capital',
          popup:
            "Darwin is the capital of the Northern Territory and Australia's gateway to Asia.",
        },
      ],
      regions: [
        {
          id: 'nsw',
          name: 'New South Wales',
          coordinates: [
            [-28.5, 141.0],
            [-37.5, 141.0],
            [-37.5, 153.6],
            [-28.5, 153.6],
          ],
          properties: { population: '8.2 million', area: '800,642 km²' },
          style: { fillColor: '#3b82f6', opacity: 0.3 },
        },
      ],
    },
    'aboriginal-groups-map': {
      id: 'aboriginal-groups-map',
      title: 'Aboriginal Language Groups',
      baseMap: 'australia' as const,
      initialView: {
        center: [-25.0, 135.0] as [number, number],
        zoom: 4,
      },
      layers: [
        {
          id: 'language-groups',
          name: 'Language Groups',
          type: 'historical' as const,
          visible: true,
          opacity: 0.8,
        },
      ],
      markers: [
        {
          id: 'yolngu',
          position: [-12.0, 136.0] as [number, number],
          title: 'Yolŋu People',
          description: 'Arnhem Land, Northern Territory',
          category: 'language-group',
          popup:
            'The Yolŋu people are the traditional owners of northeast Arnhem Land in the Northern Territory.',
        },
        {
          id: 'arrernte',
          position: [-23.7, 133.9] as [number, number],
          title: 'Arrernte People',
          description: 'Central Australia',
          category: 'language-group',
          popup:
            'The Arrernte people are the traditional custodians of Mparntwe (Alice Springs) and surrounding areas.',
        },
      ],
      regions: [],
    },
  }

  return (
    mapConfigs[mapId as keyof typeof mapConfigs] ||
    mapConfigs['australia-states-map']
  )
}

export function InteractiveMap({ mapId }: InteractiveMapProps) {
  const [mapData, setMapData] = useState<InteractiveMapData | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set())
  const [zoom, setZoom] = useState(4)
  const [center, setCenter] = useState<[number, number]>([-25.0, 135.0])
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const data = getMockMapData(mapId)
    setMapData(data)
    setCenter(data.initialView.center)
    setZoom(data.initialView.zoom)

    // Initialize visible layers
    const initialLayers = new Set(
      data.layers.filter(layer => layer.visible).map(layer => layer.id)
    )
    setVisibleLayers(initialLayers)
  }, [mapId])

  const toggleLayer = (layerId: string) => {
    setVisibleLayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(layerId)) {
        newSet.delete(layerId)
      } else {
        newSet.add(layerId)
      }
      return newSet
    })
  }

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(selectedMarker?.id === marker.id ? null : marker)
  }

  const resetView = () => {
    if (mapData) {
      setCenter(mapData.initialView.center)
      setZoom(mapData.initialView.zoom)
    }
  }

  const getMarkerColor = (category: string) => {
    const colors = {
      capital: '#ef4444',
      'national-capital': '#f59e0b',
      'language-group': '#8b5cf6',
      default: '#3b82f6',
    }
    return colors[category as keyof typeof colors] || colors.default
  }

  if (!mapData) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {mapData.title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Map Controls */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(10, zoom + 1))}
              disabled={zoom >= 10}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Layers:</span>
          {mapData.layers.map(layer => (
            <Button
              key={layer.id}
              size="sm"
              variant={visibleLayers.has(layer.id) ? 'default' : 'outline'}
              onClick={() => toggleLayer(layer.id)}
              className="flex items-center gap-1"
            >
              {visibleLayers.has(layer.id) ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {layer.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={mapRef}
          className={`relative bg-blue-50 dark:bg-blue-950 rounded-lg overflow-hidden ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #f59e0b 0%, transparent 50%),
              linear-gradient(45deg, #3b82f6, #8b5cf6)
            `,
            backgroundSize: '400px 400px, 300px 300px, 100% 100%',
          }}
        >
          {/* Map Background - Simplified Australia Shape */}
          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `scale(${zoom / 4}) translate(${(center[1] + 135) * 2}px, ${(center[0] + 25) * 3}px)`,
            }}
          >
            {/* Simplified Australia outline */}
            <path
              d="M 50 150 Q 80 120 120 130 L 160 125 Q 200 120 240 135 L 280 140 Q 320 145 340 170 L 345 200 Q 340 230 320 240 L 280 245 Q 240 250 200 245 L 160 240 Q 120 235 90 220 L 70 190 Q 55 170 50 150 Z"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />

            {/* Tasmania */}
            <circle
              cx="280"
              cy="270"
              r="15"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />
          </svg>

          {/* Markers */}
          {mapData.markers.map(marker => {
            // Convert lat/lng to screen coordinates (simplified)
            const x = ((marker.position[1] + 135) / 45) * 100
            const y = ((marker.position[0] + 45) / 45) * 100

            return (
              <div
                key={marker.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `scale(${Math.max(0.5, zoom / 6)})`,
                }}
                onClick={() => handleMarkerClick(marker)}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getMarkerColor(marker.category) }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </div>

                {/* Marker label */}
                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
                  {marker.title}
                </div>
              </div>
            )
          })}

          {/* Selected Marker Popup */}
          {selectedMarker && (
            <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedMarker.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedMarker.description}
                  </p>
                  {selectedMarker.popup && (
                    <p className="text-sm">{selectedMarker.popup}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedMarker(null)}
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Map Info Panel */}
          {showInfo && (
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-xs">
              <h4 className="font-semibold mb-2">Map Information</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Zoom:</span> {zoom}x
                </p>
                <p>
                  <span className="font-medium">Center:</span>{' '}
                  {center[0].toFixed(1)}°, {center[1].toFixed(1)}°
                </p>
                <p>
                  <span className="font-medium">Markers:</span>{' '}
                  {mapData.markers.length}
                </p>
                <p>
                  <span className="font-medium">Active Layers:</span>{' '}
                  {visibleLayers.size}
                </p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
            <h5 className="font-medium text-sm mb-2">Legend</h5>
            <div className="space-y-1">
              {Object.entries({
                capital: 'State Capitals',
                'national-capital': 'National Capital',
                'language-group': 'Language Groups',
              }).map(([category, label]) => (
                <div key={category} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: getMarkerColor(category) }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
