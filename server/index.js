const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// Configuration for local TOR service
const TOR_PROXY = 'socks5h://127.0.0.1:9050';
const agent = new SocksProxyAgent(TOR_PROXY);

app.use(cors());
app.use(express.json());

// TORCH Onion Address (V3)
const TORCH_ONION = 'http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion';

const checkTorConnection = async () => {
  try {
    const response = await axios.get('https://check.torproject.org/api/ip', { 
      httpsAgent: agent,
      timeout: 15000 
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

// 2. REAL SEARCH: Scrape Torch
app.get('/api/v1/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    console.log(`[Real Search] Querying Tor (Torch): ${q}`);
    
    // Torch uses /search?query=KEYWORD&action=search
    const searchUrl = `${TORCH_ONION}/search`;
    
    const response = await axios.get(searchUrl, {
      params: { 
        query: q,
        action: 'search'
      },
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 60000, // Torch can be slow
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': TORCH_ONION
      }
    });

    const $ = cheerio.load(response.data);
    const pageTitle = $('title').text().trim();
    const results = [];

    // Torch Logic: Results are usually in div.result or just spaced divs
    // Typical Torch structure:
    // <div class="result mb-3"> <h5><a href="...">Title</a></h5> ... </div>
    $('.result').each((i, el) => {
      const anchor = $(el).find('h5 a');
      const title = anchor.text().trim();
      const link = anchor.attr('href');
      // Torch puts the description/snippet in a <p> tag or just text content
      const snippet = $(el).text().replace(title, '').trim().substring(0, 150) + '...';

      if (title && link) {
        results.push({
          title,
          url: link,
          snippet: snippet.replace(/\s+/g, ' '), // Clean up whitespace
          lastSeen: new Date().toISOString(),
          engine: 'Torch'
        });
      }
    });

    // Fallback scraper if standard classes change (Torch HTML is sometimes messy)
    if (results.length === 0) {
       console.log(`[Scraper] Standard Torch selector failed. Trying fallback. Page Title: "${pageTitle}"`);
       
       // Look for any H5 or H4 headers with links, common in older tor engines
       $('h5 a, h4 a').each((i, el) => {
          const title = $(el).text().trim();
          const link = $(el).attr('href');
          
          if (link && link.includes('.onion')) {
             // Try to get text immediately after the header
             const parentText = $(el).parent().parent().text();
             const cleanSnippet = parentText.replace(title, '').substring(0, 100).trim();

             results.push({
                title: title || 'Hidden Service',
                url: link,
                snippet: cleanSnippet || 'No description available',
                lastSeen: new Date().toISOString(),
                engine: 'Torch (Fallback)'
             });
          }
       });
    }

    console.log(`[Real Search] Found ${results.length} results.`);

    res.json({ 
      success: true, 
      count: results.length, 
      data: results,
      debug: {
        title: pageTitle,
        htmlSize: response.data.length,
        status: response.status,
        url: response.config.url
      }
    });

  } catch (error) {
    console.error(`[Search Error] ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Tor Search Failed',
      details: error.message 
    });
  }
});

// 3. REAL RECON
app.post('/api/v1/recon', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  const targetUrl = url.startsWith('http') ? url : `http://${url}`;

  try {
    console.log(`[Recon] Scanning: ${targetUrl}`);
    const response = await axios.get(targetUrl, {
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 30000,
      validateStatus: () => true
    });

    const $ = cheerio.load(response.data);
    
    res.json({
      status: 'SUCCESS',
      target: targetUrl,
      httpStatus: response.status,
      headers: response.headers,
      serverInfo: {
        server: response.headers['server'] || 'Hidden',
        poweredBy: response.headers['x-powered-by'] || 'Hidden',
        title: $('title').text().trim() || 'No Title'
      },
      htmlPreview: $('body').text().substring(0, 500).replace(/\s+/g, ' ').trim()
    });

  } catch (error) {
    console.error(`[Recon Error] ${error.message}`);
    res.json({ status: 'FAILED', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`TorWatch Backend running on ${PORT}`);
});