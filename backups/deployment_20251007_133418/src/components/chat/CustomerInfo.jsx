import React from 'react'
import { X, Mail, Phone, Calendar, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const CustomerInfo = ({ customer, conversation, onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Customer Info</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Customer Details */}
        <div>
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-medium text-gray-600">
              {customer?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900">
              {customer?.name || 'Anonymous Customer'}
            </h4>
            <p className="text-sm text-gray-500 mt-1">Customer</p>
          </div>
        </div>
        {/* Contact Information */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h5>
          <div className="space-y-3">
            {customer?.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{customer.email}</span>
              </div>
            )}
            {customer?.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{customer.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Customer since {formatDistanceToNow(new Date(customer?.created_at || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        {/* Conversation Details */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">Conversation Details</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                conversation?.status === 'open' 
                  ? 'bg-green-100 text-green-800'
                  : conversation?.status === 'waiting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {conversation?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                conversation?.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : conversation?.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {conversation?.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Messages</span>
              <span className="text-sm font-medium text-gray-900">
                {conversation?.messages?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(conversation?.created_at || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">Actions</h5>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              Assign to agent
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              Change priority
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              Add internal note
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
              Close conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfo
