import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [terms, setTerms] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
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

        setMessage({ text: 'Registering...', type: 'info' });

        try {
            await axios.post('http://localhost:3001/api/auth/register', {
                name: fullName,
                email,
                password
            });
            setMessage({ text: 'Registration successful! Redirecting to login...', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.error || err.message || 'Registration failed', 
                type: 'error' 
            });
        }
    };

    return (
        <main className="auth-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">Create an Account</h2>
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Jane Doe" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Create a strong password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="Type your password again" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <input 
                            type="checkbox" 
                            id="terms" 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                        />
                        <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            I agree to the <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Terms & Conditions</Link>
                        </label>
                    </div>
                    
                    <p style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600', 
                        marginBottom: '15px', 
                        textAlign: 'center', 
                        minHeight: '20px',
                        color: message.type === 'error' ? '#e11d48' : message.type === 'success' ? '#166534' : 'var(--primary)'
                    }}>
                        {message.text}
                    </p>

                    <button type="submit" className="btn btn-primary auth-btn">Create Account</button>
                </form>
                <p className="auth-toggle">Already have an account? <Link to="/login">Log In here</Link></p>
            </div>
        </main>
    );
};

export default Register;
