import React from 'react';
import { X, Sparkles, MessageSquare, BarChart3, Settings, Zap, ArrowRight } from 'lucide-react';

export default function WelcomeModal({ onClose, onStartTour }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Welcome to AgenStack!</h2>
          </div>
          <p className="text-blue-100 text-lg">
            Your AI-powered chatbot platform is ready. Let's get you set up in minutes!
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid gap-6 mb-8">
            {/* Feature 1 */}
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 rounded-lg p-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Build Your Bot</h3>
                <p className="text-gray-600">Customize your chatbot's personality, directives, and responses with our intuitive builder.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start">
              <div className="bg-purple-100 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Track Performance</h3>
                <p className="text-gray-600">Monitor conversations, engagement rates, and conversions with real-time analytics.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 rounded-lg p-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Proactive Engagement</h3>
                <p className="text-gray-600">Set up triggers to engage visitors at the perfect moment and boost conversions.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 items-start">
              <div className="bg-orange-100 rounded-lg p-3">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Seamless Integrations</h3>
                <p className="text-gray-600">Connect with Shopify, CRM tools, and social channels to centralize your customer data.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onStartTour}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Take a Quick Tour
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            You can always access this tour from the help menu
          </p>
        </div>
      </div>
    </div>
  );
}
