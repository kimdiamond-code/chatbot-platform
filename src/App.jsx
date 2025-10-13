import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { authService } from './services/authService';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import UserManagement from './pages/UserManagement.jsx';
import CleanModernNavigation, { CleanHeader } from './components/CleanModernNavigation.jsx';
import EnhancedDashboard from './components/EnhancedDashboard.jsx';
import FullBotBuilder from './components/BotBuilder.jsx';
import FullIntegrations from './components/Integrations.jsx';
import LiveChat from './components/LiveChat.jsx';
import Analytics from './components/Analytics.jsx';
import ProactiveEngagement from './components/ProactiveEngagement.jsx';
import CRMCustomerContext from './components/CRMCustomerContext.jsx';
import ECommerceSupport from './components/ECommerceSupport.jsx';
import MultiChannelSupport from './components/MultiChannelSupport.jsx';
import SecurityCompliance from './components/SecurityCompliance.jsx';

import FAQ from './components/FAQ.jsx';
import WidgetStudio from './components/WidgetStudio.jsx';
import WebhookManagement from './components/WebhookManagement.jsx';
import ShopifyTestPage from './pages/ShopifyTestPage.jsx';
import ShopifyDiagnostic from './components/debug/ShopifyDiagnostic.jsx';
import BotHealthCheck from './components/debug/BotHealthCheck.jsx';
import ShopifyCallback from './pages/ShopifyCallback.jsx';
import { debugEnvVars } from './utils/debugEnv.js';
import './utils/emergencyActivator.js';
import './services/openaiService.js';

// Enhanced Bot Builder Component
const BotBuilder = () => {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen glass-premium">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bot Builder...</p>
        </div>
      </div>
    }>
      <FullBotBuilder />
    </React.Suspense>
  );
};

// Enhanced Live Chat Component
const EnhancedLiveChat = ({ onNavigate }) => {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen glass-premium">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Live Chat...</p>
        </div>
      </div>
    }>
      <LiveChat onNavigate={onNavigate} />
    </React.Suspense>
  );
};

// Enhanced Settings Component
const EnhancedSettings = () => (
  <div className="p-6 glass-premium min-h-screen">
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">⚙️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Platform Settings</h1>
      <p className="text-gray-600 glass-dynamic px-6 py-3 rounded-xl inline-block">
        Advanced configuration panel in development...
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass-dynamic p-6 rounded-xl">
          <h3 className="font-bold text-lg text-blue-900 mb-2">General Settings</h3>
          <p className="text-sm text-gray-600">Platform preferences and defaults</p>
        </div>
        <div className="glass-dynamic p-6 rounded-xl">
          <h3 className="font-bold text-lg text-purple-900 mb-2">Security & Access</h3>
          <p className="text-sm text-gray-600">User permissions and authentication</p>
        </div>
        <div className="glass-dynamic p-6 rounded-xl">
          <h3 className="font-bold text-lg text-green-900 mb-2">Notifications</h3>
          <p className="text-sm text-gray-600">Alert preferences and channels</p>
        </div>
      </div>
    </div>
  </div>
);

// MAIN APP COMPONENT
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [showSignup, setShowSignup] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeChats: 3,
    todayMessages: 127,
    avgResponseTime: 135,
    satisfaction: 4.8
  });

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    debugEnvVars();
    
    // Check for OAuth success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('shopify') === 'connected') {
      setActiveTab('integrations');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    console.log('🚀 AI ChatBot Platform - v2.0');
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const metricsInterval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        activeChats: Math.max(0, prev.activeChats + Math.floor(Math.random() * 3 - 1)),
        todayMessages: prev.todayMessages + Math.floor(Math.random() * 5)
      }));
    }, 30000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(metricsInterval);
    };
  }, []);

  // Show login/signup page if not authenticated
  if (!isAuthenticated) {
    if (showSignup) {
      return <Signup 
        onSignupSuccess={() => {
          setIsAuthenticated(true);
          setCurrentUser(authService.getCurrentUser());
          setShowSignup(false);
        }}
        onSwitchToLogin={() => setShowSignup(false)}
      />;
    }
    
    return <Login 
      onLoginSuccess={() => {
        setIsAuthenticated(true);
        setCurrentUser(authService.getCurrentUser());
      }}
      onSwitchToSignup={() => setShowSignup(true)}
    />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', component: EnhancedDashboard },
    { id: 'botbuilder', name: 'Bot Builder', component: BotBuilder },
    { id: 'livechat', name: 'Live Chat', component: EnhancedLiveChat },
    { id: 'proactive', name: 'Proactive', component: ProactiveEngagement },
    { id: 'crm', name: 'CRM', component: CRMCustomerContext },
    { id: 'ecommerce', name: 'E-Commerce', component: ECommerceSupport },
    { id: 'multichannel', name: 'Channels', component: MultiChannelSupport },
    { id: 'faq', name: 'FAQ', component: FAQ },
    { id: 'widget', name: 'Widget', component: WidgetStudio },
    { id: 'webhooks', name: 'Webhooks', component: WebhookManagement },
    { id: 'analytics', name: 'Analytics', component: Analytics },
    { id: 'integrations', name: 'Integrations', component: FullIntegrations },
    { id: 'shopifytest', name: 'Shopify Test', component: ShopifyTestPage },
    { id: 'shopifydiag', name: 'Shopify Debug', component: ShopifyDiagnostic },
    { id: 'bothealth', name: 'Bot Health', component: BotHealthCheck },
    { id: 'security', name: 'Security', component: SecurityCompliance },
    ...(authService.isAdmin() ? [{ id: 'users', name: 'Users', component: UserManagement }] : []),
    { id: 'settings', name: 'Settings', component: EnhancedSettings }
  ];

  const ActiveComponent = navigation.find(nav => nav.id === activeTab)?.component || EnhancedDashboard;

  return (
    <AuthProvider>
      <div className="min-h-screen gradient-background flex overflow-hidden">
        <CleanModernNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          realTimeMetrics={realTimeMetrics}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <CleanHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            realTimeMetrics={realTimeMetrics}
          />

          <main className="flex-1 overflow-y-auto glass-background">
            <div className="min-h-full">
              <ActiveComponent onNavigate={setActiveTab} />
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
