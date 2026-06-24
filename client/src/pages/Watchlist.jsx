import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AuctionCard from '../components/AuctionCard';
import SkeletonCard from '../components/SkeletonCard';

const Watchlist = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title'); // title, bidAsc, bidDesc
    const [nowMs, setNowMs] = useState(() => Date.now());

    React.useEffect(() => {
        const interval = setInterval(() => setNowMs(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

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
        const remaining = new Date(item.endTime).getTime() - nowMs;
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
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '40px', height: '34px', margin: '3px 0' }}></div>
                    ) : (
                        <p className="metric-value">{watchingCount}</p>
                    )}
                    <p className="meta-table" style={{ color: 'var(--primary)', marginTop: 'var(--space-xs)' }}>
                        ★ Monitored in real-time
                    </p>
                </div>
                <div className="metric-card" style={{ borderColor: 'var(--error)' }}>
                    <p className="metric-title">Ending Within 24h</p>
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '40px', height: '34px', margin: '3px 0' }}></div>
                    ) : (
                        <p className="metric-value" style={{ color: 'var(--error)' }}>{endingToday}</p>
                    )}
                    <p className="meta-table" style={{ color: 'var(--error)', marginTop: 'var(--space-xs)' }}>
                        ⌛ High-priority action
                    </p>
                </div>
                <div className="metric-card">
                    <p className="metric-title">Aggregate Value (Est)</p>
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '120px', height: '34px', margin: '3px 0' }}></div>
                    ) : (
                        <p className="metric-value">${estimatedValue.toLocaleString('en-US')}</p>
                    )}
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

                    {isLoading ? (
                        <div className="auction-grid">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : filteredWatchlist.length === 0 ? (
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
                            <span>Watched Lots Activity</span>
                            <span className="badge-live" style={{ fontSize: '9px', padding: '2px 6px' }}>Live</span>
                        </h3>
                        {isLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                <div className="skeleton" style={{ width: '100%', height: '50px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '50px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '50px' }}></div>
                            </div>
                        ) : (
                            <div className="timeline-list" style={{ marginTop: 'var(--space-md)' }} aria-label="Real-time watched asset activity timeline">
                                {watchlist.length === 0 ? (
                                    <p className="body-sm text-muted" style={{ fontStyle: 'italic', margin: 0, padding: 'var(--space-sm) 0' }}>
                                        No watched assets to display activity for. Add items to your watchlist to track live status updates.
                                    </p>
                                ) : (
                                    watchlist.slice(0, 5).map((item, idx) => {
                                        const isClosed = item.status === 'CLOSED' || item.status === 'SETTLED';
                                        const isPending = item.status === 'PENDING';
                                        const statusText = isClosed
                                            ? `Closed at $${Number(item.currentBid || item.startPrice).toLocaleString('en-US')}`
                                            : isPending
                                                ? `Pending review and registry approval`
                                                : `Currently at $${Number(item.currentBid || item.startPrice).toLocaleString('en-US')} (${item.bidCount} bid${item.bidCount === 1 ? '' : 's'})`;
                                        const valColor = (!isClosed && !isPending) ? 'var(--primary)' : 'var(--on-surface-variant)';
                                        
                                        // Format time left/ended
                                        const remaining = new Date(item.endTime).getTime() - nowMs;
                                        const timeLabel = remaining <= 0 
                                            ? 'Ended' 
                                            : (() => {
                                                const mins = Math.floor(remaining / 60000);
                                                const hours = Math.floor(mins / 60);
                                                const days = Math.floor(hours / 24);
                                                if (days > 0) return `${days}d left`;
                                                if (hours > 0) return `${hours}h left`;
                                                if (mins > 0) return `${mins}m left`;
                                                return '< 1m left';
                                            })();

                                        return (
                                            <div key={item.id || idx} className="timeline-step" style={{ paddingBottom: idx === Math.min(watchlist.length, 5) - 1 ? '0' : 'var(--space-md)' }}>
                                                <p className="label-caps font-mono" style={{ fontSize: '10px', color: valColor }}>{timeLabel}</p>
                                                <p className="body-sm" style={{ fontWeight: 600 }}>{item.title}</p>
                                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>{statusText}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
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
