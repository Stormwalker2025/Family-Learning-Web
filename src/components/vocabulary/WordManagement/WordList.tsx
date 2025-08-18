/**
 * Word List Component
 * 词汇列表组件 - 显示、搜索和管理词汇
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Volume2,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  chineseDefinition?: string;
  pronunciation?: string;
  partOfSpeech: string;
  difficulty: number;
  yearLevel?: number;
  category?: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
  tags: string[];
  source?: string;
  createdAt: string;
  userProgress?: {
    phase: string;
    masteryLevel: number;
    nextReviewDate?: string;
    isMemorized: boolean;
    needsReview: boolean;
  };
}

interface WordListProps {
  onWordUpdate?: () => void;
}

interface FilterOptions {
  yearLevel: string;
  difficulty: string;
  category: string;
  phase: string;
  source: string;
  needsReview: boolean;
  isMemorized: boolean;
}

export function WordList({ onWordUpdate }: WordListProps) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [sortBy, setSortBy] = useState<string>('word');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // 过滤器状态
  const [filters, setFilters] = useState<FilterOptions>({
    yearLevel: '',
    difficulty: '',
    category: '',
    phase: '',
    source: '',
    needsReview: false,
    isMemorized: false
  });

  // 获取词汇列表
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });

      // 添加过滤参数
      if (filters.yearLevel) params.append('yearLevel', filters.yearLevel);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.category) params.append('category', filters.category);
      if (filters.source) params.append('source', filters.source);

      const response = await fetch(`/api/vocabulary?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setWords(data.words);
        setFilteredWords(data.words);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error('Failed to fetch words');
      }
    } catch (error) {
      console.error('获取词汇列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  // 初始加载和依赖更新
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // 搜索处理
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchWords();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // 客户端过滤和排序
  useEffect(() => {
    let filtered = [...words];

    // 应用额外的客户端过滤
    if (filters.phase) {
      filtered = filtered.filter(word => 
        word.userProgress?.phase === filters.phase
      );
    }

    if (filters.needsReview) {
      filtered = filtered.filter(word => 
        word.userProgress?.needsReview === true
      );
    }

    if (filters.isMemorized) {
      filtered = filtered.filter(word => 
        word.userProgress?.isMemorized === true
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'word':
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
          break;
        case 'difficulty':
          aValue = a.difficulty;
          bValue = b.difficulty;
          break;
        case 'masteryLevel':
          aValue = a.userProgress?.masteryLevel || 0;
          bValue = b.userProgress?.masteryLevel || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredWords(filtered);
  }, [words, filters, sortBy, sortOrder]);

  // 删除词汇
  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('确定要删除这个词汇吗？此操作不可撤销。')) return;

    try {
      const response = await fetch(`/api/vocabulary/${wordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onWordUpdate?.();
        fetchWords();
      } else {
        const error = await response.json();
        alert('删除失败: ' + error.error);
      }
    } catch (error) {
      console.error('删除词汇失败:', error);
      alert('删除失败');
    }
  };

  // 文本转语音
  const handleSpeak = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-AU'; // 澳洲英语
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // 获取词汇难度颜色
  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors[1];
  };

  // 获取学习阶段颜色
  const getPhaseColor = (phase: string) => {
    const colors = {
      'RECOGNITION': 'bg-gray-100 text-gray-800',
      'UNDERSTANDING': 'bg-blue-100 text-blue-800', 
      'APPLICATION': 'bg-yellow-100 text-yellow-800',
      'MASTERY': 'bg-green-100 text-green-800'
    };
    return colors[phase as keyof typeof colors] || colors['RECOGNITION'];
  };

  if (loading && words.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和过滤器 */}
      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          {/* 搜索栏 */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索单词、释义或例句..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>筛选</span>
            </Button>
          </div>

          {/* 过滤器 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-1">年级</label>
                <select
                  value={filters.yearLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, yearLevel: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">全部</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Year {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">难度</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">全部</option>
                  <option value="1">1 - 入门</option>
                  <option value="2">2 - 简单</option>
                  <option value="3">3 - 中等</option>
                  <option value="4">4 - 困难</option>
                  <option value="5">5 - 高级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">学习阶段</label>
                <select
                  value={filters.phase}
                  onChange={(e) => setFilters(prev => ({ ...prev, phase: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">全部</option>
                  <option value="RECOGNITION">认识</option>
                  <option value="UNDERSTANDING">理解</option>
                  <option value="APPLICATION">应用</option>
                  <option value="MASTERY">掌握</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">状态</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.needsReview}
                      onChange={(e) => setFilters(prev => ({ ...prev, needsReview: e.target.checked }))}
                    />
                    <span>需要复习</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isMemorized}
                      onChange={(e) => setFilters(prev => ({ ...prev, isMemorized: e.target.checked }))}
                    />
                    <span>已记忆</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">排序</label>
                <div className="space-y-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="word">单词</option>
                    <option value="difficulty">难度</option>
                    <option value="masteryLevel">掌握度</option>
                    <option value="createdAt">创建时间</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full"
                  >
                    {sortOrder === 'asc' ? (
                      <><SortAsc className="h-4 w-4 mr-1" />升序</>
                    ) : (
                      <><SortDesc className="h-4 w-4 mr-1" />降序</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 词汇列表 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWords.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">没有找到符合条件的词汇</p>
            <p className="text-sm text-gray-400 mt-2">
              尝试调整搜索条件或添加新词汇
            </p>
          </Card>
        ) : (
          filteredWords.map((word) => (
            <Card key={word.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* 词汇头部 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                        {word.pronunciation && (
                          <span className="text-sm text-gray-500">/{word.pronunciation}/</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeak(word.word)}
                          className="p-1 h-6 w-6"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* 标签 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline">{word.partOfSpeech}</Badge>
                        <Badge className={getDifficultyColor(word.difficulty)}>
                          难度 {word.difficulty}
                        </Badge>
                        {word.yearLevel && (
                          <Badge variant="outline">Year {word.yearLevel}</Badge>
                        )}
                        {word.category && (
                          <Badge variant="secondary">{word.category}</Badge>
                        )}
                        {word.userProgress && (
                          <Badge className={getPhaseColor(word.userProgress.phase)}>
                            {word.userProgress.phase}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWord(word)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* 编辑逻辑 */}}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWord(word.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 释义 */}
                  <div className="space-y-1">
                    <p className="text-gray-900">{word.definition}</p>
                    {word.chineseDefinition && (
                      <p className="text-gray-600">{word.chineseDefinition}</p>
                    )}
                  </div>

                  {/* 例句 */}
                  {word.example && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm italic text-gray-700">"{word.example}"</p>
                    </div>
                  )}

                  {/* 同义词和反义词 */}
                  {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      {word.synonyms.length > 0 && (
                        <div>
                          <span className="text-gray-500">同义词: </span>
                          <span className="text-blue-600">{word.synonyms.join(', ')}</span>
                        </div>
                      )}
                      {word.antonyms.length > 0 && (
                        <div>
                          <span className="text-gray-500">反义词: </span>
                          <span className="text-red-600">{word.antonyms.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 学习进度 */}
                  {word.userProgress && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">学习进度</span>
                        <span className="text-sm text-blue-600">
                          {word.userProgress.masteryLevel}%
                        </span>
                      </div>
                      <Progress value={word.userProgress.masteryLevel} className="h-2" />
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                        <span>阶段: {word.userProgress.phase}</span>
                        {word.userProgress.nextReviewDate && (
                          <span>
                            下次复习: {new Date(word.userProgress.nextReviewDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* 词汇详情弹窗 */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">词汇详情</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedWord(null)}
                >
                  ✕
                </Button>
              </div>
              
              {/* 详情内容 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-3xl font-bold">{selectedWord.word}</h3>
                  {selectedWord.pronunciation && (
                    <span className="text-lg text-gray-500">/{selectedWord.pronunciation}/</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(selectedWord.word)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedWord.partOfSpeech}</Badge>
                  <Badge className={getDifficultyColor(selectedWord.difficulty)}>
                    难度 {selectedWord.difficulty}
                  </Badge>
                  {selectedWord.yearLevel && (
                    <Badge variant="outline">Year {selectedWord.yearLevel}</Badge>
                  )}
                  {selectedWord.category && (
                    <Badge variant="secondary">{selectedWord.category}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-lg">{selectedWord.definition}</p>
                  {selectedWord.chineseDefinition && (
                    <p className="text-gray-600">{selectedWord.chineseDefinition}</p>
                  )}
                </div>

                {selectedWord.example && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">例句</h4>
                    <p className="italic">"{selectedWord.example}"</p>
                  </div>
                )}

                {/* 其他详细信息... */}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}