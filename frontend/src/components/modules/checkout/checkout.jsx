import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin, CreditCard, ShoppingBag, ChevronRight, Check,
    Plus, Loader2, CheckCircle2, Home, Building2, Truck,
    Shield, Tag, ChevronLeft, Package, Smartphone, Wallet
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────────────── */
const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');
const fmt = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const STEPS = [
    { id: 1, label: 'Delivery', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Review', icon: ShoppingBag },
];

const PAYMENT_METHODS = [
    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: Wallet },
    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
    { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm & more', icon: Smartphone },
];

/* ─────────────────────────────────────────────────────────── */
export default function Checkout() {
    const navigate = useNavigate();

    /* cart */
    const [cartItems, setCartItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    });

    /* step */
    const [step, setStep] = useState(1);

    /* addresses */
    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(false);
    const [selectedAddrId, setSelectedAddrId] = useState(null);
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [addrForm, setAddrForm] = useState({ type: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
    const [addrSaving, setAddrSaving] = useState(false);
    const [addrError, setAddrError] = useState('');

    /* payment */
    const [payMethod, setPayMethod] = useState('cod');
    const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [upiId, setUpiId] = useState('');

    /* order */
    const [placing, setPlacing] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [orderId, setOrderId] = useState(null); // success state

    /* coupon */
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);

    /* derived */
    const subtotal = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    const selAddr = addresses.find(a => a.id === selectedAddrId);

    /* redirect if not logged in */
    useEffect(() => {
        if (!token()) { navigate('/login'); return; }
        if (cartItems.length === 0) { navigate('/shop'); return; }
        fetchAddresses();
    }, []);

    async function fetchAddresses() {
        setAddrLoading(true);
        try {
            const r = await fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token()}` } });
            const d = await r.json();
            if (Array.isArray(d)) {
                setAddresses(d);
                const def = d.find(a => a.is_default) || d[0];
                if (def) setSelectedAddrId(def.id);
            }
        } catch { /* silent */ }
        finally { setAddrLoading(false); }
    }

    async function saveNewAddress() {
        const { fullName, phone, street, city, state, pincode, type } = addrForm;
        if (!fullName || !phone || !street || !city || !state || !pincode || !type) {
            setAddrError('All fields are required'); return;
        }
        setAddrSaving(true); setAddrError('');
        try {
            const r = await fetch(`${API}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(addrForm),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.message);
            setAddresses(prev => [...prev, d]);
            setSelectedAddrId(d.id);
            setShowAddrForm(false);
            setAddrForm({ type: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
        } catch (e) { setAddrError(e.message || 'Failed to save address'); }
        finally { setAddrSaving(false); }
    }

    async function placeOrder() {
        setPlacing(true); setOrderError('');
        try {
            // Build safe (masked) payment details — never send raw card numbers
            const safePaymentDetails = (() => {
                if (payMethod === 'card') {
                    const raw = cardForm.number.replace(/\s/g, '');
                    return {
                        method: 'card',
                        lastFour: raw.slice(-4) || '????',
                        cardholderName: cardForm.name || 'Unknown',
                    };
                }
                if (payMethod === 'upi') {
                    return { method: 'upi', upiId };
                }
                return { method: 'cod' };
            })();

            const r = await fetch(`${API}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    items: cartItems.map(i => ({ name: i.name, image: i.image || '', price: i.price, quantity: i.quantity || 1 })),
                    total,
                    addressSnapshot: selAddr,
                    paymentMethod: payMethod,
                    paymentDetails: safePaymentDetails,
                    couponCode: couponApplied ? 'WELCOME10' : null,
                    discount,
                }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.message);
            localStorage.setItem('cart', JSON.stringify([]));
            window.dispatchEvent(new Event('cartUpdated'));
            setOrderId(d.id);
        } catch (e) { setOrderError(e.message || 'Failed to place order'); }
        finally { setPlacing(false); }
    }


    /* ── Order Success ──────────────────────────────── */
    if (orderId) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
                </div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                    <Check className="w-3.5 h-3.5" /> Order Confirmed
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You! 🎉</h1>
                <p className="text-gray-500 mb-2">Your order <span className="font-semibold text-gray-800">#{orderId}</span> has been placed successfully.</p>
                <p className="text-sm text-gray-400 mb-8">You'll receive a confirmation shortly. Estimated delivery in 3-5 business days.</p>

                <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                    {[
                        { icon: Package, label: 'Order Placed', sub: 'Right now' },
                        { icon: Truck, label: 'Dispatched', sub: 'In 24 hours' },
                        { icon: Home, label: 'Delivered', sub: '3-5 days' },
                    ].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="bg-gray-50 rounded-2xl p-3">
                            <Icon className="w-5 h-5 text-blue-500 mx-auto mb-1" strokeWidth={1.5} />
                            <p className="text-xs font-semibold text-gray-800">{label}</p>
                            <p className="text-[10px] text-gray-400">{sub}</p>
                        </div>
                    ))}
                </div>

                <Link to="/account" className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200 mb-3">
                    Track My Order
                </Link>
                <Link to="/shop" className="block w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );

    /* ── Step indicator ─────────────────────────────── */
    const StepBar = () => (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, idx) => {
                const done = step > s.id;
                const active = step === s.id;
                const Icon = s.icon;
                return (
                    <React.Fragment key={s.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${done ? 'bg-blue-600 text-white' :
                                active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-xs font-medium mt-2 ${active ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                                {s.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`w-16 sm:w-24 h-0.5 mb-5 transition-colors duration-300 ${step > s.id ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    /* ── Order summary sidebar ──────────────────────── */
    const OrderSummary = () => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                <span className="ml-auto text-xs text-gray-400">{cartItems.length} items</span>
            </div>
            <div className="px-5 py-4 space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {item.image
                                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                : <Package className="w-5 h-5 text-gray-300 m-auto mt-4" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 shrink-0">₹{fmt(item.price * (item.quantity || 1))}</p>
                    </div>
                ))}
            </div>

            {/* Coupon */}
            <div className="px-5 py-3 border-t border-gray-100">
                {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                            <Tag className="w-3.5 h-3.5" /> WELCOME10 applied!
                        </div>
                        <button onClick={() => setCouponApplied(false)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Coupon code"
                            value={coupon}
                            onChange={e => setCoupon(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => { if (coupon === 'WELCOME10') setCouponApplied(true); }}
                            className="px-3 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >Apply</button>
                    </div>
                )}
            </div>

            {/* Price breakdown */}
            <div className="px-5 py-4 border-t border-gray-100 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>₹{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount (10%)</span><span>−₹{fmt(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-green-600">
                    <span>Delivery</span><span className="font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2.5">
                    <span>Total</span><span>₹{fmt(total)}</span>
                </div>
            </div>

            {/* Trust badges */}
            <div className="px-5 pb-5 flex gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure Checkout</div>
                <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Free Returns</div>
            </div>
        </div>
    );

    /* ══════════════ STEP 1 — DELIVERY ══════════════ */
    const Step1 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Delivery Address</h2>
                <p className="text-sm text-gray-500">Choose where you want your order delivered</p>
            </div>

            {addrLoading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : addresses.length === 0 && !showAddrForm ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-4">No saved addresses. Add one to continue.</p>
                    <button onClick={() => setShowAddrForm(true)} className="flex items-center gap-2 mx-auto text-sm font-medium text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4" /> Add New Address
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map(addr => (
                        <button key={addr.id} onClick={() => setSelectedAddrId(addr.id)}
                            className={`w-full text-left border rounded-2xl p-4 transition-all duration-200 ${selectedAddrId === addr.id ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${selectedAddrId === addr.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                    }`}>
                                    {selectedAddrId === addr.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 text-sm">{addr.type}</span>
                                        {addr.is_default && (
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">{addr.full_name}</p>
                                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} – {addr.pincode}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                    {!showAddrForm && (
                        <button onClick={() => setShowAddrForm(true)}
                            className="w-full border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl py-4 text-sm font-medium text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add a New Address
                        </button>
                    )}
                </div>
            )}

            {/* Inline add address form */}
            {showAddrForm && (
                <div className="border border-blue-100 bg-blue-50/20 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">New Address</h3>
                        <button onClick={() => { setShowAddrForm(false); setAddrError(''); }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                    {/* Type pills */}
                    <div className="flex flex-wrap gap-2">
                        {['Home', 'Office', 'Other'].map(t => (
                            <button key={t} type="button" onClick={() => setAddrForm({ ...addrForm, type: t })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${addrForm.type === t ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 bg-white'
                                    }`}>
                                {t === 'Home' && <Home className="w-3 h-3" />}
                                {t === 'Office' && <Building2 className="w-3 h-3" />}
                                {t === 'Other' && <MapPin className="w-3 h-3" />}
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Full Name" value={addrForm.fullName}
                            onChange={e => setAddrForm({ ...addrForm, fullName: e.target.value })}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        <input type="tel" placeholder="Phone Number" value={addrForm.phone}
                            onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                    <textarea rows={2} placeholder="Street Address" value={addrForm.street}
                        onChange={e => setAddrForm({ ...addrForm, street: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white" />
                    <div className="grid grid-cols-3 gap-3">
                        <input type="text" placeholder="City" value={addrForm.city}
                            onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        <input type="text" placeholder="State" value={addrForm.state}
                            onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        <input type="text" placeholder="PIN" maxLength={6} value={addrForm.pincode}
                            onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '') })}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                    {addrError && <p className="text-xs text-red-600">{addrError}</p>}
                    <button onClick={saveNewAddress} disabled={addrSaving}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {addrSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Address</>}
                    </button>
                </div>
            )}

            <button
                onClick={() => { if (selAddr || addresses.length > 0) setStep(2); }}
                disabled={!selectedAddrId}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
            >
                Continue to Payment <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    /* ══════════════ STEP 2 — PAYMENT ══════════════ */
    const Step2 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Method</h2>
                <p className="text-sm text-gray-500">Select how you'd like to pay</p>
            </div>

            <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => {
                    const Icon = pm.icon;
                    return (
                        <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                            className={`w-full text-left border rounded-2xl p-4 transition-all duration-200 ${payMethod === pm.id ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === pm.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                    }`}>
                                    {payMethod === pm.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payMethod === pm.id ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}>
                                    <Icon className={`w-5 h-5 ${payMethod === pm.id ? 'text-blue-600' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{pm.label}</p>
                                    <p className="text-xs text-gray-400">{pm.sub}</p>
                                </div>
                            </div>

                            {/* Card fields */}
                            {pm.id === 'card' && payMethod === 'card' && (
                                <div className="mt-4 space-y-3 pt-4 border-t border-blue-100" onClick={e => e.stopPropagation()}>
                                    <input type="text" placeholder="Card Number" maxLength={19}
                                        value={cardForm.number}
                                        onChange={e => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                                    <input type="text" placeholder="Cardholder Name"
                                        value={cardForm.name}
                                        onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="MM / YY" maxLength={5}
                                            value={cardForm.expiry}
                                            onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                                        <input type="password" placeholder="CVV" maxLength={4}
                                            value={cardForm.cvv}
                                            onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                                    </div>
                                </div>
                            )}

                            {/* UPI field */}
                            {pm.id === 'upi' && payMethod === 'upi' && (
                                <div className="mt-4 pt-4 border-t border-blue-100" onClick={e => e.stopPropagation()}>
                                    <input type="text" placeholder="yourname@upi"
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-5 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
                    Review Order <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    /* ══════════════ STEP 3 — REVIEW ══════════════ */
    const Step3 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Order</h2>
                <p className="text-sm text-gray-500">Please confirm everything looks correct</p>
            </div>

            {/* Delivery summary */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery To</p>
                    <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change</button>
                </div>
                {selAddr && (
                    <div className="flex gap-3">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="font-semibold text-gray-900">{selAddr.full_name} <span className="text-xs font-normal text-gray-400">({selAddr.type})</span></p>
                            <p>{selAddr.street}</p>
                            <p>{selAddr.city}, {selAddr.state} – {selAddr.pincode}</p>
                            <p className="text-gray-400">📞 {selAddr.phone}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment summary */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-white">
                <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</p>
                    <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change</button>
                </div>
                <div className="flex items-center gap-3">
                    {payMethod === 'cod' && <><Wallet className="w-5 h-5 text-gray-500" /><p className="text-sm font-medium text-gray-800">Cash on Delivery</p></>}
                    {payMethod === 'card' && <><CreditCard className="w-5 h-5 text-gray-500" /><p className="text-sm font-medium text-gray-800">Card ending ···· {cardForm.number.slice(-4) || '????'}</p></>}
                    {payMethod === 'upi' && <><Smartphone className="w-5 h-5 text-gray-500" /><p className="text-sm font-medium text-gray-800">UPI — {upiId || 'yourname@upi'}</p></>}
                </div>
            </div>

            {/* Items recap */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({cartItems.length})</p>
                </div>
                <div className="divide-y divide-gray-50">
                    {cartItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                {item.image
                                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    : <Package className="w-4 h-4 text-gray-300 m-auto mt-4" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity || 1} × ₹{fmt(item.price)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 shrink-0">₹{fmt(item.price * (item.quantity || 1))}</p>
                        </div>
                    ))}
                </div>
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{fmt(discount)}</span></div>}
                    <div className="flex justify-between text-green-600 font-medium"><span>Delivery</span><span>FREE</span></div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200"><span>Total Payable</span><span>₹{fmt(total)}</span></div>
                </div>
            </div>

            {orderError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{orderError}</p>
            )}

            <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-5 py-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={placeOrder} disabled={placing}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200 text-base">
                    {placing
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                        : <><Shield className="w-5 h-5" /> Place Order Securely</>
                    }
                </button>
            </div>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                Your payment information is encrypted and secure.
            </p>
        </div>
    );

    /* ── Page layout ──────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 tracking-tight">Aurelia</span>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-500 text-sm">Checkout</span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                        <Shield className="w-3.5 h-3.5 text-green-500" />
                        Secure Checkout
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <StepBar />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                    {/* Left — form */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                        {step === 1 && <Step1 />}
                        {step === 2 && <Step2 />}
                        {step === 3 && <Step3 />}
                    </div>
                    {/* Right — order summary */}
                    <OrderSummary />
                </div>
            </div>
        </div>
    );
}
