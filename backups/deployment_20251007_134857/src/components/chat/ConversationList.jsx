import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { User, Clock, MessageCircle } from 'lucide-react'
import Loading from '../ui/Loading'

const ConversationList = ({ conversations, selectedConversation, onSelect, loading }) => {
  if (loading) {
    return <Loading />
  }

  if (!conversations.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.id === conversation.id
        const lastMessage = conversation.messages?.[conversation.messages.length - 1]
        
        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              isSelected 
                ? 'bg-royal-50 border border-royal-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.customer?.name || 'Anonymous'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {conversation.status === 'open' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {lastMessage?.content || 'No messages yet'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    conversation.status === 'open' 
                      ? 'bg-green-100 text-green-800'
                      : conversation.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {conversation.status}
                  </span>
                  {conversation.priority === 'high' && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ConversationList
