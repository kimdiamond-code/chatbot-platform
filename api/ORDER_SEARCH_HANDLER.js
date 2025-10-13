// ==============================================================================
// ADD THIS TO api/consolidated.js
// Location: After shopify_getOrders handler (around line 470)
// ==============================================================================

if (action === 'shopify_searchOrders') {
  const { store_url, access_token, order_name } = body;
  try {
    console.log('🔍 Searching orders for:', order_name);
    
    // Search by order name/number
    // Shopify's "name" parameter searches by order name (e.g., #1001, #1002)
    const url = `https://${store_url}/admin/api/2024-01/orders.json?name=${encodeURIComponent(order_name)}&status=any`;
    
    console.log('📡 Search URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Shopify order search error:', response.status, data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.errors || data.error || 'Failed to search orders',
        details: data
      });
    }
    
    console.log('✅ Found', data.orders?.length || 0, 'matching orders');
    return res.status(200).json({ 
      success: true, 
      orders: data.orders || [] 
    });
  } catch (error) {
    console.error('❌ Order search error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
