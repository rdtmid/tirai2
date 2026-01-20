import React, { useState } from 'react';
import { 
  Table, 
  Search, 
  Download, 
  ShieldAlert, 
  Globe, 
  Activity, 
  Calendar, 
  Server,
  FileText,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ThreatLevel } from '../types';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  target: string;
  type: 'CRAWL' | 'RECON' | 'INTEL' | 'TRACE';
  category: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  location: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  details: string;
}

const ActivityLog: React.FC = () => {
  // Start with EMPTY logs for production. 
  // In a real full-stack app, this would fetch from an API endpoint (e.g., /api/logs).
  // For this frontend, it displays logs of the current session.
  const [logs] = useState<ActivityLogEntry[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityLogEntry; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof ActivityLogEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'ALL' || log.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const sortedLogs = React.useMemo(() => {
    if (!sortConfig) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredLogs, sortConfig]);

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case ThreatLevel.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case ThreatLevel.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case ThreatLevel.LOW: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CRAWL': return <Globe size={14} />;
      case 'RECON': return <Server size={14} />;
      case 'INTEL': return <FileText size={14} />;
      case 'TRACE': return <Activity size={14} />;
      default: return <Activity size={14} />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Table className="text-indigo-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Activity Logs & Audit Trail</h2>
            <p className="text-xs text-slate-400">Comprehensive history of all crawled hosts, scans, and intelligence operations.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters & Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-950/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by host, location, or details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {['ALL', 'CRAWL', 'RECON', 'INTEL', 'TRACE'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition ${
                  filterType === type 
                    ? 'bg-indigo-500 text-white border-indigo-400' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-500 font-mono text-xs uppercase sticky top-0 z-10">
              <tr>
                <th 
                  className="p-4 font-medium cursor-pointer hover:text-indigo-400 transition"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Timestamp <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 font-medium">Activity Type</th>
                <th className="p-4 font-medium">Target / Host</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Risk Level</th>
                <th className="p-4 font-medium">Location / Origin</th>
                <th className="p-4 font-medium">Result Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${
                      log.type === 'CRAWL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      log.type === 'RECON' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      log.type === 'INTEL' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {getTypeIcon(log.type)}
                      {log.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-slate-200 truncate max-w-[200px]" title={log.target}>
                      {log.target}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center w-fit gap-1 ${getThreatColor(log.threatLevel)}`}>
                       <ShieldAlert size={10} /> {log.threatLevel} ({log.riskScore})
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe size={14} />
                      <span className="text-xs">{log.location}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       {log.status === 'SUCCESS' ? (
                         <CheckCircle2 size={14} className="text-emerald-500" />
                       ) : (
                         <XCircle size={14} className="text-red-500" />
                       )}
                       <span className="text-xs text-slate-400 truncate max-w-[250px]">{log.details}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 italic">
                    Log database empty. Logs will appear here as operations occur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;