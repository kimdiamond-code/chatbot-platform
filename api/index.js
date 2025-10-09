// Main API endpoint - Status page
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Chatbot Platform API',
    version: '2.0',
    endpoints: {
      database: '/api/database',
      status: '/api'
    },
    timestamp: new Date().toISOString()
  });
}
