import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const [secret, setSecret] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const correctSecret = import.meta.env.VITE_ADMIN_SECRET || 'secret123';

        setTimeout(() => {
            if (secret.trim() === correctSecret.trim()) {
                sessionStorage.setItem('admin_authed', 'true');
                navigate('/');
            } else {
                setError('Invalid secret key. Access denied.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-6 sm:p-0">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-slate-950 overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <main className="w-full max-w-md fade-in">
                <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 border border-white/20">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Portal</h1>
                        <p className="text-slate-500 font-medium">Please enter your secret access key</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Secret Key</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-shake">
                                <AlertCircle size={18} />
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-slate-900/20"
                        >
                            {loading ? (
                                <Loader2 className="spin" size={20} />
                            ) : (
                                <>
                                    <span>Verify & Enter</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium">Aurelia E-commerce Admin System v1.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
