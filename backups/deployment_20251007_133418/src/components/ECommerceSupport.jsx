import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, RefreshCw, Tag, DollarSign, Truck, AlertCircle, Search, Star } from 'lucide-react';

const ECommerceSupport = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [cartRecoverySettings, setCartRecoverySettings] = useState({
    enabled: true,
    firstReminder: 1, // hours
    secondReminder: 24,
    discountPercentage: 10,
    emailTemplate: 'default'
  });

  const [products] = useState([
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      image: '🎧',
      category: 'Electronics',
      rating: 4.5,
      reviews: 234,
      recommendations: 1247,
      conversionRate: 18
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      price: 399.99,
      image: '⌚',
      category: 'Electronics',
      rating: 4.8,
      reviews: 567,
      recommendations: 2341,
      conversionRate: 22
    },
    {
      id: 3,
      name: 'Ergonomic Office Chair',
      price: 599.99,
      image: '🪑',
      category: 'Furniture',
      rating: 4.6,
      reviews: 123,
      recommendations: 892,
      conversionRate: 15
    }
  ]);

  const [abandonedCarts] = useState([
    {
      id: 1,
      customer: 'Sarah Johnson',
      email: 'sarah@email.com',
      cartValue: 899.97,
      items: 3,
      abandonedAt: '2 hours ago',
      recoveryStatus: 'pending',
      products: ['Premium Wireless Headphones', 'Smart Watch Pro']
    },
    {
      id: 2,
      customer: 'Mike Chen',
      email: 'mike@company.com',
      cartValue: 599.99,
      items: 1,
      abandonedAt: '5 hours ago',
      recoveryStatus: 'email_sent',
      products: ['Ergonomic Office Chair']
    },
    {
      id: 3,
      customer: 'Lisa Park',
      email: 'lisa@business.com',
      cartValue: 1299.96,
      items: 4,
      abandonedAt: '1 day ago',
      recoveryStatus: 'recovered',
      products: ['Smart Watch Pro', 'Premium Wireless Headphones', 'USB-C Hub']
    }
  ]);

  const [orders] = useState([
    {
      id: 'ORD-2024-001',
      customer: 'John Smith',
      status: 'shipped',
      total: 599.99,
      date: '2024-03-19',
      tracking: 'TRK123456789',
      estimatedDelivery: '2024-03-22'
    },
    {
      id: 'ORD-2024-002',
      customer: 'Emma Wilson',
      status: 'processing',
      total: 899.97,
      date: '2024-03-20',
      tracking: null,
      estimatedDelivery: '2024-03-24'
    },
    {
      id: 'ORD-2024-003',
      customer: 'Robert Davis',
      status: 'delivered',
      total: 399.99,
      date: '2024-03-15',
      tracking: 'TRK987654321',
      estimatedDelivery: '2024-03-18'
    }
  ]);

  const [recommendationRules, setRecommendationRules] = useState({
    algorithm: 'collaborative_filtering',
    showRelated: true,
    maxRecommendations: 5,
    personalizeByHistory: true,
    useAIEnhancement: true
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'recovered': return 'bg-green-100 text-green-700';
      case 'email_sent': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Commerce Support</h1>
        <p className="text-gray-600">Boost sales with intelligent product recommendations and cart recovery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Cart Recovery Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">23%</div>
          <span className="text-xs text-green-600">+5% vs last month</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Revenue Recovered</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$12,450</div>
          <span className="text-xs text-green-600">+18% vs last month</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Recommendation CTR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">15.7%</div>
          <span className="text-xs text-green-600">+2.3% vs last month</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Active Orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">47</div>
          <span className="text-xs text-gray-600">Being tracked</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['recommendations', 'cart_recovery', 'order_tracking', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'glass-dynamic text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Catalog */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Catalog</h2>
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="glass-dynamic p-4 rounded-xl hover-3d-tilt">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{product.image}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <span className="text-xs text-gray-500">Recommendations</span>
                          <div className="text-lg font-semibold text-gray-900">{product.recommendations}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Conversion Rate</span>
                          <div className="text-lg font-semibold text-green-600">{product.conversionRate}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation Engine</h2>
            <div className="glass-premium p-6 rounded-xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                  <select 
                    value={recommendationRules.algorithm}
                    onChange={(e) => setRecommendationRules({...recommendationRules, algorithm: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="collaborative_filtering">Collaborative Filtering</option>
                    <option value="content_based">Content-Based</option>
                    <option value="hybrid">Hybrid AI Model</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Recommendations
                  </label>
                  <input
                    type="number"
                    value={recommendationRules.maxRecommendations}
                    onChange={(e) => setRecommendationRules({...recommendationRules, maxRecommendations: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={recommendationRules.showRelated}
                      onChange={(e) => setRecommendationRules({...recommendationRules, showRelated: e.target.checked})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Show related products</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={recommendationRules.personalizeByHistory}
                      onChange={(e) => setRecommendationRules({...recommendationRules, personalizeByHistory: e.target.checked})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Personalize by browsing history</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={recommendationRules.useAIEnhancement}
                      onChange={(e) => setRecommendationRules({...recommendationRules, useAIEnhancement: e.target.checked})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Use AI enhancement</span>
                  </label>
                </div>

                <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendation Preview</h3>
              <div className="glass-dynamic p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">Customer viewing: Premium Wireless Headphones</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Smart Watch Pro</span>
                    <span className="text-xs text-blue-600">92% match</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Wireless Charging Pad</span>
                    <span className="text-xs text-blue-600">85% match</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Premium Cable Set</span>
                    <span className="text-xs text-blue-600">78% match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cart_recovery' && (
        <div>
          {/* Cart Recovery Settings */}
          <div className="glass-premium p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Recovery Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Reminder (hours)</label>
                <input
                  type="number"
                  value={cartRecoverySettings.firstReminder}
                  onChange={(e) => setCartRecoverySettings({...cartRecoverySettings, firstReminder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Reminder (hours)</label>
                <input
                  type="number"
                  value={cartRecoverySettings.secondReminder}
                  onChange={(e) => setCartRecoverySettings({...cartRecoverySettings, secondReminder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                <input
                  type="number"
                  value={cartRecoverySettings.discountPercentage}
                  onChange={(e) => setCartRecoverySettings({...cartRecoverySettings, discountPercentage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                <select 
                  value={cartRecoverySettings.emailTemplate}
                  onChange={(e) => setCartRecoverySettings({...cartRecoverySettings, emailTemplate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="default">Default Template</option>
                  <option value="urgency">Urgency Template</option>
                  <option value="discount">Discount Focused</option>
                </select>
              </div>
            </div>
          </div>

          {/* Abandoned Carts List */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Abandoned Carts</h2>
          <div className="space-y-4">
            {abandonedCarts.map(cart => (
              <div key={cart.id} className="glass-dynamic p-4 rounded-xl hover-3d-tilt">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">{cart.customer}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cart.recoveryStatus)}`}>
                        {cart.recoveryStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cart.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Cart Value: <strong>${cart.cartValue}</strong></span>
                      <span>{cart.items} items</span>
                      <span>Abandoned: {cart.abandonedAt}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Products: {cart.products.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                      Send Reminder
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      View Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'order_tracking' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="glass-dynamic p-4 rounded-xl hover-3d-tilt">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Customer: {order.customer}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Total: <strong>${order.total}</strong></span>
                      <span>Date: {order.date}</span>
                      {order.tracking && <span>Tracking: {order.tracking}</span>}
                    </div>
                    {order.estimatedDelivery && (
                      <div className="mt-2 text-sm text-gray-500">
                        Est. Delivery: {order.estimatedDelivery}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.tracking && (
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Track Order
                      </button>
                    )}
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">E-Commerce Integration Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option>Shopify</option>
                <option>WooCommerce</option>
                <option>Magento</option>
                <option>BigCommerce</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                placeholder="Enter your platform API key"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store URL</label>
              <input
                type="url"
                placeholder="https://your-store.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Connect Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECommerceSupport;