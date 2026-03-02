import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const Card = ({ label, value, sub, icon: Icon, colorClass, bgClass, trend }) => (
    <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full bg-${colorClass}-500 group-hover:opacity-20 transition-opacity`} />

        <div className="flex items-start justify-between relative z-10">
            <div className={`w-14 h-14 ${bgClass} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon size={24} className={colorClass === 'blue' ? 'text-blue-600' : colorClass === 'green' ? 'text-green-600' : colorClass === 'purple' ? 'text-purple-600' : 'text-amber-500'} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>

        <div className="mt-8 relative z-10">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-none">{label}</h3>
            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
            </div>
            {sub && <p className="text-slate-400 font-medium text-[11px] mt-2 leading-none">{sub}</p>}
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.stats()
            .then(setStats)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full spin shadow-sm" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Generating Insights...</p>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-10 text-center max-w-lg mx-auto mt-20 fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-900 mb-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">System Connection Failed</h2>
            <p className="text-red-600 font-medium mb-8 leading-relaxed">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20">Retry Connection</button>
        </div>
    );

    return (
        <div className="space-y-12 pb-12 fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1 select-none">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Dashboard</h1>
                    <p className="text-slate-500 font-bold tracking-tight text-sm">Store Performance & Activity Overview</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-2 bg-slate-50 rounded-xl">
                        <TrendingUp size={16} className="text-blue-500" />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            <span className="font-bold text-slate-900 text-xs tracking-tight">System Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card label="Revenue" value={`₹${fmt(stats?.total_revenue)}`} sub="All-time processed revenue" icon={IndianRupee} colorClass="green" bgClass="bg-green-100/50" trend={12} />
                <Card label="Total Orders" value={fmt(stats?.total_orders)} sub={`${fmt(stats?.pending_orders)} awaiting action`} icon={ShoppingCart} colorClass="blue" bgClass="bg-blue-100/50" trend={8} />
                <Card label="Catalog Size" value={fmt(stats?.total_products)} sub={`${fmt(stats?.out_of_stock)} items need restock`} icon={Package} colorClass="purple" bgClass="bg-purple-100/50" trend={3} />
                <Card label="Customers" value={fmt(stats?.total_customers)} sub="Verified registered users" icon={Users} colorClass="amber" bgClass="bg-amber-100/50" trend={-5} />
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Pending Actions */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center rotate-3">
                                <Clock className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter text-slate-900">Critical Actions</h2>
                        </div>
                        <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                            <MoreHorizontal size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group p-8 bg-blue-600 rounded-4xl text-white shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-2 bg-white/20 rounded-xl"><Package size={18} /></span>
                                <span className="font-black uppercase tracking-widest text-[10px] opacity-80">Pending Orders</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter leading-none">{stats?.pending_orders || 0}</span>
                                <span className="text-sm font-bold opacity-70 italic tracking-tight uppercase">Active</span>
                            </div>
                            <p className="mt-4 text-xs font-bold opacity-80 leading-relaxed max-w-[180px]">Orders awaiting manual processing and dispatch.</p>
                            <a href="/orders" className="mt-8 flex items-center justify-center gap-2 py-4 px-6 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-2xl font-black text-xs transition-all tracking-wider uppercase border border-white/20">Manage Queue</a>
                        </div>

                        <div className="group p-8 bg-amber-500 rounded-4xl text-white shadow-2xl shadow-amber-500/30 hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-2 bg-white/20 rounded-xl"><AlertTriangle size={18} /></span>
                                <span className="font-black uppercase tracking-widest text-[10px] opacity-80">Inventory Warning</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter">{stats?.out_of_stock || 0}</span>
                                <span className="text-sm font-bold opacity-70 italic uppercase tracking-tight leading-none">Alerts</span>
                            </div>
                            <p className="mt-4 text-xs font-bold opacity-80 leading-relaxed max-w-[180px]">Items are currently out of stock or below threshold.</p>
                            <a href="/products" className="mt-8 flex items-center justify-center gap-2 py-4 px-6 bg-white/20 hover:bg-white text-white hover:text-amber-600 rounded-2xl font-black text-xs transition-all tracking-wider uppercase border border-white/20">Restock Now</a>
                        </div>
                    </div>
                </div>

                {/* Info Text Area */}
                <div className="lg:col-span-12 xl:col-span-5 bg-slate-900 rounded-4xl p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black tracking-tighter leading-tight">Intelligent Insight Dashboard v2</h2>
                            <p className="text-slate-400 font-bold leading-relaxed tracking-tight text-sm">Your store health is calculated based on current order trajectories, customer retention metrics, and inventory turnover rates.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-help">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 font-bold text-xs uppercase cursor-default">OK</div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight text-white leading-none">Database Synchronization</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Status: Success 100%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-help">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 font-bold text-xs uppercase cursor-default">LOG</div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight text-white leading-none">Payment Webhooks</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Listeners: 5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
