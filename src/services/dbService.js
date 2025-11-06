// Database Service Wrapper
// Provides backward compatibility for components expecting dbService

import databaseService from './databaseService.js';

// Re-export databaseService as dbService
export const dbService = databaseService;
export default databaseService;
