import 'dotenv/config';
import { PrismaClient, Role, Status } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// schema.prismaで output を指定している場合、パスが変わる可能性があります。
// 基本的には標準の '@prisma/client' で動作しますが、エラーが出る場合は
// import { PrismaClient } ... from '../app/generated/prisma'
// のように相対パスに書き換えるか、schema.prismaのoutput設定を削除してください（推奨）。

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // 1. 既存データの削除（外部キー制約の順序に注意して削除）
  //    本番環境ではこの deleteMany は危険なので注意してください
  await prisma.equipmentHistory.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.equipmentCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data.');

  // 2. ユーザーの作成
  // 管理者ユーザー
  const adminUser = await prisma.user.create({
    data: {
      slackUserId: 'U0123456789', // 仮のID
      slackName: 'Admin User',
      realName: 'システム管理者',
      role: Role.ADMIN,
    },
  });

  // 一般ユーザー
  const normalUser = await prisma.user.create({
    data: {
      slackUserId: 'U9876543210', // 仮のID
      slackName: 'Taro Kyudai',
      realName: '九大 太郎',
      role: Role.USER,
    },
  });

  console.log(`👤 Created users: ${adminUser.slackName}, ${normalUser.slackName}`);

  // 3. 物品カテゴリの作成 (設計書に基づく: PC, D, S, Z)
  const categories = await Promise.all([
    prisma.equipmentCategory.create({
      data: { code: 'PC', name: 'PC・タブレット' },
    }),
    prisma.equipmentCategory.create({
      data: { code: 'D', name: 'ディスプレイ・モニター' },
    }),
    prisma.equipmentCategory.create({
      data: { code: 'S', name: 'サーバー・ネットワーク機器' },
    }),
    prisma.equipmentCategory.create({
      data: { code: 'Z', name: 'その他・雑貨' },
    }),
  ]);

  console.log(`📦 Created ${categories.length} categories.`);

  // 4. 予算の作成
  const budgetA = await prisma.budget.create({
    data: { name: '運営費費' },
  });
  const budgetB = await prisma.budget.create({
    data: { name: '共同研究費A' },
  });

  console.log(`💰 Created budgets.`);

  // 5. サンプル備品の作成 (PCカテゴリーの1つ目)
  const macbook = await prisma.equipment.create({
    data: {
      name: 'MacBook Pro 14-inch',
      type: 'ノートPC',
      publicId: 'ASSET-2026-001',
      purchaseDate: new Date('2026-04-01'),
      warrantyEnd: new Date('2029-04-01'),
      location: '居室デスク',
      status: Status.AVAILABLE,
      remarks: '初期導入分',
      categoryCode: 'PC',
      categoryIndex: 1, // PC-1
      budgetId: budgetA.budgetId,
      userId: adminUser.userId,   // 管理者が使用中
      managerId: adminUser.userId, // 管理者が管理
    },
  });

  console.log(`💻 Created sample equipment: ${macbook.name} (PC-1)`);

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
