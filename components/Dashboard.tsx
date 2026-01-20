import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_SITES } from '../services/mockData';
import { Shield, AlertOctagon, Activity, Eye } from 'lucide-react';

const data = [
  { name: '00:00', threats: 12 },
  { name: '04:00', threats: 19 },
  { name: '08:00', threats: 3 },
  { name: '12:00', threats: 25 },
  { name: '16:00', threats: 32 },
  { name: '20:00', threats: 20 },
  { name: '24:00', threats: 15 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Active Targets</p>
                    <h3 className="text-3xl font-bold text-white mt-1">1,204</h3>
                </div>
                <div className="p-2 bg-emerald-500/20 rounded text-emerald-500">
                    <Activity size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-mono">+12% from last scan</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Critical Threats</p>
                    <h3 className="text-3xl font-bold text-white mt-1">84</h3>
                </div>
                <div className="p-2 bg-red-500/20 rounded text-red-500">
                    <AlertOctagon size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-red-400 font-mono">+5 detected today</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Uptime Monitor</p>
                    <h3 className="text-3xl font-bold text-white mt-1">98.2%</h3>
                </div>
                <div className="p-2 bg-blue-500/20 rounded text-blue-500">
                    <Eye size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">15 nodes offline</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Intel Reports</p>
                    <h3 className="text-3xl font-bold text-white mt-1">450</h3>
                </div>
                <div className="p-2 bg-purple-500/20 rounded text-purple-500">
                    <Shield size={20} />
                </div>
            </div>
            <div className="mt-2 text-xs text-purple-400 font-mono">22 pending review</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-200 font-bold mb-6">Threat Activity (24h)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#ef4444' }}
                        />
                        <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Alerts List */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg overflow-y-auto max-h-[400px]">
            <h3 className="text-slate-200 font-bold mb-4">Priority Targets</h3>
            <div className="space-y-3">
                {MOCK_SITES.map((site) => (
                    <div key={site.id} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded hover:border-slate-600 transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition">{site.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                site.threatLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                site.threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-emerald-500/20 text-emerald-400'
                            }`}>
                                {site.threatLevel}
                            </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate mb-2">{site.url}</div>
                        <div className="text-xs text-slate-400 line-clamp-2">
                            {site.contentSnippet}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
