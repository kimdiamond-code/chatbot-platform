// Document Processing Service for Knowledge Base
// Full implementation with PDF, Word, and text file support

// Document processor with support for multiple file types
export const documentProcessor = {
  async processFile(file, progressCallback) {
    try {
      if (progressCallback) progressCallback({ status: 'reading', progress: 20 });
      
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      let text = '';
      
      // Process different file types
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        text = await this.processTextFile(file);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await this.processPDFFile(file, progressCallback);
      } else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
        text = await this.processWordFile(file);
      } else if (fileName.endsWith('.doc')) {
        // .doc files are harder to process, suggest conversion
        throw new Error('Legacy .doc files not supported. Please convert to .docx or .pdf format.');
      } else {
        throw new Error(`Unsupported file type: ${fileType}. Supported formats: PDF, DOCX, TXT`);
      }
      
      if (progressCallback) progressCallback({ status: 'processing', progress: 70 });
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in the file');
      }
      
      // Process the extracted text
      const chunks = this.chunkText(text);
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const keywords = this.extractKeywords(text);
      
      if (progressCallback) progressCallback({ status: 'complete', progress: 100 });
      
      return {
        success: true,
        text: text,
        chunks: chunks,
        wordCount: wordCount,
        chunkCount: chunks.length,
        keywords: keywords
      };
      
    } catch (error) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  async processTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  },
  
  async processPDFFile(file, progressCallback) {
    try {
      // Check if PDF.js is available
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (progressCallback) {
            progressCallback({ 
              status: `processing page ${pageNum}/${pdf.numPages}`, 
              progress: 30 + (pageNum / pdf.numPages) * 40 
            });
          }
          
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        if (fullText.trim().length === 0) {
          throw new Error('No text content found in PDF');
        }
        
        return fullText;
      } else {
        // PDF.js not available - inform user
        throw new Error('PDF processing requires PDF.js library. Please convert PDF to .txt format for now.');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      // Better error message for user
      throw new Error(`PDF processing failed: ${error.message}. Try converting to .txt format.`);
    }
  },
  
  async processWordFile(file) {
    try {
      // Try to use mammoth if available  
      if (typeof window !== 'undefined' && window.mammoth) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        // Fallback: Basic text extraction attempt
        const text = await this.processTextFile(file);
        return text;
      }
    } catch (error) {
      throw new Error('Word document processing failed. Install mammoth package for full .docx support, or convert to .txt format.');
    }
  },
  
  // Intelligent text chunking with context preservation
  chunkText(text, maxChunkSize = 2000, overlapSize = 200) {
    if (!text || text.length <= maxChunkSize) {
      return [text];
    }
    
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      let end = start + maxChunkSize;
      
      // Try to break at natural boundaries
      if (end < text.length) {
        // Look for paragraph breaks first
        const lastParagraph = text.lastIndexOf('\n\n', end);
        if (lastParagraph > start + maxChunkSize * 0.3) {
          end = lastParagraph + 2;
        } else {
          // Look for sentence breaks
          const lastSentence = Math.max(
            text.lastIndexOf('. ', end),
            text.lastIndexOf('! ', end),
            text.lastIndexOf('? ', end)
          );
          if (lastSentence > start + maxChunkSize * 0.5) {
            end = lastSentence + 2;
          } else {
            // Look for word boundaries
            const lastSpace = text.lastIndexOf(' ', end);
            if (lastSpace > start + maxChunkSize * 0.7) {
              end = lastSpace;
            }
          }
        }
      }
      
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      
      // Move start forward, with overlap for context
      start = Math.max(end - overlapSize, start + 1);
    }
    
    return chunks.filter(chunk => chunk.length > 10); // Filter out tiny chunks
  },
  
  // Enhanced keyword extraction
  extractKeywords(text, maxKeywords = 15) {
    if (!text) return [];
    
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'through', 'during', 'before', 'after', 'above', 'below',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    
    // Extract and process words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Filter out pure numbers
      );

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Return top keywords, prioritizing longer words
    return Object.entries(frequency)
      .sort(([wordA, freqA], [wordB, freqB]) => {
        // If frequencies are close, prefer longer words
        if (Math.abs(freqA - freqB) <= 2) {
          return wordB.length - wordA.length;
        }
        return freqB - freqA;
      })
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
};

// Webpage Scraping Service with improved error handling
export const webpageScraper = {
  async scrapeWebpage(url, onProgress = null) {
    try {
      if (onProgress) onProgress({ status: 'fetching', progress: 20 });

      let response;
      let usingProxy = false;
      
      try {
        // Try direct fetch first
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ChatBot-Platform/1.0)'
          }
        });
      } catch (directError) {
        // Fallback: Try using CORS proxy if available
        try {
          const proxyUrl = 'http://localhost:3001';
          response = await fetch(`${proxyUrl}/api/proxy?url=${encodeURIComponent(url)}`);
          usingProxy = true;
        } catch (proxyError) {
          throw new Error(`Cannot access webpage: CORS policy blocks direct access and CORS proxy (localhost:3001) is not available. Please start the proxy server with: cd cors-proxy && npm run dev`);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (onProgress) onProgress({ status: 'parsing', progress: 60 });

      const html = await response.text();
      
      // Enhanced HTML parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 'aside',
        '.navigation', '.sidebar', '.menu', '.ad', '.advertisement',
        '[role="banner"]', '[role="navigation"]', '[role="complementary"]'
      ];
      
      unwantedSelectors.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
      
      // Extract main content
      const contentSelectors = [
        'main', 'article', '.content', '.main-content', '.post-content',
        '.entry-content', '.article-body', '#content', '#main'
      ];
      
      let text = '';
      let foundMainContent = false;
      
      for (const selector of contentSelectors) {
        const element = tempDiv.querySelector(selector);
        if (element) {
          text = element.textContent || element.innerText || '';
          foundMainContent = true;
          break;
        }
      }
      
      // Fallback to body content if no main content found
      if (!foundMainContent) {
        text = tempDiv.textContent || tempDiv.innerText || '';
      }
      
      // Clean up text
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      if (!text || text.length < 100) {
        throw new Error('Insufficient content extracted from webpage. The page may be protected or contain mostly dynamic content.');
      }
      
      // Extract metadata
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
      
      // Extract description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const description = descMatch ? descMatch[1].trim() : '';

      if (onProgress) onProgress({ status: 'complete', progress: 100 });

      return {
        success: true,
        metadata: {
          url,
          title,
          description,
          scrapedDate: new Date().toISOString(),
          type: 'webpage',
          usingProxy
        },
        text: text,
        chunks: documentProcessor.chunkText(text),
        keywords: documentProcessor.extractKeywords(text),
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
        chunkCount: Math.ceil(text.length / 2000)
      };

    } catch (error) {
      console.error('Webpage scraping error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async testProxy() {
    try {
      const response = await fetch('http://localhost:3001/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Reduced timeout to 2 seconds
      });
      return response.ok;
    } catch (error) {
      // Silently fail - this is expected when proxy isn't running
      return false;
    }
  }
};

export default {
  documentProcessor,
  webpageScraper
};