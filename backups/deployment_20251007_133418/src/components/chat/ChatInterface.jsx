import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useConversations } from '../../hooks/useConversations'
import { useMessages } from '../../hooks/useMessages'
import ConversationList from './ConversationList'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import CustomerInfo from './CustomerInfo'
import { MessageSquare, User, Zap, TestTube, Play } from 'lucide-react'

const ChatInterface = () => {
  const { conversationId } = useParams()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  
  const { conversations, loading: conversationsLoading } = useConversations()
  const { 
    messages, 
    sendMessage, 
    sendCustomerMessage,
    handleActionClick,
    loading: messagesLoading,
    smartBotEnabled
  } = useMessages(selectedConversation?.id || conversationId)

  useEffect(() => {
    if (conversationId && conversations) {
      const conversation = conversations.find(c => c.id === conversationId)
      setSelectedConversation(conversation)
    }
  }, [conversationId, conversations])

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    window.history.pushState(null, '', `/chat/${conversation.id}`)
  }

  const handleSendMessage = async (content, type = 'text') => {
    if (!selectedConversation) return
    
    try {
      await sendMessage({
        conversation_id: selectedConversation.id,
        content,
        sender_type: 'agent',
        message_type: type
      })
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  // Test smart responses
  const testSmartResponse = async () => {
    // Auto-select first conversation if none selected
    let targetConversation = selectedConversation
    
    if (!targetConversation && conversations && conversations.length > 0) {
      targetConversation = conversations[0]
      setSelectedConversation(targetConversation)
      window.history.pushState(null, '', `/chat/${targetConversation.id}`)
      console.log('✅ Auto-selected first conversation:', targetConversation.id)
    }
    
    if (!targetConversation) {
      alert('No conversations available. Demo conversations should load automatically.')
      return
    }
    
    const testMessages = [
      "Hi, where is my order #12345?",
      "I need help finding some good headphones",
      "I'm frustrated with this service, I want to speak to a manager!",
      "I was charged twice for my order, this is unacceptable",
      "Can you recommend some speakers?",
      "My order hasn't arrived yet and I'm really upset about this"
    ]
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]
    
    try {
      await sendCustomerMessage(randomMessage)
      console.log('✅ Test customer message sent:', randomMessage)
    } catch (error) {
      console.error('❌ Error sending test message:', error)
      alert('Error sending test message: ' + error.message)
    }
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversations
            </h2>
            
            {/* Smart bot status indicator */}
            {smartBotEnabled && (
              <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <Zap className="w-3 h-3 mr-1" />
                Smart Bot
              </div>
            )}
          </div>
          
          {/* Always visible test button */}
          <button
            onClick={testSmartResponse}
            className="w-full text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center mb-2 font-medium"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Smart Response
          </button>
          
          <div className="text-xs text-gray-500 mb-2">
            Click above to test (auto-selects first conversation)
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations || []}
            selectedConversation={selectedConversation}
            onSelect={handleConversationSelect}
            loading={conversationsLoading}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedConversation.customer?.name || 'Anonymous Customer'}
                    </h3>
                    {selectedConversation.status === 'escalated' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        Escalated
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.customer?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Quick test button in header */}
                <button
                  onClick={testSmartResponse}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center"
                  title="Send test customer message"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Test
                </button>
                
                {smartBotEnabled && (
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Active
                  </div>
                )}
                <button
                  onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages || []}
                loading={messagesLoading}
                onActionClick={handleActionClick}
              />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200">
              <MessageInput onSend={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Conversation Selected
              </h3>
              <p className="text-gray-500 mb-4">
                Click a conversation on the left, or click "Test Smart Response" to auto-select
              </p>
              {smartBotEnabled && (
                <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Smart bot responses enabled with integrations
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Info Panel */}
      {showCustomerInfo && selectedConversation && (
        <div className="w-80 border-l border-gray-200">
          <CustomerInfo
            customer={selectedConversation.customer}
            conversation={selectedConversation}
            onClose={() => setShowCustomerInfo(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ChatInterface
