/**
 * CSV Vocabulary Import API
 * CSV词汇导入API - 支持批量导入和验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/auth/jwt';
import { z } from 'zod';
import * as csv from 'csv-parse/sync';

const prisma = new PrismaClient();

// CSV行数据验证Schema
const CSVRowSchema = z.object({
  word: z.string().min(1, '单词不能为空'),
  definition_en: z.string().min(1, '英文释义不能为空'),
  definition_zh: z.string().optional(),
  part_of_speech: z.enum([
    'NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 
    'CONJUNCTION', 'PRONOUN', 'INTERJECTION', 'ARTICLE', 'PHRASE'
  ]).optional().default('NOUN'),
  pronunciation: z.string().optional(),
  example_sentence: z.string().optional(),
  difficulty_level: z.string().transform(val => parseInt(val) || 1).pipe(z.number().min(1).max(5)),
  year_level: z.string().transform(val => val ? parseInt(val) : null).optional(),
  topic_category: z.string().optional(),
  synonyms: z.string().optional(),
  antonyms: z.string().optional()
});

// 导入设置Schema
const ImportSettingsSchema = z.object({
  overwriteExisting: z.boolean().default(false),
  skipDuplicates: z.boolean().default(true),
  validateOnly: z.boolean().default(false),
  batchSource: z.string().default('csv_import'),
  defaultYearLevel: z.number().min(1).max(12).optional()
});

// CSV字段映射
const CSV_FIELD_MAPPING = {
  'word': 'word',
  'english_definition': 'definition_en',
  'definition_en': 'definition_en',
  'english': 'definition_en',
  'chinese_definition': 'definition_zh',
  'definition_zh': 'definition_zh',
  'chinese': 'definition_zh',
  'part_of_speech': 'part_of_speech',
  'pos': 'part_of_speech',
  'pronunciation': 'pronunciation',
  'phonetic': 'pronunciation',
  'example': 'example_sentence',
  'example_sentence': 'example_sentence',
  'sentence': 'example_sentence',
  'difficulty': 'difficulty_level',
  'difficulty_level': 'difficulty_level',
  'level': 'difficulty_level',
  'year_level': 'year_level',
  'year': 'year_level',
  'grade': 'year_level',
  'category': 'topic_category',
  'topic_category': 'topic_category',
  'topic': 'topic_category',
  'synonyms': 'synonyms',
  'antonyms': 'antonyms'
};

// POST - CSV文件导入
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user || !['ADMIN', 'PARENT'].includes(user.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const settingsJson = formData.get('settings') as string;

    if (!file) {
      return NextResponse.json({ error: '请选择CSV文件' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: '只支持CSV格式文件' }, { status: 400 });
    }

    // 解析导入设置
    let settings = {};
    try {
      if (settingsJson) {
        settings = ImportSettingsSchema.parse(JSON.parse(settingsJson));
      }
    } catch (error) {
      settings = ImportSettingsSchema.parse({});
    }

    // 生成批次ID
    const batchId = `batch_${Date.now()}_${user.id}`;

    // 创建导入记录
    const importRecord = await prisma.vocabularyImport.create({
      data: {
        fileName: file.name,
        importedBy: user.id,
        batchId: batchId,
        status: 'PROCESSING',
        csvMapping: JSON.stringify(CSV_FIELD_MAPPING),
        importSettings: JSON.stringify(settings)
      }
    });

    try {
      // 读取和解析CSV文件
      const fileContent = await file.text();
      
      // 检测CSV格式和分隔符
      let delimiter = ',';
      if (fileContent.includes('\t')) delimiter = '\t';
      else if (fileContent.includes(';')) delimiter = ';';

      const records = csv.parse(fileContent, {
        columns: true,
        delimiter: delimiter,
        skip_empty_lines: true,
        trim: true
      });

      if (!records || records.length === 0) {
        throw new Error('CSV文件为空或格式无效');
      }

      // 映射CSV字段到标准字段
      const mappedRecords = records.map((record: any, index: number) => {
        const mappedRecord: any = { rowNumber: index + 2 }; // +2因为有标题行
        
        Object.keys(record).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const mappedKey = CSV_FIELD_MAPPING[normalizedKey as keyof typeof CSV_FIELD_MAPPING] || normalizedKey;
          if (record[key]) {
            mappedRecord[mappedKey] = record[key];
          }
        });

        return mappedRecord;
      });

      // 验证数据
      const validRecords = [];
      const errorRecords = [];
      const duplicateWords = new Set<string>();

      for (let i = 0; i < mappedRecords.length; i++) {
        const record = mappedRecords[i];
        
        try {
          // 数据验证
          const validatedData = CSVRowSchema.parse(record);
          
          // 检查重复词汇
          const wordLower = validatedData.word.toLowerCase();
          
          // 检查当前CSV中的重复
          if (duplicateWords.has(wordLower)) {
            errorRecords.push({
              row: record.rowNumber,
              word: validatedData.word,
              error: '在CSV文件中重复出现'
            });
            continue;
          }

          // 检查数据库中的重复
          if (!settings.overwriteExisting && !settings.skipDuplicates) {
            const existingWord = await prisma.vocabularyWord.findUnique({
              where: { word: wordLower }
            });

            if (existingWord) {
              errorRecords.push({
                row: record.rowNumber,
                word: validatedData.word,
                error: '单词已存在于数据库中'
              });
              continue;
            }
          }

          duplicateWords.add(wordLower);
          validRecords.push({
            ...validatedData,
            rowNumber: record.rowNumber
          });

        } catch (error) {
          if (error instanceof z.ZodError) {
            errorRecords.push({
              row: record.rowNumber,
              word: record.word || '未知',
              error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
            });
          } else {
            errorRecords.push({
              row: record.rowNumber,
              word: record.word || '未知',
              error: '数据格式错误'
            });
          }
        }
      }

      // 如果只是验证模式，返回结果
      if (settings.validateOnly) {
        await prisma.vocabularyImport.update({
          where: { id: importRecord.id },
          data: {
            status: 'COMPLETED',
            totalRows: mappedRecords.length,
            successfulRows: validRecords.length,
            failedRows: errorRecords.length,
            errorLog: JSON.stringify(errorRecords),
            completedAt: new Date()
          }
        });

        return NextResponse.json({
          message: '数据验证完成',
          importId: importRecord.id,
          batchId: batchId,
          totalRows: mappedRecords.length,
          validRows: validRecords.length,
          errorRows: errorRecords.length,
          errors: errorRecords,
          previewData: validRecords.slice(0, 5) // 预览前5条有效数据
        });
      }

      // 批量导入词汇
      let successCount = 0;
      const importErrors = [...errorRecords];

      for (const record of validRecords) {
        try {
          const wordData = {
            word: record.word.toLowerCase(),
            definition: record.definition_en,
            partOfSpeech: record.part_of_speech,
            pronunciation: record.pronunciation,
            example: record.example_sentence,
            chineseDefinition: record.definition_zh,
            difficulty: record.difficulty_level,
            yearLevel: record.year_level || settings.defaultYearLevel,
            category: record.topic_category,
            synonyms: record.synonyms ? JSON.stringify(record.synonyms.split(',').map(s => s.trim())) : null,
            antonyms: record.antonyms ? JSON.stringify(record.antonyms.split(',').map(s => s.trim())) : null,
            source: settings.batchSource,
            importBatch: batchId,
            csvRowNumber: record.rowNumber
          };

          // 处理重复词汇
          if (settings.overwriteExisting) {
            await prisma.vocabularyWord.upsert({
              where: { word: wordData.word },
              update: wordData,
              create: wordData
            });
          } else if (settings.skipDuplicates) {
            // 尝试创建，如果重复则跳过
            try {
              await prisma.vocabularyWord.create({ data: wordData });
            } catch (error: any) {
              if (error.code === 'P2002') {
                // 唯一性约束违反，跳过
                continue;
              }
              throw error;
            }
          } else {
            await prisma.vocabularyWord.create({ data: wordData });
          }

          successCount++;

        } catch (error: any) {
          importErrors.push({
            row: record.rowNumber,
            word: record.word,
            error: error.message || '导入失败'
          });
        }
      }

      // 更新导入记录
      await prisma.vocabularyImport.update({
        where: { id: importRecord.id },
        data: {
          status: importErrors.length > 0 ? 'COMPLETED' : 'COMPLETED',
          totalRows: mappedRecords.length,
          successfulRows: successCount,
          failedRows: importErrors.length,
          errorLog: importErrors.length > 0 ? JSON.stringify(importErrors) : null,
          completedAt: new Date()
        }
      });

      // 记录活动日志
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'VOCABULARY_IMPORT',
          details: JSON.stringify({
            fileName: file.name,
            batchId: batchId,
            totalRows: mappedRecords.length,
            successCount: successCount,
            errorCount: importErrors.length
          }),
          resourceType: 'VocabularyImport',
          resourceId: importRecord.id
        }
      });

      return NextResponse.json({
        message: '词汇导入完成',
        importId: importRecord.id,
        batchId: batchId,
        totalRows: mappedRecords.length,
        successfulRows: successCount,
        failedRows: importErrors.length,
        errors: importErrors.slice(0, 10), // 只返回前10个错误
        hasMoreErrors: importErrors.length > 10
      });

    } catch (error: any) {
      // 更新导入记录为失败状态
      await prisma.vocabularyImport.update({
        where: { id: importRecord.id },
        data: {
          status: 'FAILED',
          errorLog: JSON.stringify([{ error: error.message }]),
          completedAt: new Date()
        }
      });

      console.error('CSV导入失败:', error);
      return NextResponse.json({ 
        error: '导入失败: ' + error.message,
        importId: importRecord.id 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('CSV导入处理失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// GET - 获取导入历史
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const [imports, total] = await Promise.all([
      prisma.vocabularyImport.findMany({
        where: user.role === 'ADMIN' ? {} : { importedBy: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          importedBy_user: {
            select: {
              username: true,
              displayName: true
            }
          }
        }
      }),
      prisma.vocabularyImport.count({
        where: user.role === 'ADMIN' ? {} : { importedBy: user.id }
      })
    ]);

    // 处理错误日志
    const processedImports = imports.map(imp => ({
      ...imp,
      errorLog: imp.errorLog ? JSON.parse(imp.errorLog) : null,
      csvMapping: imp.csvMapping ? JSON.parse(imp.csvMapping) : null,
      importSettings: imp.importSettings ? JSON.parse(imp.importSettings) : null
    }));

    return NextResponse.json({
      imports: processedImports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取导入历史失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}