// Simple bot service for testing
export const botService = {
  getBotConfig: async () => {
    return {
      id: 'test-bot',
      name: 'Test Bot',
      isEnabled: true
    };
  }
};