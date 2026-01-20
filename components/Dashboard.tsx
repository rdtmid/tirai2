import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OnionSite, ThreatLevel } from '../types';
import { Shield, AlertOctagon, Activity, Eye, Database } from 'lucide-react';

interface DashboardProps {
  library: OnionSite[];
}

const Dashboard: React.FC<DashboardProps> = ({ library }) => {
  // Calculate Real Stats from Live Data
  const criticalThreats = library.filter(s => s.threatLevel === ThreatLevel.CRITICAL).length;
  const highThreats = library.filter(s => s.threatLevel === ThreatLevel.HIGH).length;
  const onlineNodes = library.filter(s => s.status === 'ONLINE').length;
  
  // Group by category for a simple chart representation (mocking time series from current snapshot for now)
  // In a full backend system, this would come from a historical DB.
  const chartData = [
    { name: 'Markets', value: library.filter(s => s.category === 'MARKETPLACE').length },
    { name: 'Forums', value: library.filter(s => s.category === 'FORUM').length },
    { name: 'Ransom', value: library.filter(s => s.category === 'RANSOMWARE').length },
    { name: 'Other', value: library.filter(s => s.category === 'UNKNOWN' || s.category === 'BLOG').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Indexed Services</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{library.length}</h3>
                </div>
                <div className="p-2 bg-emerald-500/20 rounded text-emerald-500">
                    <Database size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-mono">Live Session Data</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Critical Threats</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{criticalThreats}</h3>
                </div>
                <div className="p-2 bg-red-500/20 rounded text-red-500">
                    <AlertOctagon size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-red-400 font-mono">Requires Action</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Online Status</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{library.length > 0 ? Math.round((onlineNodes / library.length) * 100) : 0}%</h3>
                </div>
                <div className="p-2 bg-blue-500/20 rounded text-blue-500">
                    <Eye size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">Reachability</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">High Risk</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{highThreats}</h3>
                </div>
                <div className="p-2 bg-orange-500/20 rounded text-orange-500">
                    <Shield size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-orange-400 font-mono">Priority Targets</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-200 font-bold mb-6">Library Composition</h3>
            {library.length > 0 ? (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500 italic">
                    No data collected yet. Start a search or crawler session.
                </div>
            )}
        </div>

        {/* Recent Alerts List */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg overflow-y-auto max-h-[400px]">
            <h3 className="text-slate-200 font-bold mb-4">Latest Indexing</h3>
            <div className="space-y-3">
                {library.slice(0, 10).map((site) => (
                    <div key={site.id} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded hover:border-slate-600 transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition truncate max-w-[150px]">{site.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                site.threatLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                site.threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-emerald-500/20 text-emerald-400'
                            }`}>
                                {site.threatLevel}
                            </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate mb-2">{site.url}</div>
                    </div>
                ))}
                {library.length === 0 && (
                    <div className="text-slate-500 text-sm italic text-center py-4">
                        Database empty. Awaiting input.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;