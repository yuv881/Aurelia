import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Plus, Pencil, Trash2, X, Check, Search, Package, Loader2, AlertTriangle, ChevronRight, Image as ImageIcon, Star, ShoppingBag, Database } from 'lucide-react';

const EMPTY = { name: '', category: '', price: '', stock: '', rating: '', brand: '', image: '', description: '' };
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys', 'Food', 'Other'];
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const StockBadge = ({ stock }) => {
    const n = Number(stock);
    if (n === 0) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-[11px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Out Of Stock
        </span>
    );
    if (n < 10) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-600 border border-amber-200 text-[11px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Low Stock
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 border border-green-200 text-[11px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> In Stock
        </span>
    );
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [formErr, setFormErr] = useState('');

    const load = () => {
        setLoading(true);
        api.products()
            .then(setProducts)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const handleSave = async () => {
        if (!form.name || !form.category || !form.price || form.stock === '') {
            setFormErr('Missing required fields.');
            return;
        }
        setSaving(true);
        setFormErr('');
        try {
            if (modal === 'add') await api.createProduct(form);
            else await api.updateProduct(modal.id, form);
            load();
            setModal(null);
        } catch (e) { setFormErr(e.message); }
        finally { setSaving(false); }
    };

    const confirmDelete = async (id) => {
        if (!window.confirm('IRREVERSIBLE ACTION: Permanent deletion of product. Proceed?')) return;
        setDeleting(id);
        try { await api.deleteProduct(id); load(); }
        catch (e) { alert(e.message); }
        finally { setDeleting(null); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Catalog</h1>
                    <p className="text-slate-500 font-bold tracking-tight text-sm">Inventory & Stock Optimization Portfolio</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search catalog..."
                            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-80 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setForm(EMPTY); setFormErr(''); setModal('add'); }}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline italic uppercase tracking-wider text-[11px]">Add Item</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-shake">
                    <AlertTriangle className="shrink-0" />
                    <p className="font-bold tracking-tight text-sm">{error}</p>
                </div>
            )}

            {/* Table/Gallery */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {['Item Description', 'Details', 'Price', 'Inventory', 'Public Rating', ''].map(h => (
                                    <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center">
                                    <div className="w-8 h-8 border-3 border-slate-100 border-t-blue-600 rounded-full spin mx-auto" />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center">
                                    <div className="max-w-xs mx-auto space-y-4 opacity-30">
                                        <Database size={48} className="mx-auto" />
                                        <p className="font-black uppercase tracking-widest text-xs">No entries found in warehouse</p>
                                    </div>
                                </td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                ) : <ImageIcon className="m-auto absolute inset-0 text-slate-300" size={24} />}
                                            </div>
                                            <div className="min-w-0 max-w-[240px]">
                                                <h4 className="font-black text-slate-900 truncate tracking-tight">{p.name}</h4>
                                                <p className="text-[11px] font-bold text-slate-400 truncate tracking-tight">{p.brand || 'Original'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{p.category}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-slate-900 tracking-tighter">₹{fmt(p.price)}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Unit Price</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <StockBadge stock={p.stock} />
                                            <p className="text-[11px] font-bold text-slate-900/50 pl-3">Count: {p.stock}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < Math.floor(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                                ))}
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{parseFloat(p.rating).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setForm({ ...p, brand: p.brand || '' }); setFormErr(''); setModal(p); }}
                                                className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                disabled={deleting === p.id}
                                                onClick={() => confirmDelete(p.id)}
                                                className="p-3 bg-white border border-slate-200 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                            >
                                                {deleting === p.id ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - CRUD */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md fade-in" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-10 space-y-10 overflow-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-xl shadow-blue-600/20">
                                    <ShoppingBag size={28} className="text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                                        {modal === 'add' ? 'New Inventory Item' : 'Update Item Profile'}
                                    </h2>
                                    <p className="text-slate-500 font-bold tracking-tight text-sm uppercase italic">Unique ID: {modal === 'add' ? 'Auto-Generated' : modal.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setModal(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Official Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900" placeholder="e.g. Premium Leather Sneakers" />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Categorization</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900 appearance-none pointer-events-auto cursor-pointer">
                                    <option value="">Choose Label...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Brand/Series</label>
                                <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900" placeholder="e.g. Aurelia Original" />
                            </div>

                            <div className="space-y-2 group text-blue-600">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Unit Valuation (₹)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl" />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Stock Level</label>
                                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-black" />
                            </div>

                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset URL (High-Res Image)</label>
                                <div className="flex gap-4">
                                    <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-xs opacity-80" placeholder="https://..." />
                                    {form.image && (
                                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                            <img src={form.image} className="w-full h-full object-contain" alt="preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {formErr && <p className="text-red-500 font-bold bg-red-50 p-4 rounded-2xl text-xs uppercase tracking-widest leading-none border border-red-100 text-center italic">{formErr}</p>}

                        <div className="flex gap-4 pt-10">
                            <button onClick={() => setModal(null)} className="flex-1 py-5 rounded-3xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95">Cancel Operation</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-2 py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-900/30 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="spin mx-auto" size={24} /> : (modal === 'add' ? 'Confirm Addition' : 'Apply Patch')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
