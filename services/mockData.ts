import { OnionSite, SiteCategory, ThreatLevel, CaseFile, WalletAnalysis } from '../types';

export const generateMockOnionAddress = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let result = '';
  for (let i = 0; i < 56; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '.onion';
};

export const generateRandomOnionSite = (): OnionSite => {
  const categories = Object.values(SiteCategory);
  const threats = Object.values(ThreatLevel);
  const address = generateMockOnionAddress();
  
  const titles = [
    "Dark Market", "Hidden Wiki Mirror", "Secure Drop", "Anon Forum", "Crypto Mixer", 
    "Data Dump", "Leaked Docs", "Private Chat", "Shadow Hosting", "The Red Room", "Cobalt Strike Server", "Phishing Landing"
  ];
  const title = `${titles[Math.floor(Math.random() * titles.length)]} #${Math.floor(Math.random() * 999)}`;

  return {
    id: Math.random().toString(36).substr(2, 9),
    url: address,
    title: title,
    status: Math.random() > 0.1 ? 'ONLINE' : 'UNREACHABLE',
    lastSeen: new Date().toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)],
    threatLevel: threats[Math.floor(Math.random() * threats.length)],
    contentSnippet: "Automated crawl detected content signature...",
    connections: []
  };
};

export const MOCK_SITES: OnionSite[] = [
  {
    id: '1',
    url: 'alphax7...j2k.onion',
    title: 'Alpha Market Redux',
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    category: SiteCategory.MARKETPLACE,
    threatLevel: ThreatLevel.CRITICAL,
    contentSnippet: "Welcome to the #1 source for digital goods. Escrow mandatory. Bitcoin and Monero accepted.",
    connections: ['2', '3']
  },
  {
    id: '2',
    url: 'dread...55a.onion',
    title: 'Dread Forum Mirror',
    status: 'ONLINE',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    category: SiteCategory.FORUM,
    threatLevel: ThreatLevel.MEDIUM,
    contentSnippet: "Discussion regarding OpSec, privacy, and vendor reviews. No illegal transaction talk allowed in public boards.",
    connections: ['1', '4']
  },
  {
    id: '3',
    url: 'lockbit...99x.onion',
    title: 'LockBit 4.0 Leaks',
    status: 'ONLINE',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    category: SiteCategory.RANSOMWARE,
    threatLevel: ThreatLevel.CRITICAL,
    contentSnippet: "Company X data released. Download full dump here. Time remaining: 00:00:00.",
    connections: ['1']
  },
  {
    id: '4',
    url: 'whistle...22z.onion',
    title: 'Truth Drop',
    status: 'OFFLINE',
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    category: SiteCategory.WHISTLEBLOWER,
    threatLevel: ThreatLevel.LOW,
    contentSnippet: "Secure drop for sensitive documents. PGP key available below.",
    connections: ['2']
  },
  {
    id: '5',
    url: 'nexus...q1p.onion',
    title: 'The Nexus',
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    category: SiteCategory.UNKNOWN,
    threatLevel: ThreatLevel.MEDIUM,
    contentSnippet: "Entering the nexus...",
    connections: ['1', '2', '3']
  }
];

export const RAW_SAMPLE_TEXTS = [
  "SELLING: Full database dump of generic-corp.com. Contains 5M user records, emails, hashed passwords. Price: 2 BTC. Contact via XMPP only.",
  "New vendor 'PharmacyKing' is a scammer, do not buy! FE (Finalize Early) strictly prohibited on this board.",
  "We are a group of hacktivists dedicated to exposing corruption. Upload documents securely here. We recommend using Tails OS.",
  "Carding tutorial 2024 updated. Learn how to cash out securely. Logs available for cheap. US/UK/EU bins.",
];

export const MOCK_CASES: CaseFile[] = [
  {
    id: 'CASE-24-8892',
    codename: 'Operation Silent Echo',
    status: 'ACTIVE',
    priority: 'HIGH',
    leadAgent: 'Agent 42',
    description: 'Investigation into a new RaaS (Ransomware as a Service) affiliate program recruiting via Dread mirrors. Suspects are communicating via encrypted XMPP servers.',
    startDate: '2023-11-15',
    evidence: [
        { id: 'e1', type: 'TEXT', content: 'PGP Signed Message from "DarkOverlord"', timestamp: '2023-11-16', notes: 'Matches signature from 2022 breach.'},
        { id: 'e2', type: 'CRYPTO', content: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', timestamp: '2023-11-20', notes: 'Deposit address found on landing page.'},
        { id: 'e3', type: 'NETWORK', content: 'Connection graph node #8821', timestamp: '2023-12-05', notes: 'Linked to 3 other phishing domains.'}
    ],
    associatedSubjects: ['DarkOverlord', 'Unknown Affiliate #1']
  },
  {
    id: 'CASE-24-9001',
    codename: 'Project Chimera',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    leadAgent: 'Agent 42',
    description: 'Tracking the flow of illicit funds from the "Alpha Market Redux" to offshore exchanges. High volume of laundering activity detected.',
    startDate: '2024-01-02',
    evidence: [
        { id: 'e4', type: 'CRYPTO', content: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', timestamp: '2024-01-10', notes: 'Suspected cold storage wallet.'}
    ],
    associatedSubjects: ['AlphaAdmin', 'MixerService_01']
  },
  {
    id: 'CASE-23-4412',
    codename: 'Blue Skyline',
    status: 'CLOSED',
    priority: 'MEDIUM',
    leadAgent: 'Agent 12',
    description: 'Investigation into credit card dumps sold on "CarderPlaza". Site seized.',
    startDate: '2023-05-20',
    evidence: [],
    associatedSubjects: ['CarderKing']
  }
];

export const MOCK_WALLET_ANALYSIS: WalletAnalysis = {
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  balance: 142.5032,
  totalReceived: 5820.11,
  riskScore: 92,
  entityAttribution: "Hydra Market Mixer",
  taintSources: [
    { source: "Darknet Market", percentage: 65 },
    { source: "Mixing Service", percentage: 25 },
    { source: "P2P Exchange", percentage: 8 },
    { source: "Unknown", percentage: 2 }
  ],
  recentTransactions: [
    { hash: "a1b2...c3d4", amount: 2.5, currency: "BTC", timestamp: "2024-03-10 14:20:00", sender: "Unknown", receiver: "Target", riskScore: 88, type: "DEPOSIT" },
    { hash: "e5f6...g7h8", amount: 10.0, currency: "BTC", timestamp: "2024-03-09 09:15:00", sender: "Target", receiver: "Wasabi Wallet", riskScore: 95, type: "MIXING" },
    { hash: "i9j0...k1l2", amount: 0.5, currency: "BTC", timestamp: "2024-03-08 18:45:00", sender: "Exchange", receiver: "Target", riskScore: 12, type: "WITHDRAWAL" }
  ]
};
