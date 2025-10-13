import React, { useState, useEffect } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useConversations } from '../hooks/useConversations'
import ProductMessage from './shop/ProductMessage'

export default function LiveChat() {
  const { 
    conversations, 
    loading: loadingConversations, 
    createConversation, 
    creating,
    deleteConversation,
    deleting,
    clearAllConversations,
    clearingAll,
    refetch
  } = useConversations()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [shopifyStatus, setShopifyStatus] = useState('checking')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState(null)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  
  // Check Shopify connection status
  useEffect(() => {
    const checkShopifyStatus = async () => {
      try {
        const { integrationOrchestrator } = await import('../services/chat/integrationOrchestrator')
        const status = integrationOrchestrator.getIntegrationStatus()
        setShopifyStatus(status.shopify.connected ? 'connected' : 'demo')
      } catch (error) {
        console.error('Failed to check Shopify status:', error)
        setShopifyStatus('demo')
      }
    }
    
    checkShopifyStatus()
    
    // Re-check every 30 seconds in case status changes
    const interval = setInterval(checkShopifyStatus, 30000)
    return () => clearInterval(interval)
  }, [])
  
  // Auto-select first conversation when loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
    }
  }, [conversations, selectedConversation])
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      (conv.customer_name || '').toLowerCase().includes(query) ||
      (conv.customer_email || '').toLowerCase().includes(query) ||
      (conv.customer_phone || '').toLowerCase().includes(query)
    )
  })
  
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

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId)
      // Clear selection if we deleted the selected conversation
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
      setShowDeleteConfirm(false)
      setConversationToDelete(null)
      console.log('✅ Conversation deleted')
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error)
      alert('Failed to delete conversation')
    }
  }

  const handleClearAllConversations = async () => {
    try {
      await clearAllConversations()
      setSelectedConversation(null)
      setShowClearAllConfirm(false)
      console.log('✅ All conversations cleared')
    } catch (error) {
      console.error('❌ Failed to clear conversations:', error)
      alert('Failed to clear conversations')
    }
  }

  const handleRefreshShopify = async () => {
    setShopifyStatus('checking')
    try {
      const { integrationOrchestrator } = await import('../services/chat/integrationOrchestrator')
      await integrationOrchestrator.refreshIntegrations()
      const status = integrationOrchestrator.getIntegrationStatus()
      setShopifyStatus(status.shopify.connected ? 'connected' : 'demo')
    } catch (error) {
      console.error('Failed to refresh Shopify status:', error)
      setShopifyStatus('demo')
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
      <div className="w-80 border-r border-gray-200 flex flex-col max-h-screen">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <p className="text-xs text-gray-500">
                {loadingConversations ? 'Loading...' : `${filteredConversations.length} of ${conversations.length}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateConversation}
                disabled={creating}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                title="Create new conversation"
                aria-label="Create new conversation"
              >
                ➕
              </button>
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(true)}
                disabled={clearingAll || conversations.length === 0}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
                title="Clear all conversations"
                aria-label="Clear all conversations"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-3">
            <label htmlFor="conversation-search" className="sr-only">Search conversations</label>
            <input
              type="text"
              id="conversation-search"
              name="search"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Test Button - Shopify Demo Mode */}
          <button
            type="button"
            onClick={testSmartResponse}
            disabled={!selectedConversation}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧪 Test Shopify Demo
          </button>
          <p className="text-xs text-gray-500 mb-2">
            Tests product search and add-to-cart in demo mode
          </p>
          
          {/* Shopify Status Indicator */}
          {shopifyStatus === 'checking' ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                <span className="text-gray-700 font-medium">Checking Shopify...</span>
              </div>
            </div>
          ) : shopifyStatus === 'connected' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-700 font-medium">✅ SHOPIFY CONNECTED</span>
                <button
                  type="button"
                  onClick={handleRefreshShopify}
                  className="text-green-700 hover:text-green-800"
                  title="Refresh Shopify status"
                  aria-label="Refresh Shopify status"
                >
                  🔄
                </button>
              </div>
              <p className="text-green-600">
                Using real products from your Shopify store.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-700 font-medium">🎭 DEMO MODE</span>
                <button
                  type="button"
                  onClick={handleRefreshShopify}
                  className="text-yellow-700 hover:text-yellow-800"
                  title="Refresh Shopify status"
                  aria-label="Refresh Shopify status"
                >
                  🔄
                </button>
              </div>
              <p className="text-yellow-600">
                Using mock data. Connect Shopify in Integrations to use real products.
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? (
                <>
                  <p className="mb-2">🔍 No conversations match "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-2">No conversations yet</p>
                  <button
                    type="button"
                    onClick={handleCreateConversation}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Create first conversation
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div 
                  onClick={() => setSelectedConversation(conv)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {conv.customer_name || 'Anonymous'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {conv.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConversationToDelete(conv)
                          setShowDeleteConfirm(true)
                        }}
                        disabled={deleting}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.customer_email || 'No email'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.created_at).toLocaleString()}
                  </p>
                </div>
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
                  {shopifyStatus === 'connected' ? (
                    <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">
                      ✅ Shopify Connected
                    </div>
                  ) : shopifyStatus === 'checking' ? (
                    <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded">
                      🔄 Checking...
                    </div>
                  ) : (
                    <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
                      🎭 Demo Mode
                    </div>
                  )}
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
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputMessage.trim()) {
                    sendCustomerMessage(inputMessage.trim());
                    setInputMessage('');
                  }
                }}
                className="flex space-x-2"
              >
                <label htmlFor="chat-message-input" className="sr-only">Type your message</label>
                <input
                  type="text"
                  id="chat-message-input"
                  name="message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message or test phrase..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium whitespace-nowrap"
                  aria-label="Send message"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={testSmartResponse}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                  aria-label="Send demo test message"
                >
                  🧪 Demo
                </button>
              </form>
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
                  {shopifyStatus === 'connected' ? (
                    <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
                      ✅ Using Real Shopify Products
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
                      🎭 Demo Mode - Using Mock Products
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && conversationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Conversation?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the conversation with <strong>{conversationToDelete.customer_name || 'Anonymous'}</strong>? 
              This will also delete all messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setConversationToDelete(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConversation(conversationToDelete.id)}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear All Conversations?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to clear <strong>all {conversations.length} conversations</strong>? 
              This will delete all conversations and their messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllConversations}
                disabled={clearingAll}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {clearingAll ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
