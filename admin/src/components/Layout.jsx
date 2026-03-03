import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ClipboardList,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    ChevronDown
} from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const notifications = [
        { id: 1, text: 'New order received #8234', time: '2 mins ago', type: 'order' },
        { id: 2, text: 'Product "Aurelia Pearl" is low on stock', time: '1 hour ago', type: 'stock' },
        { id: 3, text: 'System backup completed successfully', time: '5 hours ago', type: 'system' }
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('admin_authed');
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Products', icon: ShoppingBag },
        { path: '/orders', label: 'Orders', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:relative z-40 bg-white border-r border-slate-200 w-64 h-screen flex flex-col transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span className="text-xl font-bold text-indigo-600 tracking-tight">Aurelia Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm
                                ${location.pathname === item.path
                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span className="capitalize">{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                                            <span className="text-[10px] font-medium text-indigo-600 cursor-pointer hover:underline">Mark all as read</span>
                                        </div>
                                        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                                            {notifications.map(n => (
                                                <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <p className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug">{n.text}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{n.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                            <span className="text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer">View all activity</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs border border-indigo-200">
                                AD
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
