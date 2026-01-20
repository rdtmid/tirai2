
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SiteCategory {
  MARKETPLACE = 'MARKETPLACE',
  FORUM = 'FORUM',
  BLOG = 'BLOG',
  WHISTLEBLOWER = 'WHISTLEBLOWER',
  RANSOMWARE = 'RANSOMWARE',
  UNKNOWN = 'UNKNOWN'
}

export interface OnionSite {
  id: string;
  url: string;
  title: string;
  status: 'ONLINE' | 'OFFLINE' | 'UNREACHABLE';
  lastSeen: string;
  category: SiteCategory;
  threatLevel: ThreatLevel;
  contentSnippet?: string;
  connections: string[]; // IDs of other sites linked to
  source?: string; // e.g. "Crawler", "Ahmia Search", "Pastebin"
  engine?: string; // Specific engine used
}

export interface AnalysisResult {
  threatScore: number; // 0-100
  category: SiteCategory;
  summary: string;
  entities: string[];
  suggestedAction: string;
}

export interface CrawlLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface IntelligenceReport {
  id: string;
  targetUrl: string;
  timestamp: string;
  analysis: AnalysisResult;
}

export interface CaseEvidence {
  id: string;
  type: 'IMAGE' | 'TEXT' | 'CRYPTO' | 'NETWORK' | 'FILE';
  content: string;
  timestamp: string;
  notes: string;
}

export interface CaseFile {
  id: string;
  codename: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  leadAgent: string;
  description: string;
  startDate: string;
  evidence: CaseEvidence[];
  associatedSubjects: string[];
}

export interface CryptoTransaction {
  hash: string;
  amount: number;
  currency: 'BTC' | 'XMR';
  timestamp: string;
  sender: string;
  receiver: string;
  riskScore: number; // 0-100
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'MIXING' | 'PAYMENT';
}

export interface WalletAnalysis {
  address: string;
  balance: number;
  totalReceived: number;
  riskScore: number;
  entityAttribution?: string; // e.g., "DarkMarket Hot Wallet"
  taintSources: { source: string; percentage: number }[];
  recentTransactions: CryptoTransaction[];
}

export interface PortInfo {
  port: number;
  service: string;
  status: 'OPEN' | 'FILTERED';
  version?: string;
}

export interface IpHistoryEntry {
  ip: string;
  date: string;
  location: string;
}

export interface HostReconResult {
  target: string;
  ipEstimate: string; // e.g., "185.x.x.x (Masked)"
  provider: string;
  location: string;
  serverHeader: string; // e.g. "nginx/1.18.0 (Ubuntu)"
  techStack: string[];
  openPorts: PortInfo[];
  vulnerabilities: string[];
  ownershipClues: string[];
  riskAssessment: string;
  ipHistory: IpHistoryEntry[];
}

export interface WhoisResult {
  query: string;
  asn: string;
  cidr: string;
  organization: string;
  countryCode: string;
  created: string;
  updated: string;
  status: string[];
  contacts: {
    type: string;
    email: string;
  }[];
  rawText: string;
}
