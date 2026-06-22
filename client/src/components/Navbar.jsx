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
        <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
            <div className="container navbar">
                <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link to="/" className="logo" aria-label="Golden Hammer Auctions Homepage" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img 
                            src="/images/logo-premium.png" 
                            alt="Golden Hammer Auctions Logo" 
                            style={{ height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold-primary, #d4af37)', boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.03em', color: '#ffffff', lineHeight: '1' }}>
                                GOLDEN HAMMER
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.28em', color: 'var(--gold-primary, #d4af37)', lineHeight: '1' }}>
                                AUCTIONS
                            </span>
                        </div>
                    </Link>
                    
                    <nav className="nav-links" aria-label="Desktop primary navigation" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                        <div className="nav-dropdown-trigger" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', padding: '4px 12px' }}>
                            <Link to="/browse" style={{ padding: 0, background: 'none', border: 'none', color: 'inherit' }}>Auctions</Link>
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
                
                <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Mockup Search Bar */}
                    <div className="desktop-search" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px' }}>
                        <input 
                            type="text" 
                            placeholder="Search auctions, items, sellers..." 
                            value={navSearch}
                            onChange={(e) => setNavSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                width: '100%',
                                background: '#0f1115',
                                border: '1px solid rgba(212, 175, 55, 0.25)',
                                borderRadius: '100px',
                                padding: '8px 36px 8px 14px',
                                fontSize: '12px',
                                color: '#ffffff',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        <span 
                            className="material-symbols-outlined" 
                            onClick={handleSearch}
                            style={{ position: 'absolute', right: '12px', color: 'var(--gold-primary, #d4af37)', fontSize: '16px', cursor: 'pointer' }}
                        >
                            search
                        </span>
                    </div>

                    {/* Icons bar */}
                    <div className="nav-icons-bar" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                        <Link to="/watchlist" aria-label="View Watchlist" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                                favorite
                            </span>
                        </Link>
                        
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                notifications
                            </span>
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#ef4444',
                                color: '#ffffff',
                                fontSize: '8px',
                                fontWeight: '700',
                                width: '13px',
                                height: '13px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
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
