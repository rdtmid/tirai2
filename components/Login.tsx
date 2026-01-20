import React, { useState } from 'react';
import { Lock, Shield, Fingerprint, Scan, Eye, ArrowRight, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'VERIFIED'>('IDLE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        setError('Credentials required.');
        return;
    }

    // Simulation of secure handshake
    setStep('SCANNING');
    setError('');

    setTimeout(() => {
        // Mock validation - accepts any input for demo purposes
        setStep('VERIFIED');
        setTimeout(() => {
            onLogin();
        }, 800);
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center font-sans">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8 space-y-2">
            <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Lock size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">TorWatch <span className="text-emerald-500">Intel</span></h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded border border-slate-800">
                <Shield size={10} /> Secure Access Gateway
            </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Top scanning line animation */}
            {step === 'SCANNING' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-scan-line z-20"></div>
            )}

            <div className="p-8">
                {step === 'IDLE' && (
                    <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Agent Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Scan size={16} className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-mono"
                                    placeholder="Enter Codename"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Clearance Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Eye size={16} className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-mono tracking-widest"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Initialize Session <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </form>
                )}

                {step === 'SCANNING' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                        <div className="relative">
                            <Fingerprint size={64} className="text-emerald-500/20 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 border-2 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-bold text-lg">Verifying Credentials</h3>
                            <p className="text-slate-500 text-xs font-mono mt-1">Establishing encrypted tunnel via Tor node...</p>
                        </div>
                    </div>
                )}

                {step === 'VERIFIED' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                         <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Shield size={32} className="text-emerald-500" />
                         </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Access Granted</h3>
                            <p className="text-slate-400 text-xs font-mono mt-1">Welcome back, Agent.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-950/50 p-4 border-t border-slate-700/50 text-center">
                <p className="text-[10px] text-slate-600 font-mono uppercase">
                    Restricted System. Unauthorized access is a federal offense.
                </p>
            </div>
        </div>

        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-600">
             <span>System v2.4</span>
             <span>•</span>
             <span>Encrypted AES-256</span>
             <span>•</span>
             <span className="text-emerald-500/50 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Node Online</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
