import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Zap, Shield, TrendingUp, Globe, Users, 
  ShoppingCart, Brain, Sparkles, ChevronRight, Check, 
  Star, ArrowRight, Play, Menu, X, Bot, Rocket, 
  BarChart3, Lock, Palette, Webhook, HeartHandshake,
  Building2, Timer, Award, Layers, Cpu
} from 'lucide-react';
import PricingSection from './PricingSection';
import DemoRequestForm from './DemoRequestForm';
import FeatureShowcase from './FeatureShowcase';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '10M+', label: 'Conversations Handled', icon: MessageSquare },
    { value: '99.9%', label: 'Uptime Guarantee', icon: Timer },
    { value: '500ms', label: 'Average Response Time', icon: Zap },
    { value: '4.9/5', label: 'Customer Satisfaction', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO at TechStart',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: 'This platform transformed our customer service. We reduced response time by 80% and increased satisfaction scores to an all-time high.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Sales at Growth Co',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
      content: 'The AI recommendations alone increased our conversion rate by 35%. The ROI was evident within the first month.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Customer Success at Scale Inc',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      content: 'The proactive engagement features are game-changing. We catch customer issues before they even reach out.',
      rating: 5
    }
  ];

  const integrations = [
    { name: 'Shopify', icon: ShoppingCart, color: 'text-green-600' },
    { name: 'Kustomer', icon: Users, color: 'text-blue-600' },
    { name: 'Klaviyo', icon: MessageSquare, color: 'text-purple-600' },
    { name: 'Messenger', icon: MessageSquare, color: 'text-blue-500' },
    { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
    { name: 'Zapier', icon: Webhook, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgenStack.ai
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#integrations" className="text-gray-700 hover:text-blue-600 transition-colors">Integrations</a>
              <a href="#demo" className="text-gray-700 hover:text-blue-600 transition-colors">Demo</a>
              <button 
                onClick={onLogin}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Pricing</a>
              <a href="#integrations" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Integrations</a>
              <a href="#demo" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Demo</a>
              <button 
                onClick={onLogin}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="block w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Animated Background */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">
              🎉 New: GPT-4 Turbo Integration Now Available
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Chat
            </span>
            <br />
            <span className="text-gray-900">That Sells For You</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform every conversation into revenue. Our intelligent chatbot platform combines 
            cutting-edge AI with proven sales psychology to engage, qualify, and convert visitors 
            24/7 while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsVideoPlaying(true)}
              className="group bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5 text-purple-600" />
              Watch 2-Min Demo
            </button>
          </div>

          <div className="text-sm text-gray-500 mb-16">
            No credit card required • 14-day free trial • Setup in 5 minutes
          </div>

          {/* Live Chat Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Assistant</p>
                      <p className="text-xs opacity-90">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0"></div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                    <p className="text-gray-800">Hi there! 👋 I noticed you're interested in our premium features. Would you like to see how we can increase your conversions by 40%?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-none p-4 max-w-xs">
                    <p>Yes! Show me how it works</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-sm">
                      <p className="text-gray-800 mb-3">Perfect! Here are our top converting features:</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Smart product recommendations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Abandoned cart recovery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Personalized discount codes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex -space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <stat.icon className="h-8 w-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <FeatureShowcase />

      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Seamlessly Integrates
              </span>
              <br />
              <span className="text-gray-900">With Your Tech Stack</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your favorite tools in minutes. No complex setup, no developers needed.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {integrations.map((integration, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 cursor-pointer"
              >
                <integration.icon className={`h-12 w-12 mx-auto mb-3 ${integration.color}`} />
                <p className="text-center font-semibold text-gray-900">{integration.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Plus 100+ more integrations through Zapier and webhooks</p>
            <button className="text-blue-600 font-semibold hover:text-purple-600 transition-colors inline-flex items-center">
              View all integrations <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Loved by </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                10,000+ Businesses
              </span>
            </h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onGetStarted={onGetStarted} />

      {/* Demo Request Section */}
      <DemoRequestForm />

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to 10x Your Customer Engagement?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using AgenStack.ai to drive growth
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Your Free Trial
            </button>
            <button 
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Schedule a Demo
            </button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required • Setup in minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AgenStack.ai</span>
              </div>
              <p className="text-sm">AI-powered chat platform that converts visitors into customers 24/7.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 AgenStack.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
