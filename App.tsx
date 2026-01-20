import React, { useState } from 'react';
import { LayoutDashboard, Network, Bug, FileText, Menu, Search, Lock, Briefcase, Bitcoin, Server, ArrowRight, History } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Crawler from './components/Crawler';
import Intelligence from './components/Intelligence';
import NetworkGraph from './components/NetworkGraph';
import Investigation from './components/Investigation';
import CryptoTrace from './components/CryptoTrace';
import HostRecon from './components/HostRecon';
import ActivityLog from './components/ActivityLog';
import { MOCK_SITES, MOCK_CASES } from './services/mockData';
import { OnionSite, CaseFile, CaseEvidence } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'crawler' | 'intel' | 'network' | 'investigation' | 'crypto' | 'recon' | 'activity'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // App-wide state for data sharing
  const [crawledLibrary, setCrawledLibrary] = useState<OnionSite[]>(MOCK_SITES);
  const [cases, setCases] = useState<CaseFile[]>(MOCK_CASES);
  const [reconTarget, setReconTarget] = useState('');

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OnionSite[]>([]);

  const handleSiteFound = (site: OnionSite) => {
    // Prevent duplicates
    setCrawledLibrary(prev => {
        if (prev.find(s => s.url === site.url)) return prev;
        return [site, ...prev];
    });
  };

  const handleAnalyzeHost = (url: string) => {
      setReconTarget(url);
      setSearchQuery(''); // Clear search on selection
      setCurrentView('recon');
  };

  const handleAddEvidence = (caseId: string, evidence: CaseEvidence) => {
      setCases(prev => prev.map(c => {
          if (c.id === caseId) {
              return { ...c, evidence: [evidence, ...c.evidence] };
          }
          return c;
      }));
  };

  const handleUpdateCase = (updatedCase: CaseFile) => {
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      if (query.trim().length > 0) {
          const results = crawledLibrary.filter(site => 
            site.url.toLowerCase().includes(query.toLowerCase()) || 
            site.title.toLowerCase().includes(query.toLowerCase()) ||
            site.category.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(results.slice(0, 5)); // Limit to 5 results
      } else {
          setSearchResults([]);
      }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view as any);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentView === view 
          ? 'bg-emerald-500 text-slate-900 font-bold shadow-lg shadow-emerald-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`
        fixed z-20 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-slate-950">
                <Lock size={18} strokeWidth={3} />
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight text-white">TorWatch</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Intel Platform v2.4</p>
            </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <div className="text-xs font-bold text-slate-600 uppercase px-4 mb-2 mt-2">Surveillance</div>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="crawler" icon={Bug} label="Live Crawler" />
            <NavItem view="network" icon={Network} label="Network Graph" />
            <NavItem view="intel" icon={FileText} label="Intelligence AI" />
            
            <div className="text-xs font-bold text-slate-600 uppercase px-4 mb-2 mt-6">Enforcement</div>
            <NavItem view="investigation" icon={Briefcase} label="Case Management" />
            <NavItem view="crypto" icon={Bitcoin} label="Crypto Forensics" />
            <NavItem view="recon" icon={Server} label="Host Recon" />
            
            <div className="text-xs font-bold text-slate-600 uppercase px-4 mb-2 mt-6">Records</div>
            <NavItem view="activity" icon={History} label="Activity Logs" />
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                    AG
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Agent 42</p>
                    <p className="text-xs text-slate-500">Cybercrime Unit</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0 relative z-30">
            <button 
                className="lg:hidden text-slate-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Menu />
            </button>
            
            <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search indexed services, hashes, or entities..." 
                        className="w-full bg-slate-950 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    
                    {/* Search Dropdown */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                            {searchResults.length > 0 ? (
                                <>
                                    <div className="p-2 text-xs font-bold text-slate-500 uppercase bg-slate-950/50">
                                        Library Results
                                    </div>
                                    {searchResults.map(site => (
                                        <div 
                                            key={site.id}
                                            onClick={() => handleAnalyzeHost(site.url)}
                                            className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 flex justify-between items-center group/item"
                                        >
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-sm text-slate-200 truncate">{site.title}</div>
                                                <div className="text-xs font-mono text-slate-500 truncate">{site.url}</div>
                                            </div>
                                            <div className="text-emerald-500 opacity-0 group-hover/item:opacity-100 transition">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => {
                                            handleAnalyzeHost(searchQuery);
                                        }}
                                        className="p-3 bg-slate-950/30 hover:bg-slate-800 cursor-pointer text-xs text-blue-400 font-bold text-center border-t border-slate-800"
                                    >
                                        Run New Analysis on "{searchQuery}"
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="p-4 text-sm text-slate-500 text-center italic">
                                        No indexed sites found matching "{searchQuery}"
                                    </div>
                                    <div 
                                        onClick={() => {
                                            handleAnalyzeHost(searchQuery);
                                        }}
                                        className="p-3 bg-slate-950/30 hover:bg-slate-800 cursor-pointer text-xs text-blue-400 font-bold text-center border-t border-slate-800"
                                    >
                                        Deep Scan Target "{searchQuery}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">SYSTEM ONLINE</span>
                </div>
            </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'crawler' && (
                <Crawler 
                    onSiteFound={handleSiteFound} 
                    library={crawledLibrary}
                    onAnalyze={handleAnalyzeHost}
                />
            )}
            {currentView === 'intel' && (
                <Intelligence 
                    cases={cases} 
                    onAddEvidence={handleAddEvidence} 
                />
            )}
            {currentView === 'investigation' && (
                <Investigation 
                    cases={cases} 
                    onAddEvidence={handleAddEvidence} 
                    onUpdateCase={handleUpdateCase}
                />
            )}
            {currentView === 'crypto' && <CryptoTrace />}
            {currentView === 'recon' && <HostRecon initialTarget={reconTarget} />}
            {currentView === 'activity' && <ActivityLog />}
            {currentView === 'network' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-end">
                         <div>
                            <h2 className="text-2xl font-bold text-white">Darknet Topology</h2>
                            <p className="text-slate-400">Visualizing relationships between known hidden services.</p>
                        </div>
                    </div>
                    <NetworkGraph data={MOCK_SITES} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-slate-200 mb-4">Node Legend</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-slate-300">Critical Threat / Ransomware</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    <span className="text-slate-300">High Risk / Marketplace</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-300">Low Risk / Blog / Info</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                             <h3 className="font-bold text-slate-200 mb-2">Network Statistics</h3>
                             <p className="text-slate-400 text-sm mb-4">
                                Analysis indicates a strong clustering of illicit marketplaces sharing hosting infrastructure.
                             </p>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold">Centrality</span>
                                    <div className="text-xl font-mono text-white">0.84</div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold">Density</span>
                                    <div className="text-xl font-mono text-white">0.32</div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
