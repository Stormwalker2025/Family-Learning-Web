'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  StickyNote,
  Search,
  Tag,
  Calendar,
  Download,
  Trash2,
  Edit3,
  BookOpen,
  Lightbulb,
} from 'lucide-react'

interface Note {
  id: string
  sectionId: string
  content: string
  tags: string[]
  timestamp: Date
  type: 'note' | 'highlight' | 'question' | 'idea'
}

interface NoteTakingProps {
  notes: Record<string, string>
  onNoteChange: (sectionId: string, note: string) => void
}

export function NoteTaking({ notes, onNoteChange }: NoteTakingProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, Note>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNoteType, setSelectedNoteType] = useState<
    Note['type'] | 'all'
  >('all')
  const [newNoteTag, setNewNoteTag] = useState('')

  // Convert simple notes to expanded note format
  useEffect(() => {
    const expanded: Record<string, Note> = {}
    Object.entries(notes).forEach(([sectionId, content]) => {
      if (content) {
        expanded[sectionId] = {
          id: `note-${sectionId}`,
          sectionId,
          content,
          tags: [],
          timestamp: new Date(),
          type: 'note',
        }
      }
    })
    setExpandedNotes(expanded)
  }, [notes])

  const noteTypes = [
    {
      type: 'note' as const,
      label: 'Note',
      icon: StickyNote,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    {
      type: 'highlight' as const,
      label: 'Highlight',
      icon: Edit3,
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    {
      type: 'question' as const,
      label: 'Question',
      icon: BookOpen,
      color:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    {
      type: 'idea' as const,
      label: 'Idea',
      icon: Lightbulb,
      color:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
  ]

  const filteredNotes = Object.values(expandedNotes).filter(note => {
    const matchesSearch =
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesType =
      selectedNoteType === 'all' || note.type === selectedNoteType
    return matchesSearch && matchesType
  })

  const updateNote = (sectionId: string, updates: Partial<Note>) => {
    setExpandedNotes(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...updates,
        timestamp: new Date(),
      },
    }))

    if (updates.content !== undefined) {
      onNoteChange(sectionId, updates.content)
    }
  }

  const deleteNote = (sectionId: string) => {
    const newNotes = { ...expandedNotes }
    delete newNotes[sectionId]
    setExpandedNotes(newNotes)
    onNoteChange(sectionId, '')
  }

  const addTag = (sectionId: string, tag: string) => {
    if (tag && !expandedNotes[sectionId]?.tags.includes(tag)) {
      updateNote(sectionId, {
        tags: [...(expandedNotes[sectionId]?.tags || []), tag],
      })
    }
  }

  const removeTag = (sectionId: string, tagToRemove: string) => {
    updateNote(sectionId, {
      tags:
        expandedNotes[sectionId]?.tags.filter(tag => tag !== tagToRemove) || [],
    })
  }

  const exportNotes = () => {
    const notesText = Object.values(expandedNotes)
      .map(
        note => `[${note.type.toUpperCase()}] ${note.timestamp.toLocaleDateString()}
Tags: ${note.tags.join(', ')}
${note.content}
${'='.repeat(50)}`
      )
      .join('\n\n')

    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hass-notes-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getNoteTypeInfo = (type: Note['type']) => {
    return noteTypes.find(nt => nt.type === type) || noteTypes[0]
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          My Notes ({filteredNotes.length})
        </CardTitle>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes and tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedNoteType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedNoteType('all')}
            >
              All Notes
            </Button>
            {noteTypes.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                size="sm"
                variant={selectedNoteType === type ? 'default' : 'outline'}
                onClick={() => setSelectedNoteType(type)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm || selectedNoteType !== 'all'
                ? 'No notes match your search criteria.'
                : 'No notes yet. Start taking notes while reading!'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const typeInfo = getNoteTypeInfo(note.type)
            const Icon = typeInfo.icon

            return (
              <div
                key={note.id}
                className="border rounded-lg p-3 space-y-2 hover:bg-muted/30 transition-colors"
              >
                {/* Note Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={typeInfo.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {note.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteNote(note.sectionId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Note Content */}
                <Textarea
                  value={note.content}
                  onChange={e =>
                    updateNote(note.sectionId, { content: e.target.value })
                  }
                  className="min-h-20 resize-none text-sm"
                  placeholder="Add your note here..."
                />

                {/* Tags */}
                <div className="space-y-2">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(note.sectionId, tag)}
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Tag */}
                  <div className="flex gap-1">
                    <Input
                      placeholder="Add tag..."
                      value={newNoteTag}
                      onChange={e => setNewNoteTag(e.target.value)}
                      className="text-xs h-7"
                      onKeyPress={e => {
                        if (e.key === 'Enter' && newNoteTag.trim()) {
                          addTag(note.sectionId, newNoteTag.trim())
                          setNewNoteTag('')
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        if (newNoteTag.trim()) {
                          addTag(note.sectionId, newNoteTag.trim())
                          setNewNoteTag('')
                        }
                      }}
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Export Notes Button */}
        {filteredNotes.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={exportNotes}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Notes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
