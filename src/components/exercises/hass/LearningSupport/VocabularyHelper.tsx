'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, BookOpen, Volume2 } from 'lucide-react'
import { HassVocabulary } from '@/types'

interface VocabularyHelperProps {
  vocabulary: HassVocabulary[]
  onClose: () => void
}

export function VocabularyHelper({ vocabulary, onClose }: VocabularyHelperProps) {
  const playPronunciation = (term: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term)
      speechSynthesis.speak(utterance)
    }
  }

  const getDifficultyColor = (level: number) => {
    const colors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600']
    return colors[level - 1] || 'text-gray-600'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Key Vocabulary ({vocabulary.length} terms)
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {vocabulary.map((vocab) => (
              <div key={vocab.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{vocab.term}</h4>
                    <Badge variant="outline" className={getDifficultyColor(vocab.difficulty)}>
                      Level {vocab.difficulty}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => playPronunciation(vocab.term)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-3">{vocab.definition}</p>
                
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Context:</strong> {vocab.context}
                </div>
                
                {vocab.examples.length > 0 && (
                  <div className="text-sm">
                    <strong>Example:</strong>
                    <p className="italic mt-1">"{vocab.examples[0]}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}