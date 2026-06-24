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

    const isActive = (path) => {
        const pathname = location.pathname;
        if (path === '/') return pathname === '/';
        if (path === '/browse') return pathname === '/browse' || pathname.startsWith('/product/');
        if (path === '/watchlist') return pathname === '/watchlist';
        if (path === '/sell') return pathname === '/sell';
        if (path === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/checkout/');
        if (path === '/admin') return pathname.startsWith('/admin');
        return pathname === path;
    };

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
                        <Link to="/browse" className={isActive('/browse') ? 'active' : ''}>Auctions</Link>
                        
                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin Console</Link>
                        )}
                        
                        {user && (
                            <>
                                <Link to="/watchlist" className={isActive('/watchlist') ? 'active' : ''}>Watchlist</Link>
                                <Link to="/sell" className={isActive('/sell') ? 'active' : ''}>Consign Asset</Link>
                                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
                            </>
                        )}
                        
                        {!user && (
                            <>
                                <a href="#how-it-works" onClick={(e) => {
                                    if (location.pathname !== '/') {
                                        e.preventDefault();
                                        navigate('/#how-it-works');
                                    }
                                }}>How It Works</a>
                                <a href="#about-us">About Us</a>
                            </>
                        )}
                    </nav>
                </div>
                
                <div className="nav-right">
                    <div className="nav-search-bar">
                        <input 
                            type="text" 
                            placeholder="Search auctions, items, sellers..." 
                            value={navSearch}
                            onChange={(e) => setNavSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            type="button"
                            className="material-symbols-outlined nav-search-bar-icon" 
                            onClick={handleSearch}
                            aria-label="Search auctions"
                        >
                            search
                        </button>
                    </div>

                    {/* Icons bar */}
                    {user && (
                        <div className="nav-action-icons">
                            <Link to="/watchlist" className="nav-icon-button" aria-label="View Watchlist">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                    favorite
                                </span>
                            </Link>
                        </div>
                    )}

                    <div className="desktop-auth">
                        {user ? (
                            <div className="row gap-md">
                                <span className="user-greeting font-semibold">
                                    Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                                </span>
                                <a 
                                    href="#" 
                                    className="btn btn-gold-outline btn-nav-action" 
                                    onClick={handleLogout} 
                                    aria-label="Log out of session"
                                >
                                    Log Out
                                </a>
                            </div>
                        ) : (
                            <Link 
                                to="/login" 
                                className="btn btn-gold-gradient btn-nav-action" 
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
                    
                    {user && (
                        <>
                            <Link to="/watchlist" className={isActive('/watchlist') ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Watchlist</Link>
                            <Link to="/sell" className={isActive('/sell') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Consign Asset</Link>
                            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Dashboard Workspace</Link>
                        </>
                    )}
                    
                    {user && user.role === 'ADMIN' && (
                        <Link to="/admin" className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                    )}
                    
                    {!user && (
                        <>
                            <a href="#how-it-works" onClick={(e) => {
                                setMenuOpen(false);
                                if (location.pathname !== '/') {
                                    e.preventDefault();
                                    navigate('/#how-it-works');
                                }
                            }}>How It Works</a>
                            <a href="#about-us" onClick={() => {
                                setMenuOpen(false);
                            }}>About Us</a>
                        </>
                    )}
                    
                    <hr className="mobile-divider" />
                    {user ? (
                        <div className="mobile-auth-wrapper">
                            <span className="user-greeting d-block mb-sm text-center">
                                Logged in as: {user.name}
                            </span>
                            <button className="btn btn-gold-outline w-full" onClick={handleLogout} aria-label="Log out of session">Log Out</button>
                        </div>
                    ) : (
                        <div className="mobile-auth-wrapper stack gap-sm">
                            <Link to="/login" className="btn btn-gold-outline w-full" onClick={() => setMenuOpen(false)} aria-label="Log in to your account">Log In</Link>
                            <Link to="/register" className="btn btn-gold-gradient w-full" onClick={() => setMenuOpen(false)} aria-label="Create a new collector account">Get Started</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
