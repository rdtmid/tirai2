
import React, { useState, useRef } from 'react';
import { Search, Globe, FileText, Terminal, Database, ArrowRight, Shield, CheckCircle, Save, Loader, AlertTriangle } from 'lucide-react';
import { OnionSite } from '../types';
import { searchTorNetwork } from '../services/api';

interface SearchIntelProps {
  onResultsFound: (results: OnionSite[]) => void;
  onAnalyze: (url: string) => void;
}

const ENGINES = [
  { id: 'ahmia', name: 'Ahmia (Tor)', icon: Globe, description: 'Real-time scraping of Ahmia.fi via Backend Proxy' },
  // Disabled others for now as we only implemented real scraper for Ahmia
  // { id: 'darksearch', name: 'DarkSearch', ... }, 
];

const SearchIntel: React.FC<SearchIntelProps> = ({ onResultsFound, onAnalyze }) => {
  const [query, setQuery] = useState('');
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['ahmia']);
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<OnionSite[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    if (logRef.current) {
        setTimeout(() => {
            logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setLogs(['Initializing REAL TIME search...', `Target Query: "${query}"`]);

    try {
        addLog(`Routing query via Backend Proxy -> Tor Network...`);
        addLog(`Engine: Ahmia.fi Hidden Service`);

        // REAL API CALL
        const realResults = await searchTorNetwork(query);
        
        addLog(`> Connection Established.`);
        addLog(`> Retrieved ${realResults.length} live results.`);
        
        setResults(realResults);
        onResultsFound(realResults);

    } catch (err: any) {
        addLog(`CRITICAL ERROR: ${err.message}`);
        setError(err.message || "Failed to connect to backend. Ensure 'node server/index.js' is running and Tor is active.");
    } finally {
        setIsSearching(false);
        addLog('Session closed.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      
      {/* Search Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Search className="text-indigo-500" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Live Tor Search</h2>
                <p className="text-xs text-slate-400">Queries the Tor network in real-time. Requires backend proxy.</p>
            </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter keywords (e.g., 'market', 'leaks', 'data')..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
                />
            </div>

            <div className="flex flex-wrap gap-3">
                {ENGINES.map(engine => (
                    <div 
                        key={engine.id}
                        className={`p-3 rounded border flex items-center gap-3 bg-indigo-900/20 border-indigo-500/50 cursor-default`}
                    >
                        <div className={`p-1.5 rounded bg-indigo-500 text-white`}>
                            <engine.icon size={16} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-indigo-300">
                                {engine.name}
                            </div>
                            <div className="text-[10px] text-slate-600 truncate max-w-[200px]">{engine.description}</div>
                        </div>
                        <CheckCircle size={14} className="ml-auto text-indigo-500" />
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={isSearching || !query}
                className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                    isSearching ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'
                }`}
            >
                {isSearching ? <><Loader className="animate-spin" size={18}/> Routing to Darknet...</> : 'Initiate Live Search'}
            </button>
        </form>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Terminal Logs */}
        <div className="bg-black border border-slate-800 rounded-lg flex flex-col shadow-2xl h-64 lg:h-auto">
             <div className="bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-slate-400 text-xs font-mono">proxy_daemon@torwatch:~/tunnel</span>
            </div>
            <div ref={logRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs text-emerald-500/80 space-y-1">
                {logs.length === 0 && <span className="text-slate-700 italic">Ready for input...</span>}
                {logs.map((log, idx) => (
                    <div key={idx} className="break-all">{log}</div>
                ))}
                {isSearching && <div className="animate-pulse">_</div>}
            </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
             <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                     <Database size={16} /> Live Results
                 </h3>
                 <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                     {results.length} Found
                 </span>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {results.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                         <Search size={48} className="mb-2" />
                         <span className="text-sm">No live data. Perform a search.</span>
                     </div>
                 ) : (
                     results.map((site) => (
                         <div key={site.id} className="bg-slate-950/50 border border-slate-800 p-3 rounded hover:border-indigo-500/50 transition group">
                             <div className="flex justify-between items-start mb-1">
                                 <div>
                                     <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition cursor-pointer" onClick={() => onAnalyze(site.url)}>{site.title}</h4>
                                     <div className="flex items-center gap-2 mt-0.5">
                                         <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 rounded border border-slate-800">
                                             {site.engine}
                                         </span>
                                         <span className="text-[10px] font-mono text-slate-500 truncate max-w-[250px]">
                                             {site.url}
                                         </span>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => onAnalyze(site.url)}
                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition flex items-center gap-1 text-xs font-bold px-2"
                                     >
                                         Analyze Headers <ArrowRight size={12} />
                                     </button>
                                 </div>
                             </div>
                             <p className="text-xs text-slate-400 line-clamp-2 pl-2 border-l-2 border-slate-800 group-hover:border-indigo-500/30 transition">
                                 {site.contentSnippet}
                             </p>
                             <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">Last Seen: {site.lastSeen}</span>
                             </div>
                         </div>
                     ))
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default SearchIntel;
