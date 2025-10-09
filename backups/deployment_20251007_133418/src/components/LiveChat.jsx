import React, { useState, useEffect } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useConversations } from '../hooks/useConversations'
import ProductMessage from './shop/ProductMessage'

export default function LiveChat() {
  const { conversations, loading: loadingConversations, createConversation, creating } = useConversations()
  const [selectedConversation, setSelectedConversation] = useState(null)
  
  // Auto-select first conversation when loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
    }
  }, [conversations, selectedConversation])
  
  const {
    messages,
    sendMessage,
    sendCustomerMessage,
    handleActionClick,
    loading: messagesLoading,
    smartBotEnabled
  } = useMessages(selectedConversation?.id)

  const testSmartResponse = async () => {
    if (!selectedConversation) {
      alert('No conversations available')
      return
    }

    const testMessages = [
      "Hi, where is my order #12345?",
      "I need help finding some good headphones",
      "Can you recommend some speakers?",
      "Show me some wireless products",
      "Looking for bluetooth accessories"
    ]

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]

    try {
      console.log('🧪 Sending test message:', randomMessage)
      await sendCustomerMessage(randomMessage)
      console.log('✅ Test message sent successfully')
    } catch (error) {
      console.error('❌ Error sending test message:', error)
      alert('Failed to send test message: ' + error.message)
    }
  }
  
  const handleCreateConversation = async () => {
    try {
      const newConv = await createConversation({
        email: 'new.customer@example.com',
        name: 'New Customer',
        phone: '+1234567890',
        channel: 'web'
      })
      setSelectedConversation(newConv)
      console.log('✅ New conversation created')
    } catch (error) {
      console.error('❌ Failed to create conversation:', error)
      alert('Failed to create conversation')
    }
  }

  // Handle add to cart from product cards
  const handleAddToCart = async (cartItem) => {
    console.log('🛒 Add to cart requested:', cartItem)
    
    if (!selectedConversation) {
      alert('No conversation selected')
      return
    }

    try {
      await handleActionClick({
        type: 'add_to_cart',
        data: cartItem
      })
      console.log('✅ Item added to cart')
    } catch (error) {
      console.error('❌ Add to cart failed:', error)
      alert('Failed to add to cart: ' + error.message)
    }
  }

  return (
    <div className="flex h-full bg-white">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <button
              onClick={handleCreateConversation}
              disabled={creating}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
              title="Create new conversation"
            >
              ➕
            </button>
          </div>
          
          {/* Test Button - Shopify Demo Mode */}
          <button
            onClick={testSmartResponse}
            disabled={!selectedConversation}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧪 Test Shopify Demo
          </button>
          <p className="text-xs text-gray-500 mb-2">
            Tests product search and add-to-cart in demo mode
          </p>
          
          {/* Demo Mode Indicator */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
            <div className="flex items-center mb-1">
              <span className="text-yellow-700 font-medium">🎭 DEMO MODE</span>
            </div>
            <p className="text-yellow-600">
              Using mock Shopify data. Connect real store in Settings.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="mb-2">No conversations yet</p>
              <button
                onClick={handleCreateConversation}
                className="text-blue-600 hover:text-blue-700"
              >
                Create first conversation
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {conv.customer_name || 'Anonymous'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    conv.status === 'active' ? 'bg-green-100 text-green-700' :
                    conv.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {conv.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.customer_email || 'No email'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.customer_name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.customer_email || 'No email'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {smartBotEnabled && (
                    <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">
                      🤖 AI Active
                    </div>
                  )}
                  <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
                    🎭 Demo Mode
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  // Check if message has products
                  const hasProducts = msg.metadata?.products && msg.metadata.products.length > 0
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="max-w-[75%] space-y-2">
                        {/* Text Message */}
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            msg.sender_type === 'user'
                              ? 'bg-gray-100 text-gray-900'
                              : msg.sender_type === 'bot'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {/* Product Display */}
                        {hasProducts && (
                          <div className="mt-2">
                            <ProductMessage 
                              products={msg.metadata.products}
                              onAddToCart={handleAddToCart}
                            />
                          </div>
                        )}

                        {/* Demo Mode Indicator for Cart Actions */}
                        {msg.metadata?.demoMode && msg.metadata?.action === 'add_to_cart' && (
                          <div className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded border border-yellow-200">
                            🎭 Demo Mode: Cart not saved to real Shopify
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 space-y-4 py-8">
                  <div className="text-6xl">🛍️</div>
                  <h3 className="text-lg font-semibold">Test Shopify Demo Mode</h3>
                  <p className="text-sm max-w-md mx-auto">
                    Click "Test Shopify Demo" to send a test message that will trigger product recommendations
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto text-left">
                    <p className="text-sm font-medium text-blue-900 mb-2">Test Phrases:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• "Looking for headphones"</li>
                      <li>• "Show me speakers"</li>
                      <li>• "Recommend bluetooth products"</li>
                      <li>• "Need wireless accessories"</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message or test phrase..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendCustomerMessage(e.target.value.trim())
                      e.target.value = ''
                    }
                  }}
                />
                <button
                  onClick={testSmartResponse}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                >
                  🧪 Demo Test
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Shopify Demo Ready!
              </h3>
              <p className="text-gray-500 mb-4">
                Test product display and add-to-cart functionality with mock data
              </p>
              {conversations.length > 0 && (
                <p className="text-sm text-blue-600 mb-4">
                  ← Select a conversation to start testing
                </p>
              )}
              {smartBotEnabled && (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
                    🤖 Smart Bot Active
                  </div>
                  <div className="text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
                    🎭 Demo Mode - Analytics Tracking Enabled
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
