// 🧪 Production Mode Test Script
// Run this in the browser console to test production mode activation

console.log('🚀 Testing Production Mode Activation...');

// Test current mode status
const testProductionMode = async () => {
  console.log('📋 Current Status:');
  console.log('PRODUCTION_MODE:', localStorage.getItem('PRODUCTION_MODE'));
  console.log('DEMO_MODE:', localStorage.getItem('DEMO_MODE'));
  
  // Import the services dynamically
  try {
    const { healthCheck, refreshSupabaseClient } = await import('./services/supabase.js');
    const { enableProductionMode, getProductionStatus } = await import('./utils/productionMode.js');
    
    console.log('\n🔍 Before Production Mode:');
    const beforeStatus = getProductionStatus();
    console.log('Production Status:', beforeStatus);
    
    const beforeHealth = await healthCheck();
    console.log('Health Check:', beforeHealth);
    
    console.log('\n🚀 Activating Production Mode...');
    enableProductionMode();
    
    console.log('\n🔄 Refreshing Supabase Client...');
    refreshSupabaseClient();
    
    console.log('\n✅ After Production Mode:');
    const afterStatus = getProductionStatus();
    console.log('Production Status:', afterStatus);
    
    const afterHealth = await healthCheck();
    console.log('Health Check:', afterHealth);
    
    console.log('\n🎯 Test Complete!');
    console.log(`Mode Change: ${beforeStatus.isProduction} → ${afterStatus.isProduction}`);
    console.log(`Database: ${beforeHealth.status} → ${afterHealth.status}`);
    
    if (afterStatus.isProduction && afterHealth.status === 'healthy') {
      console.log('✅ SUCCESS: Production mode activated with live database!');
    } else {
      console.log('⚠️ PARTIAL: Production mode activated but database needs attention');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testProductionMode();

export { testProductionMode };