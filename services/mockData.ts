import { OnionSite, CaseFile, WalletAnalysis, ThreatLevel, SiteCategory } from '../types';

export const RAW_SAMPLE_TEXTS = [
    "---BEGIN PGP MESSAGE---\nVersion: GnuPG v2\n\nhQEMA9xY...",
    "<div class='product-listing'>\n  <h3>HQ Credit Cards (Visa/MC)</h3>\n  <span class='price'>$25 USD</span>\n  <button>Buy Now</button>\n</div>",
    "We are announcing a new ransomware affiliate program. 80/20 split. Contact us on Tox.",
    "User 'Admin' moved 500 BTC to wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.",
    "root@dark-server:~# cat /etc/shadow\nroot:$6$...",
];

export const MOCK_SITES: OnionSite[] = [
    {
        id: 'site-1',
        url: 'darkmarket777.onion',
        title: 'Abacus Market',
        status: 'ONLINE',
        lastSeen: new Date().toISOString(),
        category: SiteCategory.MARKETPLACE,
        threatLevel: ThreatLevel.HIGH,
        contentSnippet: 'Best drugs, fraud, and digital goods. Escrow accepted.',
        connections: ['site-2', 'site-3'],
        source: 'Crawler',
        engine: 'Tor'
    },
    {
        id: 'site-2',
        url: 'dread-forum.onion',
        title: 'Dread Forum',
        status: 'ONLINE',
        lastSeen: new Date().toISOString(),
        category: SiteCategory.FORUM,
        threatLevel: ThreatLevel.MEDIUM,
        contentSnippet: 'Community discussion on OPSEC and marketplaces.',
        connections: ['site-1'],
        source: 'Crawler',
        engine: 'Tor'
    },
    {
        id: 'site-3',
        url: 'lockbit-blog.onion',
        title: 'LockBit 3.0 Leaks',
        status: 'ONLINE',
        lastSeen: new Date().toISOString(),
        category: SiteCategory.RANSOMWARE,
        threatLevel: ThreatLevel.CRITICAL,
        contentSnippet: 'Company data leaks published daily. Pay now.',
        connections: [],
        source: 'Crawler',
        engine: 'Tor'
    },
    {
        id: 'site-4',
        url: 'intel-exchange.onion',
        title: 'Intel Exchange',
        status: 'OFFLINE',
        lastSeen: new Date(Date.now() - 86400000).toISOString(),
        category: SiteCategory.FORUM,
        threatLevel: ThreatLevel.MEDIUM,
        contentSnippet: 'Knowledge sharing for researchers.',
        connections: ['site-2'],
        source: 'Crawler',
        engine: 'Tor'
    },
    {
        id: 'site-5',
        url: 'secure-drop.onion',
        title: 'NYT SecureDrop',
        status: 'ONLINE',
        lastSeen: new Date().toISOString(),
        category: SiteCategory.WHISTLEBLOWER,
        threatLevel: ThreatLevel.LOW,
        contentSnippet: 'Share tips securely with journalists.',
        connections: [],
        source: 'Crawler',
        engine: 'Tor'
    }
];

export const MOCK_CASES: CaseFile[] = [
    {
        id: 'CASE-24-001',
        codename: 'Operation Silk',
        status: 'ACTIVE',
        priority: 'HIGH',
        leadAgent: 'Agent 42',
        description: 'Investigation into a new vendor "SilkMerchant" operating across multiple markets.',
        startDate: '2024-02-15',
        associatedSubjects: ['SilkMerchant', 'Wallet-X'],
        evidence: [
            {
                id: 'ev-1',
                type: 'TEXT',
                content: 'PGP Key ID: 0xDEADBEEF',
                timestamp: '2024-02-16',
                notes: 'Found on profile page.'
            }
        ]
    },
    {
        id: 'CASE-23-104',
        codename: 'Project Overlord',
        status: 'ARCHIVED',
        priority: 'CRITICAL',
        leadAgent: 'Agent 42',
        description: 'Completed takedown of botnet command and control servers.',
        startDate: '2023-08-10',
        associatedSubjects: ['BotMaster', '185.x.x.x'],
        evidence: []
    }
];

// For backward compatibility or clear initial state usage
export const INITIAL_SITES = MOCK_SITES;
export const INITIAL_CASES = MOCK_CASES;

// Clean initial state for wallet analysis
export const EMPTY_WALLET_ANALYSIS: WalletAnalysis = {
  address: "",
  balance: 0,
  totalReceived: 0,
  riskScore: 0,
  entityAttribution: "Unknown",
  taintSources: [],
  recentTransactions: []
};