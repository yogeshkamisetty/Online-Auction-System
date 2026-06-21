import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AuctionCard from '../components/AuctionCard';
import Spinner from '../components/Spinner';

const Watchlist = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title'); // title, bidAsc, bidDesc

    // Redirect if not logged in
    React.useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Fetch Watchlist
    const { data: watchlist = [], isLoading, isError } = useQuery({
        queryKey: ['watchlistPage'],
        queryFn: async () => {
            const res = await api.get('/watchlist');
            return res.data;
        },
        enabled: !!token
    });

    if (isLoading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Error</h2>
                <p className="body-md">Failed to retrieve watchlist assets.</p>
            </div>
        );
    }

    // Process statistics
    const watchingCount = watchlist.length;
    const endingToday = watchlist.filter(item => {
        const remaining = new Date(item.endTime).getTime() - Date.now();
        return remaining > 0 && remaining < 24 * 60 * 60 * 1000;
    }).length;
    const estimatedValue = watchlist.reduce((sum, item) => sum + Number(item.currentBid || item.startPrice), 0);

    // Filter and Sort watchlist
    const filteredWatchlist = watchlist
        .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'bidAsc') return Number(a.currentBid) - Number(b.currentBid);
            if (sortBy === 'bidDesc') return Number(b.currentBid) - Number(a.currentBid);
            return 0;
        });

    return (
        <main className="container py-xl" aria-label="Collector watchlist portal">
            {/* Header Section */}
            <div className="section-header-flex">
                <div>
                    <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>Collector Watchlist</h1>
                    <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                        Curated high-stakes assets actively monitored for real-time price action.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="metrics-grid" style={{ marginTop: 'var(--space-md)' }}>
                <div className="metric-card">
                    <p className="metric-title">Watching Assets</p>
                    <p className="metric-value">{watchingCount}</p>
                    <p className="meta-table" style={{ color: 'var(--primary)', marginTop: 'var(--space-xs)' }}>
                        ★ Monitored in real-time
                    </p>
                </div>
                <div className="metric-card" style={{ borderColor: 'var(--error)' }}>
                    <p className="metric-title">Ending Within 24h</p>
                    <p className="metric-value" style={{ color: 'var(--error)' }}>{endingToday}</p>
                    <p className="meta-table" style={{ color: 'var(--error)', marginTop: 'var(--space-xs)' }}>
                        ⌛ High-priority action
                    </p>
                </div>
                <div className="metric-card">
                    <p className="metric-title">Aggregate Value (Est)</p>
                    <p className="metric-value">${estimatedValue.toLocaleString()}</p>
                    <p className="meta-table" style={{ color: 'var(--success)', marginTop: 'var(--space-xs)' }}>
                        ▲ Portfolio asset sum
                    </p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="split-layout" style={{ gridTemplateColumns: '1fr 320px', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                {/* Left side: Assets Grid */}
                <div>
                    {/* Controls */}
                    <div className="glass-panel" style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-lg)', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-base)', flexGrow: 1, maxWidth: '400px' }}>
                            <input 
                                type="text" 
                                placeholder="Search watched items..." 
                                className="form-input" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ backgroundColor: 'var(--surface-container-lowest)' }}
                                aria-label="Search watched items"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-base)', alignItems: 'center' }}>
                            <label htmlFor="sort-watchlist" className="label-caps" style={{ color: 'var(--outline)' }}>Sort By:</label>
                            <select 
                                id="sort-watchlist"
                                className="form-input" 
                                value={sortBy} 
                                onChange={e => setSortBy(e.target.value)}
                                style={{ width: '160px', padding: '6px var(--space-sm)', backgroundColor: 'var(--surface-container-lowest)' }}
                            >
                                <option value="title">Asset Name</option>
                                <option value="bidAsc">Bid: Low to High</option>
                                <option value="bidDesc">Bid: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {filteredWatchlist.length === 0 ? (
                        <div className="detail-card text-center" style={{ padding: 'var(--space-xl)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)' }} aria-hidden="true">
                                visibility_off
                            </span>
                            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-md)' }}>
                                {searchTerm ? 'No assets match your search filters.' : "Your watchlist is currently empty."}
                            </p>
                            <Link to="/browse" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} aria-label="Browse live auctions to watch items">
                                Browse Live Auctions
                            </Link>
                        </div>
                    ) : (
                        <div className="auction-grid">
                            {filteredWatchlist.map(item => (
                                <AuctionCard key={item.id} product={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side: Live Ticker & Activity Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="detail-card">
                        <h3 className="ledger-title" style={{ fontSize: '16px' }}>
                            <span>Live Market Feed</span>
                            <span className="badge-live" style={{ fontSize: '9px', padding: '2px 6px' }}>Live</span>
                        </h3>
                        <div className="timeline-list" style={{ marginTop: 'var(--space-md)' }} aria-label="Real-time auction activity timeline">
                            <div className="timeline-step" style={{ paddingBottom: 'var(--space-md)' }}>
                                <p className="label-caps font-mono" style={{ fontSize: '10px', color: 'var(--primary)' }}>Just Now</p>
                                <p className="body-sm" style={{ fontWeight: 600 }}>New Bid Placed</p>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Lot 402 is currently at $1,250,000</p>
                            </div>
                            <div className="timeline-step" style={{ paddingBottom: 'var(--space-md)' }}>
                                <p className="label-caps font-mono" style={{ fontSize: '10px', color: 'var(--outline)' }}>12m ago</p>
                                <p className="body-sm" style={{ fontWeight: 600 }}>Auction Closed</p>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Lot 380 closed at $48,400</p>
                            </div>
                            <div className="timeline-step" style={{ paddingBottom: '0' }}>
                                <p className="label-caps font-mono" style={{ fontSize: '10px', color: 'var(--outline)' }}>1h ago</p>
                                <p className="body-sm" style={{ fontWeight: 600 }}>Asset Uploaded</p>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Verified report added for Rothko Painting</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card text-center" style={{ background: 'var(--surface-container-low)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--secondary)' }} aria-hidden="true">
                            monitoring
                        </span>
                        <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)', marginTop: 'var(--space-base)' }}>Real-time Syncing</h4>
                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                            Watchlist tickers and price points automatically update via secure WebSockets.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Watchlist;
