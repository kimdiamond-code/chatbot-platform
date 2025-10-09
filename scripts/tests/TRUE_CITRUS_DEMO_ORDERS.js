// Quick demo mode for True Citrus order tracking
// This simulates real order lookup responses

// Add to browser console to test:
window.DEMO_TRUE_CITRUS_ORDERS = {
  '480440': {
    id: '480440',
    name: '#TC-480440',
    status: 'shipped',
    fulfillment_status: 'shipped',
    financial_status: 'paid',
    total_price: '24.99',
    currency: 'USD',
    tracking_number: '1Z999AA1234567890',
    tracking_url: 'https://wwwapps.ups.com/tracking/tracking.cgi?tracknum=1Z999AA1234567890',
    line_items: [{
      title: 'True Lemon Original (32 packets)',
      quantity: 2,
      price: '12.49'
    }],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // tomorrow
  },
  '567890': {
    id: '567890', 
    name: '#TC-567890',
    status: 'delivered',
    fulfillment_status: 'fulfilled',
    financial_status: 'paid',
    total_price: '45.97',
    currency: 'USD',
    tracking_number: '1Z999AA1987654321',
    line_items: [{
      title: 'True Lime Original (32 packets)',
      quantity: 1,
      price: '12.49'
    }, {
      title: 'True Lemon Raspberry (32 packets)', 
      quantity: 1,
      price: '12.49'
    }],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // yesterday
  }
};

console.log('✅ Demo True Citrus orders loaded');
console.log('Test with: "track order 480440" or "where is order 567890"');