import React, { useState } from 'react';
import { 
  Brain, Zap, Globe, Shield, BarChart3, MessageSquare, 
  ShoppingCart, Users, Webhook, Palette, HeartHandshake,
  TrendingUp, Eye, Clock, Target, Sparkles, Layers,
  Code, Lock, Smartphone, Mail, Bot, Rocket,
  ChevronRight, Check, ArrowRight
} from 'lucide-react';

const FeatureShowcase = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const featureCategories = [
    {
      name: 'AI & Intelligence',
      icon: Brain,
      color: 'purple',
      description: 'Cutting-edge AI that learns and improves',
      features: [
        {
          title: 'GPT-4 Turbo Integration',
          description: 'Leverage the most advanced language model for human-like conversations',
          icon: Sparkles,
          stats: '10x faster responses'
        },
        {
          title: 'Intent Detection',
          description: 'Automatically understand customer needs and route appropriately',
          icon: Target,
          stats: '95% accuracy'
        },
        {
          title: 'Sentiment Analysis',
          description: 'Real-time emotion detection to personalize responses',
          icon: HeartHandshake,
          stats: 'Improves CSAT by 40%'
        },
        {
          title: 'Smart Recommendations',
          description: 'AI-powered product and content suggestions',
          icon: TrendingUp,
          stats: '35% higher conversion'
        }
      ]
    },
    {
      name: 'E-Commerce',
      icon: ShoppingCart,
      color: 'green',
      description: 'Built for online selling success',
      features: [
        {
          title: 'Cart Recovery',
          description: 'Intelligent abandoned cart recovery sequences',
          icon: ShoppingCart,
          stats: 'Recover 30% of carts'
        },
        {
          title: 'Product Discovery',
          description: 'Help customers find exactly what they need',
          icon: Eye,
          stats: '50% faster discovery'
        },
        {
          title: 'Order Tracking',
          description: 'Automated order status and shipping updates',
          icon: Clock,
          stats: 'Reduce support by 60%'
        },
        {
          title: 'Dynamic Pricing',
          description: 'Personalized offers and discount codes',
          icon: Zap,
          stats: '25% higher AOV'
        }
      ]
    },
    {
      name: 'Engagement',
      icon: MessageSquare,
      color: 'blue',
      description: 'Proactive customer engagement tools',
      features: [
        {
          title: 'Behavioral Triggers',
          description: 'Engage based on scroll, time, exit intent',
          icon: Rocket,
          stats: '3x engagement rate'
        },
        {
          title: 'Personalized Greetings',
          description: 'Custom messages based on visitor data',
          icon: Users,
          stats: '80% response rate'
        },
        {
          title: 'Live Chat Handoff',
          description: 'Seamless transition to human agents',
          icon: MessageSquare,
          stats: 'Zero context loss'
        },
        {
          title: 'Multi-language Support',
          description: 'Chat in 100+ languages automatically',
          icon: Globe,
          stats: 'Global reach'
        }
      ]
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      color: 'orange',
      description: 'Data-driven insights and reporting',
      features: [
        {
          title: 'Conversation Analytics',
          description: 'Deep insights into every chat interaction',
          icon: BarChart3,
          stats: 'Real-time dashboards'
        },
        {
          title: 'Conversion Funnels',
          description: 'Track customer journey from chat to purchase',
          icon: TrendingUp,
          stats: 'Identify drop-offs'
        },
        {
          title: 'AI Performance',
          description: 'Monitor and optimize bot effectiveness',
          icon: Brain,
          stats: 'Continuous improvement'
        },
        {
          title: 'Custom Reports',
          description: 'Build reports that matter to your business',
          icon: Layers,
          stats: 'Export to any format'
        }
      ]
    },
    {
      name: 'Security',
      icon: Shield,
      color: 'red',
      description: 'Enterprise-grade security and compliance',
      features: [
        {
          title: 'GDPR Compliant',
          description: 'Full compliance with data protection regulations',
          icon: Lock,
          stats: 'ISO 27001 certified'
        },
        {
          title: 'Data Encryption',
          description: 'End-to-end encryption for all conversations',
          icon: Shield,
          stats: '256-bit encryption'
        },
        {
          title: 'SSO & 2FA',
          description: 'Enterprise authentication and access control',
          icon: Users,
          stats: 'SAML 2.0 support'
        },
        {
          title: 'Audit Logs',
          description: 'Complete activity tracking and compliance',
          icon: Eye,
          stats: 'SOC 2 compliant'
        }
      ]
    }
  ];

  const allFeatures = [
    {
      icon: Bot,
      title: 'No-Code Bot Builder',
      description: 'Drag-and-drop interface to build complex conversation flows without coding'
    },
    {
      icon: Webhook,
      title: 'Webhooks & API',
      description: 'Connect to any system with powerful webhooks and REST APIs'
    },
    {
      icon: Smartphone,
      title: 'Mobile SDK',
      description: 'Native iOS and Android SDKs for mobile app integration'
    },
    {
      icon: Mail,
      title: 'Email Fallback',
      description: 'Automatically continue conversations via email when offline'
    },
    {
      icon: Palette,
      title: 'White Label',
      description: 'Fully customizable branding and custom domains'
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Extensive documentation, SDKs, and code examples'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Everything You Need to </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Delight Customers
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features that work together seamlessly to create exceptional customer experiences
          </p>
        </div>

        {/* Feature Categories Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {featureCategories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeCategory === idx
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <category.icon className="h-5 w-5" />
              <span className="font-semibold">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Active Category Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {featureCategories[activeCategory].name}
            </h3>
            <p className="text-gray-600">
              {featureCategories[activeCategory].description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featureCategories[activeCategory].features.map((feature, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
                onMouseEnter={() => setHoveredFeature(`${activeCategory}-${idx}`)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${
                    featureCategories[activeCategory].color === 'purple' ? 'from-purple-100 to-pink-100' :
                    featureCategories[activeCategory].color === 'green' ? 'from-green-100 to-emerald-100' :
                    featureCategories[activeCategory].color === 'blue' ? 'from-blue-100 to-cyan-100' :
                    featureCategories[activeCategory].color === 'orange' ? 'from-orange-100 to-yellow-100' :
                    'from-red-100 to-pink-100'
                  } rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`h-6 w-6 ${
                      featureCategories[activeCategory].color === 'purple' ? 'text-purple-600' :
                      featureCategories[activeCategory].color === 'green' ? 'text-green-600' :
                      featureCategories[activeCategory].color === 'blue' ? 'text-blue-600' :
                      featureCategories[activeCategory].color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600">
                      <Zap className="h-4 w-4" />
                      <span>{feature.stats}</span>
                    </div>
                  </div>
                </div>
                {hoveredFeature === `${activeCategory}-${idx}` && (
                  <div className="absolute top-0 right-0 p-2">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* All Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Plus Dozens More Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {allFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            See All Features in Action
          </h3>
          <p className="mb-6 opacity-90">
            Experience the power of AgenStack.ai with a personalized demo
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center">
            Get Your Demo
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
