// 认证系统种子数据
// Authentication system seed data

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function seedAuthData() {
  console.log('开始创建认证系统种子数据...')

  try {
    // 1. 创建家庭
    console.log('创建家庭...')
    let family = await prisma.family.findFirst({
      where: { name: 'The Chen Family' },
    })

    if (!family) {
      family = await prisma.family.create({
        data: {
          name: 'The Chen Family',
          timezone: 'Australia/Brisbane',
        },
      })
    }
    console.log(`✓ 创建家庭: ${family.name} (ID: ${family.id})`)

    // 2. 创建管理员用户 Dan
    console.log('创建管理员用户 Dan...')
    const adminPassword = await hashPassword('admin123')
    const adminUser = await prisma.user.upsert({
      where: { username: 'dan' },
      update: {},
      create: {
        username: 'dan',
        email: 'dan@family.com',
        password: adminPassword,
        displayName: 'Dan Chen',
        role: 'ADMIN',
        familyId: family.id,
        timezone: 'Australia/Brisbane',
        isActive: true,
      },
    })
    console.log(
      `✓ 创建管理员: ${adminUser.displayName} (${adminUser.username})`
    )

    // 3. 创建家长用户 Grace
    console.log('创建家长用户 Grace...')
    const parentPassword = await hashPassword('password123')
    const parentUser = await prisma.user.upsert({
      where: { username: 'grace' },
      update: {},
      create: {
        username: 'grace',
        email: 'grace@family.com',
        password: parentPassword,
        displayName: 'Grace Chen',
        role: 'PARENT',
        familyId: family.id,
        timezone: 'Australia/Brisbane',
        isActive: true,
      },
    })
    console.log(
      `✓ 创建家长: ${parentUser.displayName} (${parentUser.username})`
    )

    // 4. 创建学生用户 August (Year 3, 8岁)
    console.log('创建学生用户 August...')
    const augustPassword = await hashPassword('password123')
    const augustUser = await prisma.user.upsert({
      where: { username: 'august' },
      update: {},
      create: {
        username: 'august',
        password: augustPassword,
        displayName: 'August Chen',
        role: 'STUDENT',
        yearLevel: 3,
        birthYear: 2016, // 8岁 (假设当前年份是2024)
        familyId: family.id,
        parentalCode: 'AUG123',
        timezone: 'Australia/Brisbane',
        isActive: true,
      },
    })
    console.log(
      `✓ 创建学生: ${augustUser.displayName} (${augustUser.username}) - Year ${augustUser.yearLevel}`
    )

    // 5. 创建学生用户 Michael (Year 6, 11岁)
    console.log('创建学生用户 Michael...')
    const michaelPassword = await hashPassword('password123')
    const michaelUser = await prisma.user.upsert({
      where: { username: 'michael' },
      update: {},
      create: {
        username: 'michael',
        password: michaelPassword,
        displayName: 'Michael Chen',
        role: 'STUDENT',
        yearLevel: 6,
        birthYear: 2013, // 11岁
        familyId: family.id,
        parentalCode: 'MIC456',
        timezone: 'Australia/Brisbane',
        isActive: true,
      },
    })
    console.log(
      `✓ 创建学生: ${michaelUser.displayName} (${michaelUser.username}) - Year ${michaelUser.yearLevel}`
    )

    // 6. 创建额外的测试用户
    console.log('创建额外测试用户...')

    // 另一个家庭
    let smithFamily = await prisma.family.findFirst({
      where: { name: 'The Smith Family' },
    })

    if (!smithFamily) {
      smithFamily = await prisma.family.create({
        data: {
          name: 'The Smith Family',
          timezone: 'Australia/Sydney',
        },
      })
    }

    // Smith 家庭的家长
    const smithParentPassword = await hashPassword('password123')
    const smithParent = await prisma.user.upsert({
      where: { username: 'john_smith' },
      update: {},
      create: {
        username: 'john_smith',
        email: 'john@smith.com',
        password: smithParentPassword,
        displayName: 'John Smith',
        role: 'PARENT',
        familyId: smithFamily.id,
        timezone: 'Australia/Sydney',
        isActive: true,
      },
    })

    // Smith 家庭的学生
    const smithStudentPassword = await hashPassword('password123')
    const smithStudent = await prisma.user.upsert({
      where: { username: 'emma_smith' },
      update: {},
      create: {
        username: 'emma_smith',
        password: smithStudentPassword,
        displayName: 'Emma Smith',
        role: 'STUDENT',
        yearLevel: 4,
        birthYear: 2015,
        familyId: smithFamily.id,
        parentalCode: 'EMM789',
        timezone: 'Australia/Sydney',
        isActive: true,
      },
    })

    console.log(`✓ 创建 Smith 家庭: ${smithFamily.name}`)
    console.log(`✓ 创建家长: ${smithParent.displayName}`)
    console.log(`✓ 创建学生: ${smithStudent.displayName}`)

    // 7. 创建一些示例活动日志
    console.log('创建示例活动日志...')
    await prisma.activityLog.createMany({
      data: [
        {
          userId: adminUser.id,
          action: 'LOGIN',
          details: JSON.stringify({
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: new Date().toISOString(),
          }),
          ipAddress: '127.0.0.1',
        },
        {
          userId: adminUser.id,
          action: 'CREATE_CONTENT',
          details: JSON.stringify({
            action: 'create_user',
            targetUserId: augustUser.id,
            timestamp: new Date().toISOString(),
          }),
          resourceType: 'User',
          resourceId: augustUser.id,
          ipAddress: '127.0.0.1',
        },
        {
          userId: parentUser.id,
          action: 'LOGIN',
          details: JSON.stringify({
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            timestamp: new Date().toISOString(),
          }),
          ipAddress: '192.168.1.100',
        },
      ],
    })

    console.log('✓ 创建示例活动日志')

    // 8. 创建系统配置
    console.log('创建系统配置...')
    const systemConfigs = [
      {
        key: 'auth.password_policy',
        value: JSON.stringify({
          minLength: 6,
          requireNumbers: false,
          requireUppercase: false,
          requireSpecialChars: false,
        }),
        category: 'security',
        description: '密码策略配置',
      },
      {
        key: 'auth.session_timeout',
        value: JSON.stringify({ timeout: 24 * 60 * 60 * 1000 }), // 24小时
        category: 'security',
        description: '会话超时配置',
      },
      {
        key: 'family.max_members',
        value: JSON.stringify({ maxMembers: 10 }),
        category: 'family',
        description: '家庭最大成员数',
      },
      {
        key: 'platform.name',
        value: JSON.stringify({ name: 'Family Learning Platform' }),
        category: 'general',
        description: '平台名称',
      },
    ]

    for (const config of systemConfigs) {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: {},
        create: config,
      })
    }

    console.log('✓ 创建系统配置')

    console.log('认证系统种子数据创建完成！')
    console.log('\n=== 测试账户信息 ===')
    console.log('管理员账户:')
    console.log('  用户名: dan')
    console.log('  密码: admin123')
    console.log('  角色: 管理员')
    console.log('\n家长账户:')
    console.log('  用户名: grace')
    console.log('  密码: password123')
    console.log('  角色: 家长')
    console.log('\n学生账户:')
    console.log('  用户名: august')
    console.log('  密码: password123')
    console.log('  角色: 学生 (Year 3)')
    console.log('\n  用户名: michael')
    console.log('  密码: password123')
    console.log('  角色: 学生 (Year 6)')
    console.log('==================')

    return {
      family,
      users: {
        admin: adminUser,
        parent: parentUser,
        augustStudent: augustUser,
        michaelStudent: michaelUser,
      },
    }
  } catch (error) {
    console.error('创建认证系统种子数据时发生错误:', error)
    throw error
  }
}

// 清理认证数据
export async function cleanAuthData() {
  console.log('清理认证系统数据...')

  try {
    // 按依赖关系顺序删除
    await prisma.activityLog.deleteMany()
    await prisma.systemConfig.deleteMany()
    await prisma.user.deleteMany()
    await prisma.family.deleteMany()

    console.log('✓ 认证系统数据清理完成')
  } catch (error) {
    console.error('清理认证数据时发生错误:', error)
    throw error
  }
}

// 如果直接运行此文件
if (require.main === module) {
  seedAuthData()
    .catch(e => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
