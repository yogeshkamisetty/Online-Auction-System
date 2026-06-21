import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const { login } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!email) {
            setMessage({ text: 'Please enter your email address.', type: 'error' });
            return;
        }
        if (!password) {
            setMessage({ text: 'Please enter your password.', type: 'error' });
            return;
        }

        setMessage({ text: 'Verifying credentials...', type: 'info' });

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            toast.success('Welcome back. Redirecting to your workspace…');
            setMessage({ text: '', type: '' });
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        } catch (err) {
            const text = err.response?.data?.error || err.message || 'Invalid email or password';
            setMessage({ text: '', type: '' });
            toast.error(text);
        }
    };

    return (
        <main className="container flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
            <div className="detail-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', boxShadow: 'var(--shadow-combined)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                        Collector Portal
                    </span>
                    <h2 className="headline-lg" style={{ color: 'var(--secondary)', margin: 0 }}>Portal Authentication</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-md">
                    <div className="form-group">
                        <label>Registered Email</label>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Private Key Password</label>
                        <input 
                            type="password" 
                            className="form-input"
                            placeholder="Enter password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    {message.text && (
                        <div className={`alert ${message.type === 'error' ? 'alert-error' : message.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ fontSize: '13px', padding: '8px 12px' }}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', marginTop: '16px' }}>
                        Authenticate Account
                    </button>
                </form>

                <p className="body-sm text-center" style={{ marginTop: '20px', color: 'var(--on-surface-variant)' }}>
                    New collector? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;
