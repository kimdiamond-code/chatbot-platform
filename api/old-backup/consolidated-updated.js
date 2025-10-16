// Enhanced shopify_createDraftOrder handler - REPLACE LINES 447-476 in consolidated.js

if (action === 'shopify_createDraftOrder') {
  const { store_url, access_token, draft_order } = body;
  
  // Validate required fields
  if (!store_url || !access_token || !draft_order) {
    console.error('❌ Missing required fields:', { 
      hasStoreUrl: !!store_url, 
      hasAccessToken: !!access_token, 
      hasDraftOrder: !!draft_order 
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: store_url, access_token, and draft_order are required'
    });
  }
  
  // Validate draft order structure
  if (!draft_order.draft_order || !draft_order.draft_order.line_items || draft_order.draft_order.line_items.length === 0) {
    console.error('❌ Invalid draft order structure:', draft_order);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid draft order: must contain draft_order.line_items array'
    });
  }
  
  try {
    console.log('🛒 Creating draft order for store:', store_url);
    console.log('📝 Draft order payload:', JSON.stringify(draft_order, null, 2));
    console.log('🔑 Access token present:', !!access_token, '(length:', access_token?.length || 0, ')');
    
    const apiUrl = `https://${store_url}/admin/api/2024-01/draft_orders.json`;
    console.log('🎯 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(draft_order)
    });
    
    const responseText = await response.text();
    console.log('📨 Shopify response status:', response.status);
    console.log('📨 Shopify response body:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Shopify response:', parseError);
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response from Shopify API',
        details: { rawResponse: responseText.substring(0, 500) }
      });
    }
    
    if (!response.ok) {
      console.error('❌ Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create draft order';
      let errorDetails = data;
      
      if (response.status === 403) {
        errorMessage = 'Permission denied. Missing write_draft_orders scope. Go to Integrations → Shopify → Disconnect, then reconnect.';
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized. Access token may be expired or invalid. Please reconnect Shopify.';
      } else if (response.status === 422) {
        // Unprocessable entity - validation errors
        if (data.errors) {
          if (typeof data.errors === 'string') {
            errorMessage = data.errors;
          } else if (typeof data.errors === 'object') {
            errorMessage = `Validation error: ${JSON.stringify(data.errors)}`;
          }
        }
      } else if (response.status === 404) {
        errorMessage = 'Shopify store not found. Check store URL in Integrations.';
      } else if (data.errors) {
        errorMessage = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      } else if (data.error) {
        errorMessage = data.error;
      }
      
      return res.status(response.status).json({ 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        shopifyStatus: response.status
      });
    }
    
    if (!data.draft_order) {
      console.error('❌ No draft_order in response:', data);
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response from Shopify: missing draft_order',
        details: data
      });
    }
    
    console.log('✅ Draft order created successfully:');
    console.log('  • ID:', data.draft_order.id);
    console.log('  • Order name:', data.draft_order.name);
    console.log('  • Total price:', data.draft_order.total_price);
    console.log('  • Line items:', data.draft_order.line_items?.length || 0);
    
    return res.status(200).json({ 
      success: true, 
      draft_order: data.draft_order 
    });
  } catch (error) {
    console.error('❌ Draft order creation error:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error while creating draft order',
      errorType: error.name
    });
  }
}
