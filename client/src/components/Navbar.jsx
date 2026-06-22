import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [navSearch, setNavSearch] = useState('');

    const handleLogout = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        logout();
        navigate('/');
    };

    const handleSearch = () => {
        if (navSearch.trim()) {
            navigate(`/browse?search=${encodeURIComponent(navSearch.trim())}`);
        } else {
            navigate('/browse');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="site-header">
            <div className="container navbar">
                <div className="nav-left">
                    <Link to="/" className="logo" aria-label="Golden Hammer Auctions Homepage" onClick={() => setMenuOpen(false)}>
                        <img 
                            src="/images/logo-premium.png" 
                            alt="Golden Hammer Auctions Logo" 
                            className="logo-premium-img"
                        />
                        <div className="logo-text-col">
                            <span className="logo-title">GOLDEN HAMMER</span>
                            <span className="logo-subtitle">AUCTIONS</span>
                        </div>
                    </Link>
                    
                    <nav className="nav-links" aria-label="Desktop primary navigation">
                        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                        <div className="nav-dropdown-trigger">
                            <Link to="/browse">Auctions</Link>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                        </div>
                        <Link to="/browse" className={isActive('/browse') && !location.search ? 'active' : ''}>Categories</Link>
                        <a href="#how-it-works" onClick={(e) => {
                            if (location.pathname !== '/') {
                                e.preventDefault();
                                navigate('/#how-it-works');
                            }
                        }}>How It Works</a>
                        <a href="#about-us">About Us</a>
                        <a href="#services">Services</a>
                        <a href="#blog">Blog</a>
                    </nav>
                </div>
                
                <div className="nav-right">
                    {/* Mockup Search Bar */}
                    <div className="nav-search-bar">
                        <input 
                            type="text" 
                            placeholder="Search auctions, items, sellers..." 
                            value={navSearch}
                            onChange={(e) => setNavSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <span 
                            className="material-symbols-outlined nav-search-bar-icon" 
                            onClick={handleSearch}
                        >
                            search
                        </span>
                    </div>

                    {/* Icons bar */}
                    <div className="nav-action-icons">
                        <Link to="/watchlist" className="nav-icon-button" aria-label="View Watchlist">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                favorite
                            </span>
                        </Link>
                        
                        <div className="nav-notification-container" aria-label="Notifications">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                notifications
                            </span>
                            <span className="nav-notification-badge">
                                3
                            </span>
                        </div>

                        <span className="material-symbols-outlined" style={{ fontSize: '20px', cursor: 'pointer' }} aria-label="Toggle dark mode">
                            dark_mode
                        </span>
                    </div>

                    <div className="desktop-auth">
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="user-greeting" style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                                    Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                                </span>
                                <a 
                                    href="#" 
                                    className="btn btn-gold-outline" 
                                    onClick={handleLogout} 
                                    style={{ padding: '8px 18px', fontSize: '12px', minHeight: '34px' }}
                                    aria-label="Log out of session"
                                >
                                    Log Out
                                </a>
                            </div>
                        ) : (
                            <Link 
                                to="/login" 
                                className="btn btn-gold-gradient" 
                                style={{ padding: '8px 20px', fontSize: '12px', minHeight: '34px', boxShadow: 'none' }}
                                aria-label="Sign in to your account"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                    
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-label="Toggle navigation menu"
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
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
                            <span className="user-greeting" style={{ display: 'block', marginBottom: '12px', textAlign: 'center' }}>
                                Logged in as: {user.name}
                            </span>
                            <button className="btn btn-gold-outline" onClick={handleLogout} style={{ width: '100%', color: '#ffffff' }} aria-label="Log out of session">Log Out</button>
                        </div>
                    ) : (
                        <div className="mobile-auth-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link to="/login" className="btn btn-gold-outline" onClick={() => setMenuOpen(false)} style={{ width: '100%', color: '#ffffff' }} aria-label="Log in to your account">Log In</Link>
                            <Link to="/register" className="btn btn-gold-gradient" onClick={() => setMenuOpen(false)} style={{ width: '100%' }} aria-label="Create a new collector account">Get Started</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
