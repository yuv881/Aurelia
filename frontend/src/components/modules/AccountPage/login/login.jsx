import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to login');
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onGoogleCredential = async (googleResponse) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/google/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: googleResponse.credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
            setGoogleLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setError(null);
        setGoogleLoading(true);
        const init = () => {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: onGoogleCredential,
            });
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    setGoogleLoading(false);
                    setError('Google sign-in was dismissed. Please try again.');
                }
            });
        };
        if (window.google?.accounts?.id) { init(); return; }
        const existing = document.querySelector('script[src*="gsi/client"]');
        if (existing) { existing.addEventListener('load', init); return; }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = init;
        script.onerror = () => { setError('Failed to load Google Sign-In.'); setGoogleLoading(false); };
        document.head.appendChild(script);
    };

    return (
        <div style={styles.page}>
            {/* ── Left Panel: Brand ─────────────────────────────────────────────── */}
            <div style={styles.left}>
                {/* Animated gradient orbs */}
                <div style={styles.orb1}></div>
                <div style={styles.orb2}></div>
                <div style={styles.orb3}></div>

                <div style={styles.leftContent}>
                    {/* Logo */}
                    <div style={styles.logo}>
                        <span style={styles.logoText}>Aurelia</span>
                    </div>

                    <h1 style={styles.headline}>
                        Shop the<br />
                        <span style={styles.headlineAccent}>future</span> of<br />
                        fashion.
                    </h1>

                    <p style={styles.subtext}>
                        Discover curated collections, exclusive drops, and personalised style — all in one place.
                    </p>

                    {/* Feature pills */}
                    <div style={styles.pills}>
                        {['✦ 10k+ Styles', '✦ Free Returns', '✦ Exclusive Members'].map((t) => (
                            <span key={t} style={styles.pill}>{t}</span>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <p style={styles.quote}>"Style is a way to say who you are without having to speak."</p>
            </div>

            {/* ── Right Panel: Form ─────────────────────────────────────────────── */}
            <div style={styles.right}>
                <div style={styles.formCard}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Welcome back</h2>
                        <p style={styles.formSub}>
                            New here?{' '}
                            <Link to="/register" style={styles.link}>Create an account</Link>
                        </p>
                    </div>

                    {/* ── Google Button ── */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        style={styles.googleBtn}
                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                        {googleLoading ? (
                            <Loader2 size={20} style={styles.spin} />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        <span style={styles.googleBtnText}>
                            {googleLoading ? 'Connecting...' : 'Continue with Google'}
                        </span>
                    </button>

                    {/* ── Divider ── */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine}></div>
                        <span style={styles.dividerText}>or log in with email</span>
                        <div style={styles.dividerLine}></div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorDot}></span>
                            {error}
                        </div>
                    )}

                    {/* ── Email/Password form ── */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Email address</label>
                            <div style={styles.inputWrap}>
                                <Mail size={16} style={styles.inputIcon} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    style={styles.input}
                                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <div style={styles.labelRow}>
                                <label style={styles.label}>Password</label>
                                <a href="#" style={styles.forgotLink}>Forgot password?</a>
                            </div>
                            <div style={styles.inputWrap}>
                                <Lock size={16} style={styles.inputIcon} />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ ...styles.input, paddingRight: '44px' }}
                                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={styles.submitBtn}
                            onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #4f46e5)')}
                            onMouseLeave={e => !isLoading && (e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #6366f1)')}
                        >
                            {isLoading ? (
                                <Loader2 size={18} style={styles.spin} />
                            ) : (
                                <>
                                    Log in
                                    <ArrowRight size={16} style={styles.arrowIcon} />
                                </>
                            )}
                        </button>
                    </form>

                    <p style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <a href="#" style={styles.termsLink}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" style={styles.termsLink}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ── Inline styles ──────────────────────────────────────────────────────────── */
const styles = {
    page: {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: '#09090b',
    },

    /* Left */
    left: {
        flex: '1 1 50%',
        position: 'relative',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0d1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        overflow: 'hidden',
    },
    orb1: {
        position: 'absolute', top: '-80px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
    },
    orb2: {
        position: 'absolute', bottom: '-60px', right: '-60px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite reverse',
    },
    orb3: {
        position: 'absolute', top: '40%', right: '10%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
    },
    leftContent: { position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    logo: { marginBottom: '48px' },
    logoText: {
        fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px',
        background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    headline: {
        fontSize: '54px', fontWeight: '800', lineHeight: '1.15',
        color: '#f9fafb', letterSpacing: '-1.5px', marginBottom: '20px',
    },
    headlineAccent: {
        background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtext: {
        fontSize: '16px', color: '#9ca3af', lineHeight: '1.7',
        marginBottom: '36px', maxWidth: '380px',
    },
    pills: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '48px' },
    pill: {
        padding: '6px 16px', borderRadius: '999px',
        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
        color: '#c4b5fd', fontSize: '13px', fontWeight: '500',
    },
    quote: {
        position: 'relative', zIndex: 1,
        fontSize: '13px', color: '#6b7280', fontStyle: 'italic', lineHeight: '1.6',
    },

    /* Right */
    right: {
        flex: '1 1 50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ffffff',
        padding: '48px 40px',
    },
    formCard: { width: '100%', maxWidth: '420px' },
    formHeader: { marginBottom: '32px' },
    formTitle: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' },
    formSub: { fontSize: '14px', color: '#6b7280' },
    link: { color: '#7c3aed', fontWeight: '600', textDecoration: 'none' },

    /* Google button */
    googleBtn: {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '13px 20px', borderRadius: '12px',
        border: '1.5px solid #e5e7eb', background: '#fff',
        cursor: 'pointer', transition: 'all 0.2s', marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    googleBtnText: { fontSize: '15px', fontWeight: '600', color: '#374151' },

    /* Divider */
    divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    dividerLine: { flex: 1, height: '1px', background: '#f3f4f6' },
    dividerText: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', fontWeight: '500' },

    /* Error */
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fef2f2', border: '1px solid #fecaca',
        color: '#dc2626', fontSize: '13px', padding: '10px 14px',
        borderRadius: '10px', marginBottom: '16px',
    },
    errorDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 },

    /* Form */
    form: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    forgotLink: { fontSize: '12px', color: '#7c3aed', fontWeight: '500', textDecoration: 'none' },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' },
    input: {
        width: '100%', padding: '12px 14px 12px 40px',
        border: '1.5px solid #e5e7eb', borderRadius: '10px',
        fontSize: '14px', color: '#111827', background: '#fafafa',
        outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px',
    },
    submitBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '13px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
        color: '#fff', fontSize: '15px', fontWeight: '700',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
    },
    arrowIcon: { transition: 'transform 0.2s' },
    spin: { animation: 'spin 1s linear infinite' },

    /* Terms */
    termsText: { fontSize: '12px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.6' },
    termsLink: { color: '#7c3aed', textDecoration: 'none', fontWeight: '500' },
};

/* Inject keyframes */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-20px) scale(1.03); }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
        .aurelia-left-panel { display: none !important; }
        .aurelia-right-panel { flex: 1 1 100% !important; }
    }
`;
if (!document.head.querySelector('#aurelia-login-styles')) {
    styleSheet.id = 'aurelia-login-styles';
    document.head.appendChild(styleSheet);
}

export default Login;
