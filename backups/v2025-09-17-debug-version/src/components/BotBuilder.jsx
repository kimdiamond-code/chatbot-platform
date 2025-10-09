import React, { useState, useEffect } from 'react';
import { documentProcessor, webpageScraper } from '../services/knowledgeService';
import { botConfigService } from '../services/botConfigService';

// Icon components
const Bot = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🤖</span>;
const Target = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🎯</span>;
const User = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>👤</span>;
const Settings = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>⚙️</span>;
const MessageSquare = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>💬</span>;
const BookOpen = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📚</span>;
const Code = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🔧</span>;
const Play = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>▶️</span>;
const Save = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>💾</span>;
const Upload = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>⬆️</span>;
const Plus = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>➕</span>;
const Trash = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🗑️</span>;
const Edit = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>✏️</span>;
const Copy = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📋</span>;

const BotBuilder = () => {
  const [activeTab, setActiveTab] = useState('directive');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [dbConnected, setDbConnected] = useState(null);
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
    
    // Q&A Database - ENSURE IT'S ALWAYS AN ARRAY
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
    
    // Knowledge Base - ENSURE IT'S ALWAYS AN ARRAY
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

  const [testChatOpen, setTestChatOpen] = useState(false);
  const [testMessages, setTestMessages] = useState([]);
  
  // Load bot configuration from database on component mount
  useEffect(() => {
    loadBotConfiguration();
  }, []);
  
  // Sanitize loaded configuration to ensure arrays are always arrays
  const sanitizeConfig = (config) => {
    return {
      ...config,
      traits: Array.isArray(config.traits) ? config.traits : ['professional', 'empathetic'],
      constraints: Array.isArray(config.constraints) ? config.constraints : [],
      goals: Array.isArray(config.goals) ? config.goals : [],
      escalationKeywords: Array.isArray(config.escalationKeywords) ? config.escalationKeywords : ['human', 'agent', 'manager'],
      qaDatabase: Array.isArray(config.qaDatabase) ? config.qaDatabase : [],
      knowledgeBase: Array.isArray(config.knowledgeBase) ? config.knowledgeBase : [],
      operatingHours: config.operatingHours || {
        enabled: false,
        timezone: 'UTC',
        hours: { start: '09:00', end: '17:00' }
      },
      widget: config.widget || {
        position: 'bottom-right',
        theme: 'light',
        primaryColor: '#3B82F6',
        size: 'medium',
        autoOpen: false,
        showBranding: true
      }
    };
  };
  
  // Load bot configuration from database or localStorage
  const loadBotConfiguration = async () => {
    setIsLoading(true);
    try {
      // Test database connection
      const connected = await botConfigService.testConnection();
      setDbConnected(connected);
      
      // Load configuration
      const result = await botConfigService.loadBotConfig();
      if (result.success && result.data) {
        const sanitizedConfig = sanitizeConfig(result.data);
        setBotConfig(sanitizedConfig);
        console.log('✅ Bot configuration loaded');
      } else {
        console.warn('Failed to load bot config:', result.error);
      }
    } catch (error) {
      console.error('Error loading bot configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save bot configuration to database or localStorage
  const saveBotConfiguration = async () => {
    setSaveStatus('saving');
    try {
      const result = await botConfigService.saveBotConfig(botConfig);
      if (result.success) {
        setSaveStatus('saved');
        console.log('✅ Bot configuration saved');
      } else {
        setSaveStatus('error');
        console.error('Failed to save bot config:', result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving bot configuration:', error);
    }
    
    // Clear save status after 3 seconds
    setTimeout(() => setSaveStatus(''), 3000);
  };
  
  // Auto-save configuration when it changes (TEMPORARILY DISABLED)
  /*
  useEffect(() => {
    if (!isLoading && botConfig.name) {
      const saveTimeout = setTimeout(() => {
        saveBotConfiguration();
      }, 5000); // Auto-save 5 seconds after changes stop
      
      return () => clearTimeout(saveTimeout);
    }
  }, [botConfig.name, botConfig.systemPrompt, botConfig.greeting, botConfig.fallback, botConfig.tone]); // Only trigger on specific fields
  */
  
  const tabs = [
    { id: 'directive', name: 'Directive', icon: Target, desc: 'Bot role & purpose' },
    { id: 'personality', name: 'Personality', icon: User, desc: 'Name, avatar & traits' },
    { id: 'options', name: 'Custom Options', icon: Settings, desc: 'Delays & escalation' },
    { id: 'qa', name: 'Q&A Database', icon: MessageSquare, desc: 'Questions & answers' },
    { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen, desc: 'Upload documents' },
    { id: 'widget', name: 'Widget Generator', icon: Code, desc: 'Embed code & styling' }
  ];

  const updateConfig = (section, updates) => {
    console.log('Updating config:', section, updates); // Debug log
    
    if (section === 'root') {
      // Update root level properties directly
      setBotConfig(prev => {
        const newConfig = { ...prev, ...updates };
        console.log('New config after root update:', newConfig); // Debug log
        return newConfig;
      });
    } else {
      // Update nested properties
      setBotConfig(prev => {
        const newConfig = {
          ...prev,
          [section]: { ...(prev[section] || {}), ...updates }
        };
        console.log('New config after nested update:', newConfig); // Debug log
        return newConfig;
      });
    }
  };

  // Directive Tab Component
  const DirectiveTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Bot Role & Purpose</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
            <input
              type="text"
              value={botConfig.name || ''}
              onChange={(e) => {
                console.log('Bot name input change:', e.target.value); // Debug log
                updateConfig('root', { name: e.target.value });
              }}
              onInput={(e) => {
                console.log('Bot name input event:', e.target.value); // Debug log
              }}
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
            onChange={(e) => {
              console.log('System prompt change:', e.target.value.length, 'characters'); // Debug log
              updateConfig('root', { systemPrompt: e.target.value });
            }}
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

  // Personality Tab Component  
  const PersonalityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Avatar & Identity</h3>
        
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
              onChange={(e) => {
                console.log('Greeting change:', e.target.value); // Debug log
                updateConfig('root', { greeting: e.target.value });
              }}
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

  // Custom Options Tab Component
  const CustomOptionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Response Settings</h3>
        
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

  // Knowledge Base Tab Component
  const KnowledgeTab = () => {
    const [uploadProgress, setUploadProgress] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [newWebpageUrl, setNewWebpageUrl] = useState('');
    const [webpageProgress, setWebpageProgress] = useState(null);
    const [proxyAvailable, setProxyAvailable] = useState(null);

    // Test CORS proxy on component mount
    useEffect(() => {
      const testProxy = async () => {
        const available = await webpageScraper.testProxy();
        setProxyAvailable(available);
      };
      testProxy();
    }, []);

    // Handle file upload
    const handleFileUpload = async (files) => {
      console.log('File upload triggered:', files); // Debug log
      
      if (!files || files.length === 0) {
        console.log('No files provided'); // Debug log
        return;
      }
      
      const fileArray = Array.from(files);
      console.log('Processing files:', fileArray); // Debug log
      
      for (const file of fileArray) {
        console.log('Processing file:', file.name, file.type, file.size); // Debug log
        setUploadProgress({ file: file.name, status: 'starting', progress: 0 });
        
        try {
          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error('File size exceeds 10MB limit');
          }
          
          // Validate file type
          const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
          const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
          
          if (!allowedTypes.includes(fileExtension)) {
            throw new Error(`Unsupported file type: ${fileExtension}. Supported: PDF, DOCX, TXT`);
          }
          
          console.log('File validation passed, processing...'); // Debug log
          
          const result = await documentProcessor.processFile(file, (progress) => {
            console.log('Upload progress:', progress); // Debug log
            setUploadProgress({ file: file.name, ...progress });
          });
          
          console.log('Processing result:', result); // Debug log
          
          if (result.success) {
            // Add to knowledge base
            const knowledgeItem = {
              id: Date.now() + Math.random(),
              name: file.name,
              type: 'file',
              status: 'processed',
              uploadDate: new Date().toISOString().split('T')[0],
              wordCount: result.wordCount,
              chunkCount: result.chunkCount,
              chunks: result.chunks,
              keywords: result.keywords || [],
              size: file.size
            };
            
            console.log('Adding knowledge item:', knowledgeItem); // Debug log
            
            updateConfig('knowledgeBase', [
              ...(Array.isArray(botConfig.knowledgeBase) ? botConfig.knowledgeBase : []), 
              knowledgeItem
            ]);
            
            setUploadProgress({ 
              file: file.name, 
              status: 'success', 
              progress: 100,
              wordCount: result.wordCount,
              chunkCount: result.chunkCount
            });
            
          } else {
            setUploadProgress({ 
              file: file.name, 
              status: 'error', 
              progress: 0,
              error: result.error || 'Unknown error occurred'
            });
          }
          
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress({ 
            file: file.name, 
            status: 'error', 
            progress: 0,
            error: error.message || 'Upload failed'
          });
        }
        
        // Clear progress after 5 seconds
        setTimeout(() => setUploadProgress(null), 5000);
      }
    };

    // Handle drag and drop
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    };

    // Handle webpage scraping
    const handleWebpageScraping = async () => {
      if (!newWebpageUrl.trim()) return;
      
      setWebpageProgress({ status: 'starting', progress: 0 });
      
      try {
        // Validate URL format
        try {
          new URL(newWebpageUrl);
        } catch {
          throw new Error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
        }
        
        const result = await webpageScraper.scrapeWebpage(newWebpageUrl, (progress) => {
          setWebpageProgress(progress);
        });
        
        if (result.success) {
          const knowledgeItem = {
            id: Date.now() + Math.random(),
            name: result.metadata?.title || 'Untitled Webpage',
            type: 'webpage',
            url: newWebpageUrl,
            status: 'processed',
            uploadDate: new Date().toISOString().split('T')[0],
            wordCount: result.wordCount || 0,
            chunkCount: result.chunkCount || 0,
            chunks: result.chunks || [],
            keywords: result.keywords || []
          };
          
          updateConfig('knowledgeBase', [
            ...(Array.isArray(botConfig.knowledgeBase) ? botConfig.knowledgeBase : []), 
            knowledgeItem
          ]);
          setNewWebpageUrl('');
          
          setWebpageProgress({ 
            status: 'success', 
            progress: 100,
            wordCount: result.wordCount,
            chunkCount: result.chunkCount
          });
          
        } else {
          setWebpageProgress({ 
            status: 'error', 
            progress: 0,
            error: result.error || 'Failed to scrape webpage'
          });
        }
        
      } catch (error) {
        console.error('Webpage scraping error:', error);
        setWebpageProgress({ 
          status: 'error', 
          progress: 0,
          error: error.message || 'Webpage scraping failed'
        });
      }
      
      // Clear progress after 5 seconds
      setTimeout(() => setWebpageProgress(null), 5000);
    };

    // Remove knowledge item
    const removeKnowledgeItem = (id) => {
      const currentKnowledgeBase = Array.isArray(botConfig.knowledgeBase) ? botConfig.knowledgeBase : [];
      updateConfig('knowledgeBase', currentKnowledgeBase.filter(item => item.id !== id));
    };

    return (
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Upload Documents</h3>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : uploadProgress?.status === 'error'
                ? 'border-red-300 bg-red-50'
                : uploadProgress?.status === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="text-gray-400 mx-auto mb-4" size={48} />
            
            {uploadProgress ? (
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">
                  {uploadProgress.status === 'success' ? '✅ Upload Complete!' :
                   uploadProgress.status === 'error' ? '❌ Upload Failed' :
                   '💬 Processing...'}
                </h4>
                
                <p className="text-gray-600">
                  {uploadProgress.file}
                </p>
                
                {uploadProgress.status !== 'success' && uploadProgress.status !== 'error' && (
                  <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress || 0}%` }}
                    ></div>
                  </div>
                )}
                
                {uploadProgress.status === 'success' && (
                  <p className="text-sm text-green-600">
                    ✨ {uploadProgress.wordCount} words processed into {uploadProgress.chunkCount} chunks
                  </p>
                )}
                
                {uploadProgress.status === 'error' && (
                  <p className="text-sm text-red-600">
                    {uploadProgress.error}
                  </p>
                )}
              </div>
            ) : (
              <div>
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

        {/* Webpage Scraping Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Add Webpage</h3>
          
          {/* CORS Proxy Status */}
          {proxyAvailable === false && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>CORS Proxy Required:</strong> To scrape webpages, start the CORS proxy server.
                Run: <code className="bg-yellow-100 px-1 rounded">cd cors-proxy && npm run dev</code>
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="url"
                value={newWebpageUrl}
                onChange={(e) => setNewWebpageUrl(e.target.value)}
                placeholder="https://example.com/help"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={webpageProgress?.status === 'fetching' || webpageProgress?.status === 'parsing'}
              />
              <button 
                onClick={handleWebpageScraping}
                disabled={!newWebpageUrl.trim() || webpageProgress?.status === 'fetching' || webpageProgress?.status === 'parsing' || proxyAvailable === false}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                {webpageProgress?.status === 'fetching' || webpageProgress?.status === 'parsing' ? 'Processing...' : 'Add URL'}
              </button>
            </div>
            
            {webpageProgress && (
              <div className={`p-4 rounded-lg border ${
                webpageProgress.status === 'success' ? 'bg-green-50 border-green-200' :
                webpageProgress.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${
                    webpageProgress.status === 'success' ? 'text-green-800' :
                    webpageProgress.status === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {webpageProgress.status === 'success' ? '✅ Webpage processed!' :
                     webpageProgress.status === 'error' ? '❌ Scraping failed' :
                     `🔄 ${webpageProgress.status}`}
                  </span>
                  
                  {webpageProgress.status !== 'success' && webpageProgress.status !== 'error' && (
                    <span className="text-sm text-gray-600">{webpageProgress.progress}%</span>
                  )}
                </div>
                
                {webpageProgress.status !== 'success' && webpageProgress.status !== 'error' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${webpageProgress.progress || 0}%` }}
                    ></div>
                  </div>
                )}
                
                {webpageProgress.status === 'success' && (
                  <p className="text-sm text-green-700 mt-1">
                    ✨ {webpageProgress.wordCount} words processed into {webpageProgress.chunkCount} chunks
                  </p>
                )}
                
                {webpageProgress.status === 'error' && (
                  <p className="text-sm text-red-700 mt-1">
                    {webpageProgress.error}
                  </p>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              Bot will scrape and learn from webpage content. Great for FAQs, policies, and documentation.
            </p>
          </div>
        </div>

        {/* Knowledge Base Display */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📚 Knowledge Base ({Array.isArray(botConfig.knowledgeBase) ? botConfig.knowledgeBase.length : 0} items)
            </h3>
            
            {Array.isArray(botConfig.knowledgeBase) && botConfig.knowledgeBase.length > 0 && (
              <div className="text-sm text-gray-600">
                {botConfig.knowledgeBase.reduce((total, item) => total + (item.wordCount || 0), 0).toLocaleString()} total words
              </div>
            )}
          </div>
          
          {!Array.isArray(botConfig.knowledgeBase) || botConfig.knowledgeBase.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto mb-2" size={48} />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload files or add webpages to build your bot's knowledge base</p>
            </div>
          ) : (
            <div className="space-y-3">
              {botConfig.knowledgeBase.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {item.type === 'file' ? '📄' : '🌐'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          {item.type === 'webpage' ? item.url : `Uploaded ${item.uploadDate}`}
                        </span>
                        {item.wordCount && (
                          <span>📝 {item.wordCount.toLocaleString()} words</span>
                        )}
                        {item.chunkCount && (
                          <span>🧩 {item.chunkCount} chunks</span>
                        )}
                      </div>
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.keywords.slice(0, 5).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                          {item.keywords.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{item.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'processed' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                    <button 
                      onClick={() => removeKnowledgeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove from knowledge base"
                    >
                      <Trash size={16} />
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

  // Widget Generator Tab Component
  const WidgetTab = () => {
    const [embedCode, setEmbedCode] = useState('');
    
    const generateEmbedCode = () => {
      // Save current bot configuration to localStorage for widget to access
      const widgetConfig = {
        position: botConfig.widget?.position || 'bottom-right',
        theme: botConfig.widget?.theme || 'light',
        primaryColor: botConfig.widget?.primaryColor || '#3B82F6',
        size: botConfig.widget?.size || 'medium',
        autoOpen: botConfig.widget?.autoOpen || false,
        showPoweredBy: botConfig.widget?.showBranding || false,
        botName: botConfig.name,
        greeting: botConfig.greeting,
        avatar: botConfig.avatar,
        personality: {
          name: botConfig.name,
          greetingMessage: botConfig.greeting,
          fallbackMessage: botConfig.fallback,
          avatar: botConfig.avatar
        },
        qaDatabase: Array.isArray(botConfig.qaDatabase) ? botConfig.qaDatabase : [],
        knowledgeBase: Array.isArray(botConfig.knowledgeBase) ? botConfig.knowledgeBase : [],
        escalationKeywords: Array.isArray(botConfig.escalationKeywords) ? botConfig.escalationKeywords : [],
        responseDelay: botConfig.responseDelay
      };
      
      localStorage.setItem('chatbot-config', JSON.stringify(widgetConfig));
      
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
      navigator.clipboard.writeText(embedCode);
      // You could add a toast notification here
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Widget Appearance</h3>
          
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Embed Code</h3>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={generateEmbedCode}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Code size={16} />
              Generate Code
            </button>
            
            {embedCode && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy Code
                </button>
                
                <button
                  onClick={() => window.open('/widget/demo.html', '_blank')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  Test Widget
                </button>
              </>
            )}
          </div>
          
          {embedCode && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{embedCode}</pre>
            </div>
          )}
          
          {!embedCode && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Code className="text-gray-400 mx-auto mb-2" size={32} />
              <p className="text-gray-600">Click "Generate Code" to create your embed code</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Deployment Instructions</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
              <div>
                <h4 className="font-medium text-gray-900">Generate embed code above</h4>
                <p className="text-sm text-gray-600">Configure your widget settings and generate the embed code</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
              <div>
                <h4 className="font-medium text-gray-900">Copy and paste into your website</h4>
                <p className="text-sm text-gray-600">Add the code before the closing &lt;/body&gt; tag on your website</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
              <div>
                <h4 className="font-medium text-gray-900">Test your chatbot</h4>
                <p className="text-sm text-gray-600">Visit your website and test the chatbot functionality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const QATab = () => {
    const [newQA, setNewQA] = useState({ question: '', answer: '', keywords: '', category: 'general' });
    const [editingQA, setEditingQA] = useState(null);

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
      
      updateConfig('qaDatabase', [
        ...(Array.isArray(botConfig.qaDatabase) ? botConfig.qaDatabase : []), 
        qa
      ]);
      setNewQA({ question: '', answer: '', keywords: '', category: 'general' });
    };

    const deleteQA = (id) => {
      const currentQADatabase = Array.isArray(botConfig.qaDatabase) ? botConfig.qaDatabase : [];
      updateConfig('qaDatabase', currentQADatabase.filter(qa => qa.id !== id));
    };

    const toggleQA = (id) => {
      const currentQADatabase = Array.isArray(botConfig.qaDatabase) ? botConfig.qaDatabase : [];
      updateConfig('qaDatabase', currentQADatabase.map(qa => 
        qa.id === id ? { ...qa, enabled: !qa.enabled } : qa
      ));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Add New Q&A</h3>
          
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
              <Plus size={16} />
              Add Q&A Pair
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Q&A Database ({Array.isArray(botConfig.qaDatabase) ? botConfig.qaDatabase.length : 0} entries)</h3>
          
          <div className="space-y-3">
            {Array.isArray(botConfig.qaDatabase) && botConfig.qaDatabase.map((qa) => (
              <div key={qa.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        qa.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {qa.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                        {qa.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Q: {qa.question}</h4>
                    <p className="text-gray-600 text-sm mb-2">A: {qa.answer}</p>
                    {qa.keywords.length > 0 && (
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
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'directive':
        return <DirectiveTab />;
      case 'personality':
        return <PersonalityTab />;
      case 'options':
        return <CustomOptionsTab />;
      case 'qa':
        return <QATab />;
      case 'knowledge':
        return <KnowledgeTab />;
      case 'widget':
        return <WidgetTab />;
      default:
        return (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
            <Bot className="text-gray-400 mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">This tab is being developed. Check back soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bot configuration...</p>
            {dbConnected !== null && (
              <p className="text-sm text-gray-500 mt-2">
                {dbConnected ? '🟢 Database connected' : '🟡 Using localStorage fallback'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤖 Bot Builder</h1>
              <p className="text-gray-600 mt-1">
                Configure your AI chatbot's behavior and appearance
                {dbConnected !== null && (
                  <span className="ml-3 text-sm">
                    {dbConnected ? '🟢 Database connected' : '🟡 localStorage fallback'}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* Debug Panel */}
              <div className="bg-red-100 border border-red-300 rounded px-3 py-1 text-sm">
                <strong>DEBUG:</strong> Config Name: {botConfig.name || 'undefined'}
              </div>
              
              <button 
                onClick={() => {
                  console.log('Manual save clicked');
                  saveBotConfiguration();
                }}
                disabled={saveStatus === 'saving'}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  saveStatus === 'saved' 
                    ? 'bg-green-600 text-white'
                    : saveStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : saveStatus === 'saving'
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Save size={16} />
                {saveStatus === 'saved' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error' :
                 saveStatus === 'saving' ? 'Saving...' : 'Save Config'}
              </button>
              
              <button 
                onClick={() => {
                  console.log('Test button clicked');
                  updateConfig('root', { name: 'Test Bot ' + Date.now() });
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Test Update
              </button>
              
              <button 
                onClick={() => setTestChatOpen(!testChatOpen)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Test Chat
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
              <tab.icon size={20} />
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
        </>
      )}
    </div>
  );
};

export default BotBuilder;