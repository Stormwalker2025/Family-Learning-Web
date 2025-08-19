'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Info } from 'lucide-react'

interface BackgroundInfoProps {
  info: string
  culturalContext: string | string[]
  onClose: () => void
}

export function BackgroundInfo({ info, culturalContext, onClose }: BackgroundInfoProps) {
  const contexts = Array.isArray(culturalContext) ? culturalContext : [culturalContext]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Background Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {contexts.map((context, index) => (
                <Badge key={index} variant="outline">
                  {context}
                </Badge>
              ))}
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="leading-relaxed">{info}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}