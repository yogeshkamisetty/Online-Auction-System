import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Reveal from '../components/Reveal';

// Custom Live Auction Card Ticker component
const CardTimer = ({ initialTime, auctionId }) => {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        if (!time || !time.includes(':')) return;
        const parts = time.split(':');
        let totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);

        const interval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(interval);
                return;
            }
            totalSeconds--;
            const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            setTime(`${hrs}:${mins}:${secs}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [initialTime]);

    return <span>{time}</span>;
};

// Next Auction Header Ticker component
const HeaderTimer = () => {
    const [time, setTime] = useState("02:34:18");

    useEffect(() => {
        let totalSeconds = 2 * 3600 + 34 * 60 + 18;
        const interval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(interval);
                return;
            }
            totalSeconds--;
            const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            setTime(`${hrs}:${mins}:${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const parts = time.split(':');
    return (
        <span className="countdown-ticker-time">
            {parts[0]} : {parts[1]} : {parts[2]}
        </span>
    );
};

const Home = () => {
    // Dynamic Query for Active Auctions
    const { data: dynamicAuctions = [] } = useQuery({
        queryKey: ['activeAuctions'],
        queryFn: async () => {
            const res = await api.get('/auctions?status=ACTIVE');
            return res.data;
        }
    });

    // Mock high-end auctions matching the design reference
    const mockAuctions = [
        { 
            id: 'rolex-daytona-diamond', 
            title: 'Rolex Daytona Diamond', 
            currentBid: 124500, 
            bidCount: 42, 
            imageUrl: '/images/rolex_daytona_diamond.png', 
            timeRemaining: '01:23:45' 
        },
        { 
            id: 'porsche-911-turbo-s', 
            title: 'Porsche 911 Turbo S', 
            currentBid: 185000, 
            bidCount: 38, 
            imageUrl: '/images/porsche_911_turbo_s.png', 
            timeRemaining: '02:10:22' 
        },
        { 
            id: 'basquiat-untitled-1982', 
            title: 'Basquiat – Untitled 1982', 
            currentBid: 950000, 
            bidCount: 28, 
            imageUrl: '/images/basquiat_untitled_1982.png', 
            timeRemaining: '00:45:31' 
        },
        { 
            id: 'hermes-birkin-30-gold', 
            title: 'Hermès Birkin 30 Gold', 
            currentBid: 68000, 
            bidCount: 19, 
            imageUrl: '/images/hermes_birkin_gold.png', 
            timeRemaining: '03:15:10' 
        }
    ];

    // Combine: Show dynamic auctions first, and fallback/pad with mock items if less than 4
    const displayAuctions = dynamicAuctions.length > 0 
        ? [...dynamicAuctions, ...mockAuctions].slice(0, 4) 
        : mockAuctions;

    // Helper to format remaining time dynamically
    const getTimerValue = (auc) => {
        if (auc.timeRemaining) return auc.timeRemaining;
        if (auc.endTime) {
            const diffMs = new Date(auc.endTime) - new Date();
            if (diffMs <= 0) return '00:00:00';
            const totalSecs = Math.floor(diffMs / 1000);
            const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
            const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
            const secs = (totalSecs % 60).toString().padStart(2, '0');
            return `${hrs}:${mins}:${secs}`;
        }
        return '02:00:00';
    };

    return (
        <div className="premium-home-root">
            {/* Hero Section */}
            <header className="premium-hero">
                <div className="container premium-hero-grid">
                    {/* Left Content */}
                    <div className="premium-hero-content">
                        <div className="premium-hero-capsule">
                            <span className="pulse-indicator"></span>
                            + PREMIUM AUCTION PLATFORM
                        </div>
                        <h1>
                            Bid. Own. Invest.<br/>
                            <span className="gold-text-gradient">Extraordinary</span> Assets.
                        </h1>
                        <p>
                            The world's most trusted marketplace for luxury assets, collectibles, real estate & high-value investments.
                        </p>

                        {/* Four Key Platform Features */}
                        <div className="premium-hero-badges">
                            <div className="premium-hero-badge-item">
                                <div className="premium-hero-badge-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                                </div>
                                <div className="premium-hero-badge-text">
                                    <h4>Verified Sellers</h4>
                                    <p>100% KYC Verified</p>
                                </div>
                            </div>
                            <div className="premium-hero-badge-item">
                                <div className="premium-hero-badge-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shield</span>
                                </div>
                                <div className="premium-hero-badge-text">
                                    <h4>Secure Bidding</h4>
                                    <p>Bank-Grade Security</p>
                                </div>
                            </div>
                            <div className="premium-hero-badge-item">
                                <div className="premium-hero-badge-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
                                </div>
                                <div className="premium-hero-badge-text">
                                    <h4>Global Reach</h4>
                                    <p>120+ Countries</p>
                                </div>
                            </div>
                            <div className="premium-hero-badge-item">
                                <div className="premium-hero-badge-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>monitoring</span>
                                </div>
                                <div className="premium-hero-badge-text">
                                    <h4>AI Insights</h4>
                                    <p>Smarter Decisions</p>
                                </div>
                            </div>
                        </div>

                        {/* Action CTA Buttons */}
                        <div className="hero-buttons">
                            <Link to="/browse" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '13px' }}>
                                Explore Live Auctions &rarr;
                            </Link>
                            <a href="#how-it-works" className="btn btn-ghost" style={{ padding: '12px 28px', color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontSize: '13px', display: 'flex', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                                How It Works
                            </a>
                        </div>
                    </div>

                    {/* Right Gavel Showcase Display */}
                    <div className="premium-hero-showcase">
                        <img 
                            src="/images/golden_gavel_display.png" 
                            alt="Glowing Golden Gavel display" 
                        />
                        <div className="hero-showcase-overlay">
                            <span className="font-mono label-caps" style={{ color: '#d4af37', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                                Featured Lot 402 • Mechanical Art
                            </span>
                            <h3 className="headline-lg" style={{ color: 'white', fontSize: '18px', margin: 0 }}>Golden Gavel 3D Showcase</h3>
                        </div>
                    </div>
                </div>
            </header>

            {/* Premium Stats Band */}
            <section className="container">
                <div className="premium-stats-band">
                    <div className="premium-stats-grid">
                        <div className="premium-stat-cell">
                            <span className="premium-stat-val">12,458+</span>
                            <span className="premium-stat-lbl">Live Auctions</span>
                        </div>
                        <div className="premium-stat-cell">
                            <span className="premium-stat-val">2.4M+</span>
                            <span className="premium-stat-lbl">Assets Sold</span>
                        </div>
                        <div className="premium-stat-cell">
                            <span className="premium-stat-val">98,642</span>
                            <span className="premium-stat-lbl">Happy Buyers</span>
                        </div>
                        <div className="premium-stat-cell">
                            <span className="premium-stat-val">$2.8B+</span>
                            <span className="premium-stat-lbl">Total Sales</span>
                        </div>
                        <div className="premium-stat-cell">
                            <span className="premium-stat-val">4.9/5</span>
                            <div className="stars-row">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Choose Us Feature Cards Section */}
            <section className="choose-us-section container">
                <h2 className="choose-us-title">Why Thousands Choose Golden Hammer</h2>
                <div className="choose-us-grid">
                    <div className="choose-us-card">
                        <div className="choose-us-card-icon" style={{ color: '#ebc24f' }}>
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h3>Curated Premium Assets</h3>
                        <p>Only the finest assets, handpicked by experts.</p>
                    </div>
                    <div className="choose-us-card">
                        <div className="choose-us-card-icon" style={{ color: '#60a5fa' }}>
                            <span className="material-symbols-outlined">bolt</span>
                        </div>
                        <h3>Real-Time Bidding</h3>
                        <p>Live, transparent & competitive bidding.</p>
                    </div>
                    <div className="choose-us-card">
                        <div className="choose-us-card-icon" style={{ color: '#34d399' }}>
                            <span className="material-symbols-outlined">insights</span>
                        </div>
                        <h3>AI Price Insights</h3>
                        <p>Data-driven valuations & market trends.</p>
                    </div>
                    <div className="choose-us-card">
                        <div className="choose-us-card-icon" style={{ color: '#a78bfa' }}>
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <h3>Secure & Insured</h3>
                        <p>Trusted escrow & insurance protection.</p>
                    </div>
                    <div className="choose-us-card">
                        <div className="choose-us-card-icon" style={{ color: '#f87171' }}>
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                        <h3>Global Community</h3>
                        <p>Collectors, investors & enthusiasts.</p>
                    </div>
                </div>
            </section>

            {/* Live Auctions Grid Section */}
            <section className="premium-live-section">
                <div className="container">
                    <div className="premium-live-header">
                        <div className="premium-live-header-left">
                            <h2 className="premium-live-title">Live Auctions Ending Soon</h2>
                            <span className="blinking-live-pill">Live</span>
                            <div className="countdown-ticker">
                                <span>Next auction ends in</span>
                                <HeaderTimer />
                            </div>
                        </div>
                        <Link to="/browse" className="font-mono label-caps" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                            View All Live Auctions &rarr;
                        </Link>
                    </div>

                    <Reveal stagger className="premium-live-grid">
                        {displayAuctions.map(auc => (
                            <div className="premium-live-card" key={auc.id}>
                                <div className="premium-live-card-img-wrap">
                                    <span className="premium-live-card-live-tag">Live</span>
                                    <div className="premium-live-card-heart">
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>favorite</span>
                                    </div>
                                    <img src={auc.imageUrl} alt={auc.title} />
                                    <div className="premium-live-card-timer">
                                        <span className="material-symbols-outlined" style={{ fontSize: '11px', marginRight: '4px', verticalAlign: 'middle' }}>schedule</span>
                                        <CardTimer initialTime={getTimerValue(auc)} auctionId={auc.id} />
                                    </div>
                                </div>
                                <div className="premium-live-card-content">
                                    <h3 className="premium-live-card-title">{auc.title}</h3>
                                    <div className="premium-live-card-footer">
                                        <div>
                                            <div className="premium-live-card-bid-lbl">CURRENT BID</div>
                                            <div className="premium-live-card-bid-val">
                                                ${Number(auc.currentBid).toLocaleString('en-US')}
                                            </div>
                                            <div className="premium-live-card-bid-cnt">{auc.bidCount || 0} Bids</div>
                                        </div>
                                        <Link to={auc.id.includes('-') ? `/browse` : `/product/${auc.id}`} className="premium-live-card-btn" aria-label={`View lot details for ${auc.title}`}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* Brand Trust Logos Recommended Bar */}
            <section className="recommended-by-bar">
                <span className="recommended-by-lbl">As Featured In</span>
                <div className="recommended-by-logos">
                    <span className="recommended-logo">Forbes</span>
                    <span className="recommended-logo" style={{ fontStyle: 'italic' }}>Sotheby's</span>
                    <span className="recommended-logo">Bloomberg</span>
                    <span className="recommended-logo">WSJ</span>
                </div>
            </section>

            {/* Editorial Showcase Philosophy Section */}
            <section className="welcome-section section-padding">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <span className="font-mono label-caps" style={{ color: '#d4af37' }}>Philosophy</span>
                        <blockquote style={{ margin: 0, fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '38px', lineHeight: '1.18', fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
                            "The world is an auction house where every person becomes a victim of the auction."
                            <cite style={{ display: 'block', marginTop: '16px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d4af37' }}>— Ehsan Sehgal</cite>
                        </blockquote>
                        <p className="body-md" style={{ color: '#9ca3af' }}>
                            The open ascending price auction is the most common form, where participants bid openly against one another. Each bid must be higher than the previous one. The auction ends when no one bids further, and the highest bidder wins. This format is widely used for art, antiques, real estate, and online marketplaces.
                        </p>
                        <div>
                            <Link to="/browse" className="btn btn-ghost" style={{ borderBottom: '2px solid #d4af37', borderRadius: '0', padding: '8px 0', textTransform: 'uppercase', fontWeight: 700, color: 'white' }}>
                                Explore Live Catalog &rarr;
                            </Link>
                        </div>
                    </div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <img src="/images/auctionblog1.jpg" alt="Gallery viewing" style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }} />
                    </div>
                </div>
            </section>

            {/* Category Grid Section */}
            <main className="categories section-padding" id="categories">
                <div className="container category-grid">
                    {/* Ancient Category */}
                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Ancient Antiquities</h3>
                            <Link to="/browse?category=ancient" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/ancient.png" alt="Ancient Artifacts" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="/browse?category=ancient">Chola Bronze Sculptures</Link></li>
                            <li><Link to="/browse?category=ancient">Roman Empire Numismatics</Link></li>
                            <li><Link to="/browse?category=ancient">Egyptian Dynastic Relics</Link></li>
                        </ul>
                    </div>
                    
                    {/* Modern Category */}
                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Modern Expression</h3>
                            <Link to="/browse?category=modern" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/modern1.jpg" alt="Modern Art" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="/browse?category=modern">Mid-Century Fine Art</Link></li>
                            <li><Link to="/browse?category=modern">Abstract Expressionism</Link></li>
                            <li><Link to="/browse?category=modern">Pop Art Collections</Link></li>
                        </ul>
                    </div>

                    {/* Luxury Category */}
                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Luxury Assets</h3>
                            <Link to="/browse?category=luxury" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/lux.jpg" alt="Luxury Items" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="/browse?category=luxury">Swiss Mechanical Watches</Link></li>
                            <li><Link to="/browse?category=luxury">Designer Rare Handbags</Link></li>
                            <li><Link to="/browse?category=luxury">Fine GIA Certified Diamonds</Link></li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Guide / How It Works Section */}
            <section className="section-padding guide-section" id="how-it-works" style={{ backgroundColor: '#0b0c0f' }}>
                <div className="container">
                    <div className="section-header-flex" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                        <div>
                            <h2 className="section-title" style={{ color: 'white' }}>Institutional Guide</h2>
                            <p className="section-subtitle" style={{ color: '#9ca3af' }}>A step-by-step framework to buy or list luxury assets.</p>
                        </div>
                    </div>
                    <Reveal stagger className="grid-12" style={{ marginTop: '20px' }}>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(13,14,17,0.5)', borderColor: 'rgba(255,255,255,0.04)' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: '#d4af37', fontWeight: 700 }}>01</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'white' }}>Create Account</h3>
                            <p className="body-sm" style={{ color: '#9ca3af' }}>
                                Register as an individual collector or institutional entity. Complete quick verification.
                            </p>
                        </div>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(13,14,17,0.5)', borderColor: 'rgba(255,255,255,0.04)' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: '#d4af37', fontWeight: 700 }}>02</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'white' }}>Browse & Bid</h3>
                            <p className="body-sm" style={{ color: '#9ca3af' }}>
                                Explore live and upcoming catalogs. Place real-time bids under websocket-synchronized timers.
                            </p>
                        </div>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(13,14,17,0.5)', borderColor: 'rgba(255,255,255,0.04)' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: '#d4af37', fontWeight: 700 }}>03</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'white' }}>Escrow & Shipping</h3>
                            <p className="body-sm" style={{ color: '#9ca3af' }}>
                                Won items are secured in credit-backed bank escrows. Armored courier transports directly to your vault.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Newsletter Subscription & Compliance Badges Block */}
            <section className="premium-newsletter-section">
                <div className="container premium-newsletter-grid">
                    {/* Left: Newsletter box */}
                    <div className="premium-newsletter-box">
                        <h3>Stay Ahead of the Market</h3>
                        <p>Get exclusive auction previews, valuations, data insights & VIP alerts.</p>
                        <form className="premium-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                className="premium-newsletter-input" 
                                placeholder="Enter your email address" 
                                aria-label="Newsletter email address"
                            />
                            <button type="submit" className="premium-newsletter-btn">Subscribe</button>
                        </form>
                        <div className="join-members-row">
                            <div className="join-members-avatars">
                                <span className="join-members-avatar" style={{ background: '#755b00', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>A</span>
                                <span className="join-members-avatar" style={{ background: '#012C4E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>B</span>
                                <span className="join-members-avatar" style={{ background: '#b22a21', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>C</span>
                            </div>
                            <span className="join-members-text">Join 40,000+ smart subscribers</span>
                        </div>
                    </div>

                    {/* Right: Compliance badges */}
                    <div className="premium-trust-grid">
                        <div className="premium-trust-badge">
                            <span className="material-symbols-outlined premium-trust-badge-icon">payments</span>
                            <div className="premium-trust-badge-text">
                                <h4>PCI DSS</h4>
                                <p>Compliant Escrow</p>
                            </div>
                        </div>
                        <div className="premium-trust-badge">
                            <span className="material-symbols-outlined premium-trust-badge-icon">security</span>
                            <div className="premium-trust-badge-text">
                                <h4>KYC VERIFIED</h4>
                                <p>Anti-Fraud Security</p>
                            </div>
                        </div>
                        <div className="premium-trust-badge">
                            <span className="material-symbols-outlined premium-trust-badge-icon">lock</span>
                            <div className="premium-trust-badge-text">
                                <h4>SSL SECURE</h4>
                                <p>Bank-Grade Encrypted</p>
                            </div>
                        </div>
                        <div className="premium-trust-badge">
                            <span className="material-symbols-outlined premium-trust-badge-icon">badge</span>
                            <div className="premium-trust-badge-text">
                                <h4>ISO 27001</h4>
                                <p>Information Audited</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
