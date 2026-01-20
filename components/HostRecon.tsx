
import React, { useState, useEffect, useRef } from 'react';
import { Server, Search, Terminal, Globe, ShieldAlert, Cpu, Layers, Activity, Lock, History, MapPin, FileSearch, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { analyzeInfrastructure } from '../services/geminiService';
import { fetchRealIpData, fetchRealWhois, performLiveRecon } from '../services/api';
import { HostReconResult, WhoisResult } from '../types';

interface HostReconProps {
    initialTarget?: string;
}

const HostRecon: React.FC<HostReconProps> = ({ initialTarget }) => {
  const [target, setTarget] = useState(initialTarget || '');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<HostReconResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Whois state
  const [whoisData, setWhoisData] = useState<WhoisResult | null>(null);
  const [showWhoisModal, setShowWhoisModal] = useState(false);
  const [isLoadingWhois, setIsLoadingWhois] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (initialTarget) setTarget(initialTarget);
  }, [initialTarget]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setResult(null);
    setErrorMessage(null);
    setLogs(['Initializing ACTIVE reconnaissance...', `Target acquired: ${target}`]);

    // Check if target is IP or Onion
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target);
    const isOnion = target.includes('.onion');

    if (isOnion) {
        addLog("Target is a TOR hidden service.");
        addLog("Routing through Backend SOCKS5 Proxy...");
        
        try {
            // 1. Call Backend to get Real Headers
            const scanData = await performLiveRecon(target);
            
            if (scanData.status === 'FAILED') {
                throw new Error(scanData.error || "Backend connection failed. Ensure Tor Proxy is running.");
            }

            addLog(`Connected to Host. HTTP Status: ${scanData.httpStatus}`);
            addLog(`Server Header: ${scanData.serverInfo.server}`);
            addLog("Sending telemetry to AI for profiling...");

            // 2. Send Real Headers to Gemini
            const analysis = await analyzeInfrastructure(target, scanData);
            setResult(analysis);

        } catch (e: any) {
             addLog(`ERROR: ${e.message}`);
             setErrorMessage(e.message);
        }
        
        setIsScanning(false);
        return;
    }

    if (isIp) {
        addLog("Target is IPv4 Address. Initiating Clearweb OSINT scan...");
        addLog("Querying IP Geolocation DB...");
        
        try {
            const realData = await fetchRealIpData(target);
            if (!realData) throw new Error("IP Lookup failed");

            addLog(`Location identified: ${realData.location}`);
            addLog(`Provider: ${realData.provider}`);
            addLog("Generating risk profile via AI...");

            // Merge real data with AI assessment of that real data
            const analysis = await analyzeInfrastructure(target, { ...realData, context: "Clearweb IP Scan" }); 
            
            setResult({
                ...analysis,
                ...realData as any, 
                riskAssessment: `[REAL DATA] Host located in ${realData.location} (${realData.provider}). ${analysis.riskAssessment}`
            });

        } catch (e: any) {
            addLog("Error accessing public IP APIs.");
            setErrorMessage(e.message || "Scan failed.");
        }
        setIsScanning(false);
        return;
    }

    setErrorMessage("Invalid Target. Please enter an IP address or .onion URL.");
    setIsScanning(false);
  };

  const handleWhoisLookup = async () => {
    const lookupTarget = result?.ipEstimate !== "Masked" && result?.ipEstimate !== "Unknown" ? result?.ipEstimate : target;
    
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(lookupTarget || '')) {
        alert("Cannot perform WHOIS: No valid IP address available.");
        return;
    }

    setIsLoadingWhois(true);
    
    // Real API
    const data = await fetchRealWhois(lookupTarget || '');
    
    if (data) {
        setWhoisData(data);
        setShowWhoisModal(true);
    } else {
        alert("RDAP/Whois Lookup failed for this IP.");
    }
    
    setIsLoadingWhois(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
                <Server className="text-blue-500" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Active Host Reconnaissance</h2>
                <p className="text-xs text-slate-400">Real-time HTTP Header analysis & IP Geolocation.</p>
            </div>
        </div>

        <div className="flex gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Enter Real IP (8.8.8.8) or Onion Address..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
            </div>
            <button 
                onClick={handleScan}
                disabled={isScanning || !target}
                className={`px-6 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                    isScanning ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                }`}
            >
                {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Left: Terminal Output */}
        <div className={`bg-black border border-slate-800 rounded-lg flex flex-col shadow-2xl transition-all duration-500 ${result ? 'h-64 lg:h-auto' : 'flex-1'}`}>
            <div className="bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-800">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-slate-400 text-xs font-mono">recon_daemon@torwatch:~/active_scan</span>
            </div>
            <div 
                ref={logContainerRef}
                className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 text-slate-300"
            >
                {logs.length === 0 && <span className="text-slate-600 italic opacity-50">System standby. Initiate scan to begin.</span>}
                {logs.map((log, idx) => (
                    <div key={idx} className="break-all">{log}</div>
                ))}
                {isScanning && (
                    <div className="animate-pulse text-blue-500 font-bold">_</div>
                )}
            </div>
        </div>

        {/* Right: Results Dashboard */}
        {result ? (
            <div className="flex flex-col gap-6 overflow-y-auto animate-fade-in custom-scrollbar pr-2">
                
                {/* Top Summary Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Globe size={100} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <h3 className="text-xs font-bold text-slate-500 uppercase">Provider & Location</h3>
                             <div className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                                <Globe size={18} className="text-blue-400" />
                                {result.location}
                             </div>
                             <p className="text-sm text-slate-400 font-mono mt-1">{result.provider}</p>
                        </div>
                        <div className="text-right">
                             <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center justify-end gap-2">
                                IP Estimation
                                <button 
                                    onClick={handleWhoisLookup} 
                                    disabled={isLoadingWhois}
                                    className="text-blue-400 hover:text-white transition" 
                                    title="Perform WHOIS Lookup"
                                >
                                    <FileSearch size={14} className={isLoadingWhois ? "animate-spin" : ""} />
                                </button>
                             </h3>
                             <div className="text-lg font-mono text-emerald-400 mt-1">{result.ipEstimate || "MASKED"}</div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Server Header (Real)</div>
                        <code className="text-sm text-slate-200">{result.serverHeader}</code>
                    </div>
                </div>

                {/* Ports & Tech Stack */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Activity size={14} /> Open Ports
                        </h3>
                        <div className="space-y-2">
                            {result.openPorts.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-900/50 rounded border border-slate-700/30">
                                    <span className="font-mono text-slate-300">{p.port}/{p.service}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                        p.status === 'OPEN' ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'
                                    }`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                            {result.openPorts.length === 0 && <span className="text-slate-500 text-xs italic">No open ports inferred/scanned.</span>}
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg flex flex-col">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Layers size={14} /> Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2 content-start">
                            {result.techStack.length > 0 ? (
                                result.techStack.map((tech, idx) => (
                                    <div 
                                        key={idx} 
                                        className="text-xs font-medium bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-full border border-slate-600"
                                    >
                                        {tech}
                                    </div>
                                ))
                            ) : (
                                <span className="text-slate-500 text-xs italic">No specific technologies identified from headers.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vulnerabilities & Risks */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg">
                    <h3 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                        <ShieldAlert size={14} /> Vulnerabilities & Risks
                    </h3>
                    <ul className="space-y-2 mb-4">
                        {result.vulnerabilities.map((vuln, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span> {vuln}
                            </li>
                        ))}
                    </ul>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-sm text-slate-400 italic">
                        "{result.riskAssessment}"
                    </div>
                </div>

            </div>
        ) : (
             <div className="flex flex-col items-center justify-center text-slate-600 opacity-40 border-2 border-dashed border-slate-800 rounded-lg">
                {errorMessage ? (
                    <>
                        <AlertTriangle size={64} className="mb-4 text-red-500 opacity-50" />
                        <h3 className="text-xl font-bold text-red-400">Scan Failed</h3>
                        <p>{errorMessage}</p>
                    </>
                ) : (
                    <>
                        <Cpu size={64} className="mb-4" />
                        <h3 className="text-xl font-bold">Awaiting Target</h3>
                        <p>Enter an address to pull REAL telemetry data.</p>
                    </>
                )}
            </div>
        )}

      </div>
      
      {/* WHOIS Modal (Real Data) */}
      {showWhoisModal && whoisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[80vh]">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileSearch size={18} className="text-blue-400"/> WHOIS Record (ARIN/RDAP)
                     </h3>
                     <button onClick={() => setShowWhoisModal(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                     </button>
                </div>
                <div className="p-6 overflow-y-auto">
                     <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="p-3 bg-slate-950 rounded border border-slate-800">
                             <span className="text-xs text-slate-500 uppercase block mb-1">Organization</span>
                             <span className="text-slate-200 font-mono">{whoisData.organization}</span>
                         </div>
                         <div className="p-3 bg-slate-950 rounded border border-slate-800">
                             <span className="text-xs text-slate-500 uppercase block mb-1">ASN / CIDR</span>
                             <span className="text-slate-200 font-mono">{whoisData.asn} <br/> {whoisData.cidr}</span>
                         </div>
                     </div>
                     
                     <div className="bg-black p-4 rounded border border-slate-800 font-mono text-xs text-slate-400 whitespace-pre-wrap overflow-x-auto">
                        {whoisData.rawText}
                     </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HostRecon;
