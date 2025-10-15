import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Demo API endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'demo'
  });
});

// Demo database endpoint 
app.get('/api/database', (req, res) => {
  res.json({
    status: 'offline',
    mode: 'demo',
    conversations: []
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 API server running on port ${port}`);
  console.log('Available endpoints:');
  console.log('  - GET  /api/health     - Health check');
  console.log('  - GET  /api            - Demo API');
  console.log('  - GET  /api/database   - Demo Database');
});