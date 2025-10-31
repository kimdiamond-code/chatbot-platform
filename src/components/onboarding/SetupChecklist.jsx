import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

const checklistItems = [
  {
    id: 'bot-configured',
    title: 'Configure Your Bot',
    description: 'Set up personality and directives',
    link: '/bot-builder'
  },
  {
    id: 'knowledge-added',
    title: 'Add Knowledge Base',
    description: 'Upload FAQs or connect data sources',
    link: '/knowledge'
  },
  {
    id: 'widget-installed',
    title: 'Install Widget',
    description: 'Add chatbot to your website',
    link: '/widget'
  },
  {
    id: 'integration-connected',
    title: 'Connect Integration',
    description: 'Link Shopify, CRM, or channels',
    link: '/integrations'
  },
  {
    id: 'first-conversation',
    title: 'Test Your Bot',
    description: 'Have a test conversation',
    link: '/conversations'
  }
];

export default function SetupChecklist({ onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedItems, setCompletedItems] = useState(() => {
    const saved = localStorage.getItem('onboarding-checklist');
    return saved ? JSON.parse(saved) : [];
  });

  const completedCount = completedItems.length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  useEffect(() => {
    localStorage.setItem('onboarding-checklist', JSON.stringify(completedItems));
  }, [completedItems]);

  const toggleItem = (itemId) => {
    setCompletedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDismiss = () => {
    if (window.confirm('Are you sure? You can always reopen this from the help menu.')) {
      localStorage.setItem('onboarding-checklist-dismissed', 'true');
      window.location.reload();
    }
  };

  // Auto-collapse when complete
  useEffect(() => {
    if (isComplete && isExpanded) {
      setTimeout(() => setIsExpanded(false), 2000);
    }
  }, [isComplete]);

  if (localStorage.getItem('onboarding-checklist-dismissed') === 'true') {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 transition-all ${
      isExpanded ? 'w-96' : 'w-80'
    }`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${
          isComplete ? 'bg-green-50 border-b border-green-200' : 'border-b border-gray-200'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {isComplete ? '🎉 Setup Complete!' : 'Getting Started'}
            </h3>
            {isComplete && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {completedCount} of {totalCount} completed
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isExpanded && (
        <div className="px-4 pt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isComplete ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {checklistItems.map((item) => {
            const isCompleted = completedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  if (!isCompleted) {
                    onNavigate?.(item.link);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isCompleted ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Message */}
      {isExpanded && isComplete && (
        <div className="p-4 bg-green-50 border-t border-green-200 text-center">
          <p className="text-sm text-green-800 font-medium">
            Great job! You're all set to start engaging with customers.
          </p>
        </div>
      )}
    </div>
  );
}
