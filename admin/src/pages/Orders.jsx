import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Search, ChevronDown, Package, MapPin, Smartphone, AlertCircle, User, Calendar, Truck, Info, Loader2 } from 'lucide-react';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLE = {
    Placed: 'bg-indigo-100 text-indigo-700',
    Processing: 'bg-amber-100 text-amber-700',
    Shipped: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

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
        const matchesSearch = !q || String(o.id).includes(q) || (o.customer_name || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find orders..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none w-full sm:w-64 transition-colors"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                        <option value="All">All Status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin" /> Loading orders...
                </div>
            ) : error ? (
                <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex items-center gap-4 text-red-700">
                    <AlertCircle size={24} />
                    <p>{error}</p>
                </div>
            ) : displayOrders.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-500 border border-slate-200 rounded-xl shadow-sm">
                    No orders found.
                </div>
            ) : (
                <div className="space-y-4">
                    {displayOrders.map(order => {
                        const isExpanded = expanded === order.id;
                        const addr = order.address_snapshot || {};

                        return (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6 flex flex-wrap items-center gap-x-12 gap-y-6">
                                    <div className="min-w-[120px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Order ID</p>
                                        <p className="font-bold text-slate-900">#{order.id.toString().substring(0, 8)}</p>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Customer</p>
                                        <p className="font-medium text-slate-900">{order.customer_name || 'Guest'}</p>
                                        <p className="text-xs text-slate-500">{order.customer_email}</p>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Total</p>
                                        <p className="font-bold text-slate-900 tracking-tight">₹{fmt(order.total)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Status</p>
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                            disabled={updating === order.id}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer transition-colors ${STATUS_STYLE[order.status] || ''}`}
                                        >
                                            {STATUSES.map(st => <option key={st} value={st} className="bg-white text-slate-900">{st}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                                        className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Package size={16} className="text-slate-400" /> Order Items
                                            </h5>
                                            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                                                {(order.items || []).map((item, i) => (
                                                    <div key={i} className="p-4 flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-50 rounded border border-slate-100 p-1 flex shrink-0">
                                                                {item.image ? <img src={item.image} className="w-full h-full object-contain" alt="" /> : <Package size={16} className="m-auto text-slate-300" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-slate-900 truncate">{item.name}</p>
                                                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-semibold text-slate-900">₹{fmt(item.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <MapPin size={16} className="text-slate-400" /> Shipping Details
                                            </h5>
                                            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 min-h-[140px]">
                                                {addr.full_name ? (
                                                    <>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{addr.full_name}</p>
                                                            <p className="text-sm text-slate-600 leading-relaxed mt-1">
                                                                {addr.street}, {addr.city},<br />
                                                                {addr.state} - {addr.pincode}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                            <Smartphone size={14} className="text-slate-400" /> {addr.phone}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">No address information available.</p>
                                                )}
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
