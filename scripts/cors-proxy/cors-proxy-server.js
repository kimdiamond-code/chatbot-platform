// cors-proxy-server.js - SOLUTION FOR CORS ERRORS WHEN ADDING WEBPAGES
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // In production, specify your domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main proxy endpoint for fetching webpages
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('Fetching URL:', url);
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content using cheerio
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();
    
    // Extract title
    const title = $('title').text().trim();
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Extract main content
    let content = '';
    
    // Try to find main content areas
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.content',
      '.main-content',
      'article',
      '.post-content',
      '.entry-content',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        content = element.text();
        break;
      }
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    // Extract headings
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({
          level: el.tagName.toLowerCase(),
          text: text
        });
      }
    });
    
    // Extract links
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text) {
        try {
          links.push({
            url: new URL(href, url).href,
            text: text
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    // Return structured data
    res.json({
      success: true,
      url: url,
      title: title,
      description: description,
      content: content.substring(0, 10000), // Limit content length
      headings: headings.slice(0, 20), // Limit headings
      links: links.slice(0, 50), // Limit links
      wordCount: content.split(' ').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch webpage',
      message: error.message,
      url: url
    });
  }
});

// Batch process multiple URLs
app.post('/api/proxy/batch', async (req, res) => {
  const { urls } = req.body;
  
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'URLs array is required' });
  }

  if (urls.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 URLs allowed per batch' });
  }

  const results = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/proxy?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      results.push(data);
    } catch (error) {
      results.push({
        success: false,
        url: url,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    results: results,
    processed: results.length,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CORS Proxy Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'CORS Proxy Server is working!',
    headers: req.headers,
    origin: req.get('origin')
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🌐 Proxy endpoint: http://localhost:${PORT}/api/proxy?url=YOUR_URL`);
  console.log('');
  console.log('💡 Usage examples:');
  console.log(`   GET http://localhost:${PORT}/api/proxy?url=https://example.com`);
  console.log(`   POST http://localhost:${PORT}/api/proxy/batch`);
  console.log('   Body: { "urls": ["https://site1.com", "https://site2.com"] }');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;