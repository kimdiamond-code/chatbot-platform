import React, { useState, useEffect } from 'react'
import { useMessages } from '../hooks/useMessages'
import { useConversations } from '../hooks/useConversations'
import ProductMessage from './shop/ProductMessage'

export default function Conversations() {
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
  const [selectedConversations, setSelectedConversations] = useState([])
  const [editingConversation, setEditingConversation] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  
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

  const handleBulkDelete = async () => {
    try {
      for (const convId of selectedConversations) {
        await deleteConversation(convId)
        if (selectedConversation?.id === convId) {
          setSelectedConversation(null)
        }
      }
      setSelectedConversations([])
      setShowBulkDeleteConfirm(false)
      console.log('✅ Selected conversations deleted')
    } catch (error) {
      console.error('❌ Failed to delete conversations:', error)
      alert('Failed to delete conversations')
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

  // Handle select/deselect conversation
  const toggleSelectConversation = (convId) => {
    setSelectedConversations(prev => 
      prev.includes(convId) 
        ? prev.filter(id => id !== convId)
        : [...prev, convId]
    )
  }

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedConversations.length === filteredConversations.length) {
      setSelectedConversations([])
    } else {
      setSelectedConversations(filteredConversations.map(c => c.id))
    }
  }

  // Handle edit conversation
  const startEditConversation = (conv) => {
    setEditingConversation(conv.id)
    setEditForm({
      name: conv.customer_name || '',
      email: conv.customer_email || '',
      phone: conv.customer_phone || ''
    })
  }

  const saveEditConversation = async () => {
    // TODO: Implement update conversation API call
    console.log('Saving conversation:', editingConversation, editForm)
    setEditingConversation(null)
  }

  const cancelEditConversation = () => {
    setEditingConversation(null)
    setEditForm({ name: '', email: '', phone: '' })
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
              {selectedConversations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  title="Delete selected conversations"
                  aria-label="Delete selected conversations"
                >
                  🗑️ ({selectedConversations.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(true)}
                disabled={clearingAll || conversations.length === 0}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
                title="Clear all conversations"
                aria-label="Clear all conversations"
              >
                🗑️ All
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

          {/* Select All Checkbox */}
          {filteredConversations.length > 0 && (
            <div className="mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConversations.length === filteredConversations.length && filteredConversations.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
                Select All
              </label>
            </div>
          )}
          
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-700 font-medium">❌ NOT CONNECTED</span>
                <button
                  type="button"
                  onClick={handleRefreshShopify}
                  className="text-red-700 hover:text-red-800"
                  title="Refresh Shopify status"
                  aria-label="Refresh Shopify status"
                >
                  🔄
                </button>
              </div>
              <p className="text-red-600">
                Connect Shopify in Integrations to use real products.
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
                className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                {editingConversation === conv.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditConversation}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditConversation}
                        className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedConversations.includes(conv.id)}
                      onChange={() => toggleSelectConversation(conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div 
                      onClick={() => setSelectedConversation(conv)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {conv.customer_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
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
                              startEditConversation(conv)
                            }}
                            className="text-blue-500 hover:text-blue-700 p-0.5"
                            title="Edit conversation"
                            aria-label="Edit conversation"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConversationToDelete(conv)
                              setShowDeleteConfirm(true)
                            }}
                            disabled={deleting}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 p-0.5"
                            title="Delete conversation"
                            aria-label="Delete conversation"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conv.customer_email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(conv.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Smaller Widget Preview Style */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedConversation.customer_name || 'Anonymous'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.customer_email || 'No email'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {smartBotEnabled && (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      🤖 AI
                    </div>
                  )}
                  {shopifyStatus === 'connected' ? (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✅ Shopify
                    </div>
                  ) : shopifyStatus === 'checking' ? (
                    <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      🔄
                    </div>
                  ) : (
                    <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      ❌ Shopify
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages - Widget Style Container */}
            <div className="flex-1 p-4 bg-gray-100">
              <div className="max-w-lg mx-auto h-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
                {/* Widget Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      💬
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Chat Support</div>
                      <div className="text-xs opacity-90">We're here to help!</div>
                    </div>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="text-center text-gray-500 text-sm">Loading messages...</div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg) => {
                      const hasProducts = msg.metadata?.products && msg.metadata.products.length > 0
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="max-w-[80%] space-y-2">
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm ${
                                msg.sender_type === 'user'
                                  ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                                  : msg.sender_type === 'bot'
                                  ? 'bg-blue-500 text-white rounded-tr-none'
                                  : 'bg-green-500 text-white rounded-tr-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            
                            {hasProducts && (
                              <div className="mt-2">
                                <ProductMessage 
                                  products={msg.metadata.products}
                                  onAddToCart={handleAddToCart}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">👋</div>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (inputMessage.trim()) {
                            sendCustomerMessage(inputMessage.trim());
                            setInputMessage('');
                          }
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (inputMessage.trim()) {
                          sendCustomerMessage(inputMessage.trim());
                          setInputMessage('');
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Conversation
              </h3>
              <p className="text-gray-500 mb-4">
                Choose a conversation from the sidebar to start chatting
              </p>
              {conversations.length > 0 && (
                <p className="text-sm text-blue-600 mb-4">
                  ← Select a conversation to view
                </p>
              )}
              {smartBotEnabled && (
                <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
                  🤖 Smart Bot Active
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Selected Conversations?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedConversations.length} selected conversations</strong>? 
              This will also delete all their messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Selected'}
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
