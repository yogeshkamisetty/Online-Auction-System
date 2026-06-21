import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="site-header">
            <div className="container navbar">
                <div className="nav-left">
                    <Link to="/" className="logo" aria-label="Golden Hammer Luxury Auctions Homepage" onClick={() => setMenuOpen(false)}>
                        <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '32px', width: 'auto' }}>
                            <path d="M10 10L20 10V30H10V10Z" fill="#ffd45f"/>
                            <path d="M25 10H35V15H25V10Z" fill="#ffd45f"/>
                            <text x="45" y="28" fontFamily="Geist, sans-serif" fontWeight="700" fontSize="20" letterSpacing="-0.03em" fill="#ffffff">GOLDEN HAMMER</text>
                            <rect x="0" y="38" width="200" height="2" fill="#ffd45f" opacity="0.3"/>
                        </svg>
                    </Link>
                    <nav className="nav-links" aria-label="Desktop primary navigation">
                        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                        <Link to="/browse" className={isActive('/browse') ? 'active' : ''}>Browse</Link>
                        <Link to="/watchlist" className={isActive('/watchlist') ? 'active' : ''}>Watchlist</Link>
                        <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" className={isActive('/admin') ? 'active' : ''} style={{ color: 'var(--primary-container)', fontWeight: '700' }}>Admin Panel</Link>
                        )}
                    </nav>
                </div>
                <div className="nav-right">
                    <div className="desktop-auth">
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <span className="user-greeting">
                                    Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                                </span>
                                <a href="#" className="btn btn-ghost" onClick={handleLogout} style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }} aria-label="Log out of session">Log Out</a>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Link to="/login" className="btn btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }} aria-label="Log in to your account">Log In</Link>
                                <Link to="/register" className="btn btn-primary" aria-label="Create a new collector account">Get Started</Link>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            {menuOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
            {/* Mobile Navigation Panel */}
            <div className={`mobile-nav-panel ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
                <nav className="mobile-nav-links" aria-label="Mobile primary navigation">
                    <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/browse" className={isActive('/browse') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Browse Catalog</Link>
                    <Link to="/watchlist" className={isActive('/watchlist') ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Watchlist</Link>
                    <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Dashboard Workspace</Link>
                    {user && user.role === 'ADMIN' && (
                        <Link to="/admin" className={isActive('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary-container)', fontWeight: '700' }}>Admin Panel</Link>
                    )}
                    <hr className="mobile-divider" />
                    {user ? (
                        <div className="mobile-auth-wrapper">
                            <span className="user-greeting" style={{ display: 'block', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                                Logged in as: {user.name}
                            </span>
                            <button className="btn btn-ghost" onClick={handleLogout} style={{ width: '100%', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }} aria-label="Log out of session">Log Out</button>
                        </div>
                    ) : (
                        <div className="mobile-auth-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }} aria-label="Log in to your account">Log In</Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ width: '100%' }} aria-label="Create a new collector account">Get Started</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
