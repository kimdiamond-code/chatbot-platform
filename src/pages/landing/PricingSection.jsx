import React, { useState } from 'react';
import { Check, X, Zap, Building2, Rocket, Crown, Info } from 'lucide-react';

const PricingSection = ({ onGetStarted }) => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 49,
      yearlyPrice: 470,
      color: 'blue',
      features: [
        { text: 'Up to 1,000 conversations/month', included: true },
        { text: '1 chatbot', included: true },
        { text: 'Basic AI responses', included: true },
        { text: 'Email support', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Standard integrations', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Advanced AI features', included: false },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false },
      ]
    },
    {
      name: 'Professional',
      icon: Building2,
      description: 'For growing teams with advanced needs',
      monthlyPrice: 149,
      yearlyPrice: 1430,
      color: 'purple',
      popular: true,
      features: [
        { text: 'Up to 10,000 conversations/month', included: true },
        { text: '5 chatbots', included: true },
        { text: 'Advanced AI with GPT-4', included: true },
        { text: 'Priority email & chat support', included: true },
        { text: 'Advanced analytics & reporting', included: true },
        { text: 'All integrations included', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Proactive engagement', included: true },
        { text: 'API access (1000 calls/month)', included: true },
        { text: 'Team collaboration', included: false },
      ]
    },
    {
      name: 'Enterprise',
      icon: Crown,
      description: 'Unlimited power for large organizations',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      color: 'gradient',
      features: [
        { text: 'Unlimited conversations', included: true },
        { text: 'Unlimited chatbots', included: true },
        { text: 'Custom AI model training', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'Custom analytics & BI tools', included: true },
        { text: 'Enterprise integrations', included: true },
        { text: 'White-label solution', included: true },
        { text: 'Advanced security & compliance', included: true },
        { text: 'Unlimited API access', included: true },
        { text: 'Dedicated account manager', included: true },
      ]
    }
  ];

  const calculateSavings = (monthly, yearly) => {
    if (typeof monthly === 'number') {
      const yearlyCost = monthly * 12;
      const savings = yearlyCost - yearly;
      return Math.round((savings / yearlyCost) * 100);
    }
    return 0;
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Simple, Transparent </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your business. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-lg text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                billingPeriod === 'yearly'
                  ? 'bg-white shadow-lg text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-600 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                      plan.color === 'gradient' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                        : plan.color === 'purple'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}>
                      <plan.icon className={`h-6 w-6 ${
                        plan.color === 'gradient' 
                          ? 'text-white' 
                          : plan.color === 'purple'
                          ? 'text-purple-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  {typeof plan.monthlyPrice === 'number' ? (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          ${billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                        </span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {calculateSavings(plan.monthlyPrice, plan.yearlyPrice)}% with yearly billing
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-gray-900">Custom</div>
                  )}
                </div>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                      : plan.color === 'gradient'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.monthlyPrice === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>

                <div className="mt-8 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Everything in {plan.name}:</p>
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">All Plans Include</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">14-Day Free Trial</p>
              <p className="text-sm opacity-90">No credit card required</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">99.9% Uptime SLA</p>
              <p className="text-sm opacity-90">Enterprise reliability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Rocket className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">Instant Setup</p>
              <p className="text-sm opacity-90">Go live in 5 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Info className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">Cancel Anytime</p>
              <p className="text-sm opacity-90">No long-term contracts</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Questions about pricing?</p>
          <button className="text-blue-600 font-semibold hover:text-purple-600 transition-colors">
            View pricing FAQ →
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
