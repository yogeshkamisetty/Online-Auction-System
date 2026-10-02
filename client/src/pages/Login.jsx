import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const { login } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const performLogin = async (loginEmail, loginPassword) => {
        setMessage({ text: '', type: '' });

        if (!loginEmail) {
            setMessage({ text: 'Please enter your email address.', type: 'error' });
            return;
        }
        if (!loginPassword) {
            setMessage({ text: 'Please enter your password.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: 'Signing in...', type: 'info' });

        try {
            const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            setMessage({ text: '', type: '' });
            setTimeout(() => {
                if (res.data.user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }, 600);
        } catch (err) {
            const text = err.response?.data?.error || err.message || 'Invalid email or password';
            setMessage({ text: '', type: '' });
            toast.error(text);
            setIsSubmitting(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        performLogin(email, password);
    };

    const handleQuickDemo = (demoEmail, demoRole) => {
        setEmail(demoEmail);
        setPassword('password123');
        toast.info(`Filling ${demoRole} credentials…`);
        performLogin(demoEmail, 'password123');
    };

    return (
        <main className="container flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
            <div className="detail-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', boxShadow: 'var(--shadow-combined)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                        Welcome Back
                    </span>
                    <h2 className="headline-lg" style={{ color: 'var(--secondary)', margin: 0 }}>Sign In</h2>
                </div>

                {/* Quick Demo Access Bar */}
                <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(197, 168, 128, 0.08)', borderRadius: '4px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '8px', fontWeight: 600 }}>
                        One-Click Demo Access
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleQuickDemo('admin@goldenhammer.com', 'Admin')}
                            style={{
                                padding: '6px 4px',
                                fontSize: '11px',
                                background: '#131A29',
                                color: 'var(--primary)',
                                border: '1px solid rgba(197, 168, 128, 0.3)',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            👑 Admin
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleQuickDemo('seller1@goldenhammer.com', 'Seller')}
                            style={{
                                padding: '6px 4px',
                                fontSize: '11px',
                                background: '#131A29',
                                color: 'var(--primary)',
                                border: '1px solid rgba(197, 168, 128, 0.3)',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            🏛️ Seller
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleQuickDemo('collector1@goldenhammer.com', 'Collector')}
                            style={{
                                padding: '6px 4px',
                                fontSize: '11px',
                                background: '#131A29',
                                color: 'var(--primary)',
                                border: '1px solid rgba(197, 168, 128, 0.3)',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            💎 Collector
                        </button>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-md">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-input"
                            placeholder="Enter your password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {message.text && (
                        <div className={`alert ${message.type === 'error' ? 'alert-error' : message.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ fontSize: '13px', padding: '8px 12px' }}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', marginTop: '16px', opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="body-sm text-center" style={{ marginTop: '20px', color: 'var(--on-surface-variant)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;
