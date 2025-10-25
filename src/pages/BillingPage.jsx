import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star, Lock } from 'lucide-react';
import subscriptionService from '../services/subscriptionService';

const BillingPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentAddons, setCurrentAddons] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const organizationId = '00000000-0000-0000-0000-000000000001'; // Get from context

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subscription, addons, plans, availAddons] = await Promise.all([
        subscriptionService.getSubscription(organizationId),
        subscriptionService.getAddons(organizationId),
        subscriptionService.getAvailablePlans(),
        subscriptionService.getAvailableAddons()
      ]);

      setCurrentSubscription(subscription);
      setCurrentAddons(addons || []);
      setAvailablePlans(plans || []);
      setAvailableAddons(availAddons || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    if (planName === 'business') return <Crown className="w-6 h-6" />;
    if (planName === 'professional') return <Star className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const getPrice = (plan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    if (price === 0) return 'Free';
    return billingCycle === 'monthly' ? `$${price}/mo` : `$${price}/yr`;
  };

  const getAddonPrice = (addon) => {
    const price = billingCycle === 'monthly' ? addon.price_monthly : addon.price_yearly;
    return billingCycle === 'monthly' ? `$${price}/mo` : `$${price}/yr`;
  };

  const isCurrentPlan = (planName) => {
    return currentSubscription?.plan?.name === planName;
  };

  const hasAddon = (addonName) => {
    return currentAddons.some(addon => addon.name === addonName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your plan and add-ons</p>
      </div>

      {/* Current Plan Card */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {currentSubscription.plan?.display_name || 'Starter'}
              </h2>
              <p className="text-gray-700">{currentSubscription.plan?.description}</p>
              
              {currentSubscription.trial_ends_at && (
                <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Trial ends {new Date(currentSubscription.trial_ends_at).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {currentSubscription.plan?.price_monthly === 0 ? 'Free' : `$${currentSubscription.plan?.price_monthly}/mo`}
              </p>
              {currentSubscription.plan?.price_monthly > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Billed {currentSubscription.billing_cycle || 'monthly'}
                </p>
              )}
            </div>
          </div>

          {/* Active Add-ons */}
          {currentAddons.length > 0 && (
            <div className="mt-6 pt-6 border-t border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Active Add-ons:</p>
              <div className="flex flex-wrap gap-2">
                {currentAddons.map(addon => (
                  <div key={addon.id} className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-sm font-medium text-gray-700">
                    {addon.display_name} (+${addon.price_monthly}/mo)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-xl p-6 transition-all ${
                isCurrentPlan(plan.name)
                  ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  plan.name === 'business' ? 'bg-yellow-100 text-yellow-600' :
                  plan.name === 'professional' ? 'bg-purple-100 text-purple-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getPlanIcon(plan.name)}
                </div>
                {isCurrentPlan(plan.name) && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                {plan.display_name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  {getPrice(plan)}
                </p>
                {plan.price_monthly > 0 && (
                  <p className="text-sm text-gray-500">
                    per {billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features?.slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
                {plan.features?.length > 5 && (
                  <p className="text-sm text-gray-500 ml-7">
                    +{plan.features.length - 5} more features
                  </p>
                )}
              </div>

              {/* Limits */}
              {plan.limits && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6 space-y-1 text-xs text-gray-600">
                  {plan.limits.conversations_per_month && (
                    <p>
                      {plan.limits.conversations_per_month === -1 ? 'Unlimited' : plan.limits.conversations_per_month} conversations/month
                    </p>
                  )}
                  {plan.limits.custom_forms && (
                    <p>
                      {plan.limits.custom_forms === -1 ? 'Unlimited' : plan.limits.custom_forms} custom forms
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                disabled={isCurrentPlan(plan.name)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isCurrentPlan(plan.name)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentPlan(plan.name) ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add-ons</h2>
        <p className="text-gray-600 mb-6">Enhance your plan with powerful add-ons</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {availableAddons.map((addon) => (
            <div
              key={addon.id}
              className={`border rounded-xl p-6 transition-all ${
                hasAddon(addon.name)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {addon.display_name}
                  </h3>
                  <p className="text-sm text-gray-600">{addon.description}</p>
                </div>
                {hasAddon(addon.name) && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    Active
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {addon.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-gray-900">
                  {getAddonPrice(addon)}
                </p>
                <button
                  disabled={hasAddon(addon.name)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    hasAddon(addon.name)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {hasAddon(addon.name) ? 'Active' : 'Add to Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Sales CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-2">Need a custom solution?</h3>
        <p className="text-blue-100 mb-6">
          Contact our sales team for enterprise pricing and custom packages
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default BillingPage;
