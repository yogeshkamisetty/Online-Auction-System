import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const { login } = useContext(AuthContext);
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

        setMessage({ text: 'Logging in...', type: 'info' });

        try {
            const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
            setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
            login(res.data.user, res.data.token);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.error || err.message || 'Invalid email or password', 
                type: 'error' 
            });
        }
    };

    return (
        <main className="auth-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">Account Login</h2>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="text" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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

                    <button type="submit" className="btn btn-primary auth-btn">Log In</button>
                </form>
                <p className="auth-toggle">Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </main>
    );
};

export default Login;
