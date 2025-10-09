import React, { useState, useEffect } from 'react';

// ✅ COMPLETE BOT BUILDER - All Tabs Working
// Fixed version without problematic service imports

// Simple Icon Components
const Target = () => <span className="text-xl">🎯</span>;
const User = () => <span className="text-xl">👤</span>;
const Settings = () => <span className="text-xl">⚙️</span>;
const MessageSquare = () => <span className="text-xl">💬</span>;
const BookOpen = () => <span className="text-xl">📚</span>;
const Code = () => <span className="text-xl">🔧</span>;
const Save = () => <span className="text-xl">💾</span>;
const Play = () => <span className="text-xl">▶️</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Upload = () => <span className="text-xl">⬆️</span>;
const Copy = () => <span className="text-xl">📋</span>;

const BotBuilder = () => {
  const [activeTab, setActiveTab] = useState('directive');
  const [saveStatus, setSaveStatus] = useState('');
  const [testChatOpen, setTestChatOpen] = useState(false);
  
  const [botConfig, setBotConfig] = useState({
    // Directive settings
    name: 'ChatBot Assistant',
    role: 'customer_support',
    systemPrompt: 'You are a helpful customer service assistant. You are professional, friendly, and concise.',
    tone: 'friendly',
    constraints: [],
    goals: [],
    
    // Personality settings  
    avatar: '🤖',
    personality: 'helpful',
    traits: ['professional', 'empathetic'],
    greeting: 'Hello! How can I help you today?',
    fallback: "I'm not sure about that. Let me connect you with a human agent.",
    
    // Custom options
    responseDelay: 1500,
    maxRetries: 3,
    operatingHours: {
      enabled: false,
      timezone: 'UTC',
      hours: { start: '09:00', end: '17:00' }
    },
    escalationKeywords: ['human', 'agent', 'manager', 'speak to someone'],
    
    // Q&A Database
    qaDatabase: [
      {
        id: 1,
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 5 PM EST.',
        keywords: ['hours', 'open', 'time', 'when'],
        category: 'general',
        enabled: true
      },
      {
        id: 2, 
        question: 'How do I return an item?',
        answer: 'You can return items within 30 days. Visit our returns page or contact support.',
        keywords: ['return', 'refund', 'exchange'],
        category: 'returns',
        enabled: true
      }
    ],
    
    // Knowledge Base
    knowledgeBase: [],
    
    // Widget settings
    widget: {
      position: 'bottom-right',
      theme: 'light',
      primaryColor: '#3B82F6',
      size: 'medium',
      autoOpen: false,
      showBranding: true
    }
  });

  // Load configuration on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatbot-config');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setBotConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  const tabs = [
    { id: 'directive', name: 'Directive', icon: Target, desc: 'Bot role & purpose' },
    { id: 'personality', name: 'Personality', icon: User, desc: 'Name, avatar & traits' },
    { id: 'options', name: 'Custom Options', icon: Settings, desc: 'Delays & escalation' },
    { id: 'qa', name: 'Q&A Database', icon: MessageSquare, desc: 'Questions & answers' },
    { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen, desc: 'Upload documents' },
    { id: 'widget', name: 'Widget Generator', icon: Code, desc: 'Embed code & styling' }
  ];

  const updateConfig = (section, updates) => {
    if (section === 'root') {
      setBotConfig(prev => ({ ...prev, ...updates }));
    } else if (section === 'qaDatabase' || section === 'knowledgeBase') {
      setBotConfig(prev => ({ ...prev, [section]: updates }));
    } else {
      setBotConfig(prev => ({
        ...prev,
        [section]: { ...(prev[section] || {}), ...updates }
      }));
    }
  };

  const saveBotConfiguration = async () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('chatbot-config', JSON.stringify(botConfig));
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // ✅ DIRECTIVE TAB
  const DirectiveTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target /> Bot Role & Purpose
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
            <input
              type="text"
              value={botConfig.name || ''}
              onChange={(e) => updateConfig('root', { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter bot name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
            <select
              value={botConfig.role}
              onChange={(e) => updateConfig('root', { role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="customer_support">Customer Support</option>
              <option value="sales">Sales Assistant</option>
              <option value="booking">Booking Agent</option>
              <option value="general">General Assistant</option>
              <option value="technical">Technical Support</option>
              <option value="custom">Custom Role</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 System Instructions</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt (This defines how your bot behaves)
          </label>
          <textarea
            value={botConfig.systemPrompt || ''}
            onChange={(e) => updateConfig('root', { systemPrompt: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="You are a helpful customer service assistant..."
          />
          <p className="text-xs text-gray-600 mt-1">
            Be specific about tone, expertise, and limitations. This directly impacts AI responses.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎭 Tone & Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['friendly', 'professional', 'casual', 'formal', 'enthusiastic', 'calm'].map((tone) => (
            <button
              key={tone}
              onClick={() => updateConfig('root', { tone })}
              className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                botConfig.tone === tone
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ PERSONALITY TAB
  const PersonalityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎨</span> Avatar & Identity
        </h3>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          {['🤖', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍🔧', '🦸‍♂️', '🦸‍♀️'].map((avatar, index) => (
            <button
              key={index}
              onClick={() => updateConfig('root', { avatar })}
              className={`w-12 h-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-colors ${
                botConfig.avatar === avatar
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Messages</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Greeting</label>
            <input
              type="text"
              value={botConfig.greeting || ''}
              onChange={(e) => updateConfig('root', { greeting: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hello! How can I help you today?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
            <input
              type="text"
              value={botConfig.fallback}
              onChange={(e) => updateConfig('root', { fallback: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="I'm not sure about that. Let me get a human agent."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Personality Traits</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['professional', 'empathetic', 'patient', 'knowledgeable', 'efficient', 'friendly'].map((trait) => (
            <label key={trait} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Array.isArray(botConfig.traits) && botConfig.traits.includes(trait)}
                onChange={(e) => {
                  const currentTraits = Array.isArray(botConfig.traits) ? botConfig.traits : [];
                  if (e.target.checked) {
                    updateConfig('root', { traits: [...currentTraits, trait] });
                  } else {
                    updateConfig('root', { traits: currentTraits.filter(t => t !== trait) });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm capitalize">{trait}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ CUSTOM OPTIONS TAB
  const CustomOptionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⏱️</span> Response Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Delay (ms)</label>
            <input
              type="number"
              value={botConfig.responseDelay}
              onChange={(e) => updateConfig('root', { responseDelay: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="500"
              max="5000"
            />
            <p className="text-xs text-gray-600 mt-1">Typing delay to make responses feel more natural</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Retry Attempts</label>
            <select
              value={botConfig.maxRetries}
              onChange={(e) => updateConfig('root', { maxRetries: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 attempt</option>
              <option value={2}>2 attempts</option>
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Operating Hours</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={botConfig.operatingHours?.enabled || false}
              onChange={(e) => updateConfig('operatingHours', { enabled: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Enable operating hours restrictions</span>
          </label>
          
          {botConfig.operatingHours?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={botConfig.operatingHours?.hours?.start || '09:00'}
                  onChange={(e) => updateConfig('operatingHours', {
                    hours: { ...(botConfig.operatingHours?.hours || {}), start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={botConfig.operatingHours?.hours?.end || '17:00'}
                  onChange={(e) => updateConfig('operatingHours', {
                    hours: { ...(botConfig.operatingHours?.hours || {}), end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={botConfig.operatingHours?.timezone || 'UTC'}
                  onChange={(e) => updateConfig('operatingHours', { timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Human Escalation</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Escalation Keywords</label>
          <textarea
            value={(Array.isArray(botConfig.escalationKeywords) ? botConfig.escalationKeywords : []).join(', ')}
            onChange={(e) => updateConfig('root', {
              escalationKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="human, agent, manager, speak to someone"
          />
          <p className="text-xs text-gray-600 mt-1">
            When customers use these words, the bot will offer to connect them with a human agent
          </p>
        </div>
      </div>
    </div>
  );

  // ✅ Q&A DATABASE TAB
  const QATab = () => {
    const [newQA, setNewQA] = useState({ question: '', answer: '', keywords: '', category: 'general' });

    const addQA = () => {
      if (!newQA.question.trim() || !newQA.answer.trim()) return;
      
      const qa = {
        id: Date.now(),
        question: newQA.question,
        answer: newQA.answer,
        keywords: newQA.keywords.split(',').map(k => k.trim()).filter(k => k),
        category: newQA.category,
        enabled: true
      };
      
      updateConfig('qaDatabase', [...(botConfig.qaDatabase || []), qa]);
      setNewQA({ question: '', answer: '', keywords: '', category: 'general' });
    };

    const deleteQA = (id) => {
      updateConfig('qaDatabase', (botConfig.qaDatabase || []).filter(qa => qa.id !== id));
    };

    const toggleQA = (id) => {
      updateConfig('qaDatabase', (botConfig.qaDatabase || []).map(qa => 
        qa.id === id ? { ...qa, enabled: !qa.enabled } : qa
      ));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus /> Add New Q&A
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={newQA.question}
                onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What are your business hours?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <textarea
                value={newQA.answer}
                onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="We are open Monday to Friday, 9 AM to 5 PM EST."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={newQA.keywords}
                  onChange={(e) => setNewQA({ ...newQA, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="hours, open, time, when"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newQA.category}
                  onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="returns">Returns</option>
                  <option value="billing">Billing</option>
                  <option value="shipping">Shipping</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={addQA}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus /> Add Q&A Pair
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Q&A Database ({(botConfig.qaDatabase || []).length} entries)
          </h3>
          
          <div className="space-y-3">
            {(botConfig.qaDatabase || []).map((qa) => (
              <div key={qa.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        qa.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {qa.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                        {qa.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Q: {qa.question}</h4>
                    <p className="text-gray-600 text-sm mb-2">A: {qa.answer}</p>
                    {qa.keywords && qa.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Keywords:</span>
                        {qa.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleQA(qa.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        qa.enabled 
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {qa.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteQA(qa.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {(!botConfig.qaDatabase || botConfig.qaDatabase.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto mb-2 text-4xl" />
                <p>No Q&A pairs added yet</p>
                <p className="text-sm">Add question-answer pairs to improve bot responses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ KNOWLEDGE BASE TAB
  const KnowledgeTab = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleFileUpload = async (files) => {
      if (!files || files.length === 0) return;
      
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        setUploadProgress({ file: file.name, status: 'processing', progress: 50 });
        
        // Simulate file processing
        setTimeout(() => {
          const knowledgeItem = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: 'file',
            status: 'processed',
            uploadDate: new Date().toISOString().split('T')[0],
            wordCount: Math.floor(Math.random() * 1000) + 500,
            size: file.size
          };
          
          updateConfig('knowledgeBase', [...(botConfig.knowledgeBase || []), knowledgeItem]);
          setUploadProgress({ file: file.name, status: 'success', progress: 100 });
          
          setTimeout(() => setUploadProgress(null), 3000);
        }, 2000);
      }
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileUpload(e.dataTransfer.files);
    };

    const removeKnowledgeItem = (id) => {
      updateConfig('knowledgeBase', (botConfig.knowledgeBase || []).filter(item => item.id !== id));
    };

    return (
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload /> Upload Documents
          </h3>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadProgress ? (
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">
                  {uploadProgress.status === 'success' ? '✅ Upload Complete!' : '💬 Processing...'}
                </h4>
                <p className="text-gray-600">{uploadProgress.file}</p>
                {uploadProgress.status !== 'success' && (
                  <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Upload className="text-gray-400 mx-auto mb-4 text-4xl" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Knowledge Files</h4>
                <p className="text-gray-600 mb-4">Drag and drop files or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Supported: PDF, DOC, DOCX, TXT (Max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Base Display */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📚 Knowledge Base ({(botConfig.knowledgeBase || []).length} items)
          </h3>
          
          {(!botConfig.knowledgeBase || botConfig.knowledgeBase.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto mb-2 text-4xl" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload files to build your bot's knowledge base</p>
            </div>
          ) : (
            <div className="space-y-3">
              {botConfig.knowledgeBase.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      📄
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Uploaded {item.uploadDate}</span>
                        {item.wordCount && <span>📝 {item.wordCount.toLocaleString()} words</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {item.status}
                    </span>
                    <button 
                      onClick={() => removeKnowledgeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ WIDGET GENERATOR TAB
  const WidgetTab = () => {
    const [embedCode, setEmbedCode] = useState('');
    
    const generateEmbedCode = () => {
      localStorage.setItem('chatbot-widget-config', JSON.stringify(botConfig));
      
      const code = `<!-- ChatBot Widget -->
<script>
  window.ChatBotConfig = {
    position: '${botConfig.widget?.position || 'bottom-right'}',
    theme: '${botConfig.widget?.theme || 'light'}',
    primaryColor: '${botConfig.widget?.primaryColor || '#3B82F6'}',
    size: '${botConfig.widget?.size || 'medium'}',
    autoOpen: ${botConfig.widget?.autoOpen || false},
    showPoweredBy: ${botConfig.widget?.showBranding || false},
    botName: '${botConfig.name}',
    greeting: '${botConfig.greeting}',
    avatar: '${botConfig.avatar}'
  };
</script>
<script src="/widget/chatbot.js"></script>`;
      
      setEmbedCode(code);
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(embedCode).then(() => {
        alert('Embed code copied to clipboard!');
      });
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎨</span> Widget Appearance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={botConfig.widget?.position || 'bottom-right'}
                onChange={(e) => updateConfig('widget', { position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="center">Center</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={botConfig.widget?.theme || 'light'}
                onChange={(e) => updateConfig('widget', { theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={botConfig.widget?.size || 'medium'}
                onChange={(e) => updateConfig('widget', { size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <input
                type="color"
                value={botConfig.widget?.primaryColor || '#3B82F6'}
                onChange={(e) => updateConfig('widget', { primaryColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={botConfig.widget?.autoOpen || false}
                onChange={(e) => updateConfig('widget', { autoOpen: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Auto-open chat on page load</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={botConfig.widget?.showBranding || false}
                onChange={(e) => updateConfig('widget', { showBranding: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Show "Powered by ChatBot Platform" branding</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Copy /> Embed Code
          </h3>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={generateEmbedCode}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Code /> Generate Code
            </button>
            
            {embedCode && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Copy /> Copy Code
                </button>
                
                <button
                  onClick={() => window.open('/widget/demo.html', '_blank')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Play /> Test Widget
                </button>
              </>
            )}
          </div>
          
          {embedCode ? (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{embedCode}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Code className="text-gray-400 mx-auto mb-2 text-4xl" />
              <p className="text-gray-600">Click "Generate Code" to create your embed code</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Simple Test Chat Component
  const TestChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const sendTestMessage = async () => {
      if (!newMessage.trim()) return;

      const userMsg = {
        id: Date.now(),
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');
      setIsTyping(true);

      // Simulate bot response
      setTimeout(() => {
        const botMsg = {
          id: Date.now() + 1,
          content: `Thanks for testing! You said: "${userMsg.content}". I'm configured as "${botConfig.name}" with a ${botConfig.personality} personality.`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, botConfig.responseDelay);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-96 h-96 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold">🧪 Test Chat - {botConfig.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="bg-gray-100 p-2 rounded text-sm">
              {botConfig.greeting}
            </div>
            
            {messages.map(msg => (
              <div key={msg.id} className={`p-2 rounded text-sm ${
                msg.sender === 'user' ? 'bg-blue-500 text-white ml-8' : 'bg-gray-100 mr-8'
              }`}>
                {msg.content}
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-gray-100 p-2 rounded text-sm mr-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
              placeholder="Type a test message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={sendTestMessage}
              disabled={!newMessage.trim() || isTyping}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'directive': return <DirectiveTab />;
      case 'personality': return <PersonalityTab />;
      case 'options': return <CustomOptionsTab />;
      case 'qa': return <QATab />;
      case 'knowledge': return <KnowledgeTab />;
      case 'widget': return <WidgetTab />;
      default: return <DirectiveTab />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            🤖 Bot Builder
          </h1>
          <p className="text-gray-600 mt-1">Configure your AI chatbot's behavior and appearance</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={saveBotConfiguration}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              saveStatus === 'saved' ? 'bg-green-600 text-white' :
              saveStatus === 'error' ? 'bg-red-600 text-white' :
              saveStatus === 'saving' ? 'bg-blue-400 text-white cursor-not-allowed' :
              'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save />
            {saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error' :
             saveStatus === 'saving' ? 'Saving...' : 'Save Config'}
          </button>
          
          <button 
            onClick={() => setTestChatOpen(!testChatOpen)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Play />Test Chat
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
      
      {/* Test Chat Modal */}
      <TestChat 
        isOpen={testChatOpen}
        onClose={() => setTestChatOpen(false)}
      />
    </div>
  );
};

export default BotBuilder;