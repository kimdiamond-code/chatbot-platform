import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap, Crown, Star } from 'lucide-react';

const FeatureLockedOverlay = ({ 
  featureName, 
  description,
  requiredPlan,
  addonName,
  type = 'plan', // 'plan' or 'addon'
  onUpgrade,
  showOverlay = true // false = just show banner, true = full overlay
}) => {
  const getIcon = () => {
    if (type === 'addon') return <Zap className="w-12 h-12 text-blue-400" />;
    if (requiredPlan === 'business') return <Crown className="w-12 h-12 text-yellow-400" />;
    return <Star className="w-12 h-12 text-purple-400" />;
  };

  const getPricing = () => {
    if (type === 'addon') {
      const prices = {
        crm: '$49/mo',
        phone: '$79/mo',
        sms: '$39/mo',
        proactive: '$59/mo'
      };
      return prices[addonName] || 'Contact sales';
    }
    
    const prices = {
      professional: '$99/mo',
      business: '$299/mo'
    };
    return prices[requiredPlan] || 'View pricing';
  };

  const getUpgradeText = () => {
    if (type === 'addon') {
      return `Add ${featureName} to your plan`;
    }
    return `Upgrade to ${requiredPlan || 'higher plan'}`;
  };

  if (!showOverlay) {
    // Just show a banner at the top
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">{featureName}</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-blue-600">{getPricing()}</span>
            <Link
              to="/settings/billing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {getUpgradeText()}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full page overlay
  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>

          {/* Feature Name */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {featureName}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6 text-lg">
            {description}
          </p>

          {/* Required Plan/Addon Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            {type === 'addon' ? (
              <p className="text-gray-700">
                This is a <span className="font-bold text-blue-600">premium add-on</span> feature
              </p>
            ) : (
              <p className="text-gray-700">
                Available in the <span className="font-bold text-purple-600 capitalize">{requiredPlan}</span> plan
              </p>
            )}
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {getPricing()}
            </p>
          </div>

          {/* Features List */}
          <div className="text-left mb-6 bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">What you'll get:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {type === 'addon' && addonName === 'crm' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Complete customer database
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Custom tags and segments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Conversation history tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Internal notes and collaboration
                  </li>
                </>
              )}
              {type === 'addon' && addonName === 'phone' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Inbound call routing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    IVR system setup
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Call recording and analytics
                  </li>
                </>
              )}
              {type === 'addon' && addonName === 'sms' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Two-way SMS conversations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    SMS campaign builder
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Custom SMS templates
                  </li>
                </>
              )}
              {type === 'addon' && addonName === 'proactive' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Exit intent detection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Scroll and time triggers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Cart abandonment recovery
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Custom popup campaigns
                  </li>
                </>
              )}
              {type === 'plan' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    All features from lower tiers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Advanced analytics and reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Priority customer support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Higher usage limits
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/settings/billing"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              onClick={onUpgrade}
            >
              {getUpgradeText()}
            </Link>
            <Link
              to="/settings/billing"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              View all plans and pricing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureLockedOverlay;
