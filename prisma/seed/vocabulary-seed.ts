/**
 * Vocabulary Database Seeder
 * 词汇数据库种子脚本 - 导入澳洲本地化词汇
 */

import { PrismaClient } from '@prisma/client'
import { allAustralianVocabulary } from '../../src/data/vocabulary/australian-vocabulary'

const prisma = new PrismaClient()

async function seedVocabulary() {
  console.log('开始导入澳洲词汇数据...')

  try {
    // 清除现有词汇数据（可选）
    console.log('清除现有词汇数据...')
    await prisma.vocabularyProgress.deleteMany()
    await prisma.vocabularyWord.deleteMany()

    // 生成批次ID
    const batchId = `australian_seed_${Date.now()}`

    // 导入词汇数据
    let successCount = 0
    let errorCount = 0

    for (const vocabData of allAustralianVocabulary) {
      try {
        await prisma.vocabularyWord.create({
          data: {
            word: vocabData.word.toLowerCase(),
            definition: vocabData.definition,
            chineseDefinition: vocabData.chineseDefinition,
            partOfSpeech: vocabData.partOfSpeech as any,
            pronunciation: vocabData.pronunciation,
            difficulty: vocabData.difficulty,
            yearLevel: vocabData.yearLevel,
            category: vocabData.category,
            example: vocabData.example,
            synonyms:
              vocabData.synonyms.length > 0
                ? JSON.stringify(vocabData.synonyms)
                : null,
            antonyms:
              vocabData.antonyms.length > 0
                ? JSON.stringify(vocabData.antonyms)
                : null,
            tags:
              vocabData.tags.length > 0 ? JSON.stringify(vocabData.tags) : null,
            source: vocabData.source,
            importBatch: batchId,
          },
        })

        successCount++
        console.log(`✓ 已导入: ${vocabData.word}`)
      } catch (error) {
        errorCount++
        console.error(`✗ 导入失败 ${vocabData.word}:`, error)
      }
    }

    console.log(`\n导入完成！`)
    console.log(`成功导入: ${successCount} 个词汇`)
    console.log(`导入失败: ${errorCount} 个词汇`)
    console.log(`批次ID: ${batchId}`)

    // 创建导入记录
    try {
      // 获取管理员用户（假设存在）
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })

      if (adminUser) {
        await prisma.vocabularyImport.create({
          data: {
            fileName: 'australian-vocabulary-seed.ts',
            importedBy: adminUser.id,
            batchId: batchId,
            totalRows: allAustralianVocabulary.length,
            successfulRows: successCount,
            failedRows: errorCount,
            duplicateWords: 0,
            status: 'COMPLETED',
            csvMapping: JSON.stringify({
              note: 'Imported from TypeScript seed file',
            }),
            importSettings: JSON.stringify({
              source: 'seed',
              type: 'australian_vocabulary',
            }),
            completedAt: new Date(),
          },
        })
        console.log('✓ 导入记录已创建')
      }
    } catch (error) {
      console.log('导入记录创建失败（可能没有管理员用户）')
    }

    // 显示统计信息
    const stats = await getVocabularyStats()
    console.log('\n=== 词汇库统计 ===')
    console.log(`总词汇数: ${stats.total}`)
    console.log(`年级分布:`)
    Object.entries(stats.byYearLevel).forEach(([year, count]) => {
      console.log(`  Year ${year}: ${count} 个词汇`)
    })
    console.log(`主题分布:`)
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个词汇`)
    })
    console.log(`难度分布:`)
    Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
      console.log(`  难度 ${difficulty}: ${count} 个词汇`)
    })
  } catch (error) {
    console.error('词汇数据导入失败:', error)
    throw error
  }
}

async function getVocabularyStats() {
  const total = await prisma.vocabularyWord.count()

  const byYearLevel = await prisma.vocabularyWord.groupBy({
    by: ['yearLevel'],
    _count: { id: true },
    where: { yearLevel: { not: null } },
  })

  const byCategory = await prisma.vocabularyWord.groupBy({
    by: ['category'],
    _count: { id: true },
    where: { category: { not: null } },
  })

  const byDifficulty = await prisma.vocabularyWord.groupBy({
    by: ['difficulty'],
    _count: { id: true },
  })

  return {
    total,
    byYearLevel: Object.fromEntries(
      byYearLevel.map(item => [item.yearLevel, item._count.id])
    ),
    byCategory: Object.fromEntries(
      byCategory.map(item => [item.category, item._count.id])
    ),
    byDifficulty: Object.fromEntries(
      byDifficulty.map(item => [item.difficulty, item._count.id])
    ),
  }
}

async function main() {
  try {
    await seedVocabulary()
  } catch (error) {
    console.error('种子脚本执行失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { seedVocabulary }
