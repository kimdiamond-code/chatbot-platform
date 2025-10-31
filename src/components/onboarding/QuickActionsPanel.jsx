import React, { useState } from 'react';
import { 
  Zap, MessageSquare, Settings, BarChart3, 
  ShoppingBag, Users, X, ChevronRight 
} from 'lucide-react';

const quickActions = [
  {
    id: 'test-bot',
    title: 'Test Your Bot',
    description: 'Open live preview',
    icon: MessageSquare,
    color: 'blue',
    action: '/bot-builder'
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Check performance',
    icon: BarChart3,
    color: 'purple',
    action: '/analytics'
  },
  {
    id: 'add-trigger',
    title: 'Add Trigger',
    description: 'Set proactive message',
    icon: Zap,
    color: 'green',
    action: '/proactive'
  },
  {
    id: 'connect-shopify',
    title: 'Connect Shopify',
    description: 'Link your store',
    icon: ShoppingBag,
    color: 'orange',
    action: '/integrations'
  },
  {
    id: 'view-customers',
    title: 'View Customers',
    description: 'See CRM data',
    icon: Users,
    color: 'pink',
    action: '/customers'
  },
  {
    id: 'bot-settings',
    title: 'Bot Settings',
    description: 'Configure options',
    icon: Settings,
    color: 'gray',
    action: '/settings'
  }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  green: 'bg-green-100 text-green-600 hover:bg-green-200',
  orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
  gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
};

export default function QuickActionsPanel({ onNavigate, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAction = (action) => {
    onNavigate?.(action);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('quick-actions-dismissed', 'true');
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  // Don't show if already dismissed
  if (localStorage.getItem('quick-actions-dismissed') === 'true') {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 z-30 animate-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Quick Actions
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Actions Grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const colorClass = colorClasses[action.color];

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.action)}
              className="flex flex-col items-start p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
            >
              <div className={`${colorClass} p-2 rounded-lg mb-2 transition-colors`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {action.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
        <button
          onClick={handleClose}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Dismiss this panel
        </button>
      </div>
    </div>
  );
}
