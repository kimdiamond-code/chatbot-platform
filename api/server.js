// Local development API server
// This wraps the Vercel serverless function for local testing

import dotenv from 'dotenv';
import express from 'express';
import handler from './consolidated.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Changed to 3000 to match Vite config

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Mock Vercel request/response for local development
const wrapHandler = async (req, res) => {
  // Extract endpoint from path
  const path = req.path.replace('/api/', '');
  const endpoint = path.split('/')[0] || req.body?.endpoint;
  
  // Create mock Vercel request
  const mockReq = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: { ...req.query, endpoint },
    socket: { remoteAddress: req.ip }
  };
  
  // Create mock Vercel response
  const mockRes = {
    status: (code) => {
      res.status(code);
      return mockRes;
    },
    json: (data) => {
      res.json(data);
    },
    send: (data) => {
      res.send(data);
    },
    end: () => {
      res.end();
    },
    setHeader: (key, value) => {
      res.setHeader(key, value);
    }
  };
  
  try {
    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('❌ API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// API routes - using proper Express patterns
app.use('/api', wrapHandler);
app.use('/consolidated', wrapHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 API Server Ready                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`   📡 Local:    http://localhost:${PORT}`);
  console.log(`   🔗 Endpoint: http://localhost:${PORT}/api/consolidated`);
  console.log(`   💾 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log('');
  console.log('   Press Ctrl+C to stop');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 API Server stopped');
  process.exit(0);
});
