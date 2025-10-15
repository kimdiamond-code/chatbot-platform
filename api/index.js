export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.query && req.query.endpoint === 'database') {
    res.status(200).json({ ok: true, demo: true });
    return;
  }
  
  res.status(200).json({ ok: true, demo: true });
}
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
