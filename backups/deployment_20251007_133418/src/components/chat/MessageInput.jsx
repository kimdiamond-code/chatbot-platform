import React, { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || sending) return
    
    setSending(true)
    try {
      await onSend(message.trim())
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-3 py-2 resize-none focus:outline-none focus:ring-0"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default MessageInput
