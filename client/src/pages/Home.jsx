import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <section className="hero">
                <div className="container hero-content">
                    <h1>Discover Rare Treasures<br/>Bid with Confidence</h1>
                    <p>The world's premier marketplace for unique collectibles, fine art, and luxury items. Real-time bidding wars start now.</p>
                    <div className="hero-buttons">
                        <Link to="/browse" className="btn btn-primary">Start Bidding</Link>
                        <Link to="/sell" className="btn btn-outline-light">Sell Item</Link>
                    </div>
                </div>
            </section>

            <main className="categories section-padding" id="categories">
                <div className="container category-grid">
                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Ancient</h3>
                            <Link to="/browse?category=ancient" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/ancient.png" alt="Ancient Artifacts" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="#">Chola Bronze Sculptures</Link></li>
                            <li><Link to="#">Roman Empire Coins</Link></li>
                            <li><Link to="#">Egyptian Antiquities</Link></li>
                        </ul>
                    </div>
                    
                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Modern</h3>
                            <Link to="/browse?category=modern" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/modern1.jpg" alt="Modern Art" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="#">Mid-Century Furniture</Link></li>
                            <li><Link to="#">Abstract Expressionism</Link></li>
                            <li><Link to="#">Pop Art Collectibles</Link></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="category-header">
                            <h3 className="category-title">Luxury</h3>
                            <Link to="/browse?category=luxury" className="category-arrow">&rarr;</Link>
                        </div>
                        <img src="/images/lux.jpg" alt="Luxury Items" className="category-image-new" />
                        <ul className="category-links">
                            <li><Link to="#">Swiss Mechanical Watches</Link></li>
                            <li><Link to="#">Designer Handbags</Link></li>
                            <li><Link to="#">Fine Diamond Jewelry</Link></li>
                        </ul>
                    </div>
                </div>
            </main>

            <section className="welcome-section">
                <div className="welcome-split">
                    <div className="welcome-text-box">
                        <h1>The world is an auction house where every person becomes a victim of the auction. — 'Ehsan Sehgal'</h1>
                        <p className="welcome-paragraph">
                            The open ascending price auction is the most common form, where participants bid openly against one another. Each bid must be higher than the previous one. The auction ends when no one bids further, and the highest bidder wins. This format is widely used for art, antiques, real estate, and online marketplaces.
                        </p>
                        <Link to="#" className="more-link">MORE ABOUT &rarr;</Link>
                    </div>
                    <div className="welcome-image-box">
                        <img src="/images/auctionblog1.jpg" alt="Person looking at art in a gallery" className="welcome-img" />
                    </div>
                </div>
            </section>

            <section className="bottom-cta">
                <div className="container cta-content">
                    <h2>Ready to clear out your attic?</h2>
                    <p>Join thousands of sellers and get the best price for your items.</p>
                    <Link to="/sell" className="btn btn-white">Start Selling Today</Link>
                </div>
            </section>

            <main className="section-padding" id="how-it-works" style={{ backgroundColor: '#efeeed' }}>
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Simple steps to start bidding and selling</p>
                    <div className="steps-grid">
                        <div className="step-card">
                            <h3 className="step-title">1. Create an Account</h3>
                            <p>Sign up for free and set up your profile to start bidding or selling.</p>
                        </div>
                        <div className="step-card">
                            <h3 className="step-title">2. Browse & Bid</h3>
                            <p>Explore thousands of auctions across various categories and place your bids.</p>
                        </div>
                        <div className="step-card">
                            <h3 className="step-title">3. Sell Your Items</h3>
                            <p>List your items in minutes and reach a global audience of eager buyers.</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
