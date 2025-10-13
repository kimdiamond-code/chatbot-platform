// ==============================================================================
// ADD THIS TO api/consolidated.js
// Location: After shopify_getOrders handler (around line 460)
// ==============================================================================

if (action === 'shopify_getDraftOrders') {
  const { store_url, access_token, customer_email, limit = 10 } = body;
  try {
    console.log('🛒 Fetching draft orders for:', customer_email || 'all customers');
    
    let url = `https://${store_url}/admin/api/2024-01/draft_orders.json?limit=${limit}`;
    if (customer_email) {
      // Filter by customer email and only get open/active draft orders
      url += `&email=${encodeURIComponent(customer_email)}&status=open`;
    }
    
    console.log('📡 Draft orders API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Shopify draft orders error:', response.status, data);
      return res.status(response.status).json({ 
        success: false, 
        error: data.errors || data.error || 'Failed to fetch draft orders',
        details: data
      });
    }
    
    console.log('✅ Retrieved', data.draft_orders?.length || 0, 'draft orders');
    return res.status(200).json({ 
      success: true, 
      draft_orders: data.draft_orders || [] 
    });
  } catch (error) {
    console.error('❌ Draft orders fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
