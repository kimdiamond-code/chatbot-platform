import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dbService } from '../services/databaseService';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Demo conversations fallback
const DEMO_CONVERSATIONS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    organization_id: DEFAULT_ORG_ID,
    customer_email: 'john@example.com',
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    status: 'active',
    channel: 'web',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    organization_id: DEFAULT_ORG_ID,
    customer_email: 'jane@example.com',
    customer_name: 'Jane Smith',
    customer_phone: '+1987654321',
    status: 'waiting',
    channel: 'web',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const useConversations = (orgId = DEFAULT_ORG_ID) => {
  const [initialized, setInitialized] = React.useState(false);

  // Fetch conversations from database with limit
  const { 
    data: conversations = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['conversations', orgId],
    queryFn: async () => {
      try {
        // Fetch only recent 50 conversations
        const convs = await dbService.getConversations(orgId, 50);
        console.log('💬 Loaded conversations from database:', convs.length);
        
        // If no conversations exist, create demo conversations in database
        if (!convs || convs.length === 0) {
          console.log('📝 No conversations found, creating demo conversations in Neon...');
          
          const demoConversations = [
            {
              organization_id: orgId,
              customer_email: 'john@example.com',
              customer_name: 'John Doe',
              customer_phone: '+1234567890',
              status: 'active',
              channel: 'web'
            },
            {
              organization_id: orgId,
              customer_email: 'jane@example.com',
              customer_name: 'Jane Smith',
              customer_phone: '+1987654321',
              status: 'waiting',
              channel: 'web'
            }
          ];
          
          // Create conversations in database
          const createdConvs = [];
          for (const conv of demoConversations) {
            try {
              const created = await dbService.createConversation(conv);
              createdConvs.push(created);
              console.log('✅ Created conversation:', created.id);
            } catch (error) {
              console.error('❌ Failed to create conversation:', error);
            }
          }
          
          return createdConvs.length > 0 ? createdConvs : DEMO_CONVERSATIONS;
        }
        
        return convs;
      } catch (error) {
        console.error('❌ Failed to load conversations:', error);
        // Return demo conversations as fallback
        return DEMO_CONVERSATIONS;
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds (reduced from 10)
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (conversationData) => {
      try {
        const newConv = await dbService.createConversation({
          organization_id: orgId,
          ...conversationData
        });
        console.log('✅ Conversation created:', newConv.id);
        return newConv;
      } catch (error) {
        console.error('❌ Failed to create conversation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  const createConversation = async (customerData) => {
    return createConversationMutation.mutateAsync({
      customer_email: customerData.email,
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      channel: customerData.channel || 'web',
      status: 'active'
    });
  };

  // Delete single conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId) => {
      try {
        await dbService.deleteConversation(conversationId);
        console.log('🗑️ Conversation deleted:', conversationId);
        return conversationId;
      } catch (error) {
        console.error('❌ Failed to delete conversation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  const deleteConversation = async (conversationId) => {
    return deleteConversationMutation.mutateAsync(conversationId);
  };

  // Clear all conversations
  const clearAllConversationsMutation = useMutation({
    mutationFn: async () => {
      try {
        await dbService.clearAllConversations(orgId);
        console.log('🗑️ All conversations cleared');
        return true;
      } catch (error) {
        console.error('❌ Failed to clear conversations:', error);
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  const clearAllConversations = async () => {
    return clearAllConversationsMutation.mutateAsync();
  };

  return {
    conversations,
    loading: isLoading,
    error,
    createConversation,
    creating: createConversationMutation.isPending || createConversationMutation.isLoading,
    deleteConversation,
    deleting: deleteConversationMutation.isPending || deleteConversationMutation.isLoading,
    clearAllConversations,
    clearingAll: clearAllConversationsMutation.isPending || clearAllConversationsMutation.isLoading,
    refetch
  };
};

export default useConversations;
