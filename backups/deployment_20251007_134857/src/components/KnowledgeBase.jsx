import React, { useState } from 'react';
import { Book, Search, Plus, Edit, Trash2, Eye, FileText, Folder, Tag, Clock, TrendingUp, HelpCircle, Upload, Link2 } from 'lucide-react';

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Getting Started with Our Platform',
      category: 'Getting Started',
      content: 'Learn how to set up your first chatbot and customize it for your business needs...',
      author: 'Admin',
      views: 1542,
      helpful: 89,
      lastUpdated: '2024-03-15',
      tags: ['setup', 'basics', 'tutorial'],
      status: 'published'
    },
    {
      id: 2,
      title: 'Advanced Bot Configuration',
      category: 'Advanced Features',
      content: 'Explore advanced features including AI training, custom intents, and workflow automation...',
      author: 'Tech Team',
      views: 892,
      helpful: 76,
      lastUpdated: '2024-03-18',
      tags: ['advanced', 'configuration', 'AI'],
      status: 'published'
    },
    {
      id: 3,
      title: 'Integration Guide: Shopify',
      category: 'Integrations',
      content: 'Step-by-step guide to connect your Shopify store with our chatbot platform...',
      author: 'Integration Team',
      views: 567,
      helpful: 92,
      lastUpdated: '2024-03-10',
      tags: ['shopify', 'ecommerce', 'integration'],
      status: 'published'
    },
    {
      id: 4,
      title: 'Troubleshooting Common Issues',
      category: 'Troubleshooting',
      content: 'Solutions to the most common issues users face and how to resolve them quickly...',
      author: 'Support Team',
      views: 2341,
      helpful: 94,
      lastUpdated: '2024-03-20',
      tags: ['troubleshooting', 'support', 'FAQ'],
      status: 'published'
    }
  ]);

  const [categories] = useState([
    { name: 'Getting Started', count: 12, icon: '🚀' },
    { name: 'Advanced Features', count: 8, icon: '⚡' },
    { name: 'Integrations', count: 15, icon: '🔌' },
    { name: 'Troubleshooting', count: 6, icon: '🔧' },
    { name: 'Best Practices', count: 9, icon: '💡' },
    { name: 'API Documentation', count: 22, icon: '📚' }
  ]);

  const [webSources, setWebSources] = useState([
    {
      id: 1,
      url: 'https://example.com/products',
      status: 'indexed',
      pages: 145,
      lastCrawled: '2024-03-19',
      autoSync: true
    },
    {
      id: 2,
      url: 'https://docs.example.com',
      status: 'crawling',
      pages: 67,
      lastCrawled: '2024-03-20',
      autoSync: true
    },
    {
      id: 3,
      url: 'https://support.example.com',
      status: 'pending',
      pages: 0,
      lastCrawled: null,
      autoSync: false
    }
  ]);

  const [documents] = useState([
    {
      id: 1,
      name: 'Product Manual.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploaded: '2024-03-15',
      status: 'processed'
    },
    {
      id: 2,
      name: 'FAQ Document.docx',
      type: 'DOCX',
      size: '156 KB',
      uploaded: '2024-03-18',
      status: 'processed'
    },
    {
      id: 3,
      name: 'Training Materials.xlsx',
      type: 'XLSX',
      size: '890 KB',
      uploaded: '2024-03-20',
      status: 'processing'
    }
  ]);

  const [aiSettings, setAiSettings] = useState({
    autoSuggest: true,
    smartSearch: true,
    contextualAnswers: true,
    multilingualSupport: false,
    confidenceThreshold: 0.7,
    maxResults: 5
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'indexed': return 'bg-green-100 text-green-700';
      case 'crawling': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
        <p className="text-gray-600">Manage help articles, documentation, and web scraping for intelligent bot responses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Articles</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{articles.length}</div>
          <span className="text-xs text-green-600">+12 this week</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">5,342</div>
          <span className="text-xs text-green-600">+23% vs last week</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Web Sources</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{webSources.length}</div>
          <span className="text-xs text-gray-600">212 pages indexed</span>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Help Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">87%</div>
          <span className="text-xs text-green-600">Above target</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['articles', 'web_scraping', 'documents', 'ai_training', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'glass-dynamic text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'articles' && (
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
                    <span className="text-sm font-medium">All Articles</span>
                    <span className="text-xs text-gray-500">{articles.length}</span>
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

          {/* Articles List */}
          <div className="lg:col-span-3">
            <div className="glass-premium p-6 rounded-xl">
              {/* Search Bar */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Article
                </button>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map(article => (
                  <div key={article.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                        <span className="text-xs text-gray-500">{article.category}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {article.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> {article.helpful}%
                        </span>
                      </div>
                      <span>Updated: {article.lastUpdated}</span>
                    </div>
                    
                    <div className="flex gap-1 mt-3">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex-1 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm transition-colors">
                        Preview
                      </button>
                      <button className="flex-1 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'web_scraping' && (
        <div>
          {/* Add New Source */}
          <div className="glass-premium p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Web Scraping Sources</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add URLs to Scrape (one per line)
                </label>
                <textarea
                  placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter multiple URLs (one per line) to scrape multiple pages at once
                </p>
              </div>
              
              <div className="flex gap-2">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Add URLs
                </button>
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Scrape All Now
                </button>
              </div>
            </div>

            {/* Sources List */}
            <div className="space-y-4">
              {webSources.map(source => (
                <div key={source.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{source.url}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(source.status)}`}>
                          {source.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Pages</span>
                          <div className="font-medium">{source.pages}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Crawled</span>
                          <div className="font-medium">{source.lastCrawled || 'Never'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Auto Sync</span>
                          <div className="font-medium">{source.autoSync ? 'Enabled' : 'Disabled'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                            {source.status === 'crawling' ? 'Stop' : 'Crawl Now'}
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                            Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crawl Settings */}
          <div className="glass-premium p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crawl Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crawl Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Manual Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Depth</label>
                <input
                  type="number"
                  defaultValue="3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pages Limit</label>
                <input
                  type="number"
                  defaultValue="500"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crawl Delay (ms)</label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Follow robots.txt rules</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Include meta descriptions</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Extract structured data</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          {/* Upload Section */}
          <div className="glass-premium p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Library</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOCX, TXT, XLSX, CSV</p>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Choose Files
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="glass-premium p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
            
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {doc.type} • {doc.size} • Uploaded {doc.uploaded}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_training' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Training Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Search Configuration</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-suggest answers</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.autoSuggest}
                      onChange={(e) => setAiSettings({...aiSettings, autoSuggest: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Smart search</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.smartSearch}
                      onChange={(e) => setAiSettings({...aiSettings, smartSearch: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Contextual answers</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.contextualAnswers}
                      onChange={(e) => setAiSettings({...aiSettings, contextualAnswers: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Multilingual support</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.multilingualSupport}
                      onChange={(e) => setAiSettings({...aiSettings, multilingualSupport: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Response Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings({...aiSettings, confidenceThreshold: parseFloat(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 w-12">{aiSettings.confidenceThreshold}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Search Results
                  </label>
                  <input
                    type="number"
                    value={aiSettings.maxResults}
                    onChange={(e) => setAiSettings({...aiSettings, maxResults: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                
                <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Save AI Settings
                </button>
              </div>
            </div>
          </div>

          {/* Training Status */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">AI Model Status</h4>
                <p className="text-sm text-blue-700 mt-1">Last trained: March 20, 2024 • Next training: Scheduled for March 27</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Train Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Base Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Most Viewed Articles</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Troubleshooting Guide</span>
                  <span className="font-medium">2,341</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Getting Started</span>
                  <span className="font-medium">1,542</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Advanced Features</span>
                  <span className="font-medium">892</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Search Queries</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">"how to integrate"</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">"pricing"</span>
                  <span className="font-medium">143</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">"API documentation"</span>
                  <span className="font-medium">98</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Article Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Read Time</span>
                  <span className="font-medium">3m 24s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Helpful Rate</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-medium">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;