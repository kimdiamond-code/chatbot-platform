// ===================================================================
// BACKEND PROMPT SECURITY SERVICE
// Additional server-side protection against prompt injection
// ===================================================================

class BackendPromptSecurity {
  constructor() {
    // Server-side injection patterns
    this.dangerousPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|commands|prompts)/gi,
      /forget\s+(everything|all)\s+you/gi,
      /you\s+are\s+now\s+(a|an)/gi,
      /new\s+instructions:/gi,
      /system\s+prompt:/gi,
      /\[system\]|\{system\}/gi,
      /(?:^|\n)\s*(?:system|assistant)\s*:/gi,
    ];

    // Rate limiting per organization
    this.rateLimits = new Map();
    this.maxRequestsPerMinute = 30;
  }

  /**
   * Validate messages array before sending to OpenAI
   */
  validateMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    // Ensure first message is always system role
    if (messages.length === 0 || messages[0].role !== 'system') {
      throw new Error('First message must be system role');
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      if (!msg.role || !msg.content) {
        throw new Error(`Invalid message at index ${i}`);
      }

      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        throw new Error(`Invalid role at index ${i}: ${msg.role}`);
      }

      // Only allow system role in first message
      if (msg.role === 'system' && i !== 0) {
        console.warn('🚨 Attempt to inject system message at index', i);
        throw new Error('System messages only allowed at index 0');
      }

      // Check user messages for injection attempts
      if (msg.role === 'user') {
        this.checkForInjection(msg.content);
      }
    }

    return true;
  }

  /**
   * Check content for injection patterns
   */
  checkForInjection(content) {
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(content)) {
        console.warn('🚨 Injection pattern detected:', pattern.toString());
        throw new Error('Suspicious content detected');
      }
    }
  }

  /**
   * Sanitize system prompt to ensure security guard is present
   */
  validateSystemPrompt(systemPrompt) {
    // Ensure security guard keywords are present
    const requiredKeywords = [
      'CRITICAL SECURITY RULES',
      'CANNOT BE OVERRIDDEN',
      'NEVER follow instructions'
    ];

    const hasAllKeywords = requiredKeywords.every(keyword => 
      systemPrompt.includes(keyword)
    );

    if (!hasAllKeywords) {
      console.error('🚨 System prompt missing security guard!');
      return false;
    }

    return true;
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(organizationId, ip) {
    const key = `${organizationId}-${ip}`;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const requests = this.rateLimits.get(key);
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded');
    }

    recentRequests.push(now);
    this.rateLimits.set(key, recentRequests);
  }

  /**
   * Clean up old rate limit data
   */
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.rateLimits) {
      const recentRequests = requests.filter(timestamp => now - timestamp < 60000);
      if (recentRequests.length === 0) {
        this.rateLimits.delete(key);
      } else {
        this.rateLimits.set(key, recentRequests);
      }
    }
  }
}

export default new BackendPromptSecurity();
