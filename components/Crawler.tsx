import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Terminal, ShieldAlert, Globe, Activity, Database, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { CrawlLog, OnionSite, ThreatLevel } from '../types';
import { checkSystemStatus } from '../services/api';

interface CrawlerProps {
  onSiteFound: (site: OnionSite) => void;
  library: OnionSite[];
  onAnalyze: (url: string) => void;
}

const Crawler: React.FC<CrawlerProps> = ({ onSiteFound, library, onAnalyze }) => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [torStatus, setTorStatus] = useState<string>('UNKNOWN');
  const [exitNode, setExitNode] = useState<string>('Unknown');
  
  const checkConnection = async () => {
    addLog("Checking Backend Connection...", "INFO");
    const status = await checkSystemStatus();
    
    if (status.torStatus === 'ONLINE') {
        setTorStatus('ONLINE');
        setExitNode(status.exitNode);
        addLog(`Tor Proxy ACTIVE. Exit Node: ${status.exitNode}`, "SUCCESS");
    } else {
        setTorStatus('OFFLINE');
        addLog(`ERROR: Backend/Tor Offline. ${status.error || ''}`, "ERROR");
    }
  };

  const addLog = (message: string, type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS') => {
    const newLog: CrawlLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]); 
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">System Status</h3>
            <button
                onClick={checkConnection}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded font-bold transition-all ${
                    torStatus === 'ONLINE' 
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
                <RefreshCw size={16} /> {torStatus === 'ONLINE' ? 'CONNECTED' : 'CHECK STATUS'}
            </button>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Globe size={16} />
                <span className="text-xs uppercase font-bold">Services Indexed</span>
            </div>
            <p className="text-2xl font-mono text-white">{library.length}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          
          {/* Left: Terminal */}
          <div className="bg-black rounded-lg border border-slate-700 overflow-hidden flex flex-col font-mono text-sm relative shadow-2xl h-full min-h-[300px]">
            <div className="bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-slate-400 text-xs">root@production-node:~/system/logs</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-1">
                {logs.length === 0 && <span className="text-slate-600 italic">Live Monitor Ready.</span>}
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
          </div>

          {/* Right: Database Library */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col shadow-2xl h-full min-h-[300px]">
              <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex flex-col gap-3 shrink-0">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Database size={16} className="text-purple-400" />
                          <h3 className="text-sm font-bold text-slate-200">Live Host Library</h3>
                      </div>
                      <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400">
                          {library.length} Records
                      </span>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {library.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                          <Database size={32} className="mb-2" />
                          <span className="text-xs">Database empty. Use 'Deep Search' to populate real data.</span>
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
                              {library.map((site) => (
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