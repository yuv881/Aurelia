import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut, Store, Menu, X, ChevronRight } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300
            ${isActive
                ? 'bg-blue-600/10 text-blue-600 shadow-sm border-2 border-blue-600/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border-2 border-transparent'
            }
        `}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </div>
        <ChevronRight size={16} className={`opacity-0 transition-opacity group-hover:opacity-100`} />
    </NavLink>
);

export default function Layout() {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('admin_authed');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Store className="text-white" size={18} />
                    </div>
                    <span className="font-black text-lg tracking-tighter">AURELIA</span>
                </div>
                <button onClick={() => setOpen(!open)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Overlay */}
            {open && <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />}

            {/* Private Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-10 transition-transform duration-500 ease-in-out md:translate-x-0 md:sticky md:h-screen
                ${open ? 'translate-x-0' : '-translate-x-full shadow-none'}
            `}>
                <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Store className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter leading-none">AURELIA</h1>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/products" icon={ShoppingBag} label="Products" />
                    <NavItem to="/orders" icon={ShoppingCart} label="Orders" />
                </nav>

                <div className="space-y-4">
                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="text-xl font-bold text-blue-600">A</span>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-slate-900 text-sm">Main Administrator</p>
                            <p className="text-xs font-medium text-slate-500">Full Access Control</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-red-500 border border-red-100 rounded-2xl font-bold hover:bg-red-50 hover:border-red-200 transition-all text-sm group"
                        >
                            <LogOut size={16} className="transition-transform group-hover:rotate-12" />
                            <span>Logout</span>
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 1.2.0 • 2024</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full overflow-x-hidden min-h-screen">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
