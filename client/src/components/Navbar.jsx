import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="container navbar">
                <div className="nav-left">
                    <Link to="/" className="logo">
                        <img src="/images/logo2.png" alt="Logo" className="logo-icon" style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'contain' }} />
                        <span className="logo-text">Golden Hammer Auctions</span>
                    </Link>
                    <nav className="nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/browse">Browse Auctions</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/profile">Profile</Link>
                    </nav>
                </div>
                <div className="nav-right">
                    {user ? (
                        <>
                            <span className="user-greeting" style={{ marginRight: '15px', fontWeight: '500', color: 'var(--text-main, #1f2937)' }}>
                                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                            </span>
                            <a href="#" className="btn btn-dark" onClick={handleLogout}>Log Out</a>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-link">Log In</Link>
                            <Link to="/register" className="btn btn-dark">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
