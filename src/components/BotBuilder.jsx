import React, { useState, useEffect } from 'react';
import KnowledgeBaseTab from './KnowledgeBaseTab.jsx';
import ChatPreview from './ChatPreview.jsx';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const Target = () => <span className="text-xl">🎯</span>;
const User = () => <span className="text-xl">👤</span>;
const Settings = () => <span className="text-xl">⚙️</span>;
const MessageSquare = () => <span className="text-xl">💬</span>;
const BookOpen = () => <span className="text-xl">📚</span>;
const Code = () => <span className="text-xl">🔧</span>;
const Save = () => <span className="text-xl">💾</span>;
const GraduationCap = () => <span className="text-xl">🎓</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Upload = () => <span className="text-xl">⬆️</span>;
const Globe = () => <span className="text-xl">🌐</span>;
const Link = () => <span className="text-xl">🔗</span>;
const CheckCircle = () => <span className="text-xl">✅</span>;
const XCircle = () => <span className="text-xl">❌</span>;

const BotBuilder = () => {
  const [activeTab, setActiveTab] = useState('directive');
  const [saveStatus, setSaveStatus] = useState('');
  const [trainingConversations, setTrainingConversations] = useState([]);
  
  const [botConfig, setBotConfig] = useState({
    name: 'ChatBot Assistant',
    role: 'customer_support',
    systemPrompt: 'You are a helpful customer service assistant. You are professional, friendly, and concise.',
    tone: 'friendly',
    avatar: '🤖',
    traits: ['professional', 'empathetic'],
    greeting: 'Hello! How can I help you today?',
    fallback: "I'm not sure about that. Let me connect you with a human agent.",
    responseDelay: 1500,
    maxRetries: 3,
    operatingHours: {
      enabled: false,
      timezone: 'UTC',
      hours: { start: '09:00', end: '17:00' }
    },
    escalationKeywords: ['human', 'agent', 'manager', 'speak to someone'],
    qaDatabase: [],
    knowledgeBase: [],
    widget: {
      position: 'bottom-right',
      theme: 'light',
      primaryColor: '#3B82F6',
      size: 'medium',
      autoOpen: false,
      showBranding: true
    }
  });

  useEffect(() => {
    loadBotConfiguration();
    loadTrainingData();
  }, []);

  const loadBotConfiguration = async () => {
    try {
      console.log('📥 Loading bot configuration from database...');
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        console.log('✅ Bot config loaded from database');
        const settings = JSON.parse(dbConfig.settings || '{}');
        const personality = JSON.parse(dbConfig.personality || '{}');
        
        const appConfig = {
          name: dbConfig.name || 'ChatBot Assistant',
          role: 'customer_support',
          systemPrompt: dbConfig.instructions || 'You are a helpful customer service assistant.',
          tone: personality.tone || 'friendly',
          avatar: personality.avatar || '🤖',
          traits: personality.traits || ['professional', 'empathetic'],
          greeting: dbConfig.greeting_message || 'Hello! How can I help you today?',
          fallback: dbConfig.fallback_message || "I'm not sure about that.",
          responseDelay: settings.responseDelay || 1500,
          maxRetries: settings.maxRetries || 3,
          operatingHours: settings.operatingHours || { enabled: false, timezone: 'UTC', hours: { start: '09:00', end: '17:00' } },
          escalationKeywords: settings.escalationKeywords || ['human', 'agent', 'manager'],
          qaDatabase: settings.qaDatabase || [],
          knowledgeBase: settings.knowledgeBase || [],
          widget: settings.widget || {
            position: 'bottom-right',
            theme: 'light',
            primaryColor: '#3B82F6',
            size: 'medium',
            autoOpen: false,
            showBranding: true
          }
        };
        setBotConfig(appConfig);
      }
    } catch (error) {
      console.error('❌ Error loading bot config:', error);
    }
  };

  const loadTrainingData = () => {
    // Load training conversations from localStorage
    const saved = localStorage.getItem('training-conversations');
    if (saved) {
      try {
        setTrainingConversations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading training data:', e);
      }
    }
  };

  const saveTrainingData = (conversations) => {
    localStorage.setItem('training-conversations', JSON.stringify(conversations));
    setTrainingConversations(conversations);
  };

  const tabs = [
    { id: 'directive', name: 'Directive', icon: Target },
    { id: 'personality', name: 'Personality', icon: User },
    { id: 'options', name: 'Options', icon: Settings },
    { id: 'qa', name: 'Q&A', icon: MessageSquare },
    { id: 'knowledge', name: 'Knowledge', icon: BookOpen },
    { id: 'training', name: 'Training', icon: GraduationCap },
    { id: 'widget', name: 'Widget', icon: Code }
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
      const dbConfig = {
        organization_id: DEFAULT_ORG_ID,
        name: botConfig.name || 'ChatBot Assistant',
        personality: JSON.stringify({
          avatar: botConfig.avatar,
          tone: botConfig.tone,
          traits: botConfig.traits
        }),
        instructions: botConfig.systemPrompt || '',
        greeting_message: botConfig.greeting || 'Hello! How can I help you today?',
        fallback_message: botConfig.fallback || "I'm not sure about that.",
        settings: JSON.stringify({
          responseDelay: botConfig.responseDelay,
          maxRetries: botConfig.maxRetries,
          operatingHours: botConfig.operatingHours,
          escalationKeywords: botConfig.escalationKeywords,
          qaDatabase: botConfig.qaDatabase,
          knowledgeBase: botConfig.knowledgeBase,
          widget: botConfig.widget
        })
      };
      
      await dbService.saveBotConfig(dbConfig);
      localStorage.setItem('chatbot-config', JSON.stringify(botConfig));
      
      console.log('✅ Bot configuration saved');
      setSaveStatus('saved');
    } catch (error) {
      console.error('❌ Error saving:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Training Functions

  const saveToTraining = (question, answer) => {
    const newConvo = {
      id: Date.now(),
      question,
      answer,
      timestamp: new Date().toISOString(),
      isCorrect: null // null = not reviewed, true = correct, false = incorrect
    };
    
    const updated = [newConvo, ...trainingConversations].slice(0, 50); // Keep last 50
    saveTrainingData(updated);
  };



  // Tab Content Components
  const DirectiveTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target /> Bot Identity
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              type="text"
              id="bot-name"
              name="botName"
              value={botConfig.name || ''}
              onChange={(e) => updateConfig('root', { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bot name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Role</label>
            <select
              value={botConfig.role}
              onChange={(e) => updateConfig('root', { role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer_support">Customer Support</option>
              <option value="sales">Sales Assistant</option>
              <option value="booking">Booking Agent</option>
              <option value="general">General Assistant</option>
              <option value="technical">Technical Support</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">System Instructions</h3>
        <textarea
          id="system-prompt"
          name="systemPrompt"
          value={botConfig.systemPrompt || ''}
          onChange={(e) => updateConfig('root', { systemPrompt: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
          placeholder="You are a helpful customer service assistant..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This defines how your bot behaves and responds
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Tone</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['friendly', 'professional', 'casual', 'formal', 'enthusiastic', 'calm'].map((tone) => (
            <button
              key={tone}
              onClick={() => updateConfig('root', { tone })}
              className={`px-3 py-2 rounded-lg border-2 transition-all capitalize text-sm ${
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

  const PersonalityTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Avatar</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {['🤖', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍🔧', '🦸‍♂️', '🦸‍♀️', '🐶', '🐱', '🦊', '🐼'].map((avatar) => (
            <button
              key={avatar}
              onClick={() => updateConfig('root', { avatar })}
              className={`w-12 h-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${
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

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Messages</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
            <input
              type="text"
              id="greeting-message"
              name="greeting"
              value={botConfig.greeting || ''}
              onChange={(e) => updateConfig('root', { greeting: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Hello! How can I help you today?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fallback</label>
            <input
              type="text"
              id="fallback-message"
              name="fallback"
              value={botConfig.fallback}
              onChange={(e) => updateConfig('root', { fallback: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="I'm not sure about that..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Traits</h3>
        <div className="grid grid-cols-2 gap-2">
          {['professional', 'empathetic', 'patient', 'knowledgeable', 'efficient', 'friendly'].map((trait) => (
            <label key={trait} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
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

  const OptionsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Response Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delay (ms)</label>
            <input
              type="number"
              value={botConfig.responseDelay}
              onChange={(e) => updateConfig('root', { responseDelay: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="500"
              max="5000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries</label>
            <select
              value={botConfig.maxRetries}
              onChange={(e) => updateConfig('root', { maxRetries: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 attempt</option>
              <option value={2}>2 attempts</option>
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Escalation Keywords</h3>
        <textarea
          value={(Array.isArray(botConfig.escalationKeywords) ? botConfig.escalationKeywords : []).join(', ')}
          onChange={(e) => updateConfig('root', {
            escalationKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
          })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
          placeholder="human, agent, manager, speak to someone"
        />
        <p className="text-xs text-gray-500 mt-1">
          When customers use these words, bot will offer human agent
        </p>
      </div>
    </div>
  );

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

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plus /> Add New Q&A
          </h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={newQA.question}
              onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Question"
            />
            
            <textarea
              value={newQA.answer}
              onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Answer"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newQA.keywords}
                onChange={(e) => setNewQA({ ...newQA, keywords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Keywords (comma separated)"
              />
              
              <select
                value={newQA.category}
                onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="returns">Returns</option>
                <option value="billing">Billing</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            
            <button
              onClick={addQA}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Plus /> Add Q&A
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            Q&A Database ({(botConfig.qaDatabase || []).length})
          </h3>
          
          <div className="space-y-2">
            {(botConfig.qaDatabase || []).map((qa) => (
              <div key={qa.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {qa.category}
                    </span>
                    <p className="font-medium text-gray-900 mt-1 text-sm">Q: {qa.question}</p>
                    <p className="text-gray-600 text-sm">A: {qa.answer}</p>
                  </div>
                  
                  <button
                    onClick={() => deleteQA(qa.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const KnowledgeTab = () => (
    <KnowledgeBaseTab 
      botConfig={botConfig}
      updateConfig={updateConfig}
      Upload={Upload}
      Globe={Globe}
      Link={Link}
      BookOpen={BookOpen}
      Trash={Trash}
    />
  );

  const TrainingTab = () => {
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [correction, setCorrection] = useState('');

    const markCorrect = (id) => {
      const updated = trainingConversations.map(c => 
        c.id === id ? { ...c, isCorrect: true } : c
      );
      saveTrainingData(updated);
    };

    const markIncorrect = (id) => {
      const convo = trainingConversations.find(c => c.id === id);
      setSelectedConvo(convo);
      setCorrection('');
    };

    const submitCorrection = () => {
      if (!correction.trim() || !selectedConvo) return;

      // Add to Q&A database
      const newQA = {
        id: Date.now(),
        question: selectedConvo.question,
        answer: correction,
        keywords: selectedConvo.question.toLowerCase().split(' ').filter(w => w.length > 3),
        category: 'training',
        enabled: true
      };

      updateConfig('qaDatabase', [...(botConfig.qaDatabase || []), newQA]);

      // Mark as corrected in training data
      const updated = trainingConversations.map(c => 
        c.id === selectedConvo.id ? { ...c, isCorrect: false, correctedAnswer: correction } : c
      );
      saveTrainingData(updated);
      
      setSelectedConvo(null);
      setCorrection('');
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap /> Training Conversations ({trainingConversations.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Review bot responses and mark them as correct or provide corrections. Corrections automatically become Q&A pairs.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trainingConversations.map((convo) => (
              <div key={convo.id} className="border border-gray-200 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-sm font-medium text-blue-900">User: {convo.question}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm text-gray-900">Bot: {convo.answer}</p>
                  </div>

                  {convo.correctedAnswer && (
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-sm font-medium text-green-900">Correction: {convo.correctedAnswer}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {convo.isCorrect === null ? (
                      <>
                        <button
                          onClick={() => markCorrect(convo.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                        >
                          <CheckCircle /> Correct
                        </button>
                        <button
                          onClick={() => markIncorrect(convo.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                        >
                          <XCircle /> Incorrect
                        </button>
                      </>
                    ) : convo.isCorrect ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle /> Marked as correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-sm">
                        <CheckCircle /> Corrected & added to Q&A
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {trainingConversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap />
                <p className="mt-2">No training data yet</p>
                <p className="text-sm">Test your bot in the preview to generate training data</p>
              </div>
            )}
          </div>
        </div>

        {/* Correction Modal */}
        {selectedConvo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Provide Correct Answer</h3>
              
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">Question:</p>
                  <p className="text-sm text-blue-800">{selectedConvo.question}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Bot's Answer:</p>
                  <p className="text-sm text-gray-700">{selectedConvo.answer}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer:</label>
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the correct answer..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitCorrection}
                  disabled={!correction.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Correction
                </button>
                <button
                  onClick={() => setSelectedConvo(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const WidgetTab = () => {
    const [embedCode, setEmbedCode] = useState('');
    
    const generateEmbedCode = () => {
      const code = `<!-- ChatBot Widget -->
<script>
  window.ChatBotConfig = {
    position: '${botConfig.widget?.position || 'bottom-right'}',
    theme: '${botConfig.widget?.theme || 'light'}',
    primaryColor: '${botConfig.widget?.primaryColor || '#3B82F6'}',
    size: '${botConfig.widget?.size || 'medium'}',
    botName: '${botConfig.name}',
    greeting: '${botConfig.greeting}',
    avatar: '${botConfig.avatar}'
  };
</script>
<script src="/widget/chatbot.js"></script>`;
      
      setEmbedCode(code);
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Widget Appearance</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={botConfig.widget?.position || 'bottom-right'}
                onChange={(e) => updateConfig('widget', { position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={botConfig.widget?.theme || 'light'}
                onChange={(e) => updateConfig('widget', { theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <button
            onClick={generateEmbedCode}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-3"
          >
            Generate Embed Code
          </button>
          
          {embedCode && (
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{embedCode}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'directive': return <DirectiveTab />;
      case 'personality': return <PersonalityTab />;
      case 'options': return <OptionsTab />;
      case 'qa': return <QATab />;
      case 'knowledge': return <KnowledgeTab />;
      case 'training': return <TrainingTab />;
      case 'widget': return <WidgetTab />;
      default: return <DirectiveTab />;
    }
  };



  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Left Side - Configuration */}
      <div className="w-1/2 flex flex-col overflow-hidden border-r border-gray-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🤖 Bot Builder</h1>
            <p className="text-sm text-gray-600">Configure and train your AI chatbot</p>
          </div>
          
          <button 
            onClick={saveBotConfiguration}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              saveStatus === 'saved' ? 'bg-green-600 text-white' :
              saveStatus === 'error' ? 'bg-red-600 text-white' :
              saveStatus === 'saving' ? 'bg-blue-400 text-white cursor-not-allowed' :
              'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save />
            {saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error' :
             saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-all text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-1/2 p-4 flex flex-col">
        <ChatPreview 
          botConfig={botConfig}
          onSaveTraining={saveToTraining}
        />
      </div>
    </div>
  );
};

export default BotBuilder;
