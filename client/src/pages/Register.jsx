import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [terms, setTerms] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const toast = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!fullName) return setMessage({ text: 'Please enter your full name.', type: 'error' });
        if (!email) return setMessage({ text: 'Please enter your email address.', type: 'error' });
        if (!password) return setMessage({ text: 'Please enter a password.', type: 'error' });
        if (password.length < 6) return setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
        if (password !== confirmPassword) return setMessage({ text: 'Passwords do not match.', type: 'error' });
        if (!terms) return setMessage({ text: 'Please agree to the Terms & Conditions.', type: 'error' });

        setMessage({ text: 'Registering new profile...', type: 'info' });

        try {
            await api.post('/auth/register', {
                name: fullName,
                email,
                password
            });
            setMessage({ text: '', type: '' });
            toast.success('Account created. Redirecting to login…');
            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err) {
            const text = err.response?.data?.error || err.message || 'Registration failed';
            setMessage({ text: '', type: '' });
            toast.error(text);
        }
    };

    return (
        <main className="container flex-center" style={{ minHeight: '85vh', padding: '40px 0' }}>
            <div className="detail-card" style={{ width: '100%', maxWidth: '460px', padding: '32px', boxW: 'var(--shadow-combined)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                        Collector Registration
                    </span>
                    <h2 className="headline-lg" style={{ color: 'var(--secondary)', margin: 0 }}>Register New Account</h2>
                </div>

                <form onSubmit={handleRegister} className="space-y-md">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="e.g. Jane Doe" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-input"
                            placeholder="Min 6 characters" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-input"
                            placeholder="Re-type password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                        <input 
                            type="checkbox" 
                            id="terms" 
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                        />
                        <label htmlFor="terms" className="body-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                            I agree to the <Link to="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms & Conditions</Link>
                        </label>
                    </div>
                    
                    {message.text && (
                        <div className={`alert ${message.type === 'error' ? 'alert-error' : message.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ fontSize: '13px', padding: '8px 12px' }}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
                        Create Registry Account
                    </button>
                </form>

                <p className="body-sm text-center" style={{ marginTop: '20px', color: 'var(--on-surface-variant)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In here</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;
