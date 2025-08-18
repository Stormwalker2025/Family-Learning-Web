/**
 * CSV Importer Component
 * CSV词汇导入组件 - 支持文件上传、格式验证和批量导入
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface CSVImporterProps {
  onImportComplete?: () => void;
}

interface ImportSettings {
  overwriteExisting: boolean;
  skipDuplicates: boolean;
  validateOnly: boolean;
  defaultYearLevel?: number;
}

interface ImportResult {
  importId: string;
  batchId: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    word: string;
    error: string;
  }>;
  hasMoreErrors?: boolean;
  previewData?: any[];
}

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ImportSettings>({
    overwriteExisting: false,
    skipDuplicates: true,
    validateOnly: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV格式说明
  const csvFormat = {
    requiredFields: ['word', 'definition_en'],
    optionalFields: [
      'definition_zh', 'pronunciation', 'part_of_speech', 
      'example_sentence', 'difficulty_level', 'year_level',
      'topic_category', 'synonyms', 'antonyms'
    ],
    sampleData: [
      ['word', 'definition_en', 'definition_zh', 'part_of_speech', 'difficulty_level'],
      ['apple', 'A round fruit with red or green skin', '苹果', 'NOUN', '1'],
      ['beautiful', 'Pleasing to look at', '美丽的', 'ADJECTIVE', '2'],
      ['quickly', 'In a fast manner', '快速地', 'ADVERB', '3']
    ]
  };

  // 处理文件拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        alert('请选择CSV格式的文件');
      }
    }
  }, []);

  // 文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setImportResult(null);
    }
  };

  // 执行导入
  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/vocabulary/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        
        if (result.successfulRows > 0 && !settings.validateOnly) {
          onImportComplete?.();
        }
      } else {
        throw new Error(result.error || '导入失败');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('导入失败: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  // 下载示例CSV
  const downloadSampleCSV = () => {
    const csvContent = csvFormat.sampleData
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'vocabulary_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 重置导入
  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CSV词汇导入</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={downloadSampleCSV}>
            <Download className="h-4 w-4 mr-2" />
            下载示例
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            导入设置
          </Button>
        </div>
      </div>

      {/* 导入设置 */}
      {showSettings && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">导入设置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.overwriteExisting}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  overwriteExisting: e.target.checked,
                  skipDuplicates: e.target.checked ? false : prev.skipDuplicates
                }))}
              />
              <span className="text-sm">覆盖已存在的词汇</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.skipDuplicates}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  skipDuplicates: e.target.checked,
                  overwriteExisting: e.target.checked ? false : prev.overwriteExisting
                }))}
              />
              <span className="text-sm">跳过重复词汇</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.validateOnly}
                onChange={(e) => setSettings(prev => ({ ...prev, validateOnly: e.target.checked }))}
              />
              <span className="text-sm">仅验证不导入</span>
            </label>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">默认年级:</span>
              <Input
                type="number"
                min="1"
                max="12"
                value={settings.defaultYearLevel || ''}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultYearLevel: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-20"
                placeholder="可选"
              />
            </div>
          </div>
        </Card>
      )}

      {/* CSV格式说明 */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">CSV格式要求</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">必填字段:</h4>
            <ul className="text-sm space-y-1">
              {csvFormat.requiredFields.map(field => (
                <li key={field} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <code className="bg-gray-100 px-1 rounded">{field}</code>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-600 mb-2">可选字段:</h4>
            <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {csvFormat.optionalFields.map(field => (
                <li key={field} className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <code className="bg-gray-100 px-1 rounded">{field}</code>
                </li>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>注意:</strong> CSV文件应使用UTF-8编码，支持逗号、分号或制表符作为分隔符。
            词性选项包括: NOUN, VERB, ADJECTIVE, ADVERB, PREPOSITION 等。
          </p>
        </div>
      </Card>

      {/* 文件选择区域 */}
      <Card className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <FileText className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {settings.validateOnly ? '验证中...' : '导入中...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {settings.validateOnly ? '验证CSV' : '开始导入'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetImport}>
                  重新选择
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">拖拽CSV文件到这里</p>
                <p className="text-gray-500">或者点击选择文件</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>
                选择CSV文件
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </Card>

      {/* 导入结果 */}
      {importResult && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            {importResult.failedRows === 0 ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            )}
            <h3 className="text-lg font-semibold">
              {settings.validateOnly ? '验证结果' : '导入结果'}
            </h3>
          </div>

          {/* 结果统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{importResult.totalRows}</p>
              <p className="text-sm text-blue-800">总行数</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{importResult.successfulRows}</p>
              <p className="text-sm text-green-800">
                {settings.validateOnly ? '有效行数' : '成功导入'}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{importResult.failedRows}</p>
              <p className="text-sm text-red-800">
                {settings.validateOnly ? '无效行数' : '导入失败'}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>成功率</span>
              <span>
                {importResult.totalRows > 0 
                  ? Math.round((importResult.successfulRows / importResult.totalRows) * 100)
                  : 0}%
              </span>
            </div>
            <Progress 
              value={importResult.totalRows > 0 
                ? (importResult.successfulRows / importResult.totalRows) * 100 
                : 0} 
              className="h-2"
            />
          </div>

          {/* 预览数据（仅验证模式） */}
          {settings.validateOnly && importResult.previewData && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                数据预览（前5条）
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">单词</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">英文释义</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">中文释义</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">词性</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">难度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.previewData.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm font-medium">{item.word}</td>
                        <td className="px-4 py-2 text-sm">{item.definition_en}</td>
                        <td className="px-4 py-2 text-sm">{item.definition_zh || '-'}</td>
                        <td className="px-4 py-2 text-sm">{item.part_of_speech}</td>
                        <td className="px-4 py-2 text-sm">
                          <Badge variant="outline">{item.difficulty_level}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 错误列表 */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                错误详情 ({importResult.errors.length} 个)
              </h4>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="p-3 border-b last:border-b-0 bg-red-50">
                    <div className="flex items-start space-x-2">
                      <Badge variant="destructive" className="text-xs">
                        行 {error.row}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          词汇: {error.word || '未知'}
                        </p>
                        <p className="text-xs text-red-600 mt-1">{error.error}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {importResult.hasMoreErrors && (
                <p className="text-xs text-gray-500 text-center">
                  还有更多错误，请检查完整的错误日志...
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-3 mt-6">
            {settings.validateOnly && importResult.successfulRows > 0 && (
              <Button 
                onClick={() => {
                  setSettings(prev => ({ ...prev, validateOnly: false }));
                  handleImport();
                }}
                disabled={importing}
              >
                确认导入有效数据
              </Button>
            )}
            <Button variant="outline" onClick={resetImport}>
              导入新文件
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}