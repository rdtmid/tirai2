const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// Configuration for local TOR service
// MUST be running on your machine: sudo apt install tor && sudo systemctl start tor
const TOR_PROXY = 'socks5h://127.0.0.1:9050';
const agent = new SocksProxyAgent(TOR_PROXY);

app.use(cors());
app.use(express.json());

// AHMIA Onion Address (Real Tor Search Engine)
const AHMIA_ONION = 'http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion';

// Helper to check if Tor is reachable
const checkTorConnection = async () => {
  try {
    const response = await axios.get('https://check.torproject.org/api/ip', { 
      httpsAgent: agent,
      timeout: 10000 
    });
    return { status: 'ONLINE', ip: response.data.IP };
  } catch (error) {
    return { status: 'OFFLINE', error: error.message };
  }
};

// 1. System Status
app.get('/api/v1/system/status', async (req, res) => {
  const connection = await checkTorConnection();
  res.json({
    torStatus: connection.status,
    exitNode: connection.ip || 'Unknown',
    proxy: TOR_PROXY
  });
});

// 2. REAL SEARCH: Scrape Ahmia.fi Onion Service
app.get('/api/v1/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    console.log(`[Real Search] Querying Tor (Ahmia): ${q}`);
    
    // Request to Ahmia Hidden Service
    const response = await axios.get(`${AHMIA_ONION}/search/?q=${encodeURIComponent(q)}`, {
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 30000, // Tor is slow
      headers: { 'User-Agent': 'TorWatch-Intel-Bot/1.0' }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse Ahmia HTML results
    $('li.result').each((i, el) => {
      const title = $(el).find('h4').text().trim();
      const link = $(el).find('a').attr('href');
      const snippet = $(el).find('p').text().trim();
      const timestamp = $(el).find('span.timestamp').text().trim();

      if (title && link) {
        results.push({
          title,
          url: link,
          snippet,
          lastSeen: timestamp || new Date().toISOString(),
          engine: 'Ahmia (Tor Network)'
        });
      }
    });

    res.json({ success: true, count: results.length, data: results });

  } catch (error) {
    console.error(`[Search Error] ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to connect to Tor Search Engine. Ensure Tor is running (port 9050).',
      details: error.message 
    });
  }
});

// 3. REAL RECON: Get HTTP Headers & Title from Onion Site
app.post('/api/v1/recon', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL required' });

  // Ensure protocol
  const targetUrl = url.startsWith('http') ? url : `http://${url}`;

  try {
    console.log(`[Recon] Scanning target: ${targetUrl}`);
    
    const response = await axios.get(targetUrl, {
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 20000,
      validateStatus: () => true // Resolve even on 404/500 to get headers
    });

    const $ = cheerio.load(response.data);
    const pageTitle = $('title').text().trim() || 'No Title Found';
    
    // Extract Tech Stack clues from headers
    const serverHeader = response.headers['server'] || 'Hidden';
    const xPoweredBy = response.headers['x-powered-by'] || 'Hidden';
    
    res.json({
      status: 'SUCCESS',
      target: targetUrl,
      httpStatus: response.status,
      headers: response.headers,
      serverInfo: {
        server: serverHeader,
        poweredBy: xPoweredBy,
        title: pageTitle
      },
      htmlPreview: $('body').text().substring(0, 500).replace(/\s+/g, ' ').trim()
    });

  } catch (error) {
    console.error(`[Recon Error] ${error.message}`);
    res.json({
      status: 'FAILED',
      error: error.message,
      suggestion: 'Target might be offline or unreachable via current Tor circuit.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`TorWatch Backend (Real Data Mode) running on port ${PORT}`);
  console.log(`Connecting to Tor Proxy at: ${TOR_PROXY}`);
});