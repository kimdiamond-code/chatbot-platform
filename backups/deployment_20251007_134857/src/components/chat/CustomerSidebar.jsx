import React, { useState, useEffect } from 'react';

const CustomerSidebar = ({ customer, context, onActionClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  if (!customer) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-sm">No customer selected</p>
        </div>
      </div>
    );
  }

  const getCustomerTierColor = (tier) => {
    switch (tier) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'valued': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const contextSummary = context || {};

  return (
    <div className={`${isExpanded ? 'w-80' : 'w-12'} bg-white border-l border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className=\"p-4 border-b border-gray-200 bg-gray-50\">
        <div className=\"flex items-center justify-between\">
          <div className={`${isExpanded ? 'flex' : 'hidden'} items-center space-x-3`}>
            <div className=\"w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold\">
              {customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <h3 className=\"font-semibold text-gray-900 truncate\">{customer.name || 'Anonymous'}</h3>
              <p className=\"text-xs text-gray-600 truncate\">{customer.email || 'No email'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className=\"p-1 hover:bg-gray-200 rounded transition-colors\"
          >
            {isExpanded ? '→' : '←'}
          </button>
        </div>

        {isExpanded && (
          <div className=\"mt-3 flex space-x-2\">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCustomerTierColor(contextSummary.customer?.tier)}`}>
              {contextSummary.customer?.tier?.toUpperCase() || 'STANDARD'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(contextSummary.customer?.riskLevel)}`}>
              {contextSummary.customer?.riskLevel?.toUpperCase() || 'LOW'} RISK
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {/* Navigation Tabs */}
          <div className=\"border-b border-gray-200\">
            <nav className=\"flex\">
              {[
                { id: 'overview', label: '📊', title: 'Overview' },
                { id: 'orders', label: '📦', title: 'Orders' },
                { id: 'support', label: '🎧', title: 'Support' },
                { id: 'actions', label: '⚡', title: 'Actions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 px-2 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeSection === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  title={tab.title}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className=\"flex-1 overflow-y-auto p-4\">
            {activeSection === 'overview' && (
              <div className=\"space-y-4\">
                <div>
                  <h4 className=\"font-semibold text-gray-900 mb-2\">Customer Stats</h4>
                  <div className=\"grid grid-cols-2 gap-3\">
                    <div className=\"bg-green-50 p-3 rounded-lg\">
                      <div className=\"text-lg font-bold text-green-900\">
                        {formatCurrency(contextSummary.shopify?.totalSpent)}
                      </div>
                      <div className=\"text-xs text-green-700\">Total Spent</div>
                    </div>
                    <div className=\"bg-blue-50 p-3 rounded-lg\">
                      <div className=\"text-lg font-bold text-blue-900\">
                        {contextSummary.shopify?.orderCount || 0}
                      </div>
                      <div className=\"text-xs text-blue-700\">Orders</div>
                    </div>
                    <div className=\"bg-purple-50 p-3 rounded-lg\">
                      <div className=\"text-lg font-bold text-purple-900\">
                        {contextSummary.kustomer?.totalConversations || 0}
                      </div>
                      <div className=\"text-xs text-purple-700\">Support Chats</div>
                    </div>
                    <div className=\"bg-orange-50 p-3 rounded-lg\">
                      <div className=\"text-lg font-bold text-orange-900\">
                        {contextSummary.kustomer?.satisfactionScore || 5}/5
                      </div>
                      <div className=\"text-xs text-orange-700\">Satisfaction</div>
                    </div>
                  </div>
                </div>

                {contextSummary.kustomer?.lastContact && (
                  <div>
                    <h4 className=\"font-semibold text-gray-900 mb-2\">Last Contact</h4>
                    <div className=\"text-sm text-gray-600\">
                      {formatDate(contextSummary.kustomer.lastContact)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'orders' && (
              <div className=\"space-y-3\">
                <h4 className=\"font-semibold text-gray-900\">Recent Orders</h4>
                {contextSummary.shopify?.recentOrders?.length > 0 ? (
                  contextSummary.shopify.recentOrders.map((order) => (
                    <div key={order.id} className=\"bg-gray-50 p-3 rounded-lg border\">
                      <div className=\"flex justify-between items-start mb-2\">
                        <div className=\"font-medium text-gray-900\">#{order.name}</div>
                        <div className=\"text-sm font-semibold text-gray-900\">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                      <div className=\"flex justify-between items-center\">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className=\"text-xs text-gray-500\">
                          {formatDate(order.date)}
                        </span>
                      </div>
                      <button 
                        onClick={() => onActionClick?.('track_order', { orderId: order.id, orderNumber: order.name })}
                        className=\"mt-2 w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors\"
                      >
                        Track Order
                      </button>
                    </div>
                  ))
                ) : (
                  <div className=\"text-sm text-gray-500 text-center py-4\">
                    No recent orders found
                  </div>
                )}
              </div>
            )}

            {activeSection === 'support' && (
              <div className=\"space-y-3\">
                <h4 className=\"font-semibold text-gray-900\">Support History</h4>
                <div className=\"bg-gray-50 p-3 rounded-lg\">
                  <div className=\"text-sm space-y-2\">
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Total Conversations:</span>
                      <span className=\"font-medium\">{contextSummary.kustomer?.totalConversations || 0}</span>
                    </div>
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Satisfaction Score:</span>
                      <span className=\"font-medium\">{contextSummary.kustomer?.satisfactionScore || 5}/5</span>
                    </div>
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Preferred Channel:</span>
                      <span className=\"font-medium capitalize\">{contextSummary.kustomer?.preferredChannel || 'chat'}</span>
                    </div>
                  </div>
                </div>

                {contextSummary.customer?.riskLevel === 'high' && (
                  <div className=\"bg-red-50 border border-red-200 p-3 rounded-lg\">
                    <div className=\"text-red-800 font-medium text-sm mb-1\">⚠️ High Risk Customer</div>
                    <div className=\"text-red-700 text-xs\">
                      Customer may need special attention. Consider escalating to manager.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'actions' && (
              <div className=\"space-y-3\">
                <h4 className=\"font-semibold text-gray-900\">Suggested Actions</h4>
                {contextSummary.actionItems?.length > 0 ? (
                  contextSummary.actionItems.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => onActionClick?.(action.type, action.data)}
                      className=\"w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors\"
                    >
                      <div className=\"text-sm font-medium text-blue-900\">{action.label}</div>
                    </button>
                  ))
                ) : (
                  <div className=\"text-sm text-gray-500 text-center py-4\">
                    No suggested actions
                  </div>
                )}

                {/* Quick Actions */}
                <div className=\"pt-3 border-t border-gray-200\">
                  <h5 className=\"font-medium text-gray-700 mb-2\">Quick Actions</h5>
                  <div className=\"space-y-2\">
                    <button 
                      onClick={() => onActionClick?.('send_email', { email: customer.email })}
                      className=\"w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors\"
                    >
                      📧 Send Email
                    </button>
                    <button 
                      onClick={() => onActionClick?.('escalate_chat', { customerId: customer.id })}
                      className=\"w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors\"
                    >
                      🚀 Escalate to Manager
                    </button>
                    <button 
                      onClick={() => onActionClick?.('create_ticket', { customerId: customer.id })}
                      className=\"w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors\"
                    >
                      🎫 Create Support Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerSidebar;