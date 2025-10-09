// Knowledge Base Search Service - Provides intelligent search through uploaded documents
export class KnowledgeBaseService {
  constructor() {
    this.defaultMaxResults = 3;
    this.defaultMinScore = 1; // Minimum keyword matches required
  }

  // Main search function for knowledge base
  searchKnowledgeBase(knowledgeBase, query, maxResults = this.defaultMaxResults) {
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2); // Skip very short words
    
    if (queryWords.length === 0) {
      return [];
    }

    const results = [];

    // Search through all knowledge items
    for (const item of knowledgeBase) {
      if (!item.enabled || !item.content) continue;

      // Search through content (could be chunked or full text)
      if (item.chunks && Array.isArray(item.chunks)) {
        // Search through chunks
        for (let i = 0; i < item.chunks.length; i++) {
          const chunk = item.chunks[i];
          const score = this.calculateRelevanceScore(chunk, queryWords, item.keywords || []);
          
          if (score >= this.defaultMinScore) {
            results.push({
              content: chunk,
              score,
              source: item.name,
              type: item.type || 'document',
              category: item.category || 'general',
              chunkIndex: i,
              url: item.url || null
            });
          }
        }
      } else {
        // Search through full content
        const score = this.calculateRelevanceScore(item.content, queryWords, item.keywords || []);
        
        if (score >= this.defaultMinScore) {
          // Extract relevant snippet from content
          const snippet = this.extractRelevantSnippet(item.content, queryWords);
          
          results.push({
            content: snippet,
            score,
            source: item.name,
            type: item.type || 'document',
            category: item.category || 'general',
            chunkIndex: 0,
            url: item.url || null
          });
        }
      }
    }

    // Sort by score (highest first) and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  // Calculate how relevant a piece of content is to the query
  calculateRelevanceScore(content, queryWords, itemKeywords = []) {
    const contentLower = content.toLowerCase();
    let score = 0;

    // Score based on query word matches
    for (const word of queryWords) {
      // Count occurrences of each word
      const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += matches;
      
      // Bonus for exact phrase matches
      if (matches > 0 && word.length > 4) {
        score += 0.5; // Bonus for longer words
      }
    }

    // Score based on item keywords (higher weight)
    for (const keyword of itemKeywords) {
      const keywordLower = keyword.toLowerCase();
      for (const queryWord of queryWords) {
        if (keywordLower.includes(queryWord) || queryWord.includes(keywordLower)) {
          score += 2; // Higher weight for keyword matches
        }
      }
    }

    // Bonus for multiple query words appearing close together
    const queryPhrase = queryWords.join(' ');
    if (contentLower.includes(queryPhrase)) {
      score += 2; // Bonus for phrase match
    }

    return score;
  }

  // Extract a relevant snippet from content around the matching keywords
  extractRelevantSnippet(content, queryWords, snippetLength = 200) {
    const contentLower = content.toLowerCase();
    let bestMatch = { index: 0, score: 0 };

    // Find the position with the highest concentration of query words
    for (let i = 0; i < content.length - snippetLength; i += 50) {
      const snippet = content.substring(i, i + snippetLength).toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        score += (snippet.match(new RegExp(word, 'g')) || []).length;
      }
      
      if (score > bestMatch.score) {
        bestMatch = { index: i, score };
      }
    }

    // Extract snippet around the best match
    let start = Math.max(0, bestMatch.index - 50);
    let end = Math.min(content.length, bestMatch.index + snippetLength + 50);
    
    // Try to end at sentence boundaries
    const snippet = content.substring(start, end);
    const sentences = snippet.split(/[.!?]+/);
    
    if (sentences.length > 1) {
      // Remove incomplete first and last sentences
      const completeSentences = sentences.slice(1, -1);
      if (completeSentences.length > 0) {
        return completeSentences.join('. ') + '.';
      }
    }
    
    // Fallback to character-based snippet
    let result = snippet.trim();
    if (start > 0) result = '...' + result;
    if (end < content.length) result = result + '...';
    
    return result;
  }

  // Generate a response based on knowledge base search results
  generateKnowledgeResponse(searchResults, originalQuery) {
    if (!searchResults || searchResults.length === 0) {
      return null;
    }

    const bestResult = searchResults[0];
    const sourceType = bestResult.type === 'webpage' ? 'website' : 'documentation';
    const sourceName = bestResult.source;

    // Create a natural response
    let response = `Based on our ${sourceType}`;
    if (sourceName) {
      response += ` (${sourceName})`;
    }
    response += `: ${bestResult.content}`;

    // Add follow-up suggestion if there are multiple results
    if (searchResults.length > 1) {
      response += '\n\nI found additional related information if you need more details.';
    }

    return {
      message: response,
      confidence: Math.min(0.9, 0.5 + (bestResult.score * 0.1)), // Scale confidence based on score
      source: 'knowledge_base',
      knowledgeUsed: true,
      knowledgeSources: searchResults.map(r => r.source),
      shouldEscalate: false
    };
  }

  // Check if query is asking about something specific that should have an answer
  isSpecificQuestion(query) {
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
    const queryLower = query.toLowerCase();
    
    // Check for question words
    const hasQuestionWord = questionWords.some(word => queryLower.includes(word));
    
    // Check for question marks
    const hasQuestionMark = query.includes('?');
    
    // Check for specific topic keywords that usually have definite answers
    const specificTopics = [
      'policy', 'return', 'refund', 'shipping', 'delivery', 'payment', 
      'account', 'order', 'product', 'service', 'hours', 'contact',
      'support', 'help', 'price', 'cost', 'fee', 'warranty', 'guarantee'
    ];
    
    const hasSpecificTopic = specificTopics.some(topic => queryLower.includes(topic));
    
    return hasQuestionWord || hasQuestionMark || hasSpecificTopic;
  }

  // Generate honest "I don't know" response based on query type
  generateHonestFallback(query, botName = 'ChatBot') {
    const isSpecific = this.isSpecificQuestion(query);
    
    if (isSpecific) {
      return {
        message: `I don't have specific information about that topic in my current knowledge base. For accurate details, I'd recommend speaking with one of our human agents who can provide you with the most up-to-date information.`,
        confidence: 0.8, // High confidence in being honest
        source: 'honest_fallback',
        knowledgeUsed: false,
        shouldEscalate: true // Suggest human help for specific questions
      };
    } else {
      return {
        message: `I'm not sure I understand what you're looking for. Could you provide more details or rephrase your question? Alternatively, I can connect you with a human agent who might be better able to assist you.`,
        confidence: 0.7,
        source: 'clarification_request',
        knowledgeUsed: false,
        shouldEscalate: false
      };
    }
  }

  // Main search and response function that combines everything
  searchAndRespond(knowledgeBase, query, botConfig = {}) {
    // First search the knowledge base
    const searchResults = this.searchKnowledgeBase(knowledgeBase, query);
    
    if (searchResults.length > 0) {
      // Found relevant information
      return this.generateKnowledgeResponse(searchResults, query);
    } else {
      // No relevant information found - be honest about it
      return this.generateHonestFallback(query, botConfig.name || 'ChatBot');
    }
  }

  // Utility function to prepare knowledge base items for search
  prepareKnowledgeBase(rawKnowledgeBase) {
    if (!rawKnowledgeBase || !Array.isArray(rawKnowledgeBase)) {
      return [];
    }

    return rawKnowledgeBase.map(item => {
      // Ensure consistent structure
      const prepared = {
        name: item.name || 'Unknown Document',
        content: item.content || '',
        enabled: item.enabled !== false, // Default to enabled
        type: item.type || 'document',
        category: item.category || 'general',
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        url: item.url || null
      };

      // If content is very long, consider chunking it
      if (prepared.content.length > 2000) {
        prepared.chunks = this.chunkContent(prepared.content);
      }

      return prepared;
    });
  }

  // Split long content into searchable chunks
  chunkContent(content, chunkSize = 500, overlap = 50) {
    const chunks = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    for (const sentence of sentences) {
      const sentenceWithPunctuation = sentence.trim() + '.';
      
      if (currentChunk.length + sentenceWithPunctuation.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.floor(overlap / 10)); // Approximate word overlap
        currentChunk = overlapWords.join(' ') + ' ' + sentenceWithPunctuation;
      } else {
        currentChunk += ' ' + sentenceWithPunctuation;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
export default knowledgeBaseService;
