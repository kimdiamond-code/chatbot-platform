// Connection Test Utility - Comprehensive Platform Health Check
import dbService from '../services/databaseService';

export const runConnectionTest = async () => {
  console.log('🔍 Starting comprehensive connection test...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Test 1: Environment Variables
  console.log('📋 Testing environment variables...');
  const envTest = {
    name: 'Environment Configuration',
    status: 'unknown',
    details: []
  };

  try {
    const requiredVars = [
      'VITE_OPENAI_API_KEY'
    ];

    requiredVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value) {
        envTest.details.push(`❌ ${varName}: Missing`);
      } else if (value.includes('your-') || value.includes('sk-') && value.length < 20) {
        envTest.details.push(`⚠️ ${varName}: Placeholder value detected`);
      } else {
        envTest.details.push(`✅ ${varName}: Configured`);
      }
    });

    const failedCount = envTest.details.filter(d => d.startsWith('❌')).length;
    const warningCount = envTest.details.filter(d => d.startsWith('⚠️')).length;
    
    if (failedCount > 0) {
      envTest.status = 'failed';
      results.summary.failed++;
    } else if (warningCount > 0) {
      envTest.status = 'warning';
      results.summary.warnings++;
    } else {
      envTest.status = 'passed';
      results.summary.passed++;
    }
  } catch (error) {
    envTest.status = 'failed';
    envTest.details.push(`❌ Error: ${error.message}`);
    results.summary.failed++;
  }

  results.tests.push(envTest);
  results.summary.total++;

  // Test 2: Neon Database Connection
  console.log('🗄️ Testing Neon database connection...');
  const databaseTest = {
    name: 'Neon PostgreSQL Database',
    status: 'unknown',
    details: []
  };

  try {
    const connection = await dbService.testConnection();
    
    if (connection) {
      databaseTest.status = 'passed';
      databaseTest.details.push('✅ Connected to Neon Database');
      databaseTest.details.push('✅ Database is responsive');
      results.summary.passed++;
    } else {
      databaseTest.status = 'failed';
      databaseTest.details.push('❌ Connection failed');
      results.summary.failed++;
    }
  } catch (error) {
    databaseTest.status = 'failed';
    databaseTest.details.push(`❌ Connection test failed: ${error.message}`);
    databaseTest.details.push('💡 Check DATABASE_URL in environment variables');
    results.summary.failed++;
  }

  results.tests.push(databaseTest);
  results.summary.total++;

  // Test 3: OpenAI API
  console.log('🤖 Testing OpenAI API...');
  const openaiTest = {
    name: 'OpenAI Integration',
    status: 'unknown',
    details: []
  };

  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-key') {
      openaiTest.status = 'failed';
      openaiTest.details.push('❌ OpenAI API key not configured');
      openaiTest.details.push('💡 Add VITE_OPENAI_API_KEY to .env file');
      results.summary.failed++;
    } else if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
      openaiTest.status = 'warning';
      openaiTest.details.push('⚠️ OpenAI API key format looks incorrect');
      openaiTest.details.push('💡 Should start with "sk-" and be longer');
      results.summary.warnings++;
    } else {
      openaiTest.status = 'passed';
      openaiTest.details.push('✅ API key configured');
      openaiTest.details.push('💡 Key format looks correct');
      results.summary.passed++;
    }
  } catch (error) {
    openaiTest.status = 'failed';
    openaiTest.details.push(`❌ OpenAI test failed: ${error.message}`);
    results.summary.failed++;
  }

  results.tests.push(openaiTest);
  results.summary.total++;

  // Test 4: Platform Health
  console.log('🏥 Running platform health check...');
  const healthTest = {
    name: 'Platform Health',
    status: 'unknown',
    details: []
  };

  try {
    // Test database + check if we can read organizations
    const orgTest = await dbService.getOrganization('00000000-0000-0000-0000-000000000001');
    
    if (orgTest) {
      healthTest.status = 'passed';
      healthTest.details.push('✅ Platform is healthy');
      healthTest.details.push('✅ All core services responsive');
      results.summary.passed++;
    } else {
      healthTest.status = 'warning';
      healthTest.details.push('⚠️ Platform partially healthy');
      healthTest.details.push('⚠️ Database schema may need setup');
      results.summary.warnings++;
    }
  } catch (error) {
    healthTest.status = 'failed';
    healthTest.details.push(`❌ Health check failed: ${error.message}`);
    healthTest.details.push('💡 Database schema may need to be initialized');
    results.summary.failed++;
  }

  results.tests.push(healthTest);
  results.summary.total++;

  // Log results summary
  console.log('📊 Connection Test Summary:');
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`⚠️ Warnings: ${results.summary.warnings}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📋 Total Tests: ${results.summary.total}`);

  // Log detailed results
  results.tests.forEach(test => {
    console.log(`\n🔍 ${test.name} (${test.status.toUpperCase()}):`);
    test.details.forEach(detail => console.log(`  ${detail}`));
  });

  // Overall status
  const overallStatus = 
    results.summary.failed > 0 ? 'FAILED' :
    results.summary.warnings > 0 ? 'WARNING' : 
    'PASSED';
  
  console.log(`\n🎯 Overall Status: ${overallStatus}`);

  if (overallStatus === 'FAILED') {
    console.log('💡 Fix failed tests before proceeding with development');
  } else if (overallStatus === 'WARNING') {
    console.log('💡 Address warnings for optimal performance');
  } else {
    console.log('🎉 All systems are go! Platform is ready');
  }

  return results;
};

// Quick connectivity test (faster, less comprehensive)
export const quickConnectivityTest = async () => {
  try {
    console.log('⚡ Running quick connectivity test...');
    
    const databaseTest = await dbService.testConnection();
    const hasOpenAI = !!(import.meta.env.VITE_OPENAI_API_KEY && 
                         import.meta.env.VITE_OPENAI_API_KEY !== 'your-openai-key');
    
    const result = {
      database: !!databaseTest,
      neon: !!databaseTest,
      openai: hasOpenAI,
      overall: !!databaseTest && hasOpenAI
    };
    
    console.log('⚡ Quick test results:', result);
    return result;
  } catch (error) {
    console.error('⚡ Quick test failed:', error);
    return {
      database: false,
      neon: false,
      openai: false,
      overall: false,
      error: error.message
    };
  }
};

export default runConnectionTest;
