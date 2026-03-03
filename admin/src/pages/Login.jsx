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
                setError('Invalid security key. Access denied.');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md">
                <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-xl space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg text-white mb-4">
                            <Lock size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                        <p className="text-sm text-slate-500">Enter your security key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Security Key</label>
                            <input
                                type="password"
                                required
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors text-slate-900"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400">
                        Aurelia Admin v4.2 &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
