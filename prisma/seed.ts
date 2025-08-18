// 主数据库种子文件
// Main database seed file

import { PrismaClient } from '@prisma/client'
import { seedAuthData } from './seed/auth-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库种子数据初始化...')
  console.log('================================')

  try {
    // 1. 创建认证系统数据
    console.log('1. 创建认证系统数据')
    const authData = await seedAuthData()
    
    // 2. 创建示例学习内容（如果需要）
    console.log('\n2. 创建示例学习内容')
    
    // 创建示例课程
    let sampleCourse = await prisma.course.findFirst({
      where: { 
        title: 'English Reading Comprehension',
        subject: 'ENGLISH',
        yearLevel: 3
      }
    })
    
    if (!sampleCourse) {
      sampleCourse = await prisma.course.create({
        data: {
          title: 'English Reading Comprehension',
          description: 'Basic reading comprehension exercises for Year 3 students',
          subject: 'ENGLISH',
          yearLevel: 3,
          isActive: true,
          order: 1,
          createdBy: authData.users.admin.id
        }
      })
    }

    console.log(`✓ 创建示例课程: ${sampleCourse.title}`)

    // 创建示例练习
    let sampleExercise = await prisma.exercise.findFirst({
      where: { 
        title: 'Simple Story Reading',
        subject: 'ENGLISH',
        yearLevel: 3
      }
    })
    
    if (!sampleExercise) {
      sampleExercise = await prisma.exercise.create({
        data: {
          title: 'Simple Story Reading',
          description: 'Read a simple story and answer questions',
          subject: 'ENGLISH',
          yearLevel: 3,
          difficulty: 'EASY',
          exerciseType: 'READING_COMPREHENSION',
          timeLimit: 30,
          isActive: true,
          order: 1,
          courseId: sampleCourse.id,
          createdBy: authData.users.admin.id,
          content: JSON.stringify({
            story: 'Once upon a time, there was a little cat named Whiskers. Whiskers loved to play in the garden.',
            type: 'story'
          }),
          instructions: 'Read the story carefully and answer the questions below.'
        }
      })
    }

    console.log(`✓ 创建示例练习: ${sampleExercise.title}`)

    // 创建示例问题
    const existingQuestion = await prisma.question.findFirst({
      where: {
        exerciseId: sampleExercise.id,
        order: 1
      }
    })
    
    if (!existingQuestion) {
      await prisma.question.create({
        data: {
          exerciseId: sampleExercise.id,
          type: 'MULTIPLE_CHOICE',
          question: 'What is the name of the cat in the story?',
          options: JSON.stringify(['Fluffy', 'Whiskers', 'Shadow', 'Tiger']),
          correctAnswer: 'Whiskers',
          explanation: 'The story clearly states that the cat\'s name is Whiskers.',
          points: 1,
          order: 1
        }
      })
    }

    console.log(`✓ 创建示例问题`)

    // 3. 创建示例词汇
    console.log('\n3. 创建示例词汇')
    
    const sampleWords = [
      {
        word: 'happy',
        definition: 'feeling joy or pleasure',
        partOfSpeech: 'ADJECTIVE',
        example: 'She was happy to see her friends.',
        chineseDefinition: '快乐的，高兴的',
        difficulty: 1,
        frequency: 5,
        yearLevel: 3,
        category: 'Emotions'
      },
      {
        word: 'beautiful',
        definition: 'pleasing to look at; attractive',
        partOfSpeech: 'ADJECTIVE',
        example: 'The sunset was beautiful.',
        chineseDefinition: '美丽的，漂亮的',
        difficulty: 2,
        frequency: 4,
        yearLevel: 3,
        category: 'Descriptive'
      },
      {
        word: 'adventure',
        definition: 'an exciting or dangerous experience',
        partOfSpeech: 'NOUN',
        example: 'They went on an adventure in the forest.',
        chineseDefinition: '冒险，历险',
        difficulty: 3,
        frequency: 3,
        yearLevel: 6,
        category: 'Story'
      }
    ]

    for (const wordData of sampleWords) {
      await prisma.vocabularyWord.upsert({
        where: { word: wordData.word },
        update: {},
        create: {
          ...wordData,
          source: 'Seed Data',
          importBatch: 'initial_seed'
        }
      })
    }

    console.log(`✓ 创建 ${sampleWords.length} 个示例词汇`)

    // 4. 创建学生的学习进度记录
    console.log('\n4. 创建示例学习进度')
    
    // August的学习进度
    await prisma.learningProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: authData.users.augustStudent.id,
          exerciseId: sampleExercise.id
        }
      },
      update: {},
      create: {
        userId: authData.users.augustStudent.id,
        exerciseId: sampleExercise.id,
        subject: 'ENGLISH',
        status: 'NOT_STARTED',
        attempts: 0,
        masteryLevel: 0
      }
    })

    // Michael的学习进度
    await prisma.learningProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: authData.users.michaelStudent.id,
          exerciseId: sampleExercise.id
        }
      },
      update: {},
      create: {
        userId: authData.users.michaelStudent.id,
        exerciseId: sampleExercise.id,
        subject: 'ENGLISH',
        status: 'COMPLETED',
        attempts: 2,
        bestScore: 1,
        bestPercentage: 100.0,
        avgScore: 1.0,
        masteryLevel: 80,
        lastAttempt: new Date()
      }
    })

    console.log('✓ 创建示例学习进度记录')

    // 5. 创建示例词汇学习进度
    console.log('\n5. 创建示例词汇学习进度')
    
    const happyWord = await prisma.vocabularyWord.findUnique({
      where: { word: 'happy' }
    })

    if (happyWord) {
      await prisma.vocabularyProgress.upsert({
        where: {
          userId_wordId: {
            userId: authData.users.augustStudent.id,
            wordId: happyWord.id
          }
        },
        update: {},
        create: {
          userId: authData.users.augustStudent.id,
          wordId: happyWord.id,
          phase: 'RECOGNITION',
          masteryLevel: 60,
          attempts: 5,
          correctAttempts: 3,
          streakCount: 2
        }
      })
    }

    console.log('✓ 创建示例词汇学习进度')

    console.log('\n================================')
    console.log('数据库种子数据初始化完成！')
    console.log('\n可以使用以下账户登录测试:')
    console.log('- 管理员: dan / admin123')
    console.log('- 家长: grace / password123')  
    console.log('- 学生: august / password123 (Year 3)')
    console.log('- 学生: michael / password123 (Year 6)')

  } catch (error) {
    console.error('种子数据创建失败:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })