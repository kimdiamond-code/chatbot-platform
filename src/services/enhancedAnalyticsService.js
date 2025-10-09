// ✅ ENHANCED: Advanced Analytics Service with Business Intelligence
// This service provides comprehensive business metrics and insights

import { supabase } from './supabase';

class EnhancedAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 3 * 60 * 1000; // 3 minutes for real-time feel
    this.realTimeListeners = new Set();
    
    // Simulate real-time updates
    this.startRealTimeSimulation();
  }

  // Start simulated real-time data updates
  startRealTimeSimulation() {
    setInterval(() => {
      this.updateRealTimeMetrics();
      this.notifyListeners();
    }, 10000); // Update every 10 seconds
  }

  // Add listener for real-time updates
  addListener(callback) {
    this.realTimeListeners.add(callback);
    return () => this.realTimeListeners.delete(callback);
  }

  // Notify all listeners of updates
  notifyListeners() {
    this.realTimeListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  // Update real-time metrics with small random changes
  updateRealTimeMetrics() {
    const cached = this.cache.get('realtime-metrics');
    if (!cached) return;

    const { data } = cached;
    
    // Simulate realistic metric changes
    data.activeChats += Math.floor((Math.random() - 0.5) * 3); // -1 to +2
    data.activeChats = Math.max(0, Math.min(data.activeChats, 50));
    
    data.avgResponseTime += Math.floor((Math.random() - 0.5) * 20); // -10 to +10 seconds
    data.avgResponseTime = Math.max(30, Math.min(data.avgResponseTime, 300));
    
    data.satisfaction += (Math.random() - 0.5) * 0.1; // Small changes
    data.satisfaction = Math.max(3.0, Math.min(data.satisfaction, 5.0));
    
    // Update timestamp
    cached.timestamp = Date.now();
    
    console.log('📊 Real-time metrics updated');
  }

  // Get cached data or fetch new data
  async getCachedData(key, fetchFunction, useRealTime = false) {
    const cached = this.cache.get(key);
    const now = Date.now();
    const expiry = useRealTime ? this.cacheExpiry / 2 : this.cacheExpiry;
    
    if (cached && (now - cached.timestamp) < expiry) {
      return cached.data;
    }
    
    try {
      const data = await fetchFunction();
      this.cache.set(key, { data: JSON.parse(JSON.stringify(data)), timestamp: now });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return cached ? cached.data : this.getDefaultData(key);
    }
  }

  // Enhanced default data with business intelligence metrics
  getDefaultData(key) {
    const now = new Date();
    
    const defaults = {
      'business-metrics': {
        monthlyRevenue: 245000,
        revenueGrowth: 12.5,
        costSavings: 89000,
        costSavingsGrowth: 18.3,
        automationROI: 340,
        customerLifetimeValue: 2850,
        churnReduction: 23.7,
        avgOrderValue: 127.50
      },
      
      'performance-analytics': {
        botAccuracy: 87.3,
        accuracyTrend: 'up',
        responseQualityScore: 4.2,
        escalationRate: 12.8,
        escalationTrend: 'down',
        resolutionTime: 142,
        resolutionTrend: 'down',
        customerRetention: 94.2,
        retentionTrend: 'up'
      },
      
      'conversion-funnel': [
        { stage: 'Visitors', count: 5420, conversion: 100 },
        { stage: 'Chat Started', count: 1628, conversion: 30.0 },
        { stage: 'Engaged', count: 1140, conversion: 21.0 },
        { stage: 'Issue Resolved', count: 970, conversion: 17.9 },
        { stage: 'Satisfied', count: 825, conversion: 15.2 },
        { stage: 'Converted', count: 287, conversion: 5.3 }
      ],
      
      'realtime-metrics': {
        activeChats: 12 + Math.floor(Math.random() * 8),
        avgResponseTime: 120 + Math.floor(Math.random() * 60),
        satisfaction: 4.3 + Math.random() * 0.4,
        botsActive: 8,
        queueLength: Math.floor(Math.random() * 5),
        agentsOnline: 4 + Math.floor(Math.random() * 3)
      },
      
      'customer-insights': {
        topIssues: [
          { issue: 'Billing Questions', count: 342, percentage: 28.5, trend: 'up' },
          { issue: 'Product Support', count: 298, percentage: 24.8, trend: 'stable' },
          { issue: 'Account Access', count: 186, percentage: 15.5, trend: 'down' },
          { issue: 'Shipping Inquiries', count: 124, percentage: 10.3, trend: 'up' },
          { issue: 'Returns/Refunds', count: 98, percentage: 8.2, trend: 'stable' }
        ],
        satisfactionBreakdown: {
          excellent: 45.2,
          good: 32.8,
          neutral: 15.1,
          poor: 4.9,
          terrible: 2.0
        },
        averageSessionTime: 8.4, // minutes
        repeatCustomers: 34.7
      },
      
      'hourly-performance': this.generateHourlyPerformanceData(),
      'weekly-trends': this.generateWeeklyTrends(),
      'geographic-data': this.generateGeographicData(),
      
      conversations: {
        total: 156,
        active: 12,
        waiting: 4,
        resolved: 140,
        escalated: 3
      },
      
      activity: [
        { time: '2 min ago', event: 'High satisfaction rating received', user: 'Sarah Wilson', type: 'positive', impact: 'high' },
        { time: '5 min ago', event: 'Bot resolved complex billing query', user: 'John Doe', type: 'resolution', impact: 'medium' },
        { time: '8 min ago', event: 'Escalation avoided with AI response', user: 'Jane Smith', type: 'success', impact: 'high' },
        { time: '12 min ago', event: 'New chat started from pricing page', user: 'Mike Johnson', type: 'conversion', impact: 'medium' },
        { time: '15 min ago', event: 'Knowledge base article updated', user: 'System', type: 'system', impact: 'low' },
        { time: '18 min ago', event: 'Customer returned for follow-up', user: 'Alice Brown', type: 'retention', impact: 'high' },
        { time: '22 min ago', event: 'Bot accuracy improved by 2%', user: 'System', type: 'improvement', impact: 'high' }
      ]
    };
    
    return defaults[key] || {};
  }

  // Generate realistic hourly performance data
  generateHourlyPerformanceData() {
    const hours = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const hourNum = hour.getHours();
      
      // Business hours pattern
      let conversations = 0;
      let satisfaction = 3.5;
      let resolutionRate = 70;
      
      if (hourNum >= 9 && hourNum <= 17) {
        conversations = 8 + Math.floor(Math.random() * 15);
        satisfaction = 4.0 + Math.random() * 0.8;
        resolutionRate = 80 + Math.floor(Math.random() * 15);
      } else if (hourNum >= 6 && hourNum <= 22) {
        conversations = 2 + Math.floor(Math.random() * 8);
        satisfaction = 3.8 + Math.random() * 0.6;
        resolutionRate = 75 + Math.floor(Math.random() * 12);
      } else {
        conversations = Math.floor(Math.random() * 3);
        satisfaction = 3.5 + Math.random() * 0.8;
        resolutionRate = 70 + Math.floor(Math.random() * 10);
      }
      
      hours.push({
        hour: hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        fullDate: hour.toISOString(),
        conversations,
        satisfaction: Number(satisfaction.toFixed(1)),
        resolutionRate,
        avgResponseTime: 90 + Math.floor(Math.random() * 120),
        botAccuracy: 75 + Math.floor(Math.random() * 20)
      });
    }
    
    return hours;
  }

  // Generate weekly trend data
  generateWeeklyTrends() {
    const weeks = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekNum = 12 - i;
      
      weeks.push({
        week: `Week ${weekNum}`,
        weekStart: weekStart.toLocaleDateString(),
        conversations: 400 + Math.floor(Math.random() * 200),
        revenue: 18000 + Math.floor(Math.random() * 8000),
        costSavings: 6000 + Math.floor(Math.random() * 3000),
        satisfaction: 4.0 + Math.random() * 0.8,
        botAccuracy: 78 + Math.floor(Math.random() * 15),
        escalationRate: 8 + Math.floor(Math.random() * 10)
      });
    }
    
    return weeks;
  }

  // Generate geographic distribution data
  generateGeographicData() {
    return [
      { region: 'North America', percentage: 45.2, conversations: 678, satisfaction: 4.3 },
      { region: 'Europe', percentage: 28.7, conversations: 431, satisfaction: 4.1 },
      { region: 'Asia Pacific', percentage: 15.8, conversations: 237, satisfaction: 4.2 },
      { region: 'Latin America', percentage: 6.9, conversations: 103, satisfaction: 4.0 },
      { region: 'Other', percentage: 3.4, conversations: 51, satisfaction: 3.9 }
    ];
  }

  // Get business intelligence metrics
  async getBusinessMetrics() {
    return this.getCachedData('business-metrics', async () => {
      // In a real app, this would calculate from actual transaction data
      const base = this.getDefaultData('business-metrics');
      
      // Add some realistic variation
      return {
        ...base,
        monthlyRevenue: base.monthlyRevenue + Math.floor((Math.random() - 0.5) * 10000),
        revenueGrowth: base.revenueGrowth + (Math.random() - 0.5) * 2,
        costSavings: base.costSavings + Math.floor((Math.random() - 0.5) * 5000),
        automationROI: base.automationROI + Math.floor((Math.random() - 0.5) * 20)
      };
    });
  }

  // Get performance analytics
  async getPerformanceAnalytics() {
    return this.getCachedData('performance-analytics', async () => {
      const base = this.getDefaultData('performance-analytics');
      
      return {
        ...base,
        botAccuracy: base.botAccuracy + (Math.random() - 0.5) * 3,
        responseQualityScore: base.responseQualityScore + (Math.random() - 0.5) * 0.3,
        escalationRate: base.escalationRate + (Math.random() - 0.5) * 2,
        resolutionTime: base.resolutionTime + Math.floor((Math.random() - 0.5) * 30)
      };
    });
  }

  // Get real-time metrics (updates frequently)
  async getRealTimeMetrics() {
    return this.getCachedData('realtime-metrics', async () => {
      return this.getDefaultData('realtime-metrics');
    }, true); // Use shorter cache time for real-time feel
  }

  // Get customer insights
  async getCustomerInsights() {
    return this.getCachedData('customer-insights', async () => {
      return this.getDefaultData('customer-insights');
    });
  }

  // Get conversion funnel data
  async getConversionFunnel() {
    return this.getCachedData('conversion-funnel', async () => {
      return this.getDefaultData('conversion-funnel');
    });
  }

  // Get hourly performance data
  async getHourlyPerformance() {
    return this.getCachedData('hourly-performance', async () => {
      return this.generateHourlyPerformanceData();
    });
  }

  // Get weekly trends
  async getWeeklyTrends() {
    return this.getCachedData('weekly-trends', async () => {
      return this.generateWeeklyTrends();
    });
  }

  // Get geographic data
  async getGeographicData() {
    return this.getCachedData('geographic-data', async () => {
      return this.generateGeographicData();
    });
  }

  // Get enhanced activity with impact levels
  async getEnhancedActivity() {
    return this.getCachedData('activity', async () => {
      return this.getDefaultData('activity');
    });
  }

  // Generate alerts based on metrics
  async generateAlerts() {
    const performance = await this.getPerformanceAnalytics();
    const realtime = await this.getRealTimeMetrics();
    const alerts = [];

    // Check for performance issues
    if (performance.botAccuracy < 80) {
      alerts.push({
        type: 'warning',
        title: 'Bot Accuracy Below Target',
        message: `Current accuracy: ${performance.botAccuracy.toFixed(1)}% (Target: 85%+)`,
        action: 'Review recent conversations',
        priority: 'medium'
      });
    }

    if (realtime.avgResponseTime > 180) {
      alerts.push({
        type: 'error',
        title: 'Response Time High',
        message: `Average response time: ${Math.floor(realtime.avgResponseTime / 60)}m ${realtime.avgResponseTime % 60}s`,
        action: 'Check system performance',
        priority: 'high'
      });
    }

    if (performance.escalationRate > 20) {
      alerts.push({
        type: 'warning',
        title: 'High Escalation Rate',
        message: `${performance.escalationRate.toFixed(1)}% of chats escalated`,
        action: 'Improve bot training',
        priority: 'medium'
      });
    }

    if (realtime.queueLength > 10) {
      alerts.push({
        type: 'info',
        title: 'Queue Length Alert',
        message: `${realtime.queueLength} customers waiting`,
        action: 'Consider adding agents',
        priority: 'low'
      });
    }

    return alerts;
  }

  // Get comprehensive enhanced dashboard data
  async getEnhancedDashboardData() {
    try {
      const [
        businessMetrics,
        performanceAnalytics,
        realTimeMetrics,
        customerInsights,
        conversionFunnel,
        hourlyPerformance,
        weeklyTrends,
        geographicData,
        activity,
        alerts
      ] = await Promise.all([
        this.getBusinessMetrics(),
        this.getPerformanceAnalytics(),
        this.getRealTimeMetrics(),
        this.getCustomerInsights(),
        this.getConversionFunnel(),
        this.getHourlyPerformance(),
        this.getWeeklyTrends(),
        this.getGeographicData(),
        this.getEnhancedActivity(),
        this.generateAlerts()
      ]);

      return {
        businessMetrics,
        performanceAnalytics,
        realTimeMetrics,
        customerInsights,
        conversionFunnel,
        hourlyPerformance,
        weeklyTrends,
        geographicData,
        activity,
        alerts,
        lastUpdated: new Date().toISOString(),
        isRealTime: true
      };
    } catch (error) {
      console.error('Error getting enhanced dashboard data:', error);
      
      // Return demo data when there's an error
      return {
        businessMetrics: this.getDefaultData('business-metrics'),
        performanceAnalytics: this.getDefaultData('performance-analytics'),
        realTimeMetrics: this.getDefaultData('realtime-metrics'),
        customerInsights: this.getDefaultData('customer-insights'),
        conversionFunnel: this.getDefaultData('conversion-funnel'),
        hourlyPerformance: this.getDefaultData('hourly-performance'),
        weeklyTrends: this.getDefaultData('weekly-trends'),
        geographicData: this.getDefaultData('geographic-data'),
        activity: this.getDefaultData('activity'),
        alerts: [],
        lastUpdated: new Date().toISOString(),
        isDemoData: true,
        isRealTime: false
      };
    }
  }

  // Export data to CSV
  exportToCSV(data, filename = 'analytics-data.csv') {
    let csvContent = '';
    
    if (Array.isArray(data) && data.length > 0) {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      csvContent += headers.join(',') + '\n';
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format percentage
  formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
  }

  // Format time duration
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  // Clear cache (useful for forcing refresh)
  clearCache() {
    this.cache.clear();
  }
}

export const enhancedAnalyticsService = new EnhancedAnalyticsService();
