// ✅ ENHANCED: Professional Enterprise Dashboard with Business Intelligence
// This dashboard provides comprehensive analytics and real-time insights

import React, { useState, useEffect } from 'react';
import { enhancedAnalyticsService } from '../services/enhancedAnalyticsService';
import { 
  EnhancedMetricCard, 
  AdvancedLineChart, 
  ConversionFunnelChart,
  GeographicChart,
  RealTimeMetrics,
  EnhancedActivityFeed,
  AlertPanel 
} from './ui/EnhancedCharts';

const ProfessionalDashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [alerts, setAlerts] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await enhancedAnalyticsService.getEnhancedDashboardData();
      setDashboardData(data);
      setAlerts(data.alerts || []);
      console.log('📊 Enhanced dashboard data loaded:', data);
    } catch (error) {
      console.error('❌ Failed to load enhanced dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time updates
  useEffect(() => {
    loadDashboardData();
    
    // Setup real-time listener
    const unsubscribe = enhancedAnalyticsService.addListener(() => {
      loadDashboardData();
    });

    return unsubscribe;
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Export functions
  const exportData = (format, dataType) => {
    if (!dashboardData) return;

    switch (format) {
      case 'csv':
        if (dataType === 'hourly') {
          enhancedAnalyticsService.exportToCSV(
            dashboardData.hourlyPerformance, 
            'hourly-performance.csv'
          );
        } else if (dataType === 'weekly') {
          enhancedAnalyticsService.exportToCSV(
            dashboardData.weeklyTrends, 
            'weekly-trends.csv'
          );
        } else if (dataType === 'geographic') {
          enhancedAnalyticsService.exportToCSV(
            dashboardData.geographicData, 
            'geographic-distribution.csv'
          );
        }
        break;
        
      case 'pdf':
        // In a real app, you'd generate a PDF report here
        alert('PDF export functionality would be implemented with a library like jsPDF');
        break;
    }
    
    setShowExportMenu(false);
  };

  // Dismiss alert
  const dismissAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading enhanced dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Gathering business intelligence data</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    businessMetrics,
    performanceAnalytics,
    realTimeMetrics,
    customerInsights,
    conversionFunnel,
    hourlyPerformance,
    weeklyTrends,
    geographicData,
    activity,
    lastUpdated,
    isDemoData,
    isRealTime
  } = dashboardData || {};

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Business Intelligence Dashboard
              </h1>
              <p className="text-indigo-100 text-lg">
                Real-time insights and analytics for your ChatBot platform
              </p>
              {isDemoData && (
                <div className="mt-3 bg-indigo-500 bg-opacity-50 rounded-lg p-3 text-sm">
                  🎮 <strong>Demo Mode:</strong> Showing sample data with simulated real-time updates
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white bg-opacity-20 text-white border-white border-opacity-30 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📥 Export
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48 z-10">
                    <button 
                      onClick={() => exportData('csv', 'hourly')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📈 Hourly Data (CSV)
                    </button>
                    <button 
                      onClick={() => exportData('csv', 'weekly')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 Weekly Trends (CSV)
                    </button>
                    <button 
                      onClick={() => exportData('csv', 'geographic')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🌍 Geographic Data (CSV)
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={() => exportData('pdf')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📄 Full Report (PDF)
                    </button>
                  </div>
                )}
              </div>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-white bg-opacity-10 text-indigo-200 hover:bg-opacity-20'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <AlertPanel alerts={alerts} onDismiss={dismissAlert} />
      )}

      {/* Real-time Metrics */}
      {realTimeMetrics && isRealTime && (
        <RealTimeMetrics metrics={realTimeMetrics} onRefresh={loadDashboardData} />
      )}

      {/* Business Intelligence Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">💼 Business Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Monthly Revenue"
            value={enhancedAnalyticsService.formatCurrency(businessMetrics?.monthlyRevenue || 0)}
            change={`+${businessMetrics?.revenueGrowth?.toFixed(1) || 0}%`}
            changeType="increase"
            icon="💰"
            color="green"
            subtitle="Total revenue this month"
            onClick={() => onNavigate && onNavigate('revenue-details')}
          />
          
          <EnhancedMetricCard
            title="Cost Savings"
            value={enhancedAnalyticsService.formatCurrency(businessMetrics?.costSavings || 0)}
            change={`+${businessMetrics?.costSavingsGrowth?.toFixed(1) || 0}%`}
            changeType="increase"
            icon="💡"
            color="blue"
            subtitle="Automation savings"
            onClick={() => onNavigate && onNavigate('cost-analysis')}
          />
          
          <EnhancedMetricCard
            title="ROI"
            value={`${businessMetrics?.automationROI || 0}%`}
            change="+23%"
            changeType="increase"
            icon="📈"
            color="purple"
            subtitle="Return on investment"
          />
          
          <EnhancedMetricCard
            title="Customer LTV"
            value={enhancedAnalyticsService.formatCurrency(businessMetrics?.customerLifetimeValue || 0)}
            change="+8.2%"
            changeType="increase"
            icon="👥"
            color="indigo"
            subtitle="Lifetime value"
          />
        </div>
      </div>

      {/* Performance Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Performance Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Bot Accuracy"
            value={`${performanceAnalytics?.botAccuracy?.toFixed(1) || 0}%`}
            change={`${performanceAnalytics?.accuracyTrend === 'up' ? '+' : '-'}2.3%`}
            changeType={performanceAnalytics?.accuracyTrend === 'up' ? 'increase' : 'decrease'}
            icon="🎯"
            color="green"
            subtitle="Response accuracy rate"
            alert={performanceAnalytics?.botAccuracy < 80 ? 'Below target (85%)' : null}
          />
          
          <EnhancedMetricCard
            title="Quality Score"
            value={`${performanceAnalytics?.responseQualityScore?.toFixed(1) || 0}/5`}
            change="+0.2"
            changeType="increase"
            icon="⭐"
            color="orange"
            subtitle="Response quality rating"
          />
          
          <EnhancedMetricCard
            title="Escalation Rate"
            value={`${performanceAnalytics?.escalationRate?.toFixed(1) || 0}%`}
            change={`${performanceAnalytics?.escalationTrend === 'down' ? '-' : '+'}1.4%`}
            changeType={performanceAnalytics?.escalationTrend === 'down' ? 'decrease' : 'increase'}
            icon="⚠️"
            color="red"
            subtitle="Chats escalated to humans"
          />
          
          <EnhancedMetricCard
            title="Resolution Time"
            value={enhancedAnalyticsService.formatDuration(performanceAnalytics?.resolutionTime || 0)}
            change={`${performanceAnalytics?.resolutionTrend === 'down' ? '-' : '+'}18s`}
            changeType={performanceAnalytics?.resolutionTrend === 'down' ? 'decrease' : 'increase'}
            icon="⏱️"
            color="blue"
            subtitle="Average resolution time"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <AdvancedLineChart 
            data={hourlyPerformance} 
            dataKeys={['conversations', 'satisfaction', 'botAccuracy']}
            title="24-Hour Performance Trends"
            colors={['#3B82F6', '#10B981', '#F59E0B']}
            onPointClick={(point, key, index) => {
              console.log('Point clicked:', point, key, index);
            }}
          />
        </div>

        {/* Weekly Business Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <AdvancedLineChart 
            data={weeklyTrends} 
            dataKeys={['revenue', 'costSavings']}
            title="Weekly Business Performance"
            colors={['#10B981', '#3B82F6']}
          />
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <ConversionFunnelChart 
            data={conversionFunnel}
            title="Customer Journey Funnel"
          />
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <GeographicChart 
            data={geographicData}
            title="Geographic Distribution"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Activity Feed */}
        <EnhancedActivityFeed activities={activity} />

        {/* Customer Insights Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Customer Insights</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Top Issue</span>
              <span className="text-blue-600 font-semibold">
                {customerInsights?.topIssues?.[0]?.issue || 'Billing Questions'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Avg Session Time</span>
              <span className="text-green-600 font-semibold">
                {customerInsights?.averageSessionTime?.toFixed(1) || '8.4'} min
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Repeat Customers</span>
              <span className="text-purple-600 font-semibold">
                {customerInsights?.repeatCustomers?.toFixed(1) || '34.7'}%
              </span>
            </div>

            {/* Satisfaction Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Satisfaction Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(customerInsights?.satisfactionBreakdown || {}).map(([level, percentage]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{level}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate && onNavigate('botbuilder')}
            className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg p-4 text-left transition-all group"
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
            className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-lg p-4 text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
              <div>
                <p className="font-medium text-green-900">Live Chats</p>
                <p className="text-sm text-green-600">{realTimeMetrics?.activeChats || 0} active now</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('integrations')}
            className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg p-4 text-left transition-all group"
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
            className="bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-lg p-4 text-left transition-all group"
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

      {/* Footer with Update Info */}
      <div className="text-center text-sm text-gray-500 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}</span>
          {isRealTime && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time updates active</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
