import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Setup test database
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db'
    }
  }
});

// Setup before all tests
global.beforeAll(async () => {
  // Connect to test database
  await testPrisma.$connect();
  
  // Clean database before tests
  await cleanDatabase();
});

// Cleanup after each test
global.afterEach(async () => {
  await cleanDatabase();
});

// Cleanup after all tests
global.afterAll(async () => {
  await testPrisma.$disconnect();
});

// Helper function to clean database
async function cleanDatabase() {
  const tablenames = await testPrisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%';
  `;

  for (const { name } of tablenames) {
    await testPrisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
  }
}

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.PORT = '3001';