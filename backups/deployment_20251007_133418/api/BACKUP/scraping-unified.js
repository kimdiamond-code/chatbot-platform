/**
 * UNIFIED WEB SCRAPING API HANDLER
 * Consolidates page scraping and site discovery
 */

import { neon } from '@neondatabase/serverless';
import * as cheerio from 'cheerio';

const sql = neon(process.env.DATABASE_URL);

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body || req.query;

    if (action === 'scrape:page') {
      return await scrapePage(req, res);
    }

    if (action === 'scrape:discover') {
      return await discoverSite(req, res);
    }

    if (action === 'scrape:batch') {
      return await scrapeBatch(req, res);
    }

    if (action === 'scrape:save') {
      return await saveScrapedData(req, res);
    }

    if (action === 'scrape:list') {
      return await listScrapedPages(req, res);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Scraping API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============== SCRAPING FUNCTIONS ==============

async function scrapePage(req, res) {
  const { url, selector } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    // Fetch page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').text() || $('h1').first().text();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    // Extract main content
    let content = '';
    
    if (selector) {
      content = $(selector).text().trim();
    } else {
      // Default content extraction
      const mainSelectors = ['main', 'article', '#content', '.content', 'body'];
      
      for (const sel of mainSelectors) {
        const text = $(sel).text().trim();
        if (text.length > content.length) {
          content = text;
        }
      }
    }

    // Extract links
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const fullUrl = new URL(href, url).href;
          links.push({ url: fullUrl, text });
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Extract images
    const images = [];
    $('img[src]').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      
      if (src) {
        try {
          const fullUrl = new URL(src, url).href;
          images.push({ url: fullUrl, alt });
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        url,
        title,
        description,
        keywords,
        content: content.substring(0, 10000), // Limit to 10k chars
        contentLength: content.length,
        links: links.slice(0, 100), // Limit to 100 links
        images: images.slice(0, 50), // Limit to 50 images
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape page',
      message: error.message 
    });
  }
}

async function discoverSite(req, res) {
  const { url, maxDepth = 2, maxPages = 50 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const baseUrl = new URL(url);
    const discovered = new Set();
    const toVisit = [{ url, depth: 0 }];
    const results = [];

    while (toVisit.length > 0 && results.length < maxPages) {
      const { url: currentUrl, depth } = toVisit.shift();

      // Skip if already visited
      if (discovered.has(currentUrl) || depth > maxDepth) {
        continue;
      }

      discovered.add(currentUrl);

      try {
        // Fetch and parse page
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';

        results.push({
          url: currentUrl,
          title,
          description,
          depth
        });

        // Find more links if not at max depth
        if (depth < maxDepth) {
          $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
              try {
                const linkUrl = new URL(href, currentUrl);
                
                // Only follow links on same domain
                if (linkUrl.hostname === baseUrl.hostname) {
                  toVisit.push({ url: linkUrl.href, depth: depth + 1 });
                }
              } catch (e) {
                // Invalid URL, skip
              }
            }
          });
        }

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error scraping ${currentUrl}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        baseUrl: url,
        pagesDiscovered: results.length,
        maxDepth,
        pages: results
      }
    });

  } catch (error) {
    console.error('Site discovery error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to discover site',
      message: error.message 
    });
  }
}

async function scrapeBatch(req, res) {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'URLs array required' });
  }

  const results = [];

  for (const url of urls.slice(0, 20)) { // Limit to 20 URLs per batch
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        results.push({ url, success: false, error: `HTTP ${response.status}` });
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const content = $('body').text().trim().substring(0, 5000);

      results.push({
        url,
        success: true,
        data: { title, description, content }
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      results.push({ url, success: false, error: error.message });
    }
  }

  return res.status(200).json({ success: true, results });
}

async function saveScrapedData(req, res) {
  const { organizationId, url, title, content, metadata } = req.body;

  if (!organizationId || !url || !content) {
    return res.status(400).json({ error: 'organizationId, url, and content required' });
  }

  try {
    await sql`
      INSERT INTO knowledge_base (organization_id, source_url, title, content, metadata)
      VALUES (${organizationId}, ${url}, ${title || ''}, ${content}, ${JSON.stringify(metadata || {})})
      ON CONFLICT (organization_id, source_url)
      DO UPDATE SET title = ${title || ''}, content = ${content}, metadata = ${JSON.stringify(metadata || {})}, updated_at = NOW()
    `;

    return res.status(200).json({ success: true, message: 'Content saved to knowledge base' });

  } catch (error) {
    console.error('Error saving scraped data:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}

async function listScrapedPages(req, res) {
  const { organizationId } = req.body || req.query;

  if (!organizationId) {
    return res.status(400).json({ error: 'organizationId required' });
  }

  try {
    const pages = await sql`
      SELECT id, source_url, title, created_at, updated_at
      FROM knowledge_base
      WHERE organization_id = ${organizationId}
      ORDER BY updated_at DESC
      LIMIT 100
    `;

    return res.status(200).json({
      success: true,
      pages: pages.map(p => ({
        id: p.id,
        url: p.source_url,
        title: p.title,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
    });

  } catch (error) {
    console.error('Error listing scraped pages:', error);
    return res.status(500).json({ error: 'Failed to list pages' });
  }
}
