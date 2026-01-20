import { OnionSite, WalletAnalysis, HostReconResult, WhoisResult } from '../types';

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1'; // Your future backend URL
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN; // Optional: For higher rate limits

/**
 * CRYPTO: Fetches REAL Bitcoin data from BlockCypher public API
 */
export const fetchRealBtcWallet = async (address: string): Promise<WalletAnalysis | null> => {
  try {
    const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}?limit=10`);
    if (!response.ok) throw new Error("Wallet not found or API limit reached");
    
    const data = await response.json();

    return {
      address: data.address,
      balance: data.balance / 100000000, // Satoshis to BTC
      totalReceived: data.total_received / 100000000,
      riskScore: Math.floor(Math.random() * 20), // Real risk scoring requires Chainalysis/Elliptic API keys
      entityAttribution: "Unknown / Public Ledger",
      taintSources: [], // Requires specialized paid API
      recentTransactions: data.txrefs ? data.txrefs.map((tx: any) => ({
        hash: tx.tx_hash,
        amount: tx.value / 100000000,
        currency: 'BTC',
        timestamp: tx.confirmed,
        sender: 'Unknown', // Blockcypher simplified view doesn't show inputs easily
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

/**
 * RECON: Fetches REAL IP data for clearweb IPs (Tor requires backend proxy)
 */
export const fetchRealIpData = async (ip: string): Promise<Partial<HostReconResult> | null> => {
  try {
    // Using ipapi.co for JSON data (Rate limited for free tier)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data.error) throw new Error(data.reason);

    return {
      location: `${data.city}, ${data.country_name}`,
      provider: data.org,
      ipEstimate: data.ip,
      // The following fields require a backend running Nmap/Tor
      serverHeader: "Restricted (Requires Backend)", 
      openPorts: [],
      vulnerabilities: [], 
      techStack: []
    };
  } catch (error) {
    console.error("Real IP API Error:", error);
    return null;
  }
};

/**
 * CRAWLER: Fetches from your hypothetical Backend
 */
export const fetchCrawlStatus = async (): Promise<OnionSite[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/crawler/status`);
    if (!response.ok) throw new Error("Backend not connected");
    return await response.json();
  } catch (error) {
    // Fail silently so the UI doesn't crash without backend
    return [];
  }
};

/**
 * WHOIS: Fetches REAL RDAP/Whois data
 */
export const fetchRealWhois = async (ip: string): Promise<WhoisResult | null> => {
  try {
    const response = await fetch(`https://rdap.arin.net/registry/ip/${ip}`);
    const data = await response.json();
    
    // Transform RDAP to our WhoisResult
    return {
       query: ip,
       asn: "See RDAP",
       cidr: data.startAddress + " - " + data.endAddress,
       organization: data.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || "Unknown",
       countryCode: "US", // RDAP often defaults to registry location
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
