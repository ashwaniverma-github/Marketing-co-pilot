const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Docker PostgreSQL...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    console.log('\n✅ Database seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed operation failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure Docker PostgreSQL is running');
    console.error('2. Check DATABASE_URL in .env file');
    console.error('3. Run: npx prisma db push');
    console.error('4. Then retry: npm run db:seed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });