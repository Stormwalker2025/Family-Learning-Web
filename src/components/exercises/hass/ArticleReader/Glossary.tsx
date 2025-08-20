'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Search,
  Volume2,
  Star,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Play,
} from 'lucide-react'
import { HassVocabulary } from '@/types'

interface GlossaryProps {
  vocabulary: HassVocabulary[]
}

type SortOption = 'alphabetical' | 'difficulty' | 'frequency'
type SortDirection = 'asc' | 'desc'

export function Glossary({ vocabulary }: GlossaryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>(
    'all'
  )
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const difficultyLevels = [
    {
      value: 1,
      label: 'Basic',
      color:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    {
      value: 2,
      label: 'Elementary',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    {
      value: 3,
      label: 'Intermediate',
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    {
      value: 4,
      label: 'Advanced',
      color:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    },
    {
      value: 5,
      label: 'Expert',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  ]

  const getDifficultyInfo = (level: number) => {
    return difficultyLevels.find(d => d.value === level) || difficultyLevels[0]
  }

  const filteredAndSortedVocabulary = useMemo(() => {
    let filtered = vocabulary.filter(vocab => {
      const matchesSearch =
        vocab.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.context.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDifficulty =
        selectedDifficulty === 'all' || vocab.difficulty === selectedDifficulty

      return matchesSearch && matchesDifficulty
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'alphabetical':
          comparison = a.term.localeCompare(b.term)
          break
        case 'difficulty':
          comparison = a.difficulty - b.difficulty
          break
        case 'frequency':
          // For now, we'll use term length as a proxy for frequency
          comparison = a.term.length - b.term.length
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [vocabulary, searchTerm, selectedDifficulty, sortBy, sortDirection])

  const toggleFavorite = (termId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(termId)) {
        newFavorites.delete(termId)
      } else {
        newFavorites.add(termId)
      }
      return newFavorites
    })
  }

  const playPronunciation = (term: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortDirection('asc')
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Glossary ({filteredAndSortedVocabulary.length} terms)
        </CardTitle>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <Button
              size="sm"
              variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty('all')}
            >
              All
            </Button>
            {difficultyLevels.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={selectedDifficulty === value ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
            onClick={() => toggleSort('alphabetical')}
            className="flex items-center gap-1"
          >
            A-Z
            {sortBy === 'alphabetical' &&
              (sortDirection === 'asc' ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'difficulty' ? 'default' : 'outline'}
            onClick={() => toggleSort('difficulty')}
            className="flex items-center gap-1"
          >
            Difficulty
            {sortBy === 'difficulty' &&
              (sortDirection === 'asc' ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="max-h-96 overflow-y-auto space-y-3">
        {filteredAndSortedVocabulary.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No vocabulary terms match your search.</p>
          </div>
        ) : (
          filteredAndSortedVocabulary.map(vocab => {
            const difficultyInfo = getDifficultyInfo(vocab.difficulty)
            const isExpanded = expandedTerm === vocab.id
            const isFavorite = favorites.has(vocab.id)

            return (
              <div
                key={vocab.id}
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                {/* Term Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{vocab.term}</h4>
                    <Badge className={difficultyInfo.color}>
                      {difficultyInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleFavorite(vocab.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                      />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => playPronunciation(vocab.term)}
                      title="Play pronunciation"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        setExpandedTerm(isExpanded ? null : vocab.id)
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-sm text-muted-foreground mb-2">
                  {vocab.definition}
                </p>

                {/* Context */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Context:</span> {vocab.context}
                </div>

                {/* Examples - Always show first example */}
                {vocab.examples.length > 0 && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    <span className="font-medium">Example:</span>
                    <p className="italic">"{vocab.examples[0]}"</p>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {/* Pronunciation */}
                    {vocab.pronunciation && (
                      <div className="text-sm">
                        <span className="font-medium">Pronunciation:</span>
                        <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                          {vocab.pronunciation}
                        </span>
                      </div>
                    )}

                    {/* Etymology */}
                    {vocab.etymology && (
                      <div className="text-sm">
                        <span className="font-medium">Etymology:</span>
                        <p className="text-muted-foreground">
                          {vocab.etymology}
                        </p>
                      </div>
                    )}

                    {/* All Examples */}
                    {vocab.examples.length > 1 && (
                      <div className="text-sm">
                        <span className="font-medium">More Examples:</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {vocab.examples.slice(1).map((example, index) => (
                            <li
                              key={index}
                              className="text-muted-foreground italic"
                            >
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Synonyms */}
                    {vocab.synonyms && vocab.synonyms.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Synonyms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vocab.synonyms.map((synonym, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Antonyms */}
                    {vocab.antonyms && vocab.antonyms.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Antonyms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vocab.antonyms.map((antonym, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {antonym}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {vocab.relatedTerms && vocab.relatedTerms.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Related Terms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vocab.relatedTerms.map((term, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
