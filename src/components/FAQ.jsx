import React, { useState } from 'react';
import { HelpCircle, Search, Plus, Edit, Trash2, Link2, FileText, ChevronDown, ChevronUp, ExternalLink, Tag, TrendingUp } from 'lucide-react';

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: 'How do I set up my first chatbot?',
      answer: 'Setting up your first chatbot is easy! Go to Bot Builder, configure your bot\'s personality and directives, then add knowledge base content. Finally, deploy the widget to your website.',
      category: 'Getting Started',
      linkedArticles: [
        { title: 'Quick Start Guide', url: '#article-1' },
        { title: 'Bot Builder Tutorial', url: '#article-2' }
      ],
      views: 1245,
      helpful: 94,
      tags: ['setup', 'beginner', 'bot-builder']
    },
    {
      id: 2,
      question: 'What integrations are available?',
      answer: 'We support Shopify, Kustomer, Facebook Messenger, Instagram DM, WhatsApp via Twilio, Klaviyo, and custom webhooks. All integrations can be configured in the Integrations section.',
      category: 'Integrations',
      linkedArticles: [
        { title: 'Shopify Integration Guide', url: '#article-3' },
        { title: 'Kustomer Setup', url: '#article-4' },
        { title: 'WhatsApp via Twilio', url: '#article-5' }
      ],
      views: 892,
      helpful: 91,
      tags: ['integrations', 'shopify', 'whatsapp']
    },
    {
      id: 3,
      question: 'How does the Knowledge Base work?',
      answer: 'Upload documents, scrape your website, or manually add Q&As. The AI bot uses this information to answer customer questions intelligently. You can organize content by categories and the bot will automatically find relevant information.',
      category: 'Features',
      linkedArticles: [
        { title: 'Knowledge Base Setup', url: '#article-6' },
        { title: 'Web Scraping Guide', url: '#article-7' }
      ],
      views: 756,
      helpful: 88,
      tags: ['knowledge-base', 'ai', 'content']
    },
    {
      id: 4,
      question: 'Can I customize the chat widget?',
      answer: 'Yes! The Widget Studio lets you customize colors, position, size, avatar, greeting message, and more. You can match your brand perfectly.',
      category: 'Customization',
      linkedArticles: [
        { title: 'Widget Customization Guide', url: '#article-8' },
        { title: 'Branding Best Practices', url: '#article-9' }
      ],
      views: 634,
      helpful: 96,
      tags: ['widget', 'customization', 'branding']
    },
    {
      id: 5,
      question: 'How do proactive messages work?',
      answer: 'Set up triggers based on user behavior (exit intent, time on page, scroll %, URL patterns, UTM parameters). The bot will automatically engage visitors with targeted messages at the right moment.',
      category: 'Proactive Engagement',
      linkedArticles: [
        { title: 'Proactive Engagement Setup', url: '#article-10' },
        { title: 'Trigger Templates', url: '#article-11' }
      ],
      views: 543,
      helpful: 89,
      tags: ['proactive', 'triggers', 'engagement']
    },
    {
      id: 6,
      question: 'What analytics are tracked?',
      answer: 'Track conversation volume, CSAT scores, agent performance, resolution times, conversion funnels, product views, add-to-cart events, and more. All metrics are available in real-time on the Analytics dashboard.',
      category: 'Analytics',
      linkedArticles: [
        { title: 'Analytics Dashboard Guide', url: '#article-12' },
        { title: 'Understanding Metrics', url: '#article-13' }
      ],
      views: 478,
      helpful: 92,
      tags: ['analytics', 'metrics', 'reporting']
    },
    {
      id: 7,
      question: 'How do I connect my Shopify store?',
      answer: 'Go to Integrations → Shopify, enter your store name, click Connect, and authorize the app. Once connected, the bot can show products, check inventory, track orders, and create draft orders.',
      category: 'Integrations',
      linkedArticles: [
        { title: 'Shopify Integration Step-by-Step', url: '#article-14' },
        { title: 'Shopify Product Recommendations', url: '#article-15' }
      ],
      views: 821,
      helpful: 95,
      tags: ['shopify', 'ecommerce', 'setup']
    },
    {
      id: 8,
      question: 'Can I add team members as live agents?',
      answer: 'Yes! In Live Chat, you can assign conversations to team members, add internal notes, tag conversations, and hand off from bot to human seamlessly.',
      category: 'Team Management',
      linkedArticles: [
        { title: 'Adding Team Members', url: '#article-16' },
        { title: 'Live Chat Features', url: '#article-17' }
      ],
      views: 412,
      helpful: 90,
      tags: ['team', 'live-chat', 'agents']
    },
    {
      id: 9,
      question: 'What security features are included?',
      answer: 'GDPR/CCPA compliance tools, IP filtering, user consent forms, SSO/2FA for agents, RBAC (role-based access control), and end-to-end encrypted data handling.',
      category: 'Security',
      linkedArticles: [
        { title: 'Security Overview', url: '#article-18' },
        { title: 'GDPR Compliance Guide', url: '#article-19' }
      ],
      views: 367,
      helpful: 93,
      tags: ['security', 'compliance', 'gdpr']
    },
    {
      id: 10,
      question: 'How do I train the bot to give better answers?',
      answer: 'Use the Training tab in Bot Builder to review bot responses, mark them as correct or incorrect, and provide better answers. The bot learns from corrections and improves over time.',
      category: 'AI Training',
      linkedArticles: [
        { title: 'AI Training Best Practices', url: '#article-20' },
        { title: 'Improving Bot Accuracy', url: '#article-21' }
      ],
      views: 589,
      helpful: 87,
      tags: ['ai', 'training', 'improvement']
    },
    {
      id: 11,
      question: 'Can I use the bot on multiple websites?',
      answer: 'Yes! Create multiple bot configurations and deploy different widgets. Each can have unique settings, knowledge bases, and integrations.',
      category: 'Multi-Site',
      linkedArticles: [
        { title: 'Multi-Site Setup', url: '#article-22' }
      ],
      views: 298,
      helpful: 91,
      tags: ['multi-site', 'deployment']
    },
    {
      id: 12,
      question: 'How do webhooks work?',
      answer: 'Webhooks let you send real-time data to external systems. Configure webhook endpoints to receive events like new conversations, messages, or custom triggers. Great for Zapier integration!',
      category: 'Advanced',
      linkedArticles: [
        { title: 'Webhook Configuration', url: '#article-23' },
        { title: 'Zapier Integration', url: '#article-24' }
      ],
      views: 445,
      helpful: 85,
      tags: ['webhooks', 'zapier', 'automation']
    }
  ]);

  const [categories] = useState([
    { name: 'Getting Started', count: 15, icon: '🚀' },
    { name: 'Integrations', count: 12, icon: '🔌' },
    { name: 'Features', count: 18, icon: '⭐' },
    { name: 'Customization', count: 9, icon: '🎨' },
    { name: 'Proactive Engagement', count: 8, icon: '📢' },
    { name: 'Analytics', count: 10, icon: '📊' },
    { name: 'Team Management', count: 7, icon: '👥' },
    { name: 'Security', count: 6, icon: '🔒' },
    { name: 'AI Training', count: 11, icon: '🧠' },
    { name: 'Advanced', count: 14, icon: '⚙️' }
  ]);

  const [howToArticles] = useState([
    {
      id: 1,
      title: 'Complete Setup Guide - Start to Finish',
      description: 'Everything you need to know to get your chatbot up and running in 15 minutes.',
      category: 'Getting Started',
      readTime: '15 min',
      views: 2341
    },
    {
      id: 2,
      title: 'Advanced Bot Configuration',
      description: 'Deep dive into personality settings, custom intents, and workflow automation.',
      category: 'Advanced',
      readTime: '12 min',
      views: 1456
    },
    {
      id: 3,
      title: 'Shopify Product Recommendations',
      description: 'Set up intelligent product recommendations based on customer behavior.',
      category: 'E-Commerce',
      readTime: '8 min',
      views: 987
    },
    {
      id: 4,
      title: 'Proactive Messaging Strategies',
      description: 'Best practices for engaging visitors at the right time with the right message.',
      category: 'Proactive',
      readTime: '10 min',
      views: 1234
    },
    {
      id: 5,
      title: 'CRM Integration Best Practices',
      description: 'How to sync customer data and conversation history with your CRM.',
      category: 'Integrations',
      readTime: '9 min',
      views: 876
    }
  ]);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQ & Help Center</h1>
        <p className="text-gray-600">Find answers to common questions and browse helpful guides</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total FAQs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{faqs.length}</div>
          <span className="text-xs text-green-600">+5 this week</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">7,342</div>
          <span className="text-xs text-green-600">+18% vs last week</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">How-To Articles</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{howToArticles.length}</div>
          <span className="text-xs text-gray-600">Linked in FAQs</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-600">Helpful Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">91%</div>
          <span className="text-xs text-green-600">Above target</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['faqs', 'how_to_articles', 'popular', 'add_faq'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'glass-dynamic text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab === 'faqs' && '💬 All FAQs'}
            {tab === 'how_to_articles' && '📚 How-To Articles'}
            {tab === 'popular' && '🔥 Most Popular'}
            {tab === 'add_faq' && '➕ Add New FAQ'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-premium p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">All Questions</span>
                    <span className="text-xs text-gray-500">{faqs.length}</span>
                  </div>
                </button>
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.name 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            <div className="glass-premium p-6 rounded-xl">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                {filteredFaqs.map(faq => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{faq.category}</span>
                          <span>{faq.views} views</span>
                          <span>•</span>
                          <span>{faq.helpful}% helpful</span>
                        </div>
                      </div>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-3 mb-4">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                        
                        {/* Linked Articles */}
                        {faq.linkedArticles && faq.linkedArticles.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Related How-To Articles:
                            </h4>
                            <div className="space-y-2">
                              {faq.linkedArticles.map((article, idx) => (
                                <a
                                  key={idx}
                                  href={article.url}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {article.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {faq.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Helpful Buttons */}
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-600">Was this helpful?</span>
                          <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                            👍 Yes
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                            👎 No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'how_to_articles' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How-To Articles & Guides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {howToArticles.map(article => (
              <div key={article.id} className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">{article.category}</span>
                      <span>⏱️ {article.readTime}</span>
                      <span>👁️ {article.views}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  Read Guide
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'popular' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Most Popular Questions</h2>
          
          <div className="space-y-3">
            {[...faqs]
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
              .map((faq, index) => (
                <div key={faq.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{faq.category}</span>
                        <span>👁️ {faq.views} views</span>
                        <span>👍 {faq.helpful}% helpful</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('faqs');
                        setExpandedFaq(faq.id);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      View Answer
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'add_faq' && (
        <div className="glass-premium p-6 rounded-xl max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New FAQ</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                placeholder="Enter the question customers ask..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <textarea
                rows={5}
                placeholder="Provide a clear, helpful answer..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="setup, beginner, tutorial"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link Related Articles (optional)</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Article title"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Article URL"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Add helpful how-to articles that provide more details</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                Save FAQ
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQ;
