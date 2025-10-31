import React, { createContext, useContext, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const TooltipContext = createContext();

export function useTooltip() {
  return useContext(TooltipContext);
}

export function TooltipProvider({ children }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const showTooltip = (id, content, position) => {
    setActiveTooltip({ id, content, position });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip, activeTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function Tooltip({ id, title, description, learnMoreUrl }) {
  const { showTooltip, hideTooltip, activeTooltip } = useTooltip();
  const isActive = activeTooltip?.id === id;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isActive) {
      hideTooltip();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      showTooltip(id, { title, description, learnMoreUrl }, {
        x: rect.left,
        y: rect.bottom + 8
      });
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isActive && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={hideTooltip}
          />

          {/* Tooltip Card */}
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm animate-in fade-in slide-in-from-top-2"
            style={{
              left: activeTooltip.position.x,
              top: activeTooltip.position.y
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <button
                onClick={hideTooltip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {description}
            </p>

            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more →
              </a>
            )}
          </div>
        </>
      )}
    </>
  );
}

// Pre-built tooltips for common features
export const tooltips = {
  botPersonality: {
    id: 'bot-personality',
    title: 'Bot Personality',
    description: 'Define how your bot communicates. Use a friendly tone for casual brands, or professional for B2B.',
    learnMoreUrl: '/docs/bot-personality'
  },
  proactiveTriggers: {
    id: 'proactive-triggers',
    title: 'Proactive Triggers',
    description: 'Automatically engage visitors based on behavior like exit intent, time on page, or specific URLs.',
    learnMoreUrl: '/docs/proactive-engagement'
  },
  knowledgeBase: {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    description: 'Upload FAQs, product info, or connect data sources to help your bot answer questions accurately.',
    learnMoreUrl: '/docs/knowledge-base'
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Track key metrics like conversation rate, engagement, and conversions to optimize performance.',
    learnMoreUrl: '/docs/analytics'
  },
  integrations: {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect Shopify for product recommendations, CRM for customer data, and social channels for multi-platform support.',
    learnMoreUrl: '/docs/integrations'
  }
};
