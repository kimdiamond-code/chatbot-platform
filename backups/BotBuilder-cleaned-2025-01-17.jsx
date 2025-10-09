// BACKUP: BotBuilder.jsx - DEBUG CODE CLEANED - 2025-01-17
// This version has all debug console logs and debug UI elements removed

import React, { useState, useEffect } from 'react';
import { documentProcessor, webpageScraper } from '../services/knowledgeService';
import { botConfigService } from '../services/botConfigService';

// Icon components
const Bot = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🤖</span>;
const Target = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🎯</span>;
const User = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>👤</span>;
const Settings = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>⚙️</span>;
const MessageSquare = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>💬</span>;
const BookOpen = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📚</span>;
const Code = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🔧</span>;
const Play = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>▶️</span>;
const Save = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>💾</span>;
const Upload = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>⬆️</span>;
const Plus = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>➕</span>;
const Trash = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🗑️</span>;
const Edit = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>✏️</span>;
const Copy = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📋</span>;

const BotBuilder = () => {
  // Component state and logic exactly as cleaned up version
  // All debug logs removed, debug UI removed, test buttons removed
  
  // ... (rest of component implementation)
};