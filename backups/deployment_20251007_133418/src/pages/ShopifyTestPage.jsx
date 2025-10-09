import React, { useState } from 'react';
import { shopifyService } from '../services/integrations/shopifyService';

const ShopifyTestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Test connection
  const testConnection = async () => {
    setLoading(prev => ({ ...prev, connection: true }));
    try {
      const result = await shopifyService.verifyConnection();
      setConnectionStatus(result);
      setTestResults(prev => ({ ...prev, connection: result }));
    } catch (error) {
      setConnectionStatus({ connected: false, error: error.message });
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  // Test product search
  const testProductSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }
    
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const products = await shopifyService.searchProducts(searchQuery, 5);
      setTestResults(prev => ({ ...prev, products }));
    } catch (error) {
      console.error('Product search error:', error);
      setTestResults(prev => ({ ...prev, products: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Test order tracking
  const testOrderTracking = async () => {
    if (!orderNumber.trim()) {
      alert('Please enter an order number');
      return;
    }
    
    setLoading(prev => ({ ...prev, order: true }));
    try {
      const order = await shopifyService.findOrderByNumber(orderNumber);
      if (order) {
        const tracking = await shopifyService.getOrderTracking(order.id);
        setTestResults(prev => ({ ...prev, order: { order, tracking } }));
      } else {
        setTestResults(prev => ({ ...prev, order: { error: 'Order not found' } }));
      }
    } catch (error) {
      console.error('Order tracking error:', error);
      setTestResults(prev => ({ ...prev, order: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, order: false }));
    }
  };

  // Test customer lookup
  const testCustomerLookup = async () => {
    if (!customerEmail.trim()) {
      alert('Please enter a customer email');
      return;
    }
    
    setLoading(prev => ({ ...prev, customer: true }));
    try {
      const customer = await shopifyService.findCustomerByEmail(customerEmail);
      if (customer) {
        const orders = await shopifyService.getCustomerOrders(customer.id, 5);
        setTestResults(prev => ({ ...prev, customer: { customer, orders } }));
      } else {
        setTestResults(prev => ({ ...prev, customer: { error: 'Customer not found' } }));
      }
    } catch (error) {
      console.error('Customer lookup error:', error);
      setTestResults(prev => ({ ...prev, customer: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, customer: false }));
    }
  };

  // Test chat inquiry
  const testChatInquiry = async (inquiry, email = null) => {
    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const result = await shopifyService.handleChatInquiry(inquiry, email);
      setTestResults(prev => ({ ...prev, chat: result }));
    } catch (error) {
      console.error('Chat inquiry error:', error);
      setTestResults(prev => ({ ...prev, chat: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">🛍️</span>
          Shopify Integration Test
        </h1>
        <p className="text-gray-600 mt-2">
          Test your True Citrus Shopify store connection and features
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connection Status</h2>
          <button
            onClick={testConnection}
            disabled={loading.connection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading.connection ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Testing...
              </>
            ) : (
              <>🔌 Test Connection</>
            )}
          </button>
        </div>

        {connectionStatus && (
          <div className={`p-4 rounded-lg ${
            connectionStatus.connected 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {connectionStatus.connected ? (
              <div className="space-y-2">
                <p className="text-green-800 font-semibold flex items-center gap-2">
                  ✅ Connected Successfully
                </p>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Store:</strong> {connectionStatus.shop}</p>
                  <p><strong>Domain:</strong> {connectionStatus.domain}</p>
                  <p><strong>Email:</strong> {connectionStatus.email}</p>
                  <p><strong>Currency:</strong> {connectionStatus.currency}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-800 font-semibold flex items-center gap-2">
                  ❌ Connection Failed
                </p>
                <p className="text-sm text-red-700 mt-2">{connectionStatus.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Search Test */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Product Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products (e.g., 'lemon', 'orange')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && testProductSearch()}
          />
          <button
            onClick={testProductSearch}
            disabled={loading.products}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading.products ? 'Searching...' : 'Search'}
          </button>
        </div>

        {testResults.products && (
          <div className="mt-4">
            {testResults.products.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                Error: {testResults.products.error}
              </div>
            ) : testResults.products.length > 0 ? (
              <div className="space-y-3">
                <p className="text-green-700 font-semibold">
                  Found {testResults.products.length} products:
                </p>
                {testResults.products.map(product => (
                  <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex gap-4">
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0].src} 
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.product_type}</p>
                        {product.variants && product.variants[0] && (
                          <p className="text-green-700 font-semibold mt-1">
                            ${product.variants[0].price}
                            {product.variants[0].inventory_quantity > 0 ? (
                              <span className="ml-2 text-sm text-green-600">
                                ✅ {product.variants[0].inventory_quantity} in stock
                              </span>
                            ) : (
                              <span className="ml-2 text-sm text-red-600">
                                ❌ Out of stock
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                No products found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Tracking Test */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📦 Order Tracking</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter order number (e.g., 1001)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && testOrderTracking()}
          />
          <button
            onClick={testOrderTracking}
            disabled={loading.order}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading.order ? 'Loading...' : 'Track Order'}
          </button>
        </div>

        {testResults.order && (
          <div className="mt-4">
            {testResults.order.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {testResults.order.error}
              </div>
            ) : testResults.order.order && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-900">
                    {testResults.order.order.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-700">
                    {shopifyService.getOrderStatus(testResults.order.order)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-gray-900">
                    {shopifyService.formatPrice(testResults.order.order.total_price, testResults.order.order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <ul className="mt-1 space-y-1">
                    {testResults.order.order.line_items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {item.title} (×{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
                {testResults.order.tracking && testResults.order.tracking.tracking_info && testResults.order.tracking.tracking_info.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking</p>
                    {testResults.order.tracking.tracking_info.map((track, index) => (
                      <div key={index} className="mt-1 text-sm">
                        {track.tracking_number && (
                          <p className="text-gray-700">
                            {track.tracking_company}: {track.tracking_number}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Lookup Test */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 Customer Lookup</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter customer email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && testCustomerLookup()}
          />
          <button
            onClick={testCustomerLookup}
            disabled={loading.customer}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading.customer ? 'Looking up...' : 'Lookup'}
          </button>
        </div>

        {testResults.customer && (
          <div className="mt-4">
            {testResults.customer.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {testResults.customer.error}
              </div>
            ) : testResults.customer.customer && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {testResults.customer.customer.first_name} {testResults.customer.customer.last_name}
                  </p>
                  <p className="text-sm text-gray-700">{testResults.customer.customer.email}</p>
                </div>
                {testResults.customer.orders && testResults.customer.orders.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Recent Orders ({testResults.customer.orders.length})
                    </p>
                    <div className="space-y-2">
                      {testResults.customer.orders.map(order => (
                        <div key={order.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{order.name}</p>
                              <p className="text-sm text-gray-600">
                                {shopifyService.formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-700">
                                {shopifyService.formatPrice(order.total_price, order.currency)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {shopifyService.getOrderStatus(order)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Inquiry Test */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💬 Chat Inquiry Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test how the bot responds to common customer inquiries
        </p>

        <div className="space-y-3">
          <button
            onClick={() => testChatInquiry('where is my order #1001?')}
            disabled={loading.chat}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">📦 "Where is my order #1001?"</div>
            <div className="text-sm text-gray-500">Test order tracking inquiry</div>
          </button>

          <button
            onClick={() => testChatInquiry('looking for lemon products')}
            disabled={loading.chat}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">🔍 "Looking for lemon products"</div>
            <div className="text-sm text-gray-500">Test product search</div>
          </button>

          <button
            onClick={() => testChatInquiry('is this item in stock?', customerEmail)}
            disabled={loading.chat}
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">📊 "Is this item in stock?"</div>
            <div className="text-sm text-gray-500">Test inventory check</div>
          </button>
        </div>

        {loading.chat && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full"></div>
              Processing inquiry...
            </div>
          </div>
        )}

        {testResults.chat && !loading.chat && (
          <div className="mt-4">
            {testResults.chat.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                Error: {testResults.chat.error}
              </div>
            ) : testResults.chat ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-semibold mb-2">
                  Type: {testResults.chat.type}
                </p>
                <div className="bg-white p-3 rounded border border-green-200">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {testResults.chat.response}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                No relevant data found for this inquiry
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyTestPage;
