'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Shape {
  id: string
  type: 'rectangle' | 'square' | 'triangle' | 'circle'
  x: number
  y: number
  width: number
  height: number
  color: string
  strokeColor: string
  label?: string
}

interface ShapeDrawerProps {
  width?: number
  height?: number
  allowDrawing?: boolean
  showGrid?: boolean
  showMeasurements?: boolean
  className?: string
  onShapeCreate?: (shape: Shape) => void
  onAreaCalculated?: (area: number, perimeter: number) => void
}

export const ShapeDrawer: React.FC<ShapeDrawerProps> = ({
  width = 600,
  height = 400,
  allowDrawing = true,
  showGrid = true,
  showMeasurements = true,
  className = '',
  onShapeCreate,
  onAreaCalculated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [drawingMode, setDrawingMode] = useState<Shape['type'] | 'select'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [shapeColor, setShapeColor] = useState('#3B82F6')
  const [strokeColor, setStrokeColor] = useState('#1F2937')
  const [dimensions, setDimensions] = useState({ width: 100, height: 60 })

  useEffect(() => {
    drawCanvas()
  }, [shapes, selectedShape, showGrid, showMeasurements])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    if (showGrid) {
      drawGrid(ctx)
    }

    // Draw all shapes
    shapes.forEach(shape => {
      drawShape(ctx, shape, selectedShape?.id === shape.id)
    })

    // Draw measurements if enabled
    if (showMeasurements && selectedShape) {
      drawMeasurements(ctx, selectedShape)
    }
  }

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 0.5
    
    const gridSize = 20
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean) => {
    ctx.fillStyle = shape.color
    ctx.strokeStyle = isSelected ? '#EF4444' : shape.strokeColor
    ctx.lineWidth = isSelected ? 3 : 2

    switch (shape.type) {
      case 'rectangle':
      case 'square':
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        break
      
      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2
        ctx.beginPath()
        ctx.arc(shape.x + radius, shape.y + radius, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        break
      
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(shape.x + shape.width / 2, shape.y) // Top center
        ctx.lineTo(shape.x, shape.y + shape.height) // Bottom left
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height) // Bottom right
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break
    }

    // Draw shape label
    if (shape.label) {
      ctx.fillStyle = '#1F2937'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(shape.label, shape.x + shape.width / 2, shape.y + shape.height / 2)
    }
  }

  const drawMeasurements = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = '#DC2626'
    ctx.fillStyle = '#DC2626'
    ctx.lineWidth = 1
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'

    const { area, perimeter } = calculateAreaAndPerimeter(shape)

    // Draw dimension lines
    switch (shape.type) {
      case 'rectangle':
      case 'square':
        // Width measurement
        ctx.beginPath()
        ctx.moveTo(shape.x, shape.y - 15)
        ctx.lineTo(shape.x + shape.width, shape.y - 15)
        ctx.stroke()
        ctx.fillText(
          `${shape.width}px`, 
          shape.x + shape.width / 2, 
          shape.y - 20
        )

        // Height measurement
        ctx.beginPath()
        ctx.moveTo(shape.x - 15, shape.y)
        ctx.lineTo(shape.x - 15, shape.y + shape.height)
        ctx.stroke()
        ctx.save()
        ctx.translate(shape.x - 25, shape.y + shape.height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${shape.height}px`, 0, 0)
        ctx.restore()
        break

      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2
        // Radius line
        ctx.beginPath()
        ctx.moveTo(shape.x + radius, shape.y + radius)
        ctx.lineTo(shape.x + shape.width, shape.y + radius)
        ctx.stroke()
        ctx.fillText(
          `r = ${radius.toFixed(1)}px`, 
          shape.x + radius + radius / 2, 
          shape.y + radius - 5
        )
        break
    }

    // Display area and perimeter
    ctx.textAlign = 'left'
    ctx.fillText(`Area: ${area.toFixed(1)} px²`, shape.x, shape.y + shape.height + 20)
    ctx.fillText(`Perimeter: ${perimeter.toFixed(1)} px`, shape.x, shape.y + shape.height + 35)
  }

  const calculateAreaAndPerimeter = (shape: Shape) => {
    let area = 0
    let perimeter = 0

    switch (shape.type) {
      case 'rectangle':
      case 'square':
        area = shape.width * shape.height
        perimeter = 2 * (shape.width + shape.height)
        break
      
      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2
        area = Math.PI * radius * radius
        perimeter = 2 * Math.PI * radius
        break
      
      case 'triangle':
        // Assuming equilateral triangle for simplicity
        area = (shape.width * shape.height) / 2
        // This is a simplified perimeter calculation
        const sideLength = Math.sqrt(Math.pow(shape.width / 2, 2) + Math.pow(shape.height, 2))
        perimeter = shape.width + 2 * sideLength
        break
    }

    return { area, perimeter }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!allowDrawing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (drawingMode === 'select') {
      // Check if clicking on existing shape
      const clickedShape = shapes.find(shape => 
        x >= shape.x && x <= shape.x + shape.width &&
        y >= shape.y && y <= shape.y + shape.height
      )
      setSelectedShape(clickedShape || null)
    } else {
      // Start drawing new shape
      setIsDrawing(true)
      setStartPos({ x, y })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !allowDrawing || drawingMode === 'select') return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: drawingMode as Shape['type'],
      x: Math.min(startPos.x, endX),
      y: Math.min(startPos.y, endY),
      width: Math.abs(endX - startPos.x),
      height: Math.abs(endY - startPos.y),
      color: shapeColor + '80', // Add transparency
      strokeColor: strokeColor,
      label: `${drawingMode} ${shapes.length + 1}`
    }

    // Ensure minimum size
    if (newShape.width < 20 || newShape.height < 20) {
      newShape.width = Math.max(newShape.width, 50)
      newShape.height = Math.max(newShape.height, 50)
    }

    // For square, make width and height equal
    if (drawingMode === 'square') {
      const size = Math.max(newShape.width, newShape.height)
      newShape.width = size
      newShape.height = size
    }

    setShapes(prev => [...prev, newShape])
    setSelectedShape(newShape)
    setIsDrawing(false)

    const { area, perimeter } = calculateAreaAndPerimeter(newShape)
    if (onAreaCalculated) {
      onAreaCalculated(area, perimeter)
    }
    if (onShapeCreate) {
      onShapeCreate(newShape)
    }
  }

  const createPredefinedShape = () => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: drawingMode as Shape['type'],
      x: 50,
      y: 50,
      width: dimensions.width,
      height: drawingMode === 'square' ? dimensions.width : dimensions.height,
      color: shapeColor + '80',
      strokeColor: strokeColor,
      label: `${drawingMode} ${shapes.length + 1}`
    }

    setShapes(prev => [...prev, newShape])
    setSelectedShape(newShape)

    const { area, perimeter } = calculateAreaAndPerimeter(newShape)
    if (onAreaCalculated) {
      onAreaCalculated(area, perimeter)
    }
    if (onShapeCreate) {
      onShapeCreate(newShape)
    }
  }

  const deleteSelectedShape = () => {
    if (!selectedShape) return
    setShapes(prev => prev.filter(shape => shape.id !== selectedShape.id))
    setSelectedShape(null)
  }

  const clearCanvas = () => {
    setShapes([])
    setSelectedShape(null)
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mode:</label>
            <div className="flex gap-1">
              {(['select', 'rectangle', 'square', 'triangle', 'circle'] as const).map(mode => (
                <Button
                  key={mode}
                  size="sm"
                  variant={drawingMode === mode ? 'default' : 'outline'}
                  onClick={() => setDrawingMode(mode)}
                  disabled={!allowDrawing && mode !== 'select'}
                >
                  {mode === 'select' ? '🖱️' : 
                   mode === 'rectangle' ? '▭' :
                   mode === 'square' ? '□' :
                   mode === 'triangle' ? '△' : '○'}
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Fill:</label>
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="w-8 h-8 rounded border"
              disabled={!allowDrawing}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Border:</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded border"
              disabled={!allowDrawing}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMeasurements(!showMeasurements)}
            >
              {showMeasurements ? 'Hide' : 'Show'} Measurements
            </Button>
          </div>
        </div>

        {/* Predefined Shapes */}
        {allowDrawing && drawingMode !== 'select' && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded">
            <span className="text-sm font-medium">Create {drawingMode}:</span>
            <div className="flex items-center gap-2">
              <label className="text-xs">W:</label>
              <Input
                type="number"
                value={dimensions.width}
                onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 100 }))}
                className="w-20 h-8"
                min="20"
                max="200"
              />
            </div>
            {drawingMode !== 'square' && drawingMode !== 'circle' && (
              <div className="flex items-center gap-2">
                <label className="text-xs">H:</label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 60 }))}
                  className="w-20 h-8"
                  min="20"
                  max="200"
                />
              </div>
            )}
            <Button size="sm" onClick={createPredefinedShape}>
              Create
            </Button>
          </div>
        )}

        {/* Canvas */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="cursor-crosshair"
            style={{ display: 'block' }}
          />
        </div>

        {/* Selected Shape Info */}
        {selectedShape && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Shape Information</h3>
                <div className="text-sm space-y-1">
                  <div>Type: {selectedShape.type}</div>
                  <div>Position: ({selectedShape.x.toFixed(0)}, {selectedShape.y.toFixed(0)})</div>
                  <div>Size: {selectedShape.width.toFixed(0)} × {selectedShape.height.toFixed(0)}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Calculations</h3>
                <div className="text-sm space-y-1">
                  {(() => {
                    const { area, perimeter } = calculateAreaAndPerimeter(selectedShape)
                    return (
                      <>
                        <div>Area: {area.toFixed(1)} px²</div>
                        <div>Perimeter: {perimeter.toFixed(1)} px</div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
            {allowDrawing && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="destructive" onClick={deleteSelectedShape}>
                  Delete Shape
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {allowDrawing && shapes.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={clearCanvas}>
              Clear All
            </Button>
            <Button variant="outline" onClick={() => setSelectedShape(null)}>
              Deselect
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Shape Drawer Help:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Choose a shape mode, then drag to draw on the canvas</li>
            <li>• Use "Select" mode to click on shapes and see measurements</li>
            <li>• Red selection outline shows the currently selected shape</li>
            <li>• Grid helps align shapes precisely</li>
            <li>• Measurements show area and perimeter automatically</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}