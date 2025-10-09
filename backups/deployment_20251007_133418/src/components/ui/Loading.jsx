import React from 'react'

// Basic Spinner Component
export function Spinner({ size = 'md', color = 'royal' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colors = {
    royal: 'border-royal-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    gray: 'border-gray-500',
    white: 'border-white'
  }

  return (
    <div 
      className={`${sizes[size]} border-2 border-gray-200 border-t-transparent ${colors[color]} rounded-full animate-spin`}
    ></div>
  )
}

// Basic Loading Component
const Loading = ({ text = 'Loading...', size = 'md' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <Spinner size={size} color="blue" />
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  )
}

// Export as default
export default Loading
