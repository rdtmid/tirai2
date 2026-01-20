import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Terminal, ShieldAlert, Globe, Activity, Database, Search, ArrowRight } from 'lucide-react';
import { CrawlLog, OnionSite, ThreatLevel } from '../types';
import { generateRandomOnionSite } from '../services/mockData';
import { fetchCrawlStatus } from '../services/api';

interface CrawlerProps {
  onSiteFound: (site: OnionSite) => void;
  library: OnionSite[];
  onAnalyze: (url: string) => void;
}

const Crawler: React.FC<CrawlerProps> = ({ onSiteFound, library, onAnalyze }) => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [stats, setStats] = useState({ pages: 0, hiddenServices: 0, data: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const toggleCrawler = () => {
    setIsActive(!isActive);
    if (!isActive) {
      addLog("Initializing TOR consensus...", "INFO");
      
      // Check for backend connection
      fetchCrawlStatus().then(sites => {
        if(sites.length >= 0) { // If api returns, backend is there
             setBackendConnected(true);
             addLog("Connected to Backend Crawler Service.", "SUCCESS");
        }
      }).catch(() => {
          setBackendConnected(false);
          addLog("Backend Service Unreachable (ws://localhost:3001). Falling back to Simulation Mode.", "WARNING");
          addLog("Building simulated circuit...", "INFO");
      });
      
    } else {
      addLog("Stopping crawler process...", "WARNING");
      addLog("Closing circuits...", "INFO");
    }
  };

  const addLog = (message: string, type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS') => {
    const newLog: CrawlLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
  };

  // Scroll to bottom of logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Main Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(async () => {
        
        if (backendConnected) {
            // REAL MODE: Poll Backend
            const newSites = await fetchCrawlStatus();
            if (newSites.length > 0) {
                 newSites.forEach(site => {
                     onSiteFound(site);
                     addLog(`Indexed: ${site.url}`, "SUCCESS");
                 });
                 setStats(s => ({ ...s, hiddenServices: s.hiddenServices + newSites.length }));
            }
        } else {
            // SIMULATION MODE (Fallback)
            const rand = Math.random();
            if (rand > 0.85) {
                const newSite = generateRandomOnionSite();
                addLog(`Discovered new hidden service: ${newSite.url.substring(0, 20)}...`, "SUCCESS");
                setStats(s => ({ ...s, hiddenServices: s.hiddenServices + 1 }));
                onSiteFound(newSite);
            } else if (rand > 0.6) {
                setStats(s => ({ ...s, pages: s.pages + Math.floor(Math.random() * 5), data: s.data + Math.random() }));
                addLog(`Indexing content block ${Math.floor(Math.random() * 9999)}...`, "INFO");
            }
        }

      }, 1500);
    }

    return () => clearInterval(interval);
  }, [isActive, onSiteFound, backendConnected]);

  const filteredLibrary = library.filter(site => 
      site.url.includes(searchTerm) || 
      site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Control</h3>
            <button
                onClick={toggleCrawler}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded font-bold transition-all ${
                    isActive 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                }`}
            >
                {isActive ? <><Square size={16} /> STOP CRAWLER</> : <><Play size={16} /> START CRAWLER</>}
            </button>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Globe size={16} />
                <span className="text-xs uppercase font-bold">Services Found</span>
            </div>
            <p className="text-2xl font-mono text-white">{library.length}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Activity size={16} />
                <span className="text-xs uppercase font-bold">Pages Indexed</span>
            </div>
            <p className="text-2xl font-mono text-white">{stats.pages}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <ShieldAlert size={16} />
                <span className="text-xs uppercase font-bold">Data (MB)</span>
            </div>
            <p className="text-2xl font-mono text-white">{stats.data.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          
          {/* Left: Terminal */}
          <div className="bg-black rounded-lg border border-slate-700 overflow-hidden flex flex-col font-mono text-sm relative shadow-2xl h-full min-h-[300px]">
            <div className="bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-slate-400 text-xs">root@torwatch-node-01:~/crawler/logs</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-1">
                {logs.length === 0 && <span className="text-slate-600 italic">System ready. Waiting for command...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className={`break-all
                            ${log.type === 'INFO' ? 'text-blue-400' : ''}
                            ${log.type === 'SUCCESS' ? 'text-emerald-400' : ''}
                            ${log.type === 'WARNING' ? 'text-amber-400' : ''}
                            ${log.type === 'ERROR' ? 'text-red-500' : ''}
                        `}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
            {isActive && (
                <div className="absolute bottom-4 right-4">
                    <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </div>
            )}
          </div>

          {/* Right: Database Library */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col shadow-2xl h-full min-h-[300px]">
              <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex flex-col gap-3 shrink-0">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Database size={16} className="text-purple-400" />
                          <h3 className="text-sm font-bold text-slate-200">Crawled Host Library</h3>
                      </div>
                      <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400">
                          {library.length} Records
                      </span>
                  </div>
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                          type="text" 
                          placeholder="Search database..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {library.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                          <Database size={32} className="mb-2" />
                          <span className="text-xs">Database empty</span>
                      </div>
                  ) : (
                      <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/50 text-slate-500 font-mono sticky top-0 z-10">
                              <tr>
                                  <th className="p-2 font-medium">Service Info</th>
                                  <th className="p-2 font-medium text-center">Threat</th>
                                  <th className="p-2 font-medium text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {filteredLibrary.map((site) => (
                                  <tr key={site.id} className="hover:bg-slate-800/50 transition">
                                      <td className="p-2">
                                          <div className="font-bold text-slate-300 truncate max-w-[150px]">{site.title}</div>
                                          <div className="font-mono text-slate-500 text-[10px] truncate max-w-[150px]">{site.url}</div>
                                          <div className="text-[10px] text-slate-400 mt-0.5 bg-slate-800 inline-block px-1 rounded">{site.category}</div>
                                      </td>
                                      <td className="p-2 text-center">
                                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                              site.threatLevel === ThreatLevel.CRITICAL ? 'bg-red-500/10 text-red-500' :
                                              site.threatLevel === ThreatLevel.HIGH ? 'bg-orange-500/10 text-orange-500' :
                                              'bg-emerald-500/10 text-emerald-500'
                                          }`}>
                                              {site.threatLevel}
                                          </span>
                                      </td>
                                      <td className="p-2 text-right">
                                          <button 
                                              onClick={() => onAnalyze(site.url)}
                                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition"
                                              title="Analyze Host"
                                          >
                                              <ArrowRight size={14} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Crawler;
