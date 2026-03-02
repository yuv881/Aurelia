import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Search, ChevronDown, ChevronUp, Package, MapPin, CreditCard, Smartphone, Wallet, AlertTriangle, Tag, MoreHorizontal, User, Calendar, IndianRupee, Truck, ShieldCheck } from 'lucide-react';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_MAP = {
    Placed: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' },
    Processing: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' },
    Shipped: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
    Delivered: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', dot: 'bg-green-500' },
    Cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', dot: 'bg-red-500' },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const PayBadge = ({ method }) => {
    const icons = { card: CreditCard, upi: Smartphone, cod: Wallet };
    const Icon = icons[method] || Wallet;
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
            <Icon size={12} strokeWidth={3} />
            <span>{method || 'cod'}</span>
        </div>
    );
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilter] = useState('All');
    const [expanded, setExpanded] = useState(null);
    const [updating, setUpdating] = useState(null);

    const load = () => {
        setLoading(true);
        api.orders()
            .then(setOrders)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const handleStatusUpdate = async (id, s) => {
        setUpdating(id);
        try {
            await api.updateOrderStatus(id, s);
            setOrders(oList => oList.map(o => o.id === id ? { ...o, status: s } : o));
        } catch (e) { alert(e.message); }
        finally { setUpdating(null); }
    };

    const displayOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            String(o.id).includes(q) ||
            (o.customer_name || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-10 fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Transaction Log</h1>
                    <p className="text-slate-500 font-bold tracking-tight text-sm uppercase italic">End-to-End Fulfillment Pipeline Control</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Find Order #..."
                            className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all w-full md:w-64"
                        />
                    </div>
                    {['All', ...STATUSES].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95
                                ${filterStatus === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}
                            `}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full spin mx-auto" /></div>
            ) : error ? (
                <div className="p-8 bg-red-50 text-red-600 border border-red-100 rounded-4xl flex items-center gap-4 animate-shake">
                    <AlertTriangle className="shrink-0" />
                    <p className="font-bold tracking-tight text-sm">{error}</p>
                </div>
            ) : displayOrders.length === 0 ? (
                <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                    <Package size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="font-black italic uppercase tracking-[0.2em] text-sm text-slate-400">Zero matches in log stream</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {displayOrders.map(order => {
                        const s = STATUS_MAP[order.status] || STATUS_MAP.Placed;
                        const expandedView = expanded === order.id;
                        const addr = order.address_snapshot || {};

                        return (
                            <div key={order.id} className={`bg-white border-2 rounded-[2.5rem] transition-all duration-500 overflow-hidden relative group
                                ${expandedView ? 'border-blue-500 shadow-2xl ring-4 ring-blue-500/5' : 'border-slate-50 shadow-sm hover:border-slate-200'}
                            `}>
                                {/* Summary Entry */}
                                <div className="p-8 flex items-center flex-wrap gap-x-10 gap-y-6">
                                    <div className="shrink-0 bg-slate-900 text-white rounded-3xl px-5 py-4 text-center min-w-[100px] shadow-lg -rotate-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 m-0 leading-none">Order Ref</p>
                                        <p className="text-xl font-black mt-2 leading-none">#{order.id}</p>
                                    </div>

                                    <div className="flex-1 min-w-[200px] space-y-1">
                                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                            <User size={14} className="text-blue-500" />
                                            <h4 className="font-black text-slate-900 tracking-tight leading-none uppercase italic">{order.customer_name || 'Incognito User'}</h4>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 pl-6 lowercase tracking-tight">{order.customer_email}</p>
                                    </div>

                                    <div className="space-y-2 hidden lg:block">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-400 font-black text-[10px] uppercase italic tracking-widest">
                                            <Calendar size={12} />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                        <PayBadge method={order.payment_method} />
                                    </div>

                                    <div className="text-right min-w-[100px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Gross Total</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter mt-1 italic">₹{fmt(order.total)}</p>
                                    </div>

                                    <div className="flex items-center gap-4 ml-auto">
                                        <div className={`flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl border ${s.bg} ${s.text} ${s.border} font-black text-xs uppercase tracking-tighter shadow-sm`}>
                                            <div className={`w-2 h-2 rounded-full ${s.dot} ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? 'animate-pulse' : ''}`} />
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                                disabled={updating === order.id}
                                                className="bg-transparent outline-none cursor-pointer disabled:opacity-50 appearance-none pr-4 font-black"
                                                style={{ background: 'none' }}
                                            >
                                                {STATUSES.map(st => <option key={st} value={st} className="bg-white text-slate-900">{st}</option>)}
                                            </select>
                                        </div>

                                        <button
                                            onClick={() => setExpanded(expandedView ? null : order.id)}
                                            className={`p-4 rounded-2xl transition-all shadow-sm active:scale-95
                                                ${expandedView ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                                            `}
                                        >
                                            {expandedView ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Detail Panel */}
                                {expandedView && (
                                    <div className="border-t-2 border-slate-50 bg-slate-50/50 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 fade-in">
                                        {/* Products List */}
                                        <div className="space-y-6 bg-white p-8 rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-5"><Package size={48} /></div>
                                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 shadow-sm bg-slate-50 w-fit px-3 py-1 rounded-lg">
                                                <ShieldCheck size={12} /> Line Items
                                            </h5>
                                            <div className="space-y-4">
                                                {(order.items || []).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4 group/item transition-all hover:translate-x-1 cursor-default">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm group-hover/item:border-blue-300">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : <Package className="m-auto absolute inset-0 text-slate-300" size={18} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-black text-slate-900 text-sm truncate leading-none uppercase tracking-tight">{item.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase italic">Qty: {item.quantity} × ₹{fmt(item.price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Specs */}
                                        <div className="space-y-6 bg-slate-900 p-8 rounded-4xl text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-10"><Truck size={48} /></div>
                                            <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 shadow-sm bg-white/5 w-fit px-3 py-1 rounded-lg">Dispatch Coordinates</h5>
                                            {addr.full_name ? (
                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                                                            <MapPin size={18} className="text-white" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-black text-lg tracking-tighter uppercase italic">{addr.full_name}</p>
                                                            <p className="text-xs font-bold text-white/60 tracking-tight leading-relaxed">{addr.street}, {addr.city}</p>
                                                            <p className="text-[11px] font-black text-blue-400 tracking-widest uppercase">{addr.state} — {addr.pincode}</p>
                                                            <p className="text-[10px] font-bold text-white/40 pt-2 italic tracking-widest uppercase">Tel: {addr.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : <p className="text-white/30 italic font-bold text-xs uppercase text-center py-10">No record found</p>}
                                        </div>

                                        {/* Financial Matrix */}
                                        <div className="space-y-6 bg-white p-8 rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div className="absolute top-0 right-0 p-6 opacity-5"><IndianRupee size={48} /></div>
                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 shadow-sm bg-slate-50 w-fit px-3 py-1 rounded-lg">Financial Matrix</h5>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest italic group hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-default">
                                                        <span>Subtotal</span>
                                                        <span className="text-slate-900 font-black tracking-tight">₹{fmt(Number(order.total) + (order.discount || 0))}</span>
                                                    </div>
                                                    {order.discount > 0 && (
                                                        <div className="flex justify-between items-center text-xs font-black text-green-600 bg-green-50 p-3 rounded-2xl border border-green-100 shadow-sm animate-pulse">
                                                            <div className="flex items-center gap-2 uppercase tracking-[0.2em] italic underline decoration-2 underline-offset-4">
                                                                <Tag size={14} /> {order.coupon_code || 'PROMO'}
                                                            </div>
                                                            <span className="text-lg">−₹{fmt(order.discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest p-2">
                                                        <span>Logistic Fee</span>
                                                        <span className="text-green-600 font-black tracking-[0.2em] shadow-sm bg-green-50 px-2 py-0.5 rounded-md">FREE</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 text-white rounded-3xl p-6 text-center transform hover:scale-[1.02] transition-transform shadow-2xl shadow-slate-900/20 mt-4">
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] m-0 mb-1 leading-none italic">Total Paid Net</p>
                                                <p className="text-3xl font-black italic tracking-tighter tabular-nums leading-none">₹{fmt(order.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
