import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/api'
import { useOrganization } from '../contexts/OrganizationContext'

export const useAnalytics = (timeframe = '7d') => {
  const { currentOrganization } = useOrganization()

  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['analytics', 'stats', currentOrganization?.id, timeframe],
    queryFn: () => analyticsService.getConversationStats(currentOrganization?.id, timeframe),
    enabled: !!currentOrganization?.id,
  })

  const {
    data: messageVolume,
    isLoading: volumeLoading
  } = useQuery({
    queryKey: ['analytics', 'volume', currentOrganization?.id, timeframe],
    queryFn: () => analyticsService.getMessageVolume(currentOrganization?.id, timeframe),
    enabled: !!currentOrganization?.id,
  })

  const {
    data: agentPerformance,
    isLoading: performanceLoading
  } = useQuery({
    queryKey: ['analytics', 'performance', currentOrganization?.id],
    queryFn: () => analyticsService.getAgentPerformance(currentOrganization?.id),
    enabled: !!currentOrganization?.id,
  })

  return {
    stats: stats?.data,
    messageVolume: messageVolume?.data,
    agentPerformance: agentPerformance?.data,
    loading: statsLoading || volumeLoading || performanceLoading
  }
}
