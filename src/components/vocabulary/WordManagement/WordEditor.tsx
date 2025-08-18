/**
 * Word Editor Component
 * 词汇编辑器 - 添加和编辑单个词汇
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  X, 
  Volume2, 
  Plus, 
  Minus,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface WordEditorProps {
  wordId?: string; // 如果提供则为编辑模式
  onWordSaved?: () => void;
  onCancel?: () => void;
}

interface WordFormData {
  word: string;
  definition: string;
  chineseDefinition: string;
  pronunciation: string;
  partOfSpeech: string;
  difficulty: number;
  yearLevel: number | null;
  category: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  tags: string[];
  source: string;
}

const PARTS_OF_SPEECH = [
  { value: 'NOUN', label: '名词 (Noun)' },
  { value: 'VERB', label: '动词 (Verb)' },
  { value: 'ADJECTIVE', label: '形容词 (Adjective)' },
  { value: 'ADVERB', label: '副词 (Adverb)' },
  { value: 'PREPOSITION', label: '介词 (Preposition)' },
  { value: 'CONJUNCTION', label: '连词 (Conjunction)' },
  { value: 'PRONOUN', label: '代词 (Pronoun)' },
  { value: 'INTERJECTION', label: '感叹词 (Interjection)' },
  { value: 'ARTICLE', label: '冠词 (Article)' },
  { value: 'PHRASE', label: '短语 (Phrase)' }
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: '1 - 入门', color: 'bg-green-100 text-green-800' },
  { value: 2, label: '2 - 简单', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: '3 - 中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: '4 - 困难', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: '5 - 高级', color: 'bg-red-100 text-red-800' }
];

const COMMON_CATEGORIES = [
  'Academic', 'General', 'Science', 'History', 'Geography', 
  'Literature', 'Animals', 'Food', 'Sports', 'Technology',
  'Nature', 'Family', 'School', 'Daily Life', 'Queensland'
];

export function WordEditor({ wordId, onWordSaved, onCancel }: WordEditorProps) {
  const [formData, setFormData] = useState<WordFormData>({
    word: '',
    definition: '',
    chineseDefinition: '',
    pronunciation: '',
    partOfSpeech: 'NOUN',
    difficulty: 1,
    yearLevel: null,
    category: '',
    example: '',
    synonyms: [],
    antonyms: [],
    tags: [],
    source: 'manual'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 新增同义词/反义词/标签的临时输入
  const [newSynonym, setNewSynonym] = useState('');
  const [newAntonym, setNewAntonym] = useState('');
  const [newTag, setNewTag] = useState('');

  // 编辑模式：加载现有词汇
  useEffect(() => {
    if (wordId) {
      loadWord(wordId);
    }
  }, [wordId]);

  const loadWord = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vocabulary/${id}`);
      if (response.ok) {
        const { word } = await response.json();
        setFormData({
          word: word.word,
          definition: word.definition,
          chineseDefinition: word.chineseDefinition || '',
          pronunciation: word.pronunciation || '',
          partOfSpeech: word.partOfSpeech,
          difficulty: word.difficulty,
          yearLevel: word.yearLevel,
          category: word.category || '',
          example: word.example || '',
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || [],
          tags: word.tags || [],
          source: word.source || 'manual'
        });
      } else {
        throw new Error('Failed to load word');
      }
    } catch (error) {
      console.error('加载词汇失败:', error);
      alert('加载词汇失败');
    } finally {
      setLoading(false);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = '单词不能为空';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.word.trim())) {
      newErrors.word = '单词只能包含英文字母、空格、连字符和撇号';
    }

    if (!formData.definition.trim()) {
      newErrors.definition = '英文释义不能为空';
    }

    if (formData.yearLevel && (formData.yearLevel < 1 || formData.yearLevel > 12)) {
      newErrors.yearLevel = '年级必须在1-12之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存词汇
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = wordId ? `/api/vocabulary/${wordId}` : '/api/vocabulary';
      const method = wordId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          yearLevel: formData.yearLevel || undefined
        })
      });

      if (response.ok) {
        onWordSaved?.();
        if (!wordId) {
          // 新增模式：重置表单
          setFormData({
            word: '',
            definition: '',
            chineseDefinition: '',
            pronunciation: '',
            partOfSpeech: 'NOUN',
            difficulty: 1,
            yearLevel: null,
            category: '',
            example: '',
            synonyms: [],
            antonyms: [],
            tags: [],
            source: 'manual'
          });
        }
      } else {
        const error = await response.json();
        alert('保存失败: ' + error.error);
      }
    } catch (error) {
      console.error('保存词汇失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 文本转语音
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-AU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // 添加同义词
  const addSynonym = () => {
    if (newSynonym.trim() && !formData.synonyms.includes(newSynonym.trim())) {
      setFormData(prev => ({
        ...prev,
        synonyms: [...prev.synonyms, newSynonym.trim()]
      }));
      setNewSynonym('');
    }
  };

  // 添加反义词
  const addAntonym = () => {
    if (newAntonym.trim() && !formData.antonyms.includes(newAntonym.trim())) {
      setFormData(prev => ({
        ...prev,
        antonyms: [...prev.antonyms, newAntonym.trim()]
      }));
      setNewAntonym('');
    }
  };

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // 删除项目
  const removeItem = (type: 'synonyms' | 'antonyms' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <BookOpen className="h-6 w-6 mr-2" />
          {wordId ? '编辑词汇' : '添加新词汇'}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {wordId ? '更新' : '保存'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本信息 */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-semibold mb-4">基本信息</h3>
          <div className="space-y-4">
            {/* 单词 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                单词 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={formData.word}
                  onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                  placeholder="输入英文单词"
                  className={errors.word ? 'border-red-500' : ''}
                />
                {formData.word && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(formData.word)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors.word && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.word}
                </p>
              )}
            </div>

            {/* 音标 */}
            <div>
              <label className="block text-sm font-medium mb-1">音标</label>
              <Input
                value={formData.pronunciation}
                onChange={(e) => setFormData(prev => ({ ...prev, pronunciation: e.target.value }))}
                placeholder="如: /ˈæpəl/"
              />
            </div>

            {/* 英文释义 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                英文释义 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.definition}
                onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
                placeholder="输入英文释义"
                rows={3}
                className={errors.definition ? 'border-red-500' : ''}
              />
              {errors.definition && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.definition}
                </p>
              )}
            </div>

            {/* 中文释义 */}
            <div>
              <label className="block text-sm font-medium mb-1">中文释义</label>
              <Textarea
                value={formData.chineseDefinition}
                onChange={(e) => setFormData(prev => ({ ...prev, chineseDefinition: e.target.value }))}
                placeholder="输入中文释义（可选）"
                rows={2}
              />
            </div>

            {/* 例句 */}
            <div>
              <label className="block text-sm font-medium mb-1">例句</label>
              <Textarea
                value={formData.example}
                onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                placeholder="输入例句"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* 属性设置 */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">属性设置</h3>
          <div className="space-y-4">
            {/* 词性 */}
            <div>
              <label className="block text-sm font-medium mb-1">词性</label>
              <select
                value={formData.partOfSpeech}
                onChange={(e) => setFormData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {PARTS_OF_SPEECH.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 难度等级 */}
            <div>
              <label className="block text-sm font-medium mb-1">难度等级</label>
              <div className="space-y-2">
                {DIFFICULTY_LEVELS.map(level => (
                  <label key={level.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.value}
                      checked={formData.difficulty === level.value}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        difficulty: parseInt(e.target.value) 
                      }))}
                    />
                    <Badge className={level.color}>{level.label}</Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* 年级 */}
            <div>
              <label className="block text-sm font-medium mb-1">适用年级</label>
              <select
                value={formData.yearLevel || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  yearLevel: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">不指定</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Year {i + 1}</option>
                ))}
              </select>
              {errors.yearLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.yearLevel}</p>
              )}
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium mb-1">主题分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md mb-2"
              >
                <option value="">选择分类</option>
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="或输入自定义分类"
                className="text-sm"
              />
            </div>

            {/* 来源 */}
            <div>
              <label className="block text-sm font-medium mb-1">词汇来源</label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="如: Queensland, IELTS, manual"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 同义词、反义词、标签 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 同义词 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">同义词</h3>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                placeholder="添加同义词"
                onKeyPress={(e) => e.key === 'Enter' && addSynonym()}
              />
              <Button size="sm" onClick={addSynonym}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.synonyms.map((synonym, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{synonym}</span>
                  <button
                    onClick={() => removeItem('synonyms', index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* 反义词 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">反义词</h3>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newAntonym}
                onChange={(e) => setNewAntonym(e.target.value)}
                placeholder="添加反义词"
                onKeyPress={(e) => e.key === 'Enter' && addAntonym()}
              />
              <Button size="sm" onClick={addAntonym}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.antonyms.map((antonym, index) => (
                <Badge key={index} variant="destructive" className="flex items-center space-x-1">
                  <span>{antonym}</span>
                  <button
                    onClick={() => removeItem('antonyms', index)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* 标签 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">标签</h3>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    onClick={() => removeItem('tags', index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}