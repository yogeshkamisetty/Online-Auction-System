import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import Reveal from '../components/Reveal';
import '../assets/css/homepage-dark.css';

const MOCK_AUCTIONS = [
    {
        id: 'rolex',
        title: 'Rolex Daytona Diamond',
        currentBid: 124500,
        bids: 42,
        timeLeft: 1 * 3600 + 23 * 60 + 45, // 01:23:45
        image: '/images/rolex_daytona_diamond.png',
        flash: false,
        isMock: true
    },
    {
        id: 'porsche',
        title: 'Porsche 911 Turbo S',
        currentBid: 185000,
        bids: 38,
        timeLeft: 2 * 3600 + 10 * 60 + 22, // 02:10:22
        image: '/images/porsche_911_turbo_s.png',
        flash: false,
        isMock: true
    },
    {
        id: 'basquiat',
        title: 'Basquiat - Untitled 1982',
        currentBid: 950000,
        bids: 28,
        timeLeft: 45 * 60 + 31, // 00:45:31
        image: '/images/basquiat_untitled_1982.png',
        flash: false,
        isMock: true
    },
    {
        id: 'hermes',
        title: 'Hermès Birkin 30 Gold',
        currentBid: 68000,
        bids: 19,
        timeLeft: 3 * 3600 + 15 * 60 + 10, // 03:15:10
        image: '/images/hermes_birkin_gold.png',
        flash: false,
        isMock: true
    }
];

const Home = () => {
    const toast = useToast();
    const [email, setEmail] = useState('');
    
    // Ticking digital clock state (Next auction ends in...)
    const [clockTimer, setClockTimer] = useState({
        hours: '02',
        minutes: '34',
        seconds: '18'
    });
    const [nowMs, setNowMs] = useState(() => Date.now());

    // Fetch actual products from database
    const { data: dbProducts = [] } = useQuery({
        queryKey: ['auctions'],
        queryFn: async () => {
            const res = await api.get('/auctions');
            return res.data;
        }
    });

    // Merge database active auctions with mock fallback items
    const auctions = useMemo(() => {
        const activeDbAuctions = dbProducts
            .filter(p => p.status === 'ACTIVE')
            .map(p => ({
                id: p.id,
                title: p.title,
                currentBid: parseFloat(p.currentBid) || 0,
                bids: p.bidCount || 0,
                timeLeft: p.endTime ? Math.max(0, Math.floor((new Date(p.endTime) - new Date()) / 1000)) : 3600,
                endTime: p.endTime,
                image: p.imageUrl || '/images/logo-premium.png',
                flash: false,
                isDb: true
            }));

        const displayAuctions = [...activeDbAuctions].slice(0, 4);

        if (displayAuctions.length < 4) {
            const needed = 4 - displayAuctions.length;
            const fillItems = MOCK_AUCTIONS.slice(0, needed).map(item => ({
                ...item,
                isDb: false
            }));
            return [...displayAuctions, ...fillItems];
        }
        return displayAuctions;
    }, [dbProducts]);

    // Isolated dark theme setup for the homepage
    useEffect(() => {
        const prevBg = document.body.style.backgroundColor;
        const prevOverflow = document.body.style.overflowX;
        
        document.body.style.backgroundColor = '#060709';
        document.body.style.overflowX = 'hidden';

        return () => {
            document.body.style.backgroundColor = prevBg;
            document.body.style.overflowX = prevOverflow;
        };
    }, []);

    // 1-second countdown loop for main clock and individual cards
    useEffect(() => {
        let totalClockSec = 2 * 3600 + 34 * 60 + 18; // 02:34:18

        const interval = setInterval(() => {
            // Update main countdown clock
            if (totalClockSec <= 0) {
                totalClockSec = 24 * 3600; // Reset to 24h
            } else {
                totalClockSec--;
            }
            
            const ch = Math.floor(totalClockSec / 3600);
            const cm = Math.floor((totalClockSec % 3600) / 60);
            const cs = totalClockSec % 60;
            setClockTimer({
                hours: String(ch).padStart(2, '0'),
                minutes: String(cm).padStart(2, '0'),
                seconds: String(cs).padStart(2, '0')
            });
            setNowMs(Date.now());

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format seconds into digital layout (hh:mm:ss)
    const formatTime = (totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

    // Newsletter submit handler
    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setSubmittingNewsletter(true);
        try {
            const res = await api.post('/newsletter', { email: email.trim() });
            toast.success(res.data.message || "You're subscribed! We'll send you private previews.");
            setEmail('');
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || "Failed to subscribe");
        } finally {
            setSubmittingNewsletter(false);
        }
    };

    return (
        <div className="home-dark-theme">
            {/* 1. HERO SECTION */}
            <header className="hero-section">
                <div className="container hero-container">
                    {/* Left: Headline & Text */}
                    <div className="hero-content-left">
                        <Reveal>
                            <div className="tagline-badge">
                                <span className="badge-dot"></span>
                                <span>Premium Auction Platform</span>
                            </div>
                        </Reveal>
                        
                        <Reveal>
                            <h1 className="hero-title">
                                Bid. Own. Invest.<br />
                                <span className="serif-italic">Extraordinary Assets.</span>
                            </h1>
                        </Reveal>

                        <Reveal>
                            <p className="hero-desc">
                                The world's most trusted marketplace for luxury assets, collectibles, real estate & high-value investments.
                            </p>
                        </Reveal>

                        {/* Badges/Credentials */}
                        <Reveal>
                            <div className="hero-features-grid">
                                <div className="hero-feature-pill">
                                    <div className="icon-container">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                    <div className="feature-text">
                                        <span className="feature-title">Verified Sellers</span>
                                        <span className="feature-sub">All sellers verified</span>
                                    </div>
                                </div>
                                <div className="hero-feature-pill">
                                    <div className="icon-container">
                                        <span className="material-symbols-outlined">shield</span>
                                    </div>
                                    <div className="feature-text">
                                        <span className="feature-title">Secure Bidding</span>
                                        <span className="feature-sub">Bank-Grade Security</span>
                                    </div>
                                </div>
                                <div className="hero-feature-pill">
                                    <div className="icon-container">
                                        <span className="material-symbols-outlined">language</span>
                                    </div>
                                    <div className="feature-text">
                                        <span className="feature-title">Global Reach</span>
                                        <span className="feature-sub">120+ Countries</span>
                                    </div>
                                </div>
                                <div className="hero-feature-pill">
                                    <div className="icon-container">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </div>
                                    <div className="feature-text">
                                        <span className="feature-title">AI Insights</span>
                                        <span className="feature-sub">Smarter Decisions</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* CTA Buttons */}
                        <Reveal>
                            <div className="hero-actions">
                                <Link to="/browse" className="btn-gold-gradient">
                                    Explore Live Auctions
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                </Link>
                                <a href="#how-it-works" className="btn-gold-outline">
                                    How It Works
                                    <span className="play-icon-circle">⏵</span>
                                </a>
                            </div>
                        </Reveal>

                        {/* Live Platform Stats */}
                        <Reveal>
                            <div className="hero-stats-band">
                                <div className="hero-stat-item">
                                    <span className="hero-stat-val">12,458+</span>
                                    <span className="hero-stat-lbl">Live Auctions</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="hero-stat-val">2.4M+</span>
                                    <span className="hero-stat-lbl">Assets Sold</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="hero-stat-val">98,642</span>
                                    <span className="hero-stat-lbl">Happy Buyers</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="hero-stat-val">$2.8B+</span>
                                    <span className="hero-stat-lbl">Total Sales</span>
                                </div>
                                <div className="hero-stat-item">
                                    <span className="hero-stat-val">4.9/5</span>
                                    <span className="hero-stat-lbl" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        Trust Score
                                        <div className="stars-row">
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px', fill: '1' }}>star</span>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right: Glass display case Gavel Showcase */}
                    <div className="hero-showcase-right">
                        <div className="showcase-glow-container">
                            <div className="showcase-glow-back"></div>
                            <div className="glass-display-case">
                                <div className="showcase-image-wrapper">
                                    <img 
                                        src="/images/golden_gavel_display.png" 
                                        alt="Golden Gavel luxury showcase" 
                                    />
                                    <div className="floating-play-btn" aria-label="Watch showcase video">
                                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>play_arrow</span>
                                    </div>
                                    <div className="display-case-overlay">
                                        <span className="showcase-tag">Featured Asset</span>
                                        <h3 className="showcase-title">Golden Hammer Masterpiece</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. BENTO SECTION: WHY CHOOSE GOLDEN HAMMER */}
            <section className="bento-section">
                <div className="container">
                    <div className="bento-header">
                        <h2 className="section-title-premium">
                            Why Thousands Choose Golden Hammer
                            <span className="section-title-line"></span>
                        </h2>
                        <button className="btn-next-arrow" aria-label="Next slide">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>

                    <Reveal stagger className="bento-grid">
                        <div className="bento-card">
                            <div className="bento-icon-box">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>military_tech</span>
                            </div>
                            <h3 className="bento-title">Handpicked Items</h3>
                            <p className="bento-desc">Every listing is reviewed and graded by our team of experts before going live.</p>
                        </div>
                        <div className="bento-card">
                            <div className="bento-icon-box">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
                            </div>
                            <h3 className="bento-title">Live Bidding</h3>
                            <p className="bento-desc">Bid in real time with full transparency. Every bid is shown instantly to all participants.</p>
                        </div>
                        <div className="bento-card">
                            <div className="bento-icon-box">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>insights</span>
                            </div>
                            <h3 className="bento-title">Smart Price Insights</h3>
                            <p className="bento-desc">Use data-driven valuations and market trends to help you bid at the right price.</p>
                        </div>
                        <div className="bento-card">
                            <div className="bento-icon-box">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shield</span>
                            </div>
                            <h3 className="bento-title">Secure & Insured</h3>
                            <p className="bento-desc">Every transaction is protected. Your payment is held securely until you receive your item.</p>
                        </div>
                        <div className="bento-card">
                            <div className="bento-icon-box">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>public</span>
                            </div>
                            <h3 className="bento-title">Global Community</h3>
                            <p className="bento-desc">Join a worldwide network of collectors, investors, and enthusiasts all in one place.</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 3. LIVE AUCTIONS SECTION */}
            <section className="live-auctions-section" id="live-auctions">
                <div className="container">
                    <div className="live-header-bar">
                        <div className="live-title-area">
                            <h2 className="section-title-premium" style={{ margin: 0 }}>
                                Live Auctions Ending Soon
                            </h2>
                            <div className="live-indicator-tag">
                                <span className="live-dot"></span>
                                <span>Live</span>
                            </div>
                        </div>

                        {/* Clock Countdown Timer */}
                        <div className="digital-clock-timer">
                            <span className="clock-label">Next auction ends in</span>
                            <span className="clock-digits">
                                {clockTimer.hours} : {clockTimer.minutes} : {clockTimer.seconds}
                            </span>
                        </div>

                        <Link to="/browse" className="view-all-link-premium">
                            View All Live Auctions
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Luxury Card Grid */}
                    <div className="luxury-grid">
                        {auctions.map((auc) => (
                            <div key={auc.id} className="lux-card">
                                <div className="lux-img-wrapper">
                                    <Link to={auc.isDb ? `/product/${auc.id}` : "/browse"} style={{ display: 'block', height: '100%' }}>
                                        <img src={auc.image} alt={auc.title} />
                                    </Link>
                                    <span className="lux-card-badge-live">Live</span>
                                    <Link
                                        to={auc.isDb ? `/product/${auc.id}` : "/browse"}
                                        className="lux-card-favorite-btn"
                                        aria-label={auc.isDb ? `View ${auc.title} to add it to your watchlist` : 'Browse live auctions to add items to your watchlist'}
                                    >
                                        <span className="material-symbols-outlined">favorite</span>
                                    </Link>
                                    <span className="lux-card-timer">
                                        {formatTime(
                                            auc.endTime
                                                ? Math.max(0, Math.floor((new Date(auc.endTime).getTime() - nowMs) / 1000))
                                                : auc.timeLeft
                                        )}
                                    </span>
                                </div>
                                <div className="lux-card-content">
                                    <h3 className="lux-card-title">
                                        <Link to={auc.isDb ? `/product/${auc.id}` : "/browse"} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {auc.title}
                                        </Link>
                                    </h3>
                                    <div className="lux-card-footer">
                                        <div className="lux-bid-col">
                                            <span className="lux-bid-lbl">Current Bid</span>
                                            <span className={`lux-bid-val ${auc.flash ? 'bid-flash-green' : ''}`}>
                                                ${auc.currentBid.toLocaleString()}
                                            </span>
                                            <span className="lux-bids-count">
                                                <span className="green-dot-pulse"></span>
                                                {auc.bids} Bids
                                            </span>
                                        </div>
                                        <Link to={auc.isDb ? `/product/${auc.id}` : "/browse"} className="btn-card-action" aria-label={`Bid on ${auc.title}`}>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. RECOMMENDATIONS & TRUST PARTNERS */}
            <section className="credentials-section">
                <div className="container credentials-grid">
                    {/* Media Endorsement */}
                    <div className="media-endorsement">
                        <span className="media-lbl">Recommended by</span>
                        <div className="media-logos-row">
                            <span className="media-logo-text logo-forbes">Forbes</span>
                            <span className="media-logo-text logo-sothebys">Sotheby's</span>
                            <span className="media-logo-text logo-bloomberg">Bloomberg</span>
                            <span className="media-logo-text logo-wsj">WSJ</span>
                        </div>
                    </div>

                    {/* Security credentials */}
                    <div className="security-badges-container">
                        <div className="security-badge">
                            <span className="material-symbols-outlined badge-icon">credit_card</span>
                            <span>PCI DSS Compliant</span>
                        </div>
                        <div className="security-badge">
                            <span className="material-symbols-outlined badge-icon">verified</span>
                            <span>KYC Verified</span>
                        </div>
                        <div className="security-badge">
                            <span className="material-symbols-outlined badge-icon">lock</span>
                            <span>SSL Secure</span>
                        </div>
                        <div className="security-badge">
                            <span className="material-symbols-outlined badge-icon">workspace_premium</span>
                            <span>ISO 27001</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. HOW IT WORKS */}
            <section className="how-it-works-section" id="how-it-works" style={{ padding: '80px 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'linear-gradient(180deg, #060709 0%, #0d111a 100%)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
                        <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', letterSpacing: '0.15em' }}>
                            The Collector's Journey
                        </span>
                        <h2 className="headline-lg" style={{ color: '#F3F4F6', fontSize: '2.2rem', marginTop: '8px' }}>
                            How Golden Hammer Works
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '15px', marginTop: '10px' }}>
                            A seamless, institutional-grade auction process connecting discerning collectors with museum-tier provenance.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(197, 168, 128, 0.2)', borderRadius: '8px', padding: '28px 20px', textAlign: 'left' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>01 / CONSIGNMENT</span>
                            <h3 style={{ color: '#FFFFFF', fontSize: '17px', margin: '8px 0', fontWeight: 600 }}>Curation & Verification</h3>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6 }}>
                                Every submitted lot undergoes multi-point physical provenance verification and appraisal before going live.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(197, 168, 128, 0.2)', borderRadius: '8px', padding: '28px 20px', textAlign: 'left' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>02 / BIDDING</span>
                            <h3 style={{ color: '#FFFFFF', fontSize: '17px', margin: '8px 0', fontWeight: 600 }}>Live Price Discovery</h3>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6 }}>
                                Bid in real time with WebSocket synchronisation. Watch the live ascending ledger update with zero latency.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(197, 168, 128, 0.2)', borderRadius: '8px', padding: '28px 20px', textAlign: 'left' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>03 / FAIR PLAY</span>
                            <h3 style={{ color: '#FFFFFF', fontSize: '17px', margin: '8px 0', fontWeight: 600 }}>Anti-Snipe Protection</h3>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6 }}>
                                Late bids extend the countdown clock by 2 minutes, ensuring genuine collectors have fair time to react.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(197, 168, 128, 0.2)', borderRadius: '8px', padding: '28px 20px', textAlign: 'left' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined">local_shipping</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>04 / SETTLEMENT</span>
                            <h3 style={{ color: '#FFFFFF', fontSize: '17px', margin: '8px 0', fontWeight: 600 }}>Escrow & Armored Transit</h3>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6 }}>
                                Payments are held in secure escrow. Fully insured white-glove transport delivers your asset to your private vault.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. ABOUT US */}
            <section className="about-us-section" id="about-us" style={{ padding: '80px 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: '#080B12' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
                    <div>
                        <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', letterSpacing: '0.15em' }}>
                            Our Heritage & Authenticity
                        </span>
                        <h2 className="headline-lg" style={{ color: '#F3F4F6', fontSize: '2.2rem', marginTop: '8px', lineHeight: 1.2 }}>
                            The Standard in High-Value Online Auctions
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: 1.7, marginTop: '16px' }}>
                            Founded by master antiquarians and software engineers, Golden Hammer Auctions unites the centuries-old gravitas of London and Geneva salerooms with modern real-time technology.
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: 1.7, marginTop: '12px' }}>
                            Every single asset is guaranteed authentic by our advisory board. Buyers enjoy comprehensive escrow protection, transparent fees, and discreet global delivery.
                        </p>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                            <Link to="/browse" className="btn btn-gold-gradient" style={{ padding: '12px 24px', textDecoration: 'none' }}>
                                Explore The Catalog
                            </Link>
                            <Link to="/sell" className="btn btn-gold-outline" style={{ padding: '12px 24px', textDecoration: 'none' }}>
                                Consign An Asset
                            </Link>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(197, 168, 128, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop" 
                                alt="Golden Hammer Curatorial Excellence" 
                                style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. NEWSLETTER SUBSCRIBE BANNER */}
            <section className="subscribe-section" id="newsletter">
                <div className="container">
                    <div className="subscribe-card">
                        <div className="subscribe-left">
                            <h2>Stay Ahead of the Market</h2>
                            <p>Get exclusive luxury auction previews, expert market insights, and real-time alerts delivered straight to your inbox.</p>
                        </div>
                        <div className="subscribe-right">
                            <form className="subscribe-form-row" onSubmit={handleSubscribe}>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email address" 
                                    className="subscribe-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={submittingNewsletter}
                                    required
                                />
                                <button type="submit" disabled={submittingNewsletter} className="btn-subscribe" style={{ opacity: submittingNewsletter ? 0.7 : 1 }}>
                                    {submittingNewsletter ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                            <div className="facepile-wrapper">
                                <div className="facepile-row">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Collector 1" className="facepile-avatar" />
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Collector 2" className="facepile-avatar" />
                                    <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80" alt="Collector 3" className="facepile-avatar" />
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80" alt="Collector 4" className="facepile-avatar" />
                                </div>
                                <span className="facepile-text">
                                    Join <strong>40,000+</strong> subscribers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
