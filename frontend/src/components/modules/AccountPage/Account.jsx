import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, ChevronDown, Edit2, Check, Plus, Trash2, Phone, Home, Building2, Hash, Star, X, ShoppingBag, Truck, CheckCircle2, XCircle, Clock, CreditCard, Smartphone, Wallet, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210'
};

const defaultAddresses = [
    {
        id: '1',
        type: 'Home',
        isDefault: true,
        addressString: "123 Innovation Drive,\nTech Park, Bangalore,\nKarnataka, 560001"
    }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Dynamic States
    const [profile, setProfile] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                // Split name into first and last if possible, else use name as first
                const names = user.name.split(' ');
                return {
                    firstName: names[0] || 'User',
                    lastName: names.slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: localStorage.getItem('userPhone') || '+91 00000 00000'
                };
            }
            return defaultProfile;
        } catch {
            return defaultProfile;
        }
    });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressError, setAddressError] = useState('');
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [editForm, setEditForm] = useState({ type: '', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState(profile);

    // Address Add State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        type: '',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Fetch addresses from DB on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAddressLoading(true);
        fetch(`${API_URL}/api/addresses`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAddresses(data); })
            .catch(() => setAddressError('Could not load addresses.'))
            .finally(() => setAddressLoading(false));
    }, []);

    // Fetch orders from DB on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setOrdersLoading(true);
        fetch(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); })
            .catch(() => setOrdersError('Could not load orders.'))
            .finally(() => setOrdersLoading(false));
    }, []);

    const handleCancelOrder = async (orderId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        } catch (err) {
            setOrdersError(err.message || 'Could not cancel order.');
        }
    };

    // Save Handlers
    const handleSaveProfile = () => {
        setProfile(editProfileForm);
        localStorage.setItem('userProfile', JSON.stringify(editProfileForm));
        localStorage.setItem('userPhone', editProfileForm.phone); // Persist phone separately if needed
        setIsEditingProfile(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Optional: clear other user specific data
        window.location.href = '/';
    };

    const handleSaveAddress = async () => {
        // Validate required fields
        const errors = {};
        if (!newAddressForm.fullName.trim()) errors.fullName = 'Full name is required';
        if (!newAddressForm.phone.trim()) errors.phone = 'Phone number is required';
        if (!newAddressForm.street.trim()) errors.street = 'Street address is required';
        if (!newAddressForm.city.trim()) errors.city = 'City is required';
        if (!newAddressForm.state.trim()) errors.state = 'State is required';
        if (!newAddressForm.pincode.trim()) errors.pincode = 'PIN code is required';
        if (!newAddressForm.type.trim()) errors.type = 'Address label is required';
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newAddressForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setAddresses(prev => [...prev, data]);
            setIsAddingAddress(false);
            setNewAddressForm({ type: '', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
            setFormErrors({});
        } catch (err) {
            setAddressError(err.message || 'Failed to save address.');
        }
    };

    const handleDeleteAddress = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            setAddresses(prev => {
                const updated = prev.filter(a => a.id !== id);
                // If the deleted one was default, promote the first remaining
                if (updated.length > 0 && !updated.some(a => a.is_default)) {
                    updated[0] = { ...updated[0], is_default: true };
                }
                return updated;
            });
        } catch {
            setAddressError('Could not delete address.');
        }
    };

    const handleSetDefault = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}/default`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
        } catch {
            setAddressError('Could not set default address.');
        }
    };

    const handleStartEdit = (address) => {
        setEditingAddressId(address.id);
        setEditForm({
            type: address.type,
            fullName: address.full_name,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode
        });
    };

    const handleCancelEdit = () => {
        setEditingAddressId(null);
        setEditForm({ type: '', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
    };

    const handleUpdateAddress = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setAddresses(prev => prev.map(a => a.id === id ? data : a));
            setEditingAddressId(null);
        } catch (err) {
            setAddressError(err.message || 'Could not update address.');
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                            {!isEditingProfile ? (
                                <button
                                    onClick={() => {
                                        setEditProfileForm(profile);
                                        setIsEditingProfile(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveProfile}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Save
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={editProfileForm.firstName}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, firstName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{profile.firstName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={editProfileForm.lastName}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, lastName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{profile.lastName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                                {isEditingProfile ? (
                                    <input
                                        type="email"
                                        value={editProfileForm.email}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{profile.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                                {isEditingProfile ? (
                                    <input
                                        type="tel"
                                        value={editProfileForm.phone}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{profile.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'orders': {
                const STATUS_CONFIG = {
                    Placed: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Order Placed' },
                    Processing: { color: 'bg-yellow-100 text-yellow-700', icon: Package, label: 'Processing' },
                    Shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Shipped' },
                    Delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
                    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle, label: 'Cancelled' },
                };
                const statusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];

                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                            {orders.length > 0 && (
                                <span className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
                            )}
                        </div>

                        {ordersError && (
                            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{ordersError}</p>
                        )}

                        {ordersLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Placed;
                                    const StatusIcon = cfg.icon;
                                    const isExpanded = expandedOrderId === order.id;
                                    const isCancelled = order.status === 'Cancelled';
                                    const activeStep = statusSteps.indexOf(order.status);

                                    return (
                                        <div key={order.id} className={`border rounded-2xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            {/* ─ Order Summary Row ─ */}
                                            <button
                                                className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 bg-white hover:bg-gray-50/60 transition-colors"
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? 'bg-red-50' : 'bg-blue-50'
                                                        }`}>
                                                        <StatusIcon className={`w-5 h-5 ${isCancelled ? 'text-red-500' : 'text-blue-600'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.color}`}>
                                                                {cfg.label}
                                                            </span>
                                                            {/* Payment method pill */}
                                                            {order.payment_method && (
                                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                                                                    {order.payment_method === 'card' && <CreditCard className="w-2.5 h-2.5" />}
                                                                    {order.payment_method === 'upi' && <Smartphone className="w-2.5 h-2.5" />}
                                                                    {order.payment_method === 'cod' && <Wallet className="w-2.5 h-2.5" />}
                                                                    {order.payment_method === 'card' ? `Card ···· ${order.payment_details?.lastFour || '????'}` :
                                                                        order.payment_method === 'upi' ? 'UPI' : 'COD'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            &nbsp;·&nbsp;{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-auto">
                                                    <span className="font-bold text-gray-900 text-base">
                                                        ₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>

                                            {/* ─ Expanded Detail Panel ─ */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-100">

                                                    {/* Status tracker (skip for cancelled) */}
                                                    {!isCancelled && (
                                                        <div className="px-6 py-5 bg-gray-50/60">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Progress</p>
                                                            <div className="flex items-center gap-0">
                                                                {statusSteps.map((step, idx) => {
                                                                    const done = idx <= activeStep;
                                                                    const active = idx === activeStep;
                                                                    const StepIcon = STATUS_CONFIG[step]?.icon || Package;
                                                                    return (
                                                                        <div key={step} className="flex items-center flex-1 last:flex-none">
                                                                            <div className="flex flex-col items-center">
                                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                                                                    : done ? 'bg-blue-600 text-white'
                                                                                        : 'bg-gray-200 text-gray-400'
                                                                                    }`}>
                                                                                    <StepIcon className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className={`text-[10px] font-medium mt-1.5 whitespace-nowrap ${done ? 'text-blue-600' : 'text-gray-400'
                                                                                    }`}>{step}</span>
                                                                            </div>
                                                                            {idx < statusSteps.length - 1 && (
                                                                                <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < activeStep ? 'bg-blue-500' : 'bg-gray-200'
                                                                                    }`} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Items list */}
                                                    <div className="px-6 py-5">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</p>
                                                        <div className="space-y-3">
                                                            {(order.items || []).map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                                        {item.image ? (
                                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ShoppingBag className="w-5 h-5 text-gray-300" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                                                                        ₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Order summary + address */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-5">
                                                        {/* Price breakdown */}
                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Summary</p>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between text-gray-600">
                                                                    <span>Subtotal ({order.items?.length || 0} items)</span>
                                                                    <span>₹{(Number(order.total) + Number(order.discount || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                                {Number(order.discount) > 0 && (
                                                                    <div className="flex justify-between text-green-600">
                                                                        <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" />{order.coupon_code || 'Coupon'}</span>
                                                                        <span>−₹{Number(order.discount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between text-green-600">
                                                                    <span>Delivery</span><span>FREE</span>
                                                                </div>
                                                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                                                                    <span>Total Paid</span>
                                                                    <span>₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Delivery address snapshot */}
                                                        {order.address_snapshot && order.address_snapshot.full_name && (
                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Delivery Address</p>
                                                                <div className="flex gap-2">
                                                                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                                    <div className="text-sm text-gray-600 leading-relaxed">
                                                                        <p className="font-medium text-gray-900">{order.address_snapshot.full_name}</p>
                                                                        <p>{order.address_snapshot.street}</p>
                                                                        <p>{order.address_snapshot.city}, {order.address_snapshot.state} – {order.address_snapshot.pincode}</p>
                                                                        <p className="text-gray-400">📞 {order.address_snapshot.phone}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Payment details panel */}
                                                    {order.payment_method && (
                                                        <div className="px-6 pb-5">
                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</p>
                                                                <div className="flex items-center gap-3">
                                                                    {order.payment_method === 'card' && (
                                                                        <><div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                                                        </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">Card ending ···· {order.payment_details?.lastFour || '????'}</p>
                                                                                {order.payment_details?.cardholderName && <p className="text-xs text-gray-400">{order.payment_details.cardholderName}</p>}
                                                                            </div></>
                                                                    )}
                                                                    {order.payment_method === 'upi' && (
                                                                        <><div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                                                            <Smartphone className="w-4 h-4 text-purple-600" />
                                                                        </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">UPI Payment</p>
                                                                                {order.payment_details?.upiId && <p className="text-xs text-gray-400">{order.payment_details.upiId}</p>}
                                                                            </div></>
                                                                    )}
                                                                    {order.payment_method === 'cod' && (
                                                                        <><div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                                                            <Wallet className="w-4 h-4 text-green-600" />
                                                                        </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
                                                                                <p className="text-xs text-gray-400">Pay when your order arrives</p>
                                                                            </div></>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    {order.status === 'Placed' && (
                                                        <div className="px-6 pb-5">
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Cancel Order
                                                            </button>
                                                        </div>
                                                    )}
                                                    {order.status === 'Cancelled' && (
                                                        <div className="px-6 pb-5">
                                                            <p className="text-sm text-red-500 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> This order was cancelled.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-blue-300" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
                                <p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">You haven't placed any orders yet. Add something to your cart and checkout!</p>
                                <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                );
            }
            case 'addresses':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                            {!isAddingAddress && (
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add New
                                </button>
                            )}
                        </div>

                        {/* Add Address Form */}
                        {isAddingAddress && (
                            <div className="mb-8 rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
                                {/* Form Header */}
                                <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-base">Add New Address</h3>
                                        <p className="text-blue-100 text-xs">Fill in the details below to save a new delivery address</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Address Label row */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Home', 'Office', 'Other'].map(label => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewAddressForm({ ...newAddressForm, type: label });
                                                        setFormErrors({ ...formErrors, type: '' });
                                                    }}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${newAddressForm.type === label
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                                                        }`}
                                                >
                                                    {label === 'Home' && <Home className="w-3.5 h-3.5" />}
                                                    {label === 'Office' && <Building2 className="w-3.5 h-3.5" />}
                                                    {label === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                                                    {label}
                                                </button>
                                            ))}
                                            {/* Custom label input */}
                                            <input
                                                type="text"
                                                placeholder="Custom label..."
                                                value={!['Home', 'Office', 'Other', ''].includes(newAddressForm.type) ? newAddressForm.type : ''}
                                                onChange={e => {
                                                    setNewAddressForm({ ...newAddressForm, type: e.target.value });
                                                    setFormErrors({ ...formErrors, type: '' });
                                                }}
                                                className="flex-1 min-w-[120px] px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
                                    </div>

                                    {/* Full Name + Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Recipient's full name"
                                                    value={newAddressForm.fullName}
                                                    onChange={e => {
                                                        setNewAddressForm({ ...newAddressForm, fullName: e.target.value });
                                                        setFormErrors({ ...formErrors, fullName: '' });
                                                    }}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    placeholder="10-digit mobile number"
                                                    value={newAddressForm.phone}
                                                    onChange={e => {
                                                        setNewAddressForm({ ...newAddressForm, phone: e.target.value });
                                                        setFormErrors({ ...formErrors, phone: '' });
                                                    }}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                        </div>
                                    </div>

                                    {/* Street Address */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Street Address <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <textarea
                                                placeholder="Flat / House No., Building, Street, Area"
                                                rows={2}
                                                value={newAddressForm.street}
                                                onChange={e => {
                                                    setNewAddressForm({ ...newAddressForm, street: e.target.value });
                                                    setFormErrors({ ...formErrors, street: '' });
                                                }}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${formErrors.street ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                    }`}
                                            />
                                        </div>
                                        {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
                                    </div>

                                    {/* City + State + Pincode */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={newAddressForm.city}
                                                onChange={e => {
                                                    setNewAddressForm({ ...newAddressForm, city: e.target.value });
                                                    setFormErrors({ ...formErrors, city: '' });
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${formErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                    }`}
                                            />
                                            {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={newAddressForm.state}
                                                onChange={e => {
                                                    setNewAddressForm({ ...newAddressForm, state: e.target.value });
                                                    setFormErrors({ ...formErrors, state: '' });
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${formErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                    }`}
                                            />
                                            {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PIN Code <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 560001"
                                                    maxLength={6}
                                                    value={newAddressForm.pincode}
                                                    onChange={e => {
                                                        setNewAddressForm({ ...newAddressForm, pincode: e.target.value.replace(/\D/g, '') });
                                                        setFormErrors({ ...formErrors, pincode: '' });
                                                    }}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${formErrors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={handleSaveAddress}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all text-sm shadow-sm shadow-blue-200 hover:shadow-md"
                                        >
                                            <Check className="w-4 h-4" /> Save Address
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingAddress(false);
                                                setNewAddressForm({ type: '', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
                                                setFormErrors({});
                                            }}
                                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {addressError && (
                            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{addressError}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addressLoading ? (
                                <p className="text-gray-400 text-sm col-span-2">Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <div className="col-span-2 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No saved addresses yet. Add one above.</p>
                                </div>
                            ) : (
                                addresses.map((address) => (
                                    <div key={address.id} className={`border rounded-2xl overflow-hidden transition-all ${address.is_default ? 'border-blue-200' : 'border-gray-200'
                                        }`}>

                                        {/* Card body */}
                                        {editingAddressId === address.id ? (
                                            /* ── Inline Edit Form ── */
                                            <div className="p-5 bg-white space-y-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">Edit Address</h4>
                                                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                                                </div>
                                                {/* Type pills */}
                                                <div className="flex flex-wrap gap-2">
                                                    {['Home', 'Office', 'Other'].map(label => (
                                                        <button key={label} type="button"
                                                            onClick={() => setEditForm({ ...editForm, type: label })}
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${editForm.type === label ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'
                                                                }`}>
                                                            {label === 'Home' && <Home className="w-3 h-3" />}
                                                            {label === 'Office' && <Building2 className="w-3 h-3" />}
                                                            {label === 'Other' && <MapPin className="w-3 h-3" />}
                                                            {label}
                                                        </button>
                                                    ))}
                                                    <input type="text" placeholder="Custom label"
                                                        value={!['Home', 'Office', 'Other', ''].includes(editForm.type) ? editForm.type : ''}
                                                        onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                                        className="flex-1 min-w-[100px] px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                                {/* Name + Phone */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                        <input type="text" placeholder="Full name" value={editForm.fullName}
                                                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                                            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="relative">
                                                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                        <input type="tel" placeholder="Phone" value={editForm.phone}
                                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                </div>
                                                {/* Street */}
                                                <textarea rows={2} placeholder="Street address" value={editForm.street}
                                                    onChange={e => setEditForm({ ...editForm, street: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                {/* City + State + PIN */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <input type="text" placeholder="City" value={editForm.city}
                                                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    <input type="text" placeholder="State" value={editForm.state}
                                                        onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                                                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    <div className="relative">
                                                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                        <input type="text" placeholder="PIN" maxLength={6} value={editForm.pincode}
                                                            onChange={e => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, '') })}
                                                            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                </div>
                                                {/* Save / Cancel */}
                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => handleUpdateAddress(address.id)}
                                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                                                        <Check className="w-3.5 h-3.5" /> Save Changes
                                                    </button>
                                                    <button onClick={handleCancelEdit}
                                                        className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── Display Mode ── */
                                            <div className={`p-5 ${address.is_default ? 'bg-blue-50/30' : 'bg-white'}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className={`w-4 h-4 ${address.is_default ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <h3 className="font-semibold text-gray-900">{address.type}</h3>
                                                        {address.is_default && (
                                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-800">{address.full_name}</p>
                                                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{address.street}</p>
                                                <p className="text-sm text-gray-600">{address.city}, {address.state} – {address.pincode}</p>
                                                <p className="text-sm text-gray-500 mt-0.5">📞 {address.phone}</p>
                                            </div>
                                        )}

                                        {/* ── Action Bar ── always visible at bottom of card */}
                                        {editingAddressId !== address.id && (
                                            <div className={`flex items-center gap-1 px-4 py-2.5 border-t ${address.is_default ? 'border-blue-100 bg-blue-50/60' : 'border-gray-100 bg-gray-50'
                                                }`}>
                                                <button
                                                    onClick={() => handleStartEdit(address)}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                                {!address.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefault(address.id)}
                                                        className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                                                    >
                                                        <Star className="w-3.5 h-3.5" /> Set Default
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                        <div className="max-w-md">
                            <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert("Password updated successfully!"); }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input required type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input required type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input required type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                                </div>
                                <button type="submit" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors">
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-[80vh] py-12">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My Account</h1>
                    <p className="text-gray-500 mt-2">Manage your orders, profile, and settings.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-[280px] shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
                                    {profile.firstName?.charAt(0) || ''}{profile.lastName?.charAt(0) || ''}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 line-clamp-1">{profile.firstName} {profile.lastName}</p>
                                    <p className="text-sm text-gray-500 line-clamp-1">{profile.email}</p>
                                </div>
                            </div>
                            <nav className="p-2 flex flex-col gap-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                                {tab.label}
                                            </div>
                                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                                        </button>
                                    );
                                })}
                                <div className="my-2 border-t border-gray-100 mx-2"></div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all"
                                >
                                    <LogOut className="w-5 h-5 text-red-500" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
