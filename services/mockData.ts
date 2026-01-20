import { OnionSite, CaseFile, WalletAnalysis } from '../types';

// PRODUCTION MODE: Mock data removed.
// All initial states are empty to prevent false intelligence.

export const RAW_SAMPLE_TEXTS: string[] = [];

export const MOCK_SITES: OnionSite[] = [];

export const MOCK_CASES: CaseFile[] = [];

export const INITIAL_SITES: OnionSite[] = [];
export const INITIAL_CASES: CaseFile[] = [];

export const EMPTY_WALLET_ANALYSIS: WalletAnalysis = {
  address: "",
  balance: 0,
  totalReceived: 0,
  riskScore: 0,
  entityAttribution: "Unknown",
  taintSources: [],
  recentTransactions: []
};