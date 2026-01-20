import { OnionSite, WalletAnalysis, HostReconResult, WhoisResult, SiteCategory, ThreatLevel } from '../types';

const API_BASE_URL = '/api/v1'; 

// --- REAL TOR FUNCTIONS (Via Backend) ---

export const checkSystemStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/system/status`);
    return await response.json();
  } catch (e) {
    return { torStatus: 'DISCONNECTED', error: 'Backend unreachable' };
  }
};

export const searchTorNetwork = async (query: string): Promise<OnionSite[]> => {
  try {
    // Call our Node.js backend which scrapes Ahmia via SOCKS5
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error || 'Search failed');
    }

    // Map backend results to OnionSite type
    return json.data.map((item: any, index: number) => ({
      id: `real-${Date.now()}-${index}`,
      url: item.url,
      title: item.title || 'Unknown Hidden Service',
      status: 'ONLINE', // If found in search, it was recently indexed
      lastSeen: item.lastSeen,
      category: SiteCategory.UNKNOWN, // To be determined by AI later
      threatLevel: ThreatLevel.MEDIUM, // Default until analyzed
      contentSnippet: item.snippet,
      connections: [],
      source: 'Ahmia Scraper',
      engine: 'Tor Network'
    }));

  } catch (error) {
    console.error("Real Search Error:", error);
    throw error;
  }
};

export const performLiveRecon = async (url: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    console.error("Recon Error:", error);
    return { status: 'FAILED', error: 'Network Error' };
  }
};

// --- REAL CLEARWEB/BLOCKCHAIN APIs ---

export const fetchRealBtcWallet = async (address: string): Promise<WalletAnalysis | null> => {
  try {
    // BlockCypher Free Tier
    const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}?limit=10`);
    if (!response.ok) throw new Error("Wallet not found or API limit reached");
    
    const data = await response.json();

    return {
      address: data.address,
      balance: data.balance / 100000000,
      totalReceived: data.total_received / 100000000,
      riskScore: 0, // Requires specialized paid API for real risk scoring
      entityAttribution: "Public Ledger", 
      taintSources: [], 
      recentTransactions: data.txrefs ? data.txrefs.map((tx: any) => ({
        hash: tx.tx_hash,
        amount: tx.value / 100000000,
        currency: 'BTC',
        timestamp: tx.confirmed,
        sender: 'Unknown', 
        receiver: address,
        riskScore: 0,
        type: tx.tx_input_n === -1 ? 'DEPOSIT' : 'WITHDRAWAL'
      })) : []
    };
  } catch (error) {
    console.error("Real Crypto API Error:", error);
    return null;
  }
};

export const fetchRealIpData = async (ip: string): Promise<Partial<HostReconResult> | null> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data.error) throw new Error(data.reason);

    return {
      location: `${data.city}, ${data.country_name}`,
      provider: data.org,
      ipEstimate: data.ip,
      serverHeader: "Scanning...", 
      openPorts: [],
      vulnerabilities: [], 
      techStack: []
    };
  } catch (error) {
    console.error("Real IP API Error:", error);
    return null;
  }
};

export const fetchRealWhois = async (ip: string): Promise<WhoisResult | null> => {
  try {
    const response = await fetch(`https://rdap.arin.net/registry/ip/${ip}`);
    const data = await response.json();
    
    return {
       query: ip,
       asn: "See RDAP Data",
       cidr: (data.startAddress && data.endAddress) ? `${data.startAddress} - ${data.endAddress}` : "N/A",
       organization: data.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || "Unknown",
       countryCode: "US", 
       created: data.events?.find((e: any) => e.eventAction === "registration")?.eventDate || "Unknown",
       updated: data.events?.find((e: any) => e.eventAction === "last changed")?.eventDate || "Unknown",
       status: data.status || [],
       contacts: [],
       rawText: JSON.stringify(data, null, 2)
    };
  } catch (error) {
    console.error("Real Whois API Error:", error);
    return null;
  }
};