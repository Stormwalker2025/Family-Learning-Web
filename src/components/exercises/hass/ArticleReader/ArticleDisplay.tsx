'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Image,
  Play,
  MapPin,
  Clock,
  Eye,
} from 'lucide-react'
import { HassArticle, MediaResource } from '@/types'
import { MultimediaViewer } from './MultimediaViewer'
import ReactMarkdown from 'react-markdown'

interface ArticleDisplayProps {
  article: HassArticle
  notes: Record<string, string>
  bookmarks: string[]
  onNoteChange: (sectionId: string, note: string) => void
  onBookmark: (sectionId: string) => void
  onMediaInteraction: (mediaId: string) => void
}

export function ArticleDisplay({
  article,
  notes,
  bookmarks,
  onNoteChange,
  onBookmark,
  onMediaInteraction,
}: ArticleDisplayProps) {
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(
    null
  )
  const [selectedMedia, setSelectedMedia] = useState<MediaResource | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Split article content into sections for better interaction
  const sections = article.content
    .split('\n\n')
    .filter(section => section.trim())

  const handleMediaClick = (media: MediaResource) => {
    setSelectedMedia(media)
    onMediaInteraction(media.id)
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Play className="h-4 w-4" />
      case 'interactive-map':
        return <MapPin className="h-4 w-4" />
      case 'timeline':
        return <Clock className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const highlightVocabulary = (text: string) => {
    let highlightedText = text
    article.keyVocabulary.forEach(vocab => {
      const regex = new RegExp(`\\b${vocab.term}\\b`, 'gi')
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded cursor-help font-medium" title="${vocab.definition}">${vocab.term}</span>`
      )
    })
    return highlightedText
  }

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {article.title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{article.readingTime} min read</span>
                <span>{article.wordCount} words</span>
                <Badge variant="outline">{article.subject}</Badge>
                <Badge variant="outline">Year {article.yearLevel}</Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary">{article.difficulty}</Badge>
              <div className="flex gap-1">
                {article.topics.slice(0, 3).map(topic => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Media Resources */}
      {article.mediaResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Media Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.mediaResources.map(media => (
                <Button
                  key={media.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleMediaClick(media)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {getMediaIcon(media.type)}
                    <span className="font-medium text-left flex-1">
                      {media.title}
                    </span>
                  </div>
                  {media.description && (
                    <p className="text-sm text-muted-foreground text-left">
                      {media.description}
                    </p>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Article Content */}
      <Card>
        <CardContent className="pt-6">
          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <ReactMarkdown
              components={{
                // Custom rendering for different markdown elements
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 text-primary border-b pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-4 mt-8 text-primary">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">
                    {children}
                  </h3>
                ),
                p: ({ children }) => {
                  const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`
                  return (
                    <div className="group relative">
                      <p
                        className="mb-4 leading-relaxed text-justify hover:bg-muted/30 p-2 rounded-lg transition-colors"
                        dangerouslySetInnerHTML={{
                          __html: highlightVocabulary(
                            children?.toString() || ''
                          ),
                        }}
                      />

                      {/* Section Actions */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => onBookmark(sectionId)}
                          title={
                            bookmarks.includes(sectionId)
                              ? 'Remove bookmark'
                              : 'Add bookmark'
                          }
                        >
                          {bookmarks.includes(sectionId) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setActiveNoteSection(
                              activeNoteSection === sectionId ? null : sectionId
                            )
                          }
                          title="Add note"
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Note Input */}
                      {activeNoteSection === sectionId && (
                        <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                          <Textarea
                            placeholder="Add your note here..."
                            value={notes[sectionId] || ''}
                            onChange={e =>
                              onNoteChange(sectionId, e.target.value)
                            }
                            className="min-h-20 resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => setActiveNoteSection(null)}
                            >
                              Save Note
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveNoteSection(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                },
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-primary">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic bg-muted/50 p-4 rounded-r-lg my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Background Information */}
      {article.backgroundInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Background Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {article.backgroundInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Australian Curriculum Links */}
      {article.australianCurriculum.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Australian Curriculum Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {article.australianCurriculum.map(code => (
                <Badge key={code} variant="outline" className="font-mono">
                  {code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multimedia Viewer Modal */}
      {selectedMedia && (
        <MultimediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  )
}
