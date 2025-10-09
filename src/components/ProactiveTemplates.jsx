import React, { useState } from 'react';
import { Zap, ShoppingCart, Gift, TrendingUp, Heart, Clock, AlertCircle, Package, Edit, Check, X } from 'lucide-react';

// Pre-built proactive engagement templates
export const PROACTIVE_TEMPLATES = [
  {
    id: 'welcome-discount',
    name: 'Welcome Discount',
    category: 'conversion',
    icon: <Gift className="w-5 h-5" />,
    description: 'Greet first-time visitors with a special offer',
    trigger: {
      trigger_type: 'time_on_page',
      delay_seconds: 10,
      priority: 7,
      conditions: { timeOnPage: 10 }
    },
    message: "👋 Welcome! First time here? Get 15% off your first order with code WELCOME15!",
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'exit-intent-save',
    name: 'Exit Intent Offer',
    category: 'retention',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'Catch visitors before they leave',
    trigger: {
      trigger_type: 'exit_intent',
      delay_seconds: 0,
      priority: 9,
      conditions: {}
    },
    message: "⚠️ Wait! Don't leave empty-handed. Here's 10% off your order if you complete checkout now!",
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'cart-abandonment',
    name: 'Cart Abandonment',
    category: 'recovery',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'Remind customers about items in cart',
    trigger: {
      trigger_type: 'cart_abandonment',
      delay_seconds: 300,
      priority: 10,
      conditions: { cartValue: 50 }
    },
    message: "🛒 You have items waiting in your cart! Need help completing your order? I'm here to assist!",
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'product-recommendation',
    name: 'Smart Product Recommendation',
    category: 'engagement',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Suggest products based on browsing',
    trigger: {
      trigger_type: 'scroll_percentage',
      delay_seconds: 20,
      priority: 6,
      conditions: { scrollPercentage: 50 }
    },
    message: "💡 Based on what you're viewing, I think you'll love these products! Want personalized recommendations?",
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'shipping-promo',
    name: 'Free Shipping Alert',
    category: 'conversion',
    icon: <Package className="w-5 h-5" />,
    description: 'Notify about free shipping threshold',
    trigger: {
      trigger_type: 'cart_abandonment',
      delay_seconds: 60,
      priority: 8,
      conditions: { cartValue: 40 }
    },
    message: "🚚 You're just $10 away from FREE shipping! Add a bit more to your cart to qualify.",
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'urgency-stock',
    name: 'Low Stock Urgency',
    category: 'urgency',
    icon: <Clock className="w-5 h-5" />,
    description: 'Create urgency with low stock alerts',
    trigger: {
      trigger_type: 'url_match',
      delay_seconds: 15,
      priority: 7,
      conditions: { pageUrl: '/products/*' }
    },
    message: "⏰ Only a few items left in stock! This popular item sells out fast. Want to secure yours now?",
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'help-offer',
    name: 'Assistance Offer',
    category: 'support',
    icon: <Heart className="w-5 h-5" />,
    description: 'Offer help to engaged visitors',
    trigger: {
      trigger_type: 'time_on_page',
      delay_seconds: 45,
      priority: 5,
      conditions: { timeOnPage: 45 }
    },
    message: "👋 Hi! I noticed you've been browsing for a bit. Can I help you find what you're looking for?",
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'returning-customer',
    name: 'VIP Welcome Back',
    category: 'loyalty',
    icon: <Zap className="w-5 h-5" />,
    description: 'Special greeting for returning customers',
    trigger: {
      trigger_type: 'time_on_page',
      delay_seconds: 5,
      priority: 8,
      conditions: { customerType: 'returning' }
    },
    message: "🌟 Welcome back! As a valued customer, you have exclusive access to our VIP deals. Want to see them?",
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'utm-campaign',
    name: 'Campaign Landing',
    category: 'campaign',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Greet visitors from marketing campaigns',
    trigger: {
      trigger_type: 'utm_parameter',
      delay_seconds: 3,
      priority: 9,
      conditions: { utm_source: 'email' }
    },
    message: "🎯 Thanks for clicking! Your exclusive campaign offer is ready. Let me show you the details!",
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'product-quiz',
    name: 'Product Finder Quiz',
    category: 'engagement',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'Guide customers with interactive quiz',
    trigger: {
      trigger_type: 'scroll_percentage',
      delay_seconds: 30,
      priority: 6,
      conditions: { scrollPercentage: 70 }
    },
    message: "🎯 Not sure which product is right for you? Take our 30-second quiz and get personalized recommendations!",
    color: 'from-teal-500 to-cyan-500'
  }
];

const ProactiveTemplates = ({ onSelectTemplate, activeTriggers = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📚' },
    { value: 'conversion', label: 'Conversion', icon: '💰' },
    { value: 'retention', label: 'Retention', icon: '🔄' },
    { value: 'recovery', label: 'Recovery', icon: '🔙' },
    { value: 'engagement', label: 'Engagement', icon: '⚡' },
    { value: 'urgency', label: 'Urgency', icon: '⏰' },
    { value: 'support', label: 'Support', icon: '💬' },
    { value: 'loyalty', label: 'Loyalty', icon: '⭐' },
    { value: 'campaign', label: 'Campaign', icon: '🎯' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? PROACTIVE_TEMPLATES 
    : PROACTIVE_TEMPLATES.filter(t => t.category === selectedCategory);

  const isTemplateActive = (templateId) => {
    return activeTriggers.some(trigger => 
      trigger.name === PROACTIVE_TEMPLATES.find(t => t.id === templateId)?.name
    );
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setEditMessage(template.message);
  };

  const handleSaveEdit = (template) => {
    const updatedTemplate = {
      ...template,
      message: editMessage
    };
    onSelectTemplate(updatedTemplate, 'edit');
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proactive Templates</h2>
          <p className="text-gray-600 mt-1">Quick-activate engagement triggers with one click</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat.value
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => {
          const isActive = isTemplateActive(template.id);
          const isEditing = editingId === template.id;

          return (
            <div 
              key={template.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${template.color} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="text-sm text-white/90">{template.description}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {isActive && (
                    <span className="px-2 py-1 bg-white/30 rounded-full text-xs font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Message Preview/Edit */}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(template)}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200 min-h-[60px]">
                    {template.message}
                  </div>
                )}

                {/* Trigger Details */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span className="font-semibold text-gray-900">
                      {template.trigger.trigger_type.split('_')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delay:</span>
                    <span className="font-semibold text-gray-900">
                      {template.trigger.delay_seconds}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Priority:</span>
                    <span className="font-semibold text-gray-900">
                      {template.trigger.priority}/10
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isEditing && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onSelectTemplate(template, isActive ? 'toggle-off' : 'toggle-on')}
                      className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isActive
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      }`}
                    >
                      {isActive ? 'Disable' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No templates found in this category</p>
        </div>
      )}
    </div>
  );
};

export default ProactiveTemplates;
