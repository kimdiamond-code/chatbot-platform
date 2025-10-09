/**
 * ChatBot Widget - Embeddable Chat Interface
 * Version: 1.1.0 - Now supports webpage knowledge base
 */

(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#3B82F6',
    size: 'medium',
    botName: 'ChatBot',
    greeting: 'Hello! How can I help you today?',
    avatar: 'robot',
    showPoweredBy: true,
    autoOpen: false,
    autoOpenDelay: 3
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.ChatBotConfig || {});

  // Widget state
  let isOpen = false;
  let messages = [];
  let messageId = 0;
  let conversationId = 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Load saved configuration from API or localStorage
  async function loadSavedConfig() {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/bot-config');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('✅ Bot configuration loaded from API');
          return Object.assign({}, config, {
            botName: data.data.name || config.botName,
            greeting: data.data.greeting || config.greeting,
            avatar: data.data.avatar || config.avatar,
            qaDatabase: data.data.qaDatabase || [],
            knowledgeBase: data.data.knowledgeBase || [],
            escalationKeywords: data.data.escalationKeywords || [],
            responseDelay: data.data.responseDelay || config.responseDelay,
            // Merge widget settings
            ...data.data.widget
          });
        }
      }
    } catch (error) {
      console.warn('API failed, using localStorage fallback:', error.message);
    }
    
    // Fallback to localStorage
    try {
      const savedConfig = localStorage.getItem('chatbot-config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        console.log('✅ Bot configuration loaded from localStorage (fallback)');
        return Object.assign({}, config, {
          botName: parsed.personality?.name || parsed.name || config.botName,
          greeting: parsed.personality?.greetingMessage || parsed.greeting || config.greeting,
          avatar: parsed.personality?.avatar || parsed.avatar || config.avatar,
          qaDatabase: parsed.qaDatabase || [],
          knowledgeBase: parsed.knowledgeBase || [],
          escalationKeywords: parsed.escalationKeywords || []
        });
      }
    } catch (error) {
      console.warn('Error loading chatbot config:', error);
    }
    
    // Return default config if all else fails
    return config;
  }

  // Enhanced configuration with saved data - will be loaded asynchronously
  let enhancedConfig = config;

  // Load configuration asynchronously
  loadSavedConfig().then(loadedConfig => {
    enhancedConfig = loadedConfig;
    console.log('ChatBot Widget configuration updated:', enhancedConfig.botName);
  }).catch(error => {
    console.warn('Failed to load configuration:', error);
    enhancedConfig = config; // fallback to default
  });

  // CSS Styles
  const styles = `
    .chatbot-widget {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    .chatbot-widget.position-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .chatbot-widget.position-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .chatbot-widget.position-top-right {
      top: 20px;
      right: 20px;
    }

    .chatbot-widget.position-top-left {
      top: 20px;
      left: 20px;
    }

    .chatbot-widget.position-center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chatbot-container {
      width: ${config.size === 'small' ? '320px' : config.size === 'large' ? '400px' : '360px'};
      height: ${config.size === 'small' ? '400px' : config.size === 'large' ? '600px' : '500px'};
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 80px;
      border: 1px solid #e5e7eb;
    }

    .chatbot-container.theme-dark {
      background: #1f2937;
      border-color: #374151;
    }

    .chatbot-container.open {
      display: flex;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chatbot-header {
      background: ${config.primaryColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chatbot-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chatbot-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .chatbot-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .chatbot-header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.8;
    }

    .chatbot-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .chatbot-close:hover {
      opacity: 1;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: ${config.theme === 'dark' ? '#111827' : '#f9fafb'};
    }

    .chatbot-message {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }

    .chatbot-message.user {
      flex-direction: row-reverse;
    }

    .chatbot-message-content {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
    }

    .chatbot-message.bot .chatbot-message-content {
      background: white;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    .chatbot-message.user .chatbot-message-content {
      background: ${config.primaryColor};
      color: white;
    }

    .chatbot-message.bot.theme-dark .chatbot-message-content {
      background: #374151;
      color: #f3f4f6;
      border-color: #4b5563;
    }

    .chatbot-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 18px;
      border: 1px solid #e5e7eb;
      max-width: 75%;
    }

    .chatbot-typing.theme-dark {
      background: #374151;
      border-color: #4b5563;
    }

    .chatbot-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite ease-in-out;
    }

    .chatbot-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chatbot-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    .chatbot-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .chatbot-input-container.theme-dark {
      background: #1f2937;
      border-color: #374151;
    }

    .chatbot-input-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .chatbot-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 10px 16px;
      resize: none;
      max-height: 100px;
      min-height: 40px;
      font-family: inherit;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chatbot-input:focus {
      border-color: ${config.primaryColor};
    }

    .chatbot-input.theme-dark {
      background: #374151;
      border-color: #4b5563;
      color: #f3f4f6;
    }

    .chatbot-send {
      background: ${config.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chatbot-send:not(:disabled):hover {
      opacity: 0.9;
    }

    .chatbot-powered-by {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }

    .chatbot-powered-by.theme-dark {
      color: #6b7280;
      border-color: #374151;
    }

    .chatbot-confidence {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    .chatbot-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .chatbot-quick-reply {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chatbot-quick-reply:hover {
      background: #e5e7eb;
    }

    .chatbot-quick-reply.theme-dark {
      background: #4b5563;
      border-color: #6b7280;
      color: #f3f4f6;
    }

    .chatbot-quick-reply.theme-dark:hover {
      background: #6b7280;
    }

    .chatbot-source-indicator {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
      font-style: italic;
    }

    .chatbot-quick-replies-container {
      margin-top: 8px;
      margin-bottom: 8px;
    }

    .chatbot-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px;
    }

    .chatbot-quick-reply {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      color: #374151;
      font-family: inherit;
    }

    .chatbot-quick-reply:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }

    .chatbot-quick-reply.theme-dark {
      background: #4b5563;
      border-color: #6b7280;
      color: #f3f4f6;
    }

    .chatbot-quick-reply.theme-dark:hover {
      background: #6b7280;
    }

    .offline-message {
      border-left: 4px solid #f59e0b !important;
      background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 100%) !important;
    }

    .operating-hours-info {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .chatbot-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        margin-bottom: 80px;
      }

      .chatbot-widget.position-bottom-right,
      .chatbot-widget.position-bottom-left {
        left: 20px;
        right: 20px;
        bottom: 20px;
      }
    }
  `;

  // API call functions
  async function callChatAPI(message) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversationId: conversationId,
        organizationId: null // Will use default demo org
      })
    });
    
    if (!response.ok) {
      throw new Error(`Chat API returned ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Chat API failed');
    }
  }
  
  async function callQAMatchAPI(message) {
    const response = await fetch('/api/chat/qa-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        organizationId: null // Will use default demo org
      })
    });
    
    if (!response.ok) {
      throw new Error(`Q&A API returned ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Q&A API failed');
    }
  }

  // Enhanced bot logic for responding to messages with knowledge base search
  function generateLocalBotResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    console.log('🌐 Local fallback processing:', userMessage);
    console.log('📊 Local Q&A entries:', enhancedConfig.qaDatabase?.length || 0);
    console.log('📚 Local knowledge base items:', enhancedConfig.knowledgeBase?.length || 0);
    
    // Check escalation keywords first
    const escalationKeywords = enhancedConfig.escalationKeywords || [];
    for (const keyword of escalationKeywords) {
      if (message.includes(keyword.toLowerCase())) {
        console.log('🚨 Local escalation detected:', keyword);
        return {
          text: "I understand you'd like to speak with a human agent. Let me connect you with someone who can help you better.",
          confidence: 0.9,
          type: 'escalation',
          source: 'local_escalation_detection'
        };
      }
    }

    // Check Q&A database
    const qaDatabase = enhancedConfig.qaDatabase || [];
    for (const qa of qaDatabase) {
      if (!qa.enabled) continue;
      
      // Check if question matches
      if (qa.question.toLowerCase().includes(message) || message.includes(qa.question.toLowerCase())) {
        console.log('✅ Local Q&A match found:', qa.question);
        return {
          text: qa.answer,
          confidence: 0.85,
          type: 'qa_match',
          source: 'Local Q&A Database'
        };
      }
      
      // Check keywords
      for (const keyword of qa.keywords || []) {
        if (message.includes(keyword.toLowerCase())) {
          console.log('✅ Local Q&A keyword match:', keyword);
          return {
            text: qa.answer,
            confidence: 0.75,
            type: 'keyword_match',
            source: 'Local Q&A Database'
          };
        }
      }
    }

    // Search knowledge base (both documents and webpages)
    const knowledgeBase = enhancedConfig.knowledgeBase || [];
    for (const doc of knowledgeBase) {
      if (!doc.enabled || !doc.content) continue;
      
      // Simple text search in content
      if (doc.content.toLowerCase().includes(message)) {
        const sourceType = doc.source === 'webpage' ? 'Website' : 'Document';
        const sourceName = doc.source === 'webpage' ? doc.name : doc.name.split('.')[0];
        
        // Extract relevant snippet (limit to 200 characters)
        let snippet = doc.content;
        const searchIndex = doc.content.toLowerCase().indexOf(message);
        if (searchIndex !== -1) {
          const start = Math.max(0, searchIndex - 50);
          const end = Math.min(doc.content.length, searchIndex + 200);
          snippet = doc.content.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < doc.content.length) snippet = snippet + '...';
        } else {
          snippet = doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '');
        }
        
        console.log('✅ Local knowledge base match found:', sourceName);
        return {
          text: `Based on our ${sourceType.toLowerCase()} (${sourceName}): ${snippet}`,
          confidence: 0.7,
          type: 'knowledge_match',
          source: `${sourceType}: ${sourceName}`
        };
      }
      
      // Check keywords in document
      if (doc.keywords) {
        for (const keyword of doc.keywords) {
          if (message.includes(keyword.toLowerCase())) {
            console.log('✅ Local knowledge keyword match:', keyword);
            const sourceType = doc.source === 'webpage' ? 'Website' : 'Document';
            const sourceName = doc.source === 'webpage' ? doc.name : doc.name.split('.')[0];
            
            return {
              text: `I found information about "${keyword}" in our ${sourceType.toLowerCase()}: ${doc.content.substring(0, 150)}... Would you like me to elaborate on any specific part?`,
              confidence: 0.6,
              type: 'keyword_knowledge_match',
              source: `${sourceType}: ${sourceName}`
            };
          }
        }
      }
    }

    // Enhanced keyword matching for webpages
    for (const doc of knowledgeBase) {
      if (!doc.enabled || doc.source !== 'webpage') continue;
      
      // Check URL and title for additional matching
      const searchableText = `${doc.content} ${doc.name} ${doc.url || ''} ${doc.description || ''}`.toLowerCase();
      if (searchableText.includes(message)) {
        console.log('✅ Local webpage contextual match:', doc.name);
        return {
          text: `I found information about this on our website: ${doc.content.substring(0, 150)}... For more details, you can visit the full page.`,
          confidence: 0.65,
          type: 'webpage_match',
          source: `Website: ${doc.name}`,
          url: doc.url
        };
      }
    }

    // Check if this is a specific question that should have an answer
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
    const hasQuestionWord = questionWords.some(word => message.includes(word));
    const hasQuestionMark = userMessage.includes('?');
    const specificTopics = [
      'policy', 'return', 'refund', 'shipping', 'delivery', 'payment', 
      'account', 'order', 'product', 'service', 'hours', 'contact',
      'support', 'help', 'price', 'cost', 'fee', 'warranty', 'guarantee'
    ];
    const hasSpecificTopic = specificTopics.some(topic => message.includes(topic));
    const isSpecificQuestion = hasQuestionWord || hasQuestionMark || hasSpecificTopic;
    
    console.log('❌ No local matches found - generating honest fallback');
    
    if (isSpecificQuestion) {
      // For specific questions, be honest about not having information
      return {
        text: "I don't have specific information about that topic in my current knowledge base. For accurate details, I'd recommend speaking with one of our human agents who can provide you with the most up-to-date information.",
        confidence: 0.8,
        type: 'honest_no_match',
        source: 'local_honest_fallback'
      };
    } else {
      // For unclear questions, ask for clarification
      return {
        text: "I'm not sure I understand what you're looking for. Could you provide more details or rephrase your question? Alternatively, I can connect you with a human agent who might be better able to assist you.",
        confidence: 0.7,
        type: 'clarification_needed',
        source: 'local_clarification_request'
      };
    }
  }

  // Enhanced quick replies based on message type and context
  function getQuickReplies(messageType, shouldEscalate = false) {
    if (shouldEscalate) {
      return ['Yes, connect me', 'No, continue with bot', 'Let me try again'];
    }
    
    switch (messageType) {
      case 'greeting':
      case 'api_greeting':
      case 'local_greeting':
        return ['I have a question', 'I need help', 'Browse topics'];
      case 'escalation':
      case 'escalation_detection':
        return ['Yes, connect me', 'No, continue with bot', 'Let me try again'];
      case 'fallback':
      case 'emergency_fallback':
        return ['Try different question', 'Speak to human', 'Start over'];
      case 'webpage_match':
        return ['Tell me more', 'Visit full page', 'Ask something else'];
      case 'qa_database':
        return ['That helps!', 'Tell me more', 'Ask another question'];
      case 'knowledge_base':
        return ['More details', 'Related topics', 'Ask something else'];
      case 'openai':
      case 'openai+kb':
        return ['That\'s helpful', 'Follow up question', 'New topic'];
      default:
        return ['Continue', 'New question', 'Speak to human'];
    }
  }
  
  // Add quick replies to the chat interface
  function addQuickReplies(replies) {
    if (!replies || replies.length === 0) return;
    
    const messagesContainer = document.getElementById('chatbot-messages');
    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'chatbot-quick-replies-container';
    quickRepliesDiv.innerHTML = `
      <div class="chatbot-quick-replies ${config.theme === 'dark' ? 'theme-dark' : ''}">
        ${replies.map(reply => 
          `<button class="chatbot-quick-reply ${config.theme === 'dark' ? 'theme-dark' : ''}" 
                   onclick="handleQuickReply('${reply.replace(/'/g, "\\'")}')">  
             ${reply}
           </button>`
        ).join('')}
      </div>
    `;
    
    // Remove any existing quick replies first
    const existingReplies = messagesContainer.querySelector('.chatbot-quick-replies-container');
    if (existingReplies) {
      existingReplies.remove();
    }
    
    messagesContainer.appendChild(quickRepliesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Create widget HTML
  function createWidget() {
    const avatarIcon = getAvatarIcon(config.avatar);
    
    return `
      <div class="chatbot-widget position-${config.position}" id="chatbot-widget">
        <div class="chatbot-container ${config.theme === 'dark' ? 'theme-dark' : ''}" id="chatbot-container">
          <div class="chatbot-header">
            <div class="chatbot-header-info">
              <div class="chatbot-avatar">${avatarIcon}</div>
              <div class="chatbot-header-text">
                <h3>${enhancedConfig.botName}</h3>
                <p>Online • Typically replies instantly</p>
              </div>
            </div>
            <button class="chatbot-close" id="chatbot-close">×</button>
          </div>
          
          <div class="chatbot-messages ${config.theme === 'dark' ? 'theme-dark' : ''}" id="chatbot-messages">
            <!-- Messages will be added here -->
          </div>
          
          <div class="chatbot-input-container ${config.theme === 'dark' ? 'theme-dark' : ''}">
            <form class="chatbot-input-form" id="chatbot-form">
              <textarea 
                class="chatbot-input ${config.theme === 'dark' ? 'theme-dark' : ''}" 
                id="chatbot-input" 
                placeholder="Type your message..."
                rows="1"
              ></textarea>
              <button type="submit" class="chatbot-send" id="chatbot-send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          </div>
          
          ${config.showPoweredBy ? `
            <div class="chatbot-powered-by ${config.theme === 'dark' ? 'theme-dark' : ''}">
              Powered by ChatBot Platform
            </div>
          ` : ''}
        </div>
        
        <button class="chatbot-toggle" id="chatbot-toggle">
          <span id="chatbot-toggle-icon">💬</span>
        </button>
      </div>
    `;
  }

  function getAvatarIcon(avatar) {
    const avatarMap = {
      'robot': '🤖',
      'assistant': '👨‍💼',
      'support': '👩‍💻',
      'friendly': '😊',
      'professional': '🎯',
      'tech': '⚡',
      'helper': '🙋‍♀️',
      'mascot': '🦄'
    };
    return avatarMap[avatar] || '🤖';
  }

  // Add message to chat with enhanced metadata support including operating hours
  function addMessage(text, isUser = false, options = {}) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageId = Date.now() + Math.random();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'} ${config.theme === 'dark' ? 'theme-dark' : ''}`;
    
    const confidence = options.confidence;
    const source = options.source;
    const shouldEscalate = options.shouldEscalate;
    const knowledgeUsed = options.knowledgeUsed;
    const knowledgeSources = options.knowledgeSources || [];
    const isOffline = options.isOffline;
    const operatingHours = options.operatingHours;
    const nextOpening = options.nextOpening;
    
    let messageContent = `
      <div class="chatbot-message-content ${isOffline ? 'offline-message' : ''}">
        ${text}
        ${confidence && confidence < 0.7 ? `<div class="chatbot-confidence">Confidence: ${Math.round(confidence * 100)}%</div>` : ''}
        ${source ? `<div class="chatbot-source-indicator">${getSourceIcon(source)} ${source}${knowledgeUsed ? ' + Knowledge Base' : ''}</div>` : ''}
        ${shouldEscalate ? `<div style="color: #f59e0b; font-size: 11px; margin-top: 4px;">⚡ Escalation recommended</div>` : ''}
        ${knowledgeSources.length > 0 ? `<div style="color: #6b7280; font-size: 10px; margin-top: 2px;">Sources: ${knowledgeSources.join(', ')}</div>` : ''}
        ${isOffline && operatingHours ? `
          <div class="operating-hours-info" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 12px;">
            <div style="color: #92400e; font-weight: 500;">📅 Our Hours: ${operatingHours.start} - ${operatingHours.end}</div>
            ${nextOpening ? `<div style="color: #92400e; margin-top: 2px;">⏰ Next available: ${nextOpening.timeUntil}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
    
    messageDiv.innerHTML = messageContent;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    messages.push({
      id: messageId,
      text,
      isUser,
      timestamp: new Date(),
      options
    });
  }
  
  // Get source icon based on response source
  function getSourceIcon(source) {
    if (source.includes('openai+kb')) return '🧠'; // Brain - AI with knowledge
    if (source.includes('openai')) return '🤖'; // Robot - AI only  
    if (source.includes('qa_database')) return '📊'; // Database
    if (source.includes('knowledge_base')) return '📚'; // Books
    if (source.includes('escalation')) return '🚨'; // Alert
    if (source.includes('api_greeting')) return '👋'; // Wave
    if (source.includes('local')) return '🟡'; // Yellow circle (fallback)
    if (source.includes('fallback')) return '❓'; // Question mark
    return '💬'; // Speech bubble (default)
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="chatbot-typing ${config.theme === 'dark' ? 'theme-dark' : ''}">
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Handle user message with real API calls and operating hours awareness
  async function handleUserMessage(text) {
    if (!text.trim()) return;
    
    // Add user message
    addMessage(text, true);
    
    // Clear input
    document.getElementById('chatbot-input').value = '';
    
    // Show typing
    showTyping();
    
    try {
      // First try OpenAI API
      const response = await callChatAPI(text);
      
      // Hide typing
      hideTyping();
      
      // ✅ Handle operating hours responses
      if (response.isOffline) {
        addMessage(response.message, false, {
          confidence: response.confidence,
          source: response.source,
          shouldEscalate: response.shouldEscalate,
          knowledgeUsed: response.knowledgeUsed,
          knowledgeSources: response.knowledgeSources,
          isOffline: true,
          operatingHours: response.operatingHours,
          nextOpening: response.nextOpening
        });
        
        // Add quick replies for offline hours
        addQuickReplies(['Leave a message', 'Get notified when online', 'View hours']);
      } else {
        // Normal online response
        addMessage(response.message, false, {
          confidence: response.confidence,
          source: response.source,
          shouldEscalate: response.shouldEscalate,
          knowledgeUsed: response.knowledgeUsed,
          knowledgeSources: response.knowledgeSources,
          isOffline: false
        });
        
        // Add context-aware quick replies
        const quickReplies = getQuickReplies(response.source, response.shouldEscalate);
        if (quickReplies.length > 0) {
          addQuickReplies(quickReplies);
        }
      }
      
    } catch (error) {
      console.error('Chat API failed, using fallback:', error);
      
      // Hide typing
      hideTyping();
      
      // Try Q&A matching fallback
      try {
        const fallbackResponse = await callQAMatchAPI(text);
        
        // Handle offline responses in fallback too
        if (fallbackResponse.isOffline) {
          addMessage(fallbackResponse.message, false, {
            confidence: fallbackResponse.confidence,
            source: fallbackResponse.source + ' (offline)',
            shouldEscalate: fallbackResponse.shouldEscalate,
            isOffline: true
          });
        } else {
          addMessage(fallbackResponse.message, false, {
            confidence: fallbackResponse.confidence,
            source: fallbackResponse.source + ' (offline)',
            shouldEscalate: fallbackResponse.shouldEscalate,
            isOffline: false
          });
        }
      } catch (fallbackError) {
        // Final fallback - local pattern matching
        console.error('All APIs failed, using local fallback:', fallbackError);
        const response = generateLocalBotResponse(text);
        addMessage(response.text, false, {
          confidence: response.confidence,
          source: response.source + ' (local)',
          shouldEscalate: false,
          isOffline: false
        });
      }
    }
  }

  // Handle quick reply
  window.handleQuickReply = function(reply) {
    handleUserMessage(reply);
  };

  // Toggle widget with operating hours awareness
  async function toggleWidget() {
    const container = document.getElementById('chatbot-container');
    const toggleIcon = document.getElementById('chatbot-toggle-icon');
    
    isOpen = !isOpen;
    
    if (isOpen) {
      container.classList.add('open');
      toggleIcon.textContent = '×';
      
      // Initialize conversation if this is the first time
      if (messages.length === 0) {
        try {
          // Try to start conversation with API (includes operating hours check)
          const response = await fetch('/api/chat/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId: conversationId,
              organizationId: null
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Handle both online and offline greetings
              setTimeout(() => {
                if (data.data.isOffline) {
                  addMessage(data.data.greeting, false, {
                    source: 'api_greeting',
                    confidence: 1.0,
                    isOffline: true,
                    operatingHours: data.data.operatingHours,
                    nextOpening: data.data.nextOpening
                  });
                  
                  // Add offline quick replies
                  addQuickReplies(['Leave a message', 'Get notified when online', 'View hours']);
                } else {
                  addMessage(data.data.greeting, false, {
                    source: 'api_greeting',
                    confidence: 1.0,
                    isOffline: false
                  });
                  
                  // Add welcome quick replies
                  addQuickReplies(['I have a question', 'I need help', 'Browse topics']);
                }
              }, 500);
            } else {
              throw new Error('API initialization failed');
            }
          } else {
            throw new Error('API not available');
          }
        } catch (error) {
          console.warn('API initialization failed, using local greeting:', error);
          // Fallback to local greeting (no operating hours check available)
          setTimeout(() => {
            addMessage(enhancedConfig.greeting, false, {
              source: 'local_greeting',
              confidence: 0.8,
              isOffline: false
            });
            
            // Add basic quick replies
            addQuickReplies(['I have a question', 'I need help', 'Ask something']);
          }, 500);
        }
      }
    } else {
      container.classList.remove('open');
      toggleIcon.textContent = '💬';
    }
  }

  // Auto-resize textarea
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  // Initialize widget
  function init() {
    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Create widget container
    let container = document.getElementById('chatbot-widget');
    if (!container) {
      container = document.createElement('div');
      container.innerHTML = createWidget();
      document.body.appendChild(container.firstElementChild);
    }
    
    // Event listeners
    document.getElementById('chatbot-toggle').addEventListener('click', toggleWidget);
    document.getElementById('chatbot-close').addEventListener('click', toggleWidget);
    
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserMessage(input.value);
    });
    
    input.addEventListener('input', (e) => {
      autoResizeTextarea(e.target);
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage(input.value);
      }
    });
    
    // Auto-open if configured
    if (config.autoOpen) {
      setTimeout(() => {
        if (!isOpen) {
          toggleWidget();
        }
      }, (config.autoOpenDelay || 3) * 1000);
    }
    
    console.log('ChatBot Widget v2.0.0 initialized successfully with AI integration and API support');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();