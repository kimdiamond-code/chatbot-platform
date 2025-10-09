// agentstack.ai Logo Component
import React from 'react';

const AgentStackLogo = ({ size = 40, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" opacity="0.1" />
      
      {/* Chat Bubble Base */}
      <path 
        d="M30 35 C30 28 35 23 42 23 L68 23 C75 23 80 28 80 35 L80 55 C80 62 75 67 68 67 L50 67 L35 77 L35 67 C32 67 30 65 30 62 Z" 
        fill="url(#logoGradient)"
      />
      
      {/* AI Brain Circuit Lines */}
      <g opacity="0.9">
        {/* Horizontal lines */}
        <line x1="42" y1="38" x2="48" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="38" x2="68" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
        
        {/* Middle lines */}
        <line x1="42" y1="48" x2="58" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="62" y1="48" x2="68" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" />
        
        {/* Bottom lines */}
        <line x1="42" y1="58" x2="48" y2="58" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="58" x2="62" y2="58" stroke="white" strokeWidth="2" strokeLinecap="round" />
        
        {/* Connection dots */}
        <circle cx="50" cy="38" r="2.5" fill="white" />
        <circle cx="60" cy="48" r="2.5" fill="white" />
        <circle cx="50" cy="58" r="2.5" fill="white" />
      </g>
      
      {/* Sparkle Effect */}
      <circle cx="72" cy="30" r="2" fill="url(#logoGradient2)" opacity="0.8" />
      <circle cx="78" cy="38" r="1.5" fill="url(#logoGradient2)" opacity="0.6" />
    </svg>
  );
};

export default AgentStackLogo;
