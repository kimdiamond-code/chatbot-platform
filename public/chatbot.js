/**
 * ChatBot Platform - Embeddable Widget
 * This file creates a functional chat widget that can be embedded on any website
 */

(function() {
    'use strict';

    // Prevent multiple initializations
    if (window.ChatBotWidget) {
        return;
    }

    class ChatBotWidget {
        constructor(config) {
            this.config = {
                botId: 'default',
                apiUrl: 'http://localhost:5173/api',
                position: 'bottom-right',
                theme: 'light',
                primaryColor: '#3B82F6',
                size: 'medium',
                autoOpen: false,
                greeting: 'Hello! How can I help you today?',
                showBranding: true,
                ...config
            };

            this.isOpen = false;
            this.messages = [];
            this.conversationId = this.generateConversationId();
            this.isTyping = false;

            this.init();
        }

        generateConversationId() {
            return 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        init() {
            this.createStyles();
            this.createWidget();
            this.bindEvents();
            
            if (this.config.autoOpen) {
                setTimeout(() => this.openChat(), 1000);
            }
        }

        createStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .chatbot-widget {
                    position: fixed;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }

                .chatbot-widget.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                .chatbot-widget.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .chatbot-widget.top-right {
                    top: 20px;
                    right: 20px;
                }

                .chatbot-widget.top-left {
                    top: 20px;
                    left: 20px;
                }

                .chatbot-widget.center {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .chatbot-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${this.config.primaryColor};
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                }

                .chatbot-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                .chatbot-button.pulse {
                    animation: chatbot-pulse 2s infinite;
                }

                @keyframes chatbot-pulse {
                    0% { box-shadow: 0 0 0 0 ${this.config.primaryColor}80; }
                    70% { box-shadow: 0 0 0 10px transparent; }
                    100% { box-shadow: 0 0 0 0 transparent; }
                }

                .chatbot-chat-window {
                    position: absolute;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chatbot-widget.small .chatbot-chat-window { width: 280px; height: 400px; }
                .chatbot-widget.large .chatbot-chat-window { width: 420px; height: 600px; }

                .chatbot-widget.bottom-right .chatbot-chat-window,
                .chatbot-widget.top-right .chatbot-chat-window {
                    right: 0;
                }

                .chatbot-widget.bottom-left .chatbot-chat-window,
                .chatbot-widget.top-left .chatbot-chat-window {
                    left: 0;
                }

                .chatbot-widget.bottom-right .chatbot-chat-window,
                .chatbot-widget.bottom-left .chatbot-chat-window {
                    bottom: 80px;
                }

                .chatbot-widget.top-right .chatbot-chat-window,
                .chatbot-widget.top-left .chatbot-chat-window {
                    top: 80px;
                }

                .chatbot-header {
                    background: ${this.config.primaryColor};
                    color: white;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: between;
                }

                .chatbot-header-title {
                    flex: 1;
                    font-weight: 600;
                    font-size: 16px;
                }

                .chatbot-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                }

                .chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .chatbot-message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .chatbot-message.user {
                    background: ${this.config.primaryColor};
                    color: white;
                    align-self: flex-end;
                }

                .chatbot-message.bot {
                    background: #f3f4f6;
                    color: #374151;
                    align-self: flex-start;
                }

                .chatbot-message.system {
                    background: #e5e7eb;
                    color: #6b7280;
                    align-self: center;
                    font-size: 12px;
                    font-style: italic;
                }

                .chatbot-typing {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 12px 16px;
                    color: #6b7280;
                    font-size: 14px;
                }

                .chatbot-typing-dots {
                    display: flex;
                    gap: 3px;
                }

                .chatbot-typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #9ca3af;
                    border-radius: 50%;
                    animation: chatbot-typing-bounce 1.4s infinite;
                }

                .chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes chatbot-typing-bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                }

                .chatbot-input-area {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 8px;
                }

                .chatbot-input {
                    flex: 1;
                    border: 1px solid #d1d5db;
                    border-radius: 20px;
                    padding: 10px 16px;
                    font-size: 14px;
                    outline: none;
                    resize: none;
                }

                .chatbot-input:focus {
                    border-color: ${this.config.primaryColor};
                }

                .chatbot-send-btn {
                    background: ${this.config.primaryColor};
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .chatbot-send-btn:hover {
                    transform: scale(1.1);
                }

                .chatbot-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .chatbot-branding {
                    padding: 8px 16px;
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                    border-top: 1px solid #e5e7eb;
                }

                .chatbot-branding a {
                    color: ${this.config.primaryColor};
                    text-decoration: none;
                }

                .chatbot-message-time {
                    font-size: 11px;
                    color: #9ca3af;
                    margin-top: 4px;
                }

                .chatbot-message-source {
                    font-size: 10px;
                    color: #6b7280;
                    margin-top: 2px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                @media (max-width: 480px) {
                    .chatbot-chat-window {
                        width: calc(100vw - 40px) !important;
                        height: calc(100vh - 120px) !important;
                        left: 20px !important;
                        right: 20px !important;
                        bottom: 80px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        createWidget() {
            const widget = document.createElement('div');
            widget.className = `chatbot-widget ${this.config.position} ${this.config.size}`;
            
            widget.innerHTML = `
                <button class="chatbot-button pulse" id="chatbot-toggle">
                    💬
                </button>
                <div class="chatbot-chat-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-title">ChatBot</div>
                        <button class="chatbot-close-btn" id="chatbot-close">×</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-message bot">
                            ${this.config.greeting}
                        </div>
                    </div>
                    <div class="chatbot-input-area">
                        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type your message...">
                        <button class="chatbot-send-btn" id="chatbot-send">→</button>
                    </div>
                    ${this.config.showBranding ? `
                        <div class="chatbot-branding">
                            Powered by <a href="#" target="_blank">ChatBot Platform</a>
                        </div>
                    ` : ''}
                </div>
            `;

            document.body.appendChild(widget);
            this.widget = widget;
        }

        bindEvents() {
            const toggleBtn = this.widget.querySelector('#chatbot-toggle');
            const closeBtn = this.widget.querySelector('#chatbot-close');
            const sendBtn = this.widget.querySelector('#chatbot-send');
            const input = this.widget.querySelector('#chatbot-input');

            toggleBtn.addEventListener('click', () => this.toggleChat());
            closeBtn.addEventListener('click', () => this.closeChat());
            sendBtn.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            input.addEventListener('input', (e) => {
                sendBtn.disabled = !e.target.value.trim();
            });
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            const window = this.widget.querySelector('#chatbot-window');
            const button = this.widget.querySelector('#chatbot-toggle');
            
            window.style.display = 'flex';
            button.classList.remove('pulse');
            button.textContent = '×';
            this.isOpen = true;

            // Focus input
            setTimeout(() => {
                this.widget.querySelector('#chatbot-input').focus();
            }, 100);
        }

        closeChat() {
            const window = this.widget.querySelector('#chatbot-window');
            const button = this.widget.querySelector('#chatbot-toggle');
            
            window.style.display = 'none';
            button.textContent = '💬';
            this.isOpen = false;
        }

        async sendMessage() {
            const input = this.widget.querySelector('#chatbot-input');
            const message = input.value.trim();
            
            if (!message) return;

            // Add user message
            this.addMessage(message, 'user');
            input.value = '';

            // Show typing indicator
            this.showTyping();

            try {
                // Call the chatbot API
                const response = await this.callChatbotAPI(message);
                
                // Hide typing indicator
                this.hideTyping();
                
                // Add bot response
                this.addMessage(response.message, 'bot', response);
                
            } catch (error) {
                console.error('Chatbot API error:', error);
                this.hideTyping();
                this.addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'bot');
            }
        }

        async callChatbotAPI(message) {
            // In a real implementation, this would call your actual API
            // For now, we'll simulate the API call with demo responses
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    const demoResponses = [
                        {
                            message: "Thanks for your message! I'm a demo bot. In the real implementation, I'd connect to your ChatBot Platform API to provide intelligent responses.",
                            confidence: 0.8,
                            source: 'demo'
                        },
                        {
                            message: "I understand you need help. Let me assist you with that. This is a demonstration of how the widget works when embedded on your website.",
                            confidence: 0.9,
                            source: 'demo'
                        },
                        {
                            message: "That's a great question! Once connected to your Bot Builder configuration, I'll be able to provide personalized responses based on your knowledge base.",
                            confidence: 0.85,
                            source: 'demo'
                        }
                    ];
                    
                    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
                    resolve(randomResponse);
                }, 1000 + Math.random() * 2000); // Realistic delay
            });
        }

        addMessage(text, type, metadata = {}) {
            const messagesContainer = this.widget.querySelector('#chatbot-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message ${type}`;
            
            let messageContent = text;
            
            // Add metadata for bot messages
            if (type === 'bot' && metadata.source) {
                messageContent += `
                    <div class="chatbot-message-source">
                        ${this.getSourceIcon(metadata.source)} ${metadata.confidence ? `${Math.round(metadata.confidence * 100)}%` : ''}
                    </div>
                `;
            }
            
            messageDiv.innerHTML = messageContent;
            messagesContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Store message
            this.messages.push({ text, type, timestamp: Date.now(), metadata });
        }

        getSourceIcon(source) {
            switch (source) {
                case 'openai+kb': return '🧠';
                case 'openai': return '🤖';
                case 'knowledge_base': return '📚';
                case 'demo': return '🎯';
                default: return '💬';
            }
        }

        showTyping() {
            if (this.isTyping) return;
            
            const messagesContainer = this.widget.querySelector('#chatbot-messages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chatbot-typing';
            typingDiv.id = 'chatbot-typing-indicator';
            typingDiv.innerHTML = `
                Typing
                <div class="chatbot-typing-dots">
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                </div>
            `;
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            this.isTyping = true;
        }

        hideTyping() {
            const typingIndicator = this.widget.querySelector('#chatbot-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.isTyping = false;
        }
    }

    // Initialize widget when DOM is ready
    function initChatBotWidget() {
        // Get configuration from window.chatbotConfig or use defaults
        const config = window.chatbotConfig || {};
        
        // Create widget instance
        const widget = new ChatBotWidget(config);
        
        // Store reference globally
        window.ChatBotWidget = widget;
        
        console.log('ChatBot Widget initialized successfully');
    }

    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatBotWidget);
    } else {
        initChatBotWidget();
    }

})();