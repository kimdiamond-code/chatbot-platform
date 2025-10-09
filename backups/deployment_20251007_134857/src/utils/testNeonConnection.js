// Test Neon Database Connection
// Run this after setting up your DATABASE_URL in .env

import { dbService } from './services/databaseService.js';

async function testDatabaseConnection() {
  console.log('🧪 Testing Neon database connection...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing basic connection...');
    const time = await dbService.testConnection();
    console.log('✅ Connection successful! Server time:', time);

    // Test getting organization
    console.log('\n2️⃣ Testing organization query...');
    const org = await dbService.getOrganization('00000000-0000-0000-0000-000000000001');
    console.log('✅ Organization retrieved:', org?.name);

    // Test getting bot configs
    console.log('\n3️⃣ Testing bot configs query...');
    const configs = await dbService.getBotConfigs('00000000-0000-0000-0000-000000000001');
    console.log('✅ Bot configs retrieved:', configs?.length, 'configs found');

    console.log('\n✅ All tests passed! Your Neon database is ready.');
    console.log('\n📊 Database Info:');
    console.log('- Organization:', org?.name);
    console.log('- Bot Configs:', configs?.length);
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify DATABASE_URL is set in .env');
    console.error('2. Run the schema: Copy sql/neon_schema.sql and paste in Neon SQL Editor');
    console.error('3. Check your Neon dashboard for connection string');
    console.error('4. Ensure firewall allows Vercel IPs');
  }
}

// Run test
testDatabaseConnection();
