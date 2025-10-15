import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useConversations } from '../hooks/useConversations'

export default function Dashboard() {
  const { user } = useAuth()

  // ✅ Fetch stats
  const { data: statsResp, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', user?.organization_id],
    queryFn: () => analyticsService.getConversationStats(user?.organization_id, '7'),
    enabled: !!user?.organization_id || true, // still run in demo mode
    refetchInterval: 60000
  })

  // ✅ Extract stats & demo flag
  const stats = statsResp?.data || {}
  const statsFallback = statsResp?.fallback === true

  // ✅ Conversations
  const { conversations, loading: conversationsLoading } = useConversations()
  const conversationsFallback = conversations?.fallback === true

  // --- StatCard, RecentActivity, PerformanceOverview, QuickActions (unchanged) ---

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your chats today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <button 
              className="bg-royal-500 text-white px-4 py-2 rounded-lg hover:bg-royal-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-refresh mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="fas fa-comments"
          label="Active Chats"
          value={stats.open || 0}
          change="+12% from yesterday"
          color="green"
          isLoading={statsLoading}
        />
        <StatCard
          icon="fas fa-robot"
          label="Bot Responses"
          value={stats.botResponses || '847'}
          change="+5% from yesterday"
          color="blue"
          isLoading={statsLoading}
        />
        <StatCard
          icon="fas fa-clock"
          label="Avg Response Time"
          value={stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime/60000)}m` : '—'}
          change="-0.5m improvement"
          color="yellow"
          isLoading={statsLoading}
        />
        <StatCard
          icon="fas fa-star"
          label="Satisfaction Score"
          value={stats.customerSatisfaction || '4.8/5'}
          change="+0.1 from yesterday"
          color="purple"
          isLoading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <PerformanceOverview />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
