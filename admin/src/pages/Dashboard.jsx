import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { TrendingUp, Users, ShoppingBag, CreditCard, Activity, AlertCircle, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend !== undefined && (
                <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend}% from last month
                </p>
            )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
            <Icon size={24} />
        </div>
    </div>
);

export default function Dashboard() {
    const navigate = useNavigate();
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
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    if (error) return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`}
                    icon={TrendingUp}
                    color="indigo"
                    trend={12.4}
                />
                <StatCard
                    title="Active Products"
                    value={stats?.total_products || 0}
                    icon={ShoppingBag}
                    color="blue"
                    trend={5.2}
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.total_customers || 0}
                    icon={Users}
                    color="emerald"
                    trend={8.1}
                />
                <StatCard
                    title="Average Order"
                    value="₹1,240"
                    icon={CreditCard}
                    color="amber"
                    trend={-2.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Inventory Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Pending Orders</span>
                            <span className="text-lg font-bold text-indigo-600">{stats?.pending_orders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Out of Stock</span>
                            <span className="text-lg font-bold text-red-600">{stats?.out_of_stock || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/products?action=add')}
                            className="flex flex-col items-center justify-center p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                        >
                            <ShoppingBag size={20} className="mb-2" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Add Product</span>
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex flex-col items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                        >
                            <Activity size={20} className="mb-2" />
                            <span className="text-xs font-semibold uppercase tracking-wider">View Orders</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
