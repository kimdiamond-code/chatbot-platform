import React, { useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { User, Bot, Zap, AlertCircle } from 'lucide-react'
import Loading from '../ui/Loading'
import IntegrationResponse from './IntegrationResponse'

const MessageList = ({ messages, loading, onActionClick }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p>No messages in this conversation</p>
          <p className="text-sm mt-1">Send a message to get started</p>
        </div>
      </div>
    )
  }

  const handleActionClick = (action) => {
    console.log('🎯 Action clicked:', action);
    
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Default action handling
      switch (action.type) {
        case 'escalate':
          console.log('🚀 Escalating to human agent...');
          // Could trigger escalation modal or update conversation status
          break;
        case 'quick_reply':
          console.log('💬 Quick reply:', action.value);
          // Could auto-fill message input
          break;
        case 'callback':
          console.log('📞 Callback requested');
          // Could trigger callback form
          break;
        default:
          console.log('🔧 Unhandled action type:', action.type);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isAgent = message.sender_type === 'agent'
        const isBot = message.sender_type === 'bot'
        const isSmartBot = isBot && (
          message.message_type === 'smart_response' || 
          message.metadata?.source === 'smart_integration' ||
          message.metadata?.integrationsUsed?.length > 0
        )
        const isEscalated = message.metadata?.escalated || message.metadata?.requiresEscalation
        
        return (
          <div
            key={message.id}
            className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${
              isAgent ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isAgent 
                  ? 'bg-royal-500 text-white'
                  : isSmartBot
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : isBot
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {isAgent ? (
                  <User className="w-4 h-4" />
                ) : isSmartBot ? (
                  <Zap className="w-4 h-4" />
                ) : isBot ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              
              {/* Message Content */}
              <div className={`rounded-lg ${
                isAgent
                  ? 'bg-royal-500 text-white px-3 py-2'
                  : isSmartBot
                  ? '' // IntegrationResponse handles its own styling
                  : 'bg-gray-100 text-gray-900 px-3 py-2'
              }`}>
                
                {/* Smart Bot Response */}
                {isSmartBot ? (
                  <div>
                    <IntegrationResponse 
                      message={{
                        text: message.content,
                        actions: message.metadata?.actions || [],
                        metadata: message.metadata || {}
                      }}
                      onActionClick={handleActionClick}
                    />
                    
                    {/* Escalation indicator */}
                    {isEscalated && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>Escalated to human agent</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Message */
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Basic bot indicators */}
                    {isBot && message.metadata?.source && (
                      <div className="mt-1 text-xs opacity-75">
                        <span className="text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                          {message.metadata.source === 'openai' ? '🤖 AI' : 
                           message.metadata.source === 'knowledge_base' ? '📚 KB' : 
                           message.metadata.source === 'fallback' ? '🔄 Auto' : 'Bot'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Timestamp */}
                <p className={`text-xs mt-2 ${
                  isAgent 
                    ? 'text-royal-100' 
                    : isSmartBot 
                    ? 'text-gray-500 mt-1' 
                    : 'text-gray-500'
                }`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  
                  {/* Confidence indicator for smart responses */}
                  {isSmartBot && message.metadata?.confidence && (
                    <span className="ml-2">
                      • {Math.round(message.metadata.confidence * 100)}% confidence
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
