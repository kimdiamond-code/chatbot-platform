import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { exportCompleteReport, generatePrintableReport } from '../utils/exportAnalytics';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    insights: {
      shoppersIntelligence: {},
      missingInfo: [],
      aiRecommendations: []
    },
    sales: {
      conversionRate: 0,
      aiGeneratedSales: 0,
      aiGeneratedOrders: 0,
      aov: 0,
      pdpRedirects: 0,
      addToCart: 0,
      conversations: 0
    },
    engagement: {
      engagementRate: 0,
      conversationsByCustomerType: {},
      proactiveEngagementRate: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch(timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Fetch conversations from Neon database
      const conversations = await dbService.getConversations('00000000-0000-0000-0000-000000000001');
      
      // Filter by date range
      const filteredConversations = conversations.filter(conv => {
        const convDate = new Date(conv.created_at);
        return convDate >= startDate && convDate <= endDate;
      });

      // Fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        filteredConversations.map(async (conv) => {
          try {
            const messages = await dbService.getMessages(conv.id);
            return { ...conv, messages };
          } catch (error) {
            console.warn('Failed to load messages for conversation:', conv.id);
            return { ...conv, messages: [] };
          }
        })
      );

      // Process analytics
      processAnalytics(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Show demo data on error
      processAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (conversations) => {
    const totalConversations = conversations.length;
    
    // Sales Metrics
    const aiGeneratedOrders = conversations.filter(c => c.metadata?.orderPlaced).length;
    const aiGeneratedSales = conversations
      .filter(c => c.metadata?.orderValue)
      .reduce((sum, c) => sum + (c.metadata.orderValue || 0), 0);
    const aov = aiGeneratedOrders > 0 ? aiGeneratedSales / aiGeneratedOrders : 0;
    const pdpRedirects = conversations.filter(c => c.metadata?.redirectedToPDP).length;
    const addToCart = conversations.filter(c => c.metadata?.addedToCart).length;
    const conversionRate = totalConversations > 0 ? (aiGeneratedOrders / totalConversations) * 100 : 0;

    // Engagement Metrics
    const engagedConversations = conversations.filter(c => 
      (c.messages?.length || 0) >= 3
    ).length;
    const engagementRate = totalConversations > 0 ? (engagedConversations / totalConversations) * 100 : 0;
    
    const proactiveConversations = conversations.filter(c => c.metadata?.isProactive).length;
    const proactiveEngagementRate = proactiveConversations > 0 
      ? (conversations.filter(c => c.metadata?.isProactive && (c.messages?.length || 0) >= 3).length / proactiveConversations) * 100 
      : 0;

    // Customer Type Analysis
    const customerTypes = {
      new: conversations.filter(c => c.metadata?.customerType === 'new').length,
      returning: conversations.filter(c => c.metadata?.customerType === 'returning').length,
      vip: conversations.filter(c => c.metadata?.customerType === 'vip').length,
      anonymous: conversations.filter(c => !c.metadata?.customerType).length
    };

    // Shoppers Intelligence
    const topProducts = {};
    const topCategories = {};
    conversations.forEach(c => {
      if (c.metadata?.productsDiscussed) {
        c.metadata.productsDiscussed.forEach(product => {
          topProducts[product] = (topProducts[product] || 0) + 1;
        });
      }
      if (c.metadata?.categoriesDiscussed) {
        c.metadata.categoriesDiscussed.forEach(category => {
          topCategories[category] = (topCategories[category] || 0) + 1;
        });
      }
    });

    // Missing Info Analysis
    const missingInfoTypes = {};
    conversations.forEach(c => {
      if (c.metadata?.missingInfo) {
        c.metadata.missingInfo.forEach(info => {
          missingInfoTypes[info] = (missingInfoTypes[info] || 0) + 1;
        });
      }
    });

    setAnalyticsData({
      insights: {
        shoppersIntelligence: {
          totalVisitors: totalConversations,
          topProducts: Object.entries(topProducts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count })),
          topCategories: Object.entries(topCategories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count })),
          averageSessionTime: calculateAverageSessionTime(conversations),
          conversionFunnel: calculateConversionFunnel(conversations)
        },
        missingInfo: Object.entries(missingInfoTypes)
          .sort(([,a], [,b]) => b - a)
          .map(([type, count]) => ({ type, count, percentage: (count / totalConversations * 100).toFixed(1) })),
        aiRecommendations: generateRecommendations(conversations, {
          conversionRate,
          engagementRate,
          missingInfoTypes
        })
      },
      sales: {
        conversionRate: conversionRate.toFixed(2),
        aiGeneratedSales: aiGeneratedSales.toFixed(2),
        aiGeneratedOrders,
        aov: aov.toFixed(2),
        pdpRedirects,
        addToCart,
        conversations: totalConversations
      },
      engagement: {
        engagementRate: engagementRate.toFixed(2),
        conversationsByCustomerType: customerTypes,
        proactiveEngagementRate: proactiveEngagementRate.toFixed(2),
        totalEngaged: engagedConversations
      }
    });
  };

  const calculateAverageSessionTime = (conversations) => {
    const sessionTimes = conversations
      .map(c => {
        if (!c.ended_at || !c.created_at) return 0;
        return (new Date(c.ended_at) - new Date(c.created_at)) / 1000 / 60; // minutes
      })
      .filter(t => t > 0);
    
    return sessionTimes.length > 0 
      ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length).toFixed(1)
      : 0;
  };

  const calculateConversionFunnel = (conversations) => {
    const total = conversations.length;
    const engaged = conversations.filter(c => (c.messages?.length || 0) >= 3).length;
    const productViews = conversations.filter(c => c.metadata?.viewedProduct).length;
    const addedToCart = conversations.filter(c => c.metadata?.addedToCart).length;
    const purchased = conversations.filter(c => c.metadata?.orderPlaced).length;

    return [
      { stage: 'Started Chat', count: total, percentage: 100 },
      { stage: 'Engaged', count: engaged, percentage: ((engaged / total) * 100).toFixed(1) },
      { stage: 'Viewed Product', count: productViews, percentage: ((productViews / total) * 100).toFixed(1) },
      { stage: 'Added to Cart', count: addedToCart, percentage: ((addedToCart / total) * 100).toFixed(1) },
      { stage: 'Purchased', count: purchased, percentage: ((purchased / total) * 100).toFixed(1) }
    ];
  };

  const generateRecommendations = (conversations, metrics) => {
    const recommendations = [];

    if (metrics.conversionRate < 3) {
      recommendations.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        description: 'Consider improving product recommendations and making the purchase process more intuitive.',
        impact: 'high'
      });
    }

    if (metrics.engagementRate < 50) {
      recommendations.push({
        type: 'warning',
        title: 'Low Engagement Rate',
        description: 'Optimize bot responses and add more interactive elements to keep users engaged.',
        impact: 'high'
      });
    }

    if (Object.keys(metrics.missingInfoTypes).length > 0) {
      const topMissing = Object.entries(metrics.missingInfoTypes)[0];
      recommendations.push({
        type: 'info',
        title: 'Missing Information Detected',
        description: `${topMissing[1]} conversations missing ${topMissing[0]}. Consider adding this to your knowledge base.`,
        impact: 'medium'
      });
    }

    if (metrics.conversionRate > 5 && metrics.engagementRate > 60) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Performance',
        description: 'Your chatbot is performing well! Consider scaling proactive engagement.',
        impact: 'low'
      });
    }

    return recommendations;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your chatbot performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>
            Refresh
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button 
                onClick={() => exportCompleteReport(analyticsData, 'csv')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 rounded-t-lg"
              >
                <i className="fas fa-file-csv mr-2"></i>
                Export as CSV
              </button>
              <button 
                onClick={() => exportCompleteReport(analyticsData, 'json')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              >
                <i className="fas fa-file-code mr-2"></i>
                Export as JSON
              </button>
              <button 
                onClick={() => generatePrintableReport(analyticsData)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 rounded-b-lg"
              >
                <i className="fas fa-print mr-2"></i>
                Printable Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Conversion Rate"
            value={`${analyticsData.sales.conversionRate}%`}
            icon="📈"
            trend="+2.3%"
            trendUp={true}
          />
          <MetricCard
            title="AI Generated Sales"
            value={`$${analyticsData.sales.aiGeneratedSales}`}
            icon="💰"
            trend="+$1,234"
            trendUp={true}
          />
          <MetricCard
            title="AI Generated Orders"
            value={analyticsData.sales.aiGeneratedOrders}
            icon="🛒"
            trend="+15"
            trendUp={true}
          />
          <MetricCard
            title="Average Order Value"
            value={`$${analyticsData.sales.aov}`}
            icon="💵"
            trend="+$12"
            trendUp={true}
          />
          <MetricCard
            title="PDP Redirects"
            value={analyticsData.sales.pdpRedirects}
            icon="🔗"
            trend="+8"
            trendUp={true}
          />
          <MetricCard
            title="Add to Cart"
            value={analyticsData.sales.addToCart}
            icon="🛍️"
            trend="+12"
            trendUp={true}
          />
          <MetricCard
            title="Conversations"
            value={analyticsData.sales.conversations}
            icon="💬"
            trend="+45"
            trendUp={true}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Overall Engagement Rate"
            value={`${analyticsData.engagement.engagementRate}%`}
            icon="⚡"
            subtitle={`${analyticsData.engagement.totalEngaged} engaged conversations`}
          />
          <MetricCard
            title="Proactive Engagement"
            value={`${analyticsData.engagement.proactiveEngagementRate}%`}
            icon="🎯"
            subtitle="From proactive triggers"
          />
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Conversations by Customer Type</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="space-y-3">
              {Object.entries(analyticsData.engagement.conversationsByCustomerType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shoppers Intelligence */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🛍️ Shoppers Intelligence</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.insights.shoppersIntelligence.totalVisitors}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg. Session Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.insights.shoppersIntelligence.averageSessionTime}m
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Products Discussed</h4>
              <div className="space-y-2">
                {analyticsData.insights.shoppersIntelligence.topProducts?.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{product.name}</span>
                    <span className="font-semibold text-gray-900">{product.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Conversion Funnel</h4>
              <div className="space-y-2">
                {analyticsData.insights.shoppersIntelligence.conversionFunnel?.map((stage, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{stage.stage}</span>
                      <span className="font-semibold text-gray-900">{stage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Missing Info & AI Recommendations */}
        <div className="space-y-6">
          {/* Missing Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Missing Information</h3>
            {analyticsData.insights.missingInfo.length > 0 ? (
              <div className="space-y-2">
                {analyticsData.insights.missingInfo.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.type}</p>
                      <p className="text-xs text-gray-600">{item.count} conversations affected</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">No missing information detected</p>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Recommendations</h3>
            <div className="space-y-3">
              {analyticsData.insights.aiRecommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'success' ? 'bg-green-50 border-green-500' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      rec.impact === 'high' ? 'bg-red-100 text-red-600' :
                      rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {rec.impact.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Type Distribution Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={Object.entries(analyticsData.engagement.conversationsByCustomerType).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {Object.keys(analyticsData.engagement.conversationsByCustomerType).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, trend, trendUp, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-600">{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
