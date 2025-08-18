'use client'

import { useState } from 'react'
import { ReadingArticle } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, BookOpen, Eye, EyeOff } from 'lucide-react'

interface ArticleDisplayProps {
  article: ReadingArticle
  showVocabulary?: boolean
}

export function ArticleDisplay({ article, showVocabulary = true }: ArticleDisplayProps) {
  const [showVocabHelp, setShowVocabHelp] = useState(false)
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set())

  // Function to highlight vocabulary words in the text
  const highlightVocabulary = (text: string) => {
    if (!showVocabHelp || !article.vocabulary.length) {
      return text
    }

    let highlightedText = text
    
    article.vocabulary.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      highlightedText = highlightedText.replace(
        regex, 
        `<mark class="bg-yellow-200 px-1 rounded cursor-help" title="Vocabulary word: ${word}">$&</mark>`
      )
    })

    return highlightedText
  }

  // Split text into paragraphs for better formatting
  const paragraphs = article.content.split('\n\n').filter(p => p.trim())

  return (
    <div className="space-y-4">
      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{article.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {article.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Year {article.yearLevel}
              </Badge>
            </div>
          </div>
          
          {/* Article Metadata */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{article.wordCount} words</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{article.topic}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vocabulary Helper */}
      {showVocabulary && article.vocabulary.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Key Vocabulary</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVocabHelp(!showVocabHelp)}
              >
                {showVocabHelp ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide highlights
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show highlights
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {article.vocabulary.map((word, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs cursor-help"
                  title={`Key vocabulary word: ${word}`}
                >
                  {word}
                </Badge>
              ))}
            </div>
            
            {showVocabHelp && (
              <p className="text-xs text-muted-foreground mt-2">
                Key vocabulary words are highlighted in yellow in the text below.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Article Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                className="mb-4 last:mb-0 leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ 
                  __html: highlightVocabulary(paragraph) 
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Article Source */}
      {article.source && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              Source: {article.source}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}