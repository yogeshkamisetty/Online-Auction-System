import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            {/* Hero Section */}
            <header className="hero">
                <div className="container hero-grid">
                    {/* Left Content */}
                    <div className="hero-content">
                        <div className="hero-lot-tag">
                            <span className="pulse-indicator"></span>
                            <span className="font-mono label-caps" style={{ color: 'var(--primary-container)', fontSize: '10px' }}>
                                Live Global Network
                            </span>
                        </div>
                        <h1>
                            The Pinnacle of <br/>
                            <span style={{ color: 'var(--primary-container)' }}>Global Asset</span> <br/>
                            Exchange.
                        </h1>
                        <p>
                            Secure, high-velocity liquidation and acquisition of premium assets for discerning collectors and institutional entities.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/browse" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                                View Active Lots &rarr;
                            </Link>
                            <Link to="/sell" className="btn btn-ghost" style={{ padding: '12px 24px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                                List Your Asset
                            </Link>
                        </div>
                        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '40px' }}>
                            <div>
                                <div className="font-mono label-caps" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '4px' }}>Q3 Transaction Volume</div>
                                <div className="headline-lg" style={{ fontSize: '28px', color: '#ffffff' }}>$1.4B</div>
                            </div>
                            <div>
                                <div className="font-mono label-caps" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '4px' }}>Clearance Rate</div>
                                <div className="headline-lg" style={{ fontSize: '28px', color: 'var(--primary-container)' }}>94.2%</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Bento / Showcase */}
                    <div className="hero-showcase">
                        <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfOgt-VAm-L38jTTxh4y8V8x2bbYa0YsnDsxvbBd2vj18JcJlx-CzMfs-F62GQoRf9iiWpKP7khWnoCypg79BArrDbNzm5dPnz5lE5cSsLRwl8ayvblmFaA9BlbaqX9qeZ46O0_w6vfNKJJ6lHZ4x52UZ8n-UrOWsRzH7N0lGAiQdlqFJGH3TrjD3tu086kCOr0tIyGHaLjzt3wjmBC0mx20YLqmujdRn2v9Vx99JB2lXatDBAPh9tuTSU65EETaDmQT5RojR8Mx0" 
                            alt="Luxury watch movement" 
                        />
                        <div className="hero-showcase-overlay">
                            <span className="font-mono label-caps" style={{ color: 'var(--primary-container)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                                Featured Lot 402 • Mechanical Art
                            </span>
                            <h3 className="headline-lg" style={{ color: 'white', fontSize: '20px' }}>Patek Philippe Perpetual Calendar</h3>
                        </div>
                    </div>
                </div>
            </header>

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

            {/* Editorial Showcase Section */}
            <section className="welcome-section" style={{ padding: '80px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <span className="font-mono label-caps" style={{ color: 'var(--primary)' }}>Philosophy</span>
                        <h1 className="headline-lg" style={{ color: 'var(--secondary)', fontSize: '32px', lineHeight: '40px' }}>
                            "The world is an auction house where every person becomes a victim of the auction." — Ehsan Sehgal
                        </h1>
                        <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                            The open ascending price auction is the most common form, where participants bid openly against one another. Each bid must be higher than the previous one. The auction ends when no one bids further, and the highest bidder wins. This format is widely used for art, antiques, real estate, and online marketplaces.
                        </p>
                        <div>
                            <Link to="/browse" className="btn btn-ghost" style={{ borderBottom: '2px solid var(--secondary)', borderRadius: '0', padding: '8px 0', textTransform: 'uppercase', fontWeight: 700 }}>
                                Explore Live Catalog &rarr;
                            </Link>
                        </div>
                    </div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--outline-variant)' }}>
                        <img src="/images/auctionblog1.jpg" alt="Gallery viewing" style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }} />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section-padding" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                <div className="container">
                    <div className="section-header-flex">
                        <div>
                            <h2 className="section-title">Institutional Guide</h2>
                            <p className="section-subtitle">A step-by-step framework to buy or list luxury assets.</p>
                        </div>
                    </div>
                    <div className="grid-12" style={{ marginTop: '20px' }}>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 700 }}>01</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Create Account</h3>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                Register as an individual collector or institutional entity. Complete quick verification.
                            </p>
                        </div>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 700 }}>02</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Browse & Bid</h3>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                Explore live and upcoming catalogs. Place real-time bids under websocket-synchronized timers.
                            </p>
                        </div>
                        <div className="detail-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span className="font-mono" style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 700 }}>03</span>
                            <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Escrow & Shipping</h3>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                Won items are secured in credit-backed bank escrows. Armored courier transports directly to your vault.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="section-padding" style={{ background: 'var(--secondary)', color: '#ffffff', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                    <span className="font-mono label-caps" style={{ color: 'var(--primary-container)' }}>Liquidation Services</span>
                    <h2 className="headline-lg" style={{ color: '#ffffff', fontSize: '32px' }}>Ready to list your premium collection?</h2>
                    <p className="body-md" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Join thousands of verified global collectors and secure premium liquidity events for your luxury assets.
                    </p>
                    <div style={{ marginTop: '12px' }}>
                        <Link to="/sell" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                            Start Selling Today
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
