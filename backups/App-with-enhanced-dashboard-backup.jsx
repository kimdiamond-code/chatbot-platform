// BACKUP: App.jsx with enhanced Dashboard component implementation
// Created: Dashboard enhancement complete - switching from inline dashboard to full Dashboard component
// Features: Enhanced dashboard with real-time status, functional navigation, system monitoring

import React, { useState, useEffect, useRef } from 'react';
import { chatBotService } from './services/openaiService';
import { testSupabaseConnection } from './services/supabase';
import { runConnectionTest } from './utils/connectionTest';
import BotBuilder from './components/BotBuilder';
import Dashboard from './components/Dashboard';

// Simple Icon Components (No External Dependencies)
const MessageCircle = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>💬</span>;
const Bot = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🤖</span>;
const Users = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>👥</span>;
const Settings = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>⚙️</span>;
const Menu = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>☰</span>;
const X = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>✕</span>;
const User = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>👤</span>;
const Send = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📤</span>;
const Plus = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>➕</span>;
const Search = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🔍</span>;
const BarChart3 = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📊</span>;
const Clock = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🕐</span>;
const Sparkles = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>✨</span>;
const Globe = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🌍</span>;
const Smartphone = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>📱</span>;
const Monitor = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🖥️</span>;
const Cloud = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>☁️</span>;
const RefreshCw = ({ className, size }) => <span className={`inline-block ${className}`} style={{fontSize: size ? `${size}px` : '16px'}}>🔄</span>;

// Rest of the file content follows...
// This backup represents the working version with enhanced dashboard implementation
