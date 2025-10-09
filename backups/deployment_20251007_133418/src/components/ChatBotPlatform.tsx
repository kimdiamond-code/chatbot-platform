import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Bot, Users, Settings, Menu, X, User, 
  Send, Plus, Search, Filter, Eye, Trash, 
  Sparkles, BarChart3, Clock, Zap, CheckCircle,
  Globe, Smartphone, Monitor, Cloud
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Types
interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  sender_id?: string;
  content: string;
  content_type: 'text' | 'image' | 'file';
  metadata: Record<string, any>;
  created_at: string;
}

interface Conversation {
  id: string;
  organization_id: string;
  customer_id: string;
  status: 'active' | 'resolved' | 'waiting';
  assigned_agent?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  last_seen_at: string;
  metadata: Record<string, any>;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: Record<string, any>;
  created_at: string;
}

interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'agent' | 'viewer';
  avatar_url?: string;
  created_at: string;
  organizations?: Organization;
}

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AuthForm Component
const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Using demo mode.');
      // Create a demo session
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo-user-id',
        email: 'demo@example.com',
        full_name: 'Demo User'
      }));
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-xs text-gray-500 text-center">
        Demo credentials are pre-filled. Click "Sign In" to continue.
      </p>
    </form>
  );
};

// Main ChatBot Platform Component
const ChatBotPlatform: React.FC = () => {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    avgResponseTime: '0m 0s',
    satisfaction: 0,
    botsActive: 0,
    conversions: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connection status
  const isConnected = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');

  // Initialize
  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && currentOrganization) {
      loadConversations();
      loadCustomers();
      loadAnalytics();
    }
  }, [user, currentOrganization]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time messages effect
  useEffect(() => {
    if (!activeConversation || !isConnected) return;

    loadMessages(activeConversation.id);
    
    const channel = supabase
      .channel(`conversation:${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeConversation, isConnected]);

  const checkUser = async () => {
    try {
      // Check for demo user first
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        const userData = JSON.parse(demoUser);
        await loadDemoUserData(userData);
        return;
      }

      // Check for real Supabase session
      if (isConnected) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserData(session.user);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUserData = async (authUser: any) => {
    // Create demo organization
    const demoOrg: Organization = {
      id: 'demo-org-id',
      name: 'Demo Organization',
      domain: 'demo.example.com',
      settings: {},
      created_at: new Date().toISOString()
    };

    const demoUserData: User = {
      id: authUser.id,
      organization_id: demoOrg.id,
      email: authUser.email,
      full_name: authUser.full_name,
      role: 'admin',
      created_at: new Date().toISOString(),
      organizations: demoOrg
    };

    setUser(demoUserData);
    setCurrentOrganization(demoOrg);
    
    // Load demo data
    loadDemoData();
  };

  const loadUserData = async (authUser: any) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          organizations(*)
        `)
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;

      setUser(userData);
      setCurrentOrganization(userData.organizations);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to demo mode
      await loadDemoUserData(authUser);
    }
  };

  const loadDemoData = () => {
    // Demo conversations
    const demoConversations: Conversation[] = [
      {
        id: 'conv-1',
        organization_id: 'demo-org-id',
        customer_id: 'customer-1',
        status: 'active',
        priority: 'high',
        tags: ['support', 'urgent'],
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
          id: 'customer-1',
          organization_id: 'demo-org-id',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar_url: '',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_seen_at: new Date().toISOString(),
          metadata: {}
        }
      },
      {
        id: 'conv-2',
        organization_id: 'demo-org-id',
        customer_id: 'customer-2',
        status: 'waiting',
        priority: 'medium',
        tags: ['billing'],
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        customer: {
          id: 'customer-2',
          organization_id: 'demo-org-id',
          name: 'Mike Chen',
          email: 'mike@example.com',
          avatar_url: '',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          last_seen_at: new Date(Date.now() - 1800000).toISOString(),
          metadata: {}
        }
      }
    ];

    setConversations(demoConversations);
    setCustomers(demoConversations.map(conv => conv.customer!));
    setStats({
      totalChats: 47,
      activeChats: 12,
      avgResponseTime: '2m 34s',
      satisfaction: 4.6,
      botsActive: 8,
      conversions: 23
    });
  };

  const loadConversations = async () => {
    if (!currentOrganization || !isConnected) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customers(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!isConnected) {
      // Load demo messages
      const demoMessages: Message[] = [
        {
          id: 'msg-1',
          conversation_id: conversationId,
          sender_type: 'user',
          content: 'Hi, I need help with my account billing',
          content_type: 'text',
          metadata: {},
          created_at: new Date(Date.now() - 600000).toISOString()
        },
        {
          id: 'msg-2',
          conversation_id: conversationId,
          sender_type: 'bot',
          content: 'Hello! I\'d be happy to help you with your billing questions. What specific issue are you experiencing?',
          content_type: 'text',
          metadata: {},
          created_at: new Date(Date.now() - 580000).toISOString()
        },
        {
          id: 'msg-3',
          conversation_id: conversationId,
          sender_type: 'user',
          content: 'I was charged twice for my subscription this month',
          content_type: 'text',
          metadata: {},
          created_at: new Date(Date.now() - 560000).toISOString()
        }
      ];
      setMessages(demoMessages);
      setTimeout(scrollToBottom, 100);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadCustomers = async () => {
    if (!currentOrganization || !isConnected) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!currentOrganization || !isConnected) return;

    try {
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (convError) throw convError;

      const totalChats = conversationData?.length || 0;
      const activeChats = conversationData?.filter(c => c.status === 'active').length || 0;

      setStats(prev => ({
        ...prev,
        totalChats,
        activeChats,
        avgResponseTime: '2m 34s',
        satisfaction: 4.6,
        botsActive: 12,
        conversions: Math.floor(totalChats * 0.15)
      }));
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const messageToSend = newMessage;
    setNewMessage('');

    if (!isConnected) {
      // Demo mode
      const demoMessage: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: activeConversation.id,
        sender_type: 'agent',
        sender_id: user.id,
        content: messageToSend,
        content_type: 'text',
        metadata: {},
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, demoMessage]);
      
      // Simulate bot response
      setTimeout(() => {
        simulateBotResponse();
      }, 2000);
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_type: 'agent',
          sender_id: user.id,
          content: messageToSend,
          content_type: 'text',
          metadata: {}
        });

      if (error) throw error;
      
      setTimeout(() => {
        simulateBotResponse();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const simulateBotResponse = async () => {
    if (!activeConversation) return;

    setIsTyping(true);
    
    setTimeout(async () => {
      const responses = [
        "I understand you'd like assistance. Let me help you with that.",
        "Thank you for providing that information. I'll look into this for you.",
        "I can help you resolve this issue. Let me check our knowledge base.",
        "That's a great question! Here's what I found for you.",
        "I've processed your request. Is there anything else I can help you with?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      if (!isConnected) {
        // Demo mode
        const botMessage: Message = {
          id: `msg-${Date.now()}`,
          conversation_id: activeConversation.id,
          sender_type: 'bot',
          content: randomResponse,
          content_type: 'text',
          metadata: {},
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }

      try {
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: activeConversation.id,
            sender_type: 'bot',
            content: randomResponse,
            content_type: 'text',
            metadata: {}
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error sending bot response:', error);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  const createDemoConversation = async () => {
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      organization_id: currentOrganization?.id || 'demo-org-id',
      name: 'New Customer',
      email: 'newcustomer@example.com',
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      metadata: {}
    };

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      organization_id: currentOrganization?.id || 'demo-org-id',
      customer_id: newCustomer.id,
      status: 'active',
      priority: 'medium',
      tags: ['new'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer: newCustomer
    };

    if (!isConnected) {
      // Demo mode
      setConversations(prev => [newConversation, ...prev]);
      setCustomers(prev => [newCustomer, ...prev]);
      setActiveConversation(newConversation);
      setActiveTab('livechat');
      return;
    }

    try {
      // Insert customer first
      const { error: customerError } = await supabase
        .from('customers')
        .insert(newCustomer);

      if (customerError) throw customerError;

      // Insert conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          id: newConversation.id,
          organization_id: newConversation.organization_id,
          customer_id: newConversation.customer_id,
          status: newConversation.status,
          priority: newConversation.priority,
          tags: newConversation.tags
        });

      if (conversationError) throw conversationError;

      // Add initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_type: 'user',
          content: 'Hello! I need some help with your services. Can someone assist me?',
          content_type: 'text',
          metadata: {}
        });

      if (messageError) throw messageError;

      await loadConversations();
      setActiveConversation({ ...newConversation, customer: newCustomer });
      setActiveTab('livechat');
    } catch (error) {
      console.error('Error creating demo conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Authentication UI
  const renderAuth = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ChatBot Platform</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );

  // Loading UI
  const renderLoading = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );

  // Dashboard render
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={createDemoConversation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-2 inline" />
            Create Demo Chat
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className="text-sm font-medium text-gray-900">
            {isConnected ? `Connected to Supabase • Organization: ${currentOrganization?.name}` : 'Demo Mode - Connect to Supabase for live data'}
          </span>
          {isConnected && supabaseUrl && (
            <span className="text-xs text-gray-500">({supabaseUrl.split('//')[1]?.split('.')[0]})</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chats</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{stats.satisfaction}/5</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {conversations.slice(0, 5).map((conv) => (
            <div key={conv.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{conv.customer?.name || 'Unknown Customer'}</p>
                <p className="text-sm text-gray-600">
                  {conv.status === 'active' ? 'Active conversation' : 'Waiting for response'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                conv.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {conv.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Live Chat render
  const renderLiveChat = () => (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <div className="mt-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv);
                loadMessages(conv.id);
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {conv.customer?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.customer?.email || 'No email'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    conv.status === 'active' ? 'bg-green-100 text-green-800' :
                    conv.status === 'waiting' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {conv.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    conv.priority === 'high' ? 'bg-red-100 text-red-800' :
                    conv.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {conv.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activeConversation.customer?.name || 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activeConversation.customer?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeConversation.status === 'active' ? 'bg-green-100 text-green-800' :
                    activeConversation.status === 'waiting' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeConversation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'agent'
                        ? 'bg-blue-600 text-white'
                        : message.sender_type === 'bot'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_type === 'agent' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-600 mb-4">Choose a conversation from the list to start chatting</p>
              <button
                onClick={createDemoConversation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Demo Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Integrations render with CORS fix
  const renderIntegrations = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">🔌 Integrations</h1>
      
      {/* CORS Error Fix Section */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-4">🚨 CORS Error Fix for Webpage Integration</h2>
        <div className="space-y-4 text-red-700">
          <p className="font-medium">If you're getting CORS errors when adding webpages to your botbuilder:</p>
          
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">1. Start the CORS Proxy Server</h3>
            <p className="text-sm mb-2">Run this command in a separate terminal:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`cd cors-proxy
npm install
npm run dev`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">2. Test the Proxy</h3>
            <p className="text-sm mb-2">Verify it's working:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`curl http://localhost:3001/health`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold mb-2">3. Use Proxy in Your Code</h3>
            <p className="text-sm mb-2">Instead of direct fetch, use:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`fetch('/api/proxy?url=' + encodeURIComponent('https://example.com'))
  .then(response => response.json())
  .then(data => console.log(data));`}
            </pre>
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-gray-900">Webpage Scraper</h3>
              <p className="text-sm text-gray-600">Extract content from websites</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Configure
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-gray-900">WhatsApp</h3>
              <p className="text-sm text-gray-600">Connect WhatsApp Business</p>
            </div>
          </div>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            Connect
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Monitor className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-bold text-gray-900">Slack</h3>
              <p className="text-sm text-gray-600">Team collaboration</p>
            </div>
          </div>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  );

  // Settings render
  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bot Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bot Name
              </label>
              <input
                type="text"
                defaultValue="Assistant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <textarea
                defaultValue="Hello! How can I help you today?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <input
                type="color"
                defaultValue="#2563eb"
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat Position
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Bottom Right</option>
                <option>Bottom Left</option>
                <option>Top Right</option>
                <option>Top Left</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Update Appearance
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (loading) {
    return renderLoading();
  }

  if (!user) {
    return renderAuth();
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">ChatBot Platform</h1>
                <p className="text-xs text-gray-600">{isConnected ? 'Live' : 'Demo Mode'}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">Dashboard</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('livechat')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'livechat'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">Live Chat</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'integrations'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bot className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">🔌 Integrations</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">Settings</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">Welcome back!</p>
                <p className="text-sm text-gray-600">{user.full_name}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'livechat' && renderLiveChat()}
          {activeTab === 'integrations' && renderIntegrations()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
};

export default ChatBotPlatform;