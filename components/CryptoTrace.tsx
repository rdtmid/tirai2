import React, { useState } from 'react';
import { Bitcoin, Search, AlertTriangle, ArrowRight, ArrowDownLeft, ArrowUpRight, Wallet, Activity, ShieldCheck, Database } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchRealBtcWallet } from '../services/api';
import { WalletAnalysis } from '../types';

const CryptoTrace: React.FC = () => {
  const [address, setAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WalletAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!address) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    // Call Real API
    const data = await fetchRealBtcWallet(address);
    
    if (data) {
        setResult(data);
    } else {
        setError("Could not fetch wallet data. Ensure address is valid BTC mainnet. (Rate limits may apply)");
    }
    
    setIsAnalyzing(false);
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#94a3b8'];

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Header / Input */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg">
                <Bitcoin className="text-orange-500" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Blockchain Forensics (Live Mainnet)</h2>
                <p className="text-xs text-slate-400">Trace real funds via BlockCypher API. Try a valid BTC address.</p>
            </div>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Enter valid BTC address (e.g., 1A1zP1...)" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-200 font-mono focus:outline-none focus:border-orange-500 transition"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !address}
                className={`px-6 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                    isAnalyzing ? 'bg-slate-700 cursor-wait' : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20'
                }`}
            >
                {isAnalyzing ? 'Querying Ledger...' : 'Trace Funds'}
            </button>
        </div>
        {error && <div className="mt-3 text-xs text-red-400 font-mono">{error}</div>}
      </div>

      {/* Results */}
      {result && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
              
              {/* Left Column: Stats & Risk */}
              <div className="flex flex-col gap-6">
                  {/* Risk Score */}
                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                          <AlertTriangle size={100} />
                      </div>
                      <h3 className="text-slate-400 font-bold uppercase text-xs mb-2">Risk Score</h3>
                      <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-bold ${result.riskScore > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {result.riskScore}
                          </span>
                          <span className="text-slate-500 font-mono">/100</span>
                      </div>
                      <div className="mt-4 text-sm text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          {result.riskScore === 0 ? "Score unavailable without Chainalysis API key." : "Wallet flagged for suspicious activity."}
                      </div>
                  </div>

                  {/* Wallet Info */}
                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg flex-1">
                      <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                          <Wallet size={14} /> Wallet Summary
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <span className="text-xs text-slate-500">Total Received</span>
                              <div className="text-xl font-mono text-white flex items-center gap-1">
                                  {result.totalReceived.toLocaleString()} <span className="text-orange-500 text-sm">BTC</span>
                              </div>
                          </div>
                          <div>
                              <span className="text-xs text-slate-500">Current Balance</span>
                              <div className="text-xl font-mono text-white flex items-center gap-1">
                                  {result.balance.toLocaleString()} <span className="text-orange-500 text-sm">BTC</span>
                              </div>
                          </div>
                          <div className="pt-4 border-t border-slate-700">
                              <span className="text-xs text-slate-500">Attributed Entity</span>
                              <div className="text-md font-bold text-red-400 flex items-center gap-2 mt-1">
                                  <ShieldCheck size={16} /> {result.entityAttribution}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Middle Column: Taint Analysis (Chart) */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg flex flex-col">
                  <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                      <Activity size={14} /> Source of Funds
                  </h3>
                  <div className="flex-1 min-h-[200px] relative flex flex-col items-center justify-center">
                    {result.taintSources.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={result.taintSources}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="percentage"
                              >
                                  {result.taintSources.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                  ))}
                              </Pie>
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                  itemStyle={{ color: '#fff' }}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                        <div className="text-center p-4 opacity-50">
                            <Database size={48} className="mx-auto mb-2 text-slate-600"/>
                            <p className="text-sm text-slate-400">Taint analysis requires paid enterprise API access.</p>
                        </div>
                    )}
                  </div>
              </div>

              {/* Right Column: Transactions */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg flex flex-col">
                   <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                      <ArrowRight size={14} /> Recent Transactions
                  </h3>
                  <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
                      {result.recentTransactions.length > 0 ? result.recentTransactions.map((tx, idx) => (
                          <div key={idx} className="bg-slate-900/50 border border-slate-700/50 p-3 rounded">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                      tx.type === 'DEPOSIT' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                      tx.type === 'WITHDRAWAL' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                      'text-orange-400 bg-orange-500/10 border-orange-500/20'
                                  }`}>
                                      {tx.type}
                                  </span>
                                  <span className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1 text-slate-300 text-sm font-bold">
                                      {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-red-500" />}
                                      {tx.amount.toFixed(8)} {tx.currency}
                                  </div>
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 truncate" title={tx.hash}>
                                  TX: {tx.hash}
                              </div>
                          </div>
                      )) : (
                          <div className="text-xs text-slate-500 italic text-center py-10">No recent transactions found.</div>
                      )}
                  </div>
              </div>

          </div>
      )}

      {!result && !isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-40 border-2 border-dashed border-slate-800 rounded-lg">
              <Bitcoin size={64} className="mb-4" />
              <h3 className="text-xl font-bold">Awaiting Trace Target</h3>
              <p>Enter a cryptocurrency address to begin forensics analysis.</p>
          </div>
      )}
    </div>
  );
};

export default CryptoTrace;
