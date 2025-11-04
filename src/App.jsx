import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { authService } from './services/authService';
import rbacService, { PERMISSIONS } from './services/rbacService';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CleanModernNavigation, { CleanHeader } from './components/CleanModernNavigation.jsx';
import EnhancedDashboard from './components/EnhancedDashboard.jsx';
import FullBotBuilder from './components/BotBuilder.jsx';
import Conversations from './components/Conversations.jsx';
import Analytics from './components/Analytics.jsx';
import ProactiveEngagement from './components/ProactiveEngagement.jsx';
import CRMCustomerContext from './components/CRMCustomerContext.jsx';
import ECommerceSupport from './components/ECommerceSupport.jsx';
import MultiChannelSupport from './components/MultiChannelSupport.jsx';
import ScenarioBuilder from './components/ScenarioBuilder.jsx';
import CustomForms from './components/CustomForms.jsx';
import SMSAgent from './components/SMSAgent.jsx';
import PhoneAgent from './components/PhoneAgent.jsx';
import BillingPage from './pages/BillingPage.jsx';
import FAQ from './components/FAQ.jsx';
import WidgetStudioSimplified from './components/WidgetStudioSimplified.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import { OnboardingManager } from './components/onboarding';
import { TooltipProvider } from './components/onboarding';

import ShopifyCallback from './pages/ShopifyCallback.jsx';
import { debugEnvVars } from './utils/debugEnv.js';
import './utils/emergencyActivator.js';
import { chatBotService } from './services/openaiService.js';

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

// Enhanced Conversations Component
const EnhancedConversations = ({ onNavigate }) => {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen glass-premium">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Conversations...</p>
        </div>
      </div>
    }>
      <Conversations onNavigate={onNavigate} />
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
          <h3 className="font-bold text-lg text-purple-900 mb-2">Profile Settings</h3>
          <p className="text-sm text-gray-600">Your account and preferences</p>
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
    // Initialize RBAC with current user role
    if (currentUser) {
      rbacService.setUserRole(currentUser.role || 'user');
    }

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      if (user) {
        rbacService.setUserRole(user.role || 'user');
      }
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    // Check for OAuth success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('shopify') === 'connected') {
      setActiveTab('admin');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    console.log('🚀 agenstack.ai chat - v2.0 with RBAC');
    
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

  // Authentication check - ENABLED
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

  // ALL AVAILABLE NAVIGATION ITEMS (before filtering)
  const allNavigation = [
    // User-accessible features
    { id: 'dashboard', name: 'Dashboard', component: EnhancedDashboard, feature: 'dashboard' },
    { id: 'conversations', name: 'Conversations', component: EnhancedConversations, feature: 'conversations' },
    { id: 'widget', name: 'Widget', component: WidgetStudioSimplified, feature: 'widget' },
    { id: 'analytics', name: 'Analytics', component: Analytics, feature: 'analytics' },
    { id: 'settings', name: 'Settings', component: EnhancedSettings, feature: 'settings' },
    
    // Manager+ features
    { id: 'botbuilder', name: 'Bot Builder', component: BotBuilder, feature: 'botbuilder' },
    { id: 'scenarios', name: 'Scenarios', component: ScenarioBuilder, feature: 'scenarios' },
    { id: 'forms', name: 'Forms', component: CustomForms, feature: 'forms' },
    { id: 'proactive', name: 'Proactive', component: ProactiveEngagement, feature: 'proactive' },
    { id: 'crm', name: 'CRM', component: CRMCustomerContext, feature: 'crm' },
    { id: 'ecommerce', name: 'E-Commerce', component: ECommerceSupport, feature: 'ecommerce' },
    { id: 'multichannel', name: 'Channels', component: MultiChannelSupport, feature: 'multichannel' },
    { id: 'sms', name: 'SMS', component: SMSAgent, feature: 'sms' },
    { id: 'phone', name: 'Phone', component: PhoneAgent, feature: 'phone' },
    { id: 'faq', name: 'Help Center/FAQs', component: FAQ, feature: 'faq' },
    { id: 'billing', name: 'Billing', component: BillingPage, feature: 'billing' },
    
    // Admin/Developer ONLY - Consolidated in Admin Panel
    { 
      id: 'admin', 
      name: '🔒 Admin Panel', 
      component: AdminPanel, 
      feature: 'admin',
      adminOnly: true,
      description: 'Webhooks, API Keys, Security, Users'
    }
  ];

  // FILTER NAVIGATION BASED ON USER ROLE
  const navigation = allNavigation.filter(nav => {
    // If no feature specified, allow all
    if (!nav.feature) return true;
    
    // Admin-only features
    if (nav.adminOnly) {
      return rbacService.isAdminOrDeveloper();
    }
    
    // Check if user can access this feature
    return rbacService.canAccessFeature(nav.feature);
  });

  const ActiveComponent = navigation.find(nav => nav.id === activeTab)?.component || EnhancedDashboard;

  // Show role indicator in dev mode (remove in production)
  const roleIndicator = currentUser && (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500">
      <div className="text-xs text-gray-600">Current Role:</div>
      <div className={`text-sm font-bold px-2 py-1 rounded ${rbacService.getRoleBadgeColor(currentUser.role)}`}>
        {rbacService.getRoleDisplayName(currentUser.role)}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {navigation.length} features accessible
      </div>
      {rbacService.isAdminOrDeveloper() && (
        <div className="text-xs text-red-600 font-semibold mt-1">
          🔒 Admin Access
        </div>
      )}
    </div>
  );

  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen gradient-background flex overflow-hidden">
          <CleanModernNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            realTimeMetrics={realTimeMetrics}
            navigation={navigation}
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

          {/* Onboarding System */}
          <OnboardingManager onNavigate={setActiveTab} />

          {/* Dev Role Indicator - Remove in production */}
          {roleIndicator}
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App;
