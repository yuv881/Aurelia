import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { Plus, Pencil, Trash2, X, Check, Search, Package, Loader2, AlertCircle, Image as ImageIcon, Star, IndianRupee } from 'lucide-react';

const EMPTY = { name: '', category: '', price: '', stock: '', rating: '', brand: '', image: '', description: '' };
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys', 'Food', 'Other'];
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const StockBadge = ({ stock }) => {
    const n = Number(stock);
    if (n === 0) return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Out of Stock</span>;
    if (n < 10) return <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">Low Stock: {n}</span>;
    return <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">{n} in Stock</span>;
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

    const { search: query } = useLocation();
    const load = () => {
        setLoading(true);
        api.products()
            .then(setProducts)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    useEffect(() => {
        const params = new URLSearchParams(query);
        if (params.get('action') === 'add') {
            setForm(EMPTY);
            setModal('add');
        }
    }, [query]);

    const handleSave = async () => {
        if (!form.name || !form.category || !form.price || form.stock === '') {
            setFormErr('Please fill in all required fields.');
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
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try { await api.deleteProduct(id); load(); }
        catch (e) { alert(e.message); }
        finally { setDeleting(null); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Products Registry</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none w-full sm:w-64 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => { setForm(EMPTY); setModal('add'); setFormErr(''); }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin" /> Fetching products...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Package className="mx-auto mb-4 opacity-20" size={48} />
                        No products found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex shrink-0">
                                                    {p.image ? (
                                                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                                                    ) : (
                                                        <ImageIcon className="m-auto text-slate-300" size={20} />
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-900">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">₹{fmt(p.price)}</td>
                                        <td className="px-6 py-4">
                                            <StockBadge stock={p.stock} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 flex items-center gap-1.5">
                                            <Star className="text-amber-400" size={14} fill="currentColor" />
                                            {parseFloat(p.rating || 0).toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setForm({ ...p, brand: p.brand || '' }); setFormErr(''); setModal(p); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    disabled={deleting === p.id}
                                                    onClick={() => confirmDelete(p.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    {deleting === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40" onClick={() => setModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">{modal === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
                            <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Product Name</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Brand</label>
                                    <input
                                        value={form.brand}
                                        onChange={e => setForm({ ...form, brand: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="Enter brand name"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Stock</label>
                                    <input
                                        type="number"
                                        value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Image URL</label>
                                    <input
                                        value={form.image}
                                        onChange={e => setForm({ ...form, image: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
                                        placeholder="Enter product description"
                                    />
                                </div>
                            </div>

                            {formErr && (
                                <p className="text-sm text-red-600 font-medium">{formErr}</p>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn-primary">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
