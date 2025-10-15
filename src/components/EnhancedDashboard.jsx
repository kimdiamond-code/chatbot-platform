import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService';
import { runConnectionTest } from '../utils/connectionTest';
import analyticsService from '../services/analyticsService';
import { 
  MetricCard, 
  SimpleLineChart, 
  SimpleBarChart, 
  SimpleDonutChart, 
  ActivityFeed 
} from './ui/Charts';

const EnhancedDashboard = ({ onNavigate }) => {
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [connectionTesting, setConnectionTesting] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardData();
      setDashboardData(data);
      console.log('📊 Dashboard data loaded:', data);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test connections on component mount
  useEffect(() => {
    const checkConnections = async () => {
      setConnectionTesting(true);
      try {
        const status = await dbService.testConnection();
        setDatabaseStatus({ connected: true, message: 'Neon Database Connected' });
        console.log('🔗 Neon database connected:', status);
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        setDatabaseStatus({ 
          connected: false, 
          error: error.message,
          message: 'Connection test failed'
        });
      } finally {
        setConnectionTesting(false);
      }
    };
    
    checkConnections();
    loadDashboardData();
  }, []);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Manual connection test function
  const runManualConnectionTest = async () => {
    setConnectionTesting(true);
    console.log('🔍 Running manual connection test...');
    
    try {
      const status = await dbService.testConnection();
      setDatabaseStatus({ connected: true, message: 'Neon Database Connected' });
      
      // Refresh dashboard data after connection test
      await loadDashboardData();
    } catch (error) {
      console.error('❌ Manual test failed:', error);
      setDatabaseStatus({ 
        connected: false, 
        error: error.message,
        message: 'Manual test failed'
      });
    } finally {
      setConnectionTesting(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    analyticsService.clearCache();
    await loadDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { conversations, metrics, activity, hourlyData, dailyData, isDemoData, lastUpdated } = dashboardData || {};

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to your Analytics Dashboard! 📊</h1>
            <p className="text-blue-100">
              Real-time insights into your conversations and support performance.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-white bg-opacity-10 text-blue-200 hover:bg-opacity-20'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Conversations"
          value={conversations?.active || 0}
          change="+12%"
          changeType="increase"
          icon="💬"
          color="blue"
          subtitle={`${conversations?.total || 0} total conversations`}
        />
        <MetricCard 
          title="Avg Response Time"
          value={metrics?.avgResponseTimeFormatted || '2m 30s'}
          change="-8%"
          changeType="decrease"
          icon="⏱️"
          color="green"
          subtitle="Target: under 3 minutes"
        />
        <MetricCard 
          title="Customer Satisfaction"
          value={`${metrics?.satisfaction?.toFixed(1) || '4.6'}/5`}
          change="+5%"
          changeType="increase"
          icon="⭐"
          color="purple"
          subtitle={`${conversations?.resolved || 0} ratings collected`}
        />
        <MetricCard 
          title="Resolution Rate"
          value={`${metrics?.resolutionRate || 87}%`}
          change="+3%"
          changeType="increase"
          icon="✅"
          color="orange"
          subtitle={`${conversations?.resolved || 0} resolved today`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversation Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Conversation Trends</h3>
          <SimpleLineChart 
            data={hourlyData} 
            dataKey="conversations"
            color="#3B82F6"
          />
          <p className="text-sm text-gray-600 mt-2">
            Peak hours: 9 AM - 5 PM • Total today: {hourlyData?.reduce((sum, h) => sum + h.conversations, 0) || 0}
          </p>
        </div>

        {/* Weekly Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Performance</h3>
          <SimpleBarChart 
            data={dailyData} 
            dataKey="conversations"
            color="#10B981"
          />
          <p className="text-sm text-gray-600 mt-2">
            Weekly total: {dailyData?.reduce((sum, d) => sum + d.conversations, 0) || 0} conversations
          </p>
        </div>
      </div>

      {/* Conversation Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversation Status Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Status</h3>
          <SimpleDonutChart 
            title=""
            data={[
              { label: 'Resolved', value: conversations?.resolved || 0 },
              { label: 'Active', value: conversations?.active || 0 },
              { label: 'Waiting', value: conversations?.waiting || 0 },
              { label: 'Escalated', value: conversations?.escalated || 0 }
            ]}
            colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
          />
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={activity || []} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate && onNavigate('botbuilder')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
              <div>
                <p className="font-medium text-blue-900">Configure Bot</p>
                <p className="text-sm text-blue-600">Update responses & settings</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('livechat')}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
              <div>
                <p className="font-medium text-green-900">Live Chats</p>
                <p className="text-sm text-green-600">{conversations?.active || 0} active now</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('integrations')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">🔌</span>
              <div>
                <p className="font-medium text-purple-900">Integrations</p>
                <p className="text-sm text-purple-600">Connect services</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate && onNavigate('settings')}
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
              <div>
                <p className="font-medium text-orange-900">Settings</p>
                <p className="text-sm text-orange-600">Platform configuration</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
