import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, AlertTriangle, Key } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // PRODUCTION AUTHENTICATION
    // In a real environment with a DB, this would call an API.
    // Since we are running a proxy backend without a User DB, we use strict static credentials 
    // to prevent unauthorized access in this "Live" deployment.
    if (username === 'admin' && password === 'live-production') {
        onLogin();
    } else {
        setError('Invalid credentials. Access denied.');
        setPassword('');
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center font-sans">
      
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm p-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8 space-y-2">
            <div className="p-4 bg-slate-900 border border-red-500/30 rounded-lg shadow-2xl">
                <Lock size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TorWatch <span className="text-red-500">PRO</span></h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Live Production Environment</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-8">
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Operator ID</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-mono"
                        placeholder="admin"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Access Key</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-mono"
                        placeholder="••••••••••••"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <Key size={16} /> Authenticate
                </button>
            </form>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-600 font-mono">
             AUTHORIZED PERSONNEL ONLY. ALL ACTIVITY LOGGED.
        </div>
      </div>
    </div>
  );
};

export default Login;