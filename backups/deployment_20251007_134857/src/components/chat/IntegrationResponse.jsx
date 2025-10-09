import React from 'react';

const IntegrationResponse = ({ message, onActionClick }) => {
  const isSmartResponse = message.metadata?.source === 'smart_integration';
  const integrationsUsed = message.metadata?.integrationsUsed || [];

  if (!isSmartResponse) {
    // Regular message display
    return (
      <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
        <p className="text-sm">{message.content}</p>
      </div>
    );
  }

  // Smart integration response
  return (
    <div className="px-4 py-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      {/* Response content */}
      <div className="text-sm text-gray-900 mb-3 whitespace-pre-wrap">
        {message.text}
      </div>

      {/* Action buttons */}
      {message.actions && message.actions.length > 0 && (
        <div className="space-y-2 mb-3">
          {message.actions.map((action, index) => (
            <ActionButton 
              key={index} 
              action={action} 
              onClick={() => onActionClick?.(action)} 
            />
          ))}
        </div>
      )}

      {/* Integration badges only (no confidence) */}
      {integrationsUsed.length > 0 && (
        <div className="flex items-center space-x-2 text-xs">
          {integrationsUsed.map((integration) => (
            <span 
              key={integration}
              className={`px-2 py-1 rounded-full font-medium ${getIntegrationColor(integration)}`}
            >
              {getIntegrationIcon(integration)} {integration}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ action, onClick }) => {
  const getButtonStyle = (actionType) => {
    switch (actionType) {
      case 'external_link':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'escalate':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'callback':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'quick_reply':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'input_request':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'info':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const handleClick = () => {
    if (action.type === 'external_link' && action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else {
      onClick?.(action);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-block px-3 py-1.5 rounded text-sm font-medium transition-colors mr-2 mb-1 ${getButtonStyle(action.type)}`}
    >
      {getActionIcon(action.type)} {action.label}
    </button>
  );
};

// Helper functions
const getIntegrationColor = (integration) => {
  switch (integration) {
    case 'shopify':
      return 'bg-green-100 text-green-800';
    case 'kustomer':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getIntegrationIcon = (integration) => {
  switch (integration) {
    case 'shopify':
      return '🛍️';
    case 'kustomer':
      return '🎧';
    default:
      return '🔗';
  }
};

const getActionIcon = (actionType) => {
  switch (actionType) {
    case 'external_link':
      return '🔗';
    case 'escalate':
      return '🚀';
    case 'callback':
      return '📞';
    case 'quick_reply':
      return '💬';
    case 'input_request':
      return '✏️';
    case 'info':
      return 'ℹ️';
    default:
      return '▶️';
  }
};

export default IntegrationResponse;
