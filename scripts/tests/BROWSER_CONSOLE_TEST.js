// Quick browser console check - paste this in your browser console
// This will show the exact error from Supabase

console.log('🔍 Testing Supabase integrations table access...');

// Test direct table access
async function testIntegrationsTable() {
  try {
    // Import supabase if available
    const { supabase } = await import('./src/services/supabase.js');
    
    console.log('✅ Supabase imported successfully');
    
    // Test 1: Simple select
    console.log('🧪 Test 1: Simple table select...');
    const { data: allData, error: selectError } = await supabase
      .from('integrations')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Select error:', selectError);
      return;
    }
    
    console.log('✅ Table select works, data:', allData);
    
    // Test 2: Shopify specific query (this is what's failing)
    console.log('🧪 Test 2: Shopify specific query...');
    const { data: shopifyData, error: shopifyError } = await supabase
      .from('integrations')
      .select('*')
      .eq('integration_id', 'shopify')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001');
    
    if (shopifyError) {
      console.error('❌ Shopify query error:', shopifyError);
      console.log('💡 This is likely the cause of the 400 error!');
      return;
    }
    
    console.log('✅ Shopify query works, data:', shopifyData);
    
    // Test 3: Insert/upsert test
    console.log('🧪 Test 3: Testing upsert...');
    const { data: upsertData, error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        integration_id: 'test',
        integration_name: 'Test Integration',
        status: 'disconnected',
        config: {},
        credentials: {}
      }, {
        onConflict: 'organization_id,integration_id'
      });
    
    if (upsertError) {
      console.error('❌ Upsert error:', upsertError);
      return;
    }
    
    console.log('✅ Upsert works');
    
    // Clean up test record
    await supabase
      .from('integrations')
      .delete()
      .eq('integration_id', 'test');
    
    console.log('🎉 All tests passed! The table is working correctly.');
    
  } catch (error) {
    console.error('❌ Failed to test:', error);
  }
}

testIntegrationsTable();