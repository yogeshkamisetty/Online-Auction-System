import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../config';
import Spinner from '../components/Spinner';

const DetailedCountdown = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const targetDate = new Date(endTime).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = targetDate - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="countdown">
            <div className="time-unit">
                <span className="time-value font-mono">{timeLeft.days}</span>
                <span className="time-text">Days</span>
            </div>
            <div className="time-unit">
                <span className="time-value font-mono">{timeLeft.hours}</span>
                <span className="time-text">Hours</span>
            </div>
            <div className="time-unit">
                <span className="time-value font-mono">{timeLeft.mins}</span>
                <span className="time-text">Mins</span>
            </div>
            <div className="time-unit">
                <span className="time-value font-mono">{timeLeft.secs}</span>
                <span className="time-text">Secs</span>
            </div>
        </div>
    );
};

const ProductDetails = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const queryClient = useQueryClient();
    
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState({ text: '', type: '' });

    // Fetch product details
    const { data: product, isLoading, isError, refetch } = useQuery({
        queryKey: ['auction', id],
        queryFn: async () => {
            const res = await api.get(`/auctions/${id}`);
            return res.data;
        }
    });

    // Initialize bid amount
    useEffect(() => {
        if (product) {
            setBidAmount(Math.floor(Number(product.currentBid)) + 10);
        }
    }, [product]);

    // Query watchlist
    const { data: watchlist = [] } = useQuery({
        queryKey: ['watchlist'],
        queryFn: async () => {
            const res = await api.get('/watchlist');
            return res.data;
        },
        enabled: !!token
    });

    const isWatched = watchlist.some(item => item.id === id);

    const watchMutation = useMutation({
        mutationFn: async () => {
            if (isWatched) {
                await api.delete(`/watchlist/${id}`);
            } else {
                await api.post('/watchlist', { auctionId: id });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
        onError: (err) => {
            setBidMessage({ text: err.message || 'Failed to update watchlist', type: 'error' });
        }
    });

    const handleWatchToggle = () => {
        if (!token) {
            setBidMessage({ text: 'Please log in to watch items.', type: 'error' });
            return;
        }
        watchMutation.mutate();
    };

    // WebSocket real-time updates
    useEffect(() => {
        const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws';
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify({ action: 'join', auctionId: id }));
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { event: eventName, data } = message;

                if (eventName === 'bid:new') {
                    queryClient.setQueryData(['auction', id], (oldProduct) => {
                        if (!oldProduct) return oldProduct;
                        const bidExists = oldProduct.bids?.some(b => b.id === data.id || (b.amount === data.amount && b.createdAt === data.createdAt));
                        const newBids = bidExists ? oldProduct.bids : [
                            {
                                id: data.id || Math.random().toString(),
                                amount: data.amount,
                                createdAt: data.createdAt,
                                user: { name: data.bidder }
                            },
                            ...(oldProduct.bids || [])
                        ];
                        return {
                            ...oldProduct,
                            currentBid: data.currentBid,
                            bidCount: data.bidCount,
                            bids: newBids
                        };
                    });
                } else if (eventName === 'auction:closed') {
                    queryClient.setQueryData(['auction', id], (oldProduct) => {
                        if (!oldProduct) return oldProduct;
                        return { ...oldProduct, status: 'CLOSED' };
                    });
                }
            } catch (err) {
                console.error("Error handling ws message", err);
            }
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ action: 'leave', auctionId: id }));
            }
            socket.close();
        };
    }, [id, queryClient]);

    const handleBid = async (e) => {
        e.preventDefault();
        setBidMessage({ text: '', type: '' });

        if (!token) {
            setBidMessage({ text: 'Please log in to place a bid.', type: 'error' });
            return;
        }

        try {
            await api.post('/bids', {
                auctionId: id,
                amount: parseFloat(bidAmount)
            });
            setBidMessage({ text: 'Bid placed successfully!', type: 'success' });
            refetch();
        } catch (err) {
            setBidMessage({ 
                text: err.message || 'Failed to place bid', 
                type: 'error' 
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Asset Not Found</h2>
                <p className="body-md">The requested auction record does not exist or failed to load.</p>
                <Link to="/browse" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Catalog</Link>
            </div>
        );
    }

    const winningBid = product.bids && product.bids.length > 0 ? product.bids[0] : null;
    const isWinner = winningBid && user && (winningBid.userId === user.id || winningBid.user?.id === user.id);
    const lotCode = `LOT-${String(product.id).padStart(3, '0')}`;

    return (
        <main className="container py-xl" aria-label={`Auction details for ${product.title}`}>
            <Link to="/browse" className="back-link body-sm" aria-label="Return to Browse Catalog">
                &larr; Back to Catalog
            </Link>

            <div className="item-details-layout" style={{ marginTop: 'var(--space-md)' }}>
                {/* Left Side: Media Gallery */}
                <div className="item-gallery">
                    <div className="main-image-container">
                        <img 
                            src={product.imageUrl || '/images/camera-1.avif'} 
                            alt={product.title} 
                            className="main-item-image" 
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <div style={{ flex: 1, height: '80px', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}></div>
                        <div style={{ flex: 1, height: '80px', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}></div>
                    </div>
                </div>

                {/* Right Side: Item Details & Live Bidding Panel */}
                <div className="item-info-col">
                    <div className="detail-card">
                        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                            <div>
                                <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginBottom: 'var(--space-xs)' }}>
                                    {lotCode}
                                </span>
                                <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>{product.title}</h1>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 'var(--space-base)', alignItems: 'center' }}>
                                {product.status === 'ACTIVE' ? (
                                    <span className="badge-live">
                                        <span className="pulse-indicator" aria-hidden="true"></span> LIVE BIDDING
                                    </span>
                                ) : (
                                    <span className="badge-ended">ENDED</span>
                                )}
                                
                                {token && (
                                    <button 
                                        onClick={handleWatchToggle}
                                        className="btn btn-ghost"
                                        aria-label={isWatched ? `Remove ${product.title} from watchlist` : `Add ${product.title} to watchlist`}
                                        style={{ 
                                            padding: '8px var(--space-sm)', 
                                            textTransform: 'none', 
                                            fontWeight: 600, 
                                            fontSize: '12px',
                                            borderColor: isWatched ? 'var(--primary)' : 'var(--outline-variant)',
                                            color: isWatched ? 'var(--primary)' : 'var(--on-surface-variant)',
                                            backgroundColor: isWatched ? 'var(--primary-container)' : 'transparent'
                                        }}
                                    >
                                        {isWatched ? '★ Watching' : '☆ Watch'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="item-meta">
                            Category: <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{product.category}</span> • 
                            Seller: <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{product.seller?.name || 'Authorized Agent'}</span>
                        </p>

                        <p className="item-description body-md">
                            {product.description}
                        </p>

                        {/* Timer remaining */}
                        <div className="timer-box">
                            <div className="timer-label">WebSocket Countdown Ticker</div>
                            {product.status !== 'ACTIVE' ? (
                                <div className="body-md" style={{ color: 'var(--error)', fontWeight: 'bold', marginTop: 'var(--space-xs)' }}>
                                    Bidding Concluded
                                </div>
                            ) : (
                                <DetailedCountdown endTime={product.endTime} />
                            )}
                        </div>

                        {/* Price indicators */}
                        <div className="price-row">
                            <div className="price-col">
                                <span className="price-label">Current High Bid</span>
                                <span className="price-current font-mono">${Number(product.currentBid).toLocaleString()}</span>
                            </div>
                            <div className="price-col">
                                <span className="price-label">Opening Est. Valuation</span>
                                <span className="price-starting font-mono">${Number(product.startPrice).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Bid Placement or Settlement */}
                        <div className="bidding-section">
                            {product.status === 'ACTIVE' ? (
                                <>
                                    <div className="bid-labels">
                                        <label htmlFor="bid-amount-input" className="label-caps" style={{ color: 'var(--secondary)' }}>Place Ascending Bid</label>
                                        <span className="min-increment font-mono">Min Increment: +$10</span>
                                    </div>

                                    <form className="bid-form" onSubmit={handleBid} aria-label="Bid placement form">
                                        <div className="input-wrapper">
                                            <span className="currency-symbol" aria-hidden="true">$</span>
                                            <input 
                                                id="bid-amount-input"
                                                type="number" 
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                aria-label="Enter bid amount in dollars"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary bid-submit-btn" aria-label="Place new high bid">
                                            Place Bid
                                        </button>
                                    </form>

                                    {bidMessage.text && (
                                        <div className={`alert ${bidMessage.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginTop: 'var(--space-sm)' }}>
                                            {bidMessage.text}
                                        </div>
                                    )}
                                </>
                            ) : product.status === 'CLOSED' ? (
                                isWinner ? (
                                    <div className="detail-card text-center" style={{ background: 'linear-gradient(135deg, rgba(255,212,95,0.05) 0%, rgba(255,255,255,0) 100%)', borderColor: 'var(--primary)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                                            emoji_events
                                        </span>
                                        <h3 className="headline-lg" style={{ fontSize: '20px', color: 'var(--secondary)', marginTop: 'var(--space-base)' }}>
                                            You Won the Auction!
                                        </h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                                            Congratulations! You placed the winning bid. Settle the transaction securely.
                                        </p>
                                        <Link to={`/checkout/${id}`} className="btn btn-primary" style={{ width: '100%' }} aria-label="Proceed to secure checkout session">
                                            Proceed to Secure Checkout
                                        </Link>
                                    </div>
                                ) : product.sellerId === user?.id ? (
                                    <div className="detail-card text-center" style={{ background: 'var(--surface-container-low)' }}>
                                        <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Asset Auction Ended</h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                                            Sold for <strong className="font-mono">${Number(product.currentBid).toLocaleString()}</strong>. Awaiting winning buyer settlement checkouts.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="detail-card text-center" style={{ background: 'var(--surface-container-low)' }}>
                                        <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>Auction Concluded</h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                                            Sold to the highest bidder for <strong className="font-mono">${Number(product.currentBid).toLocaleString()}</strong>.
                                        </p>
                                    </div>
                                )
                            ) : product.status === 'SETTLED' ? (
                                isWinner ? (
                                    <div className="detail-card text-center" style={{ background: 'var(--success-light)', borderColor: 'var(--success)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--success)' }} aria-hidden="true">task_alt</span>
                                        <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)', marginTop: 'var(--space-base)' }}>Purchase Settled</h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                                            Your transaction has been securely processed. Monitor shipment journey on your checkout sheet.
                                        </p>
                                        <Link to={`/checkout/${id}`} className="btn btn-secondary" style={{ width: '100%' }} aria-label="View acquisition and delivery logs">
                                            View Acquisition Journey
                                        </Link>
                                    </div>
                                ) : product.sellerId === user?.id ? (
                                    <div className="detail-card" style={{ background: 'var(--surface-container-low)' }}>
                                        <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Sale Settled & Paid</h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                                            Winner has completed settlement. Platform commission deducted. Net earnings released: 
                                            <strong className="font-mono" style={{ color: 'var(--success)', display: 'block', fontSize: '18px', marginTop: 'var(--space-xs)' }}>
                                                ${(Number(product.currentBid) - Number(product.platformFee)).toLocaleString()}
                                            </strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="detail-card text-center" style={{ background: 'var(--surface-container-low)' }}>
                                        <h3 className="headline-lg" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>Transaction Finalized</h3>
                                        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                                            This asset was sold and settled at <strong className="font-mono">${Number(product.currentBid).toLocaleString()}</strong>.
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="detail-card text-center">
                                    <p className="body-md">Status: {product.status}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Real-time Bid Ledger */}
                    <div className="bid-ledger-card">
                        <h3 className="ledger-title">
                            <span>Live Bid Ledger</span>
                            {product.status === 'ACTIVE' && (
                                <span className="badge-live" style={{ fontSize: '9px', padding: '2px 6px' }}>WebSocket Sync</span>
                            )}
                        </h3>
                        <div className="bid-history-list" aria-live="polite" aria-relevant="additions" aria-label="Live bid transaction log">
                            {product.bids?.length > 0 ? (
                                product.bids.map((bid, index) => (
                                    <div className={`bid-history-item ${index === 0 && product.status === 'ACTIVE' ? 'winning-bid' : ''}`} key={bid.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            <div className="avatar-large" style={{ width: '32px', height: '32px', fontSize: '14px', margin: 0 }}>
                                                {(bid.user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="bidder-name">{bid.user?.name || 'Anonymous Bidder'}</p>
                                                {index === 0 && product.status === 'ACTIVE' && (
                                                    <span className="font-mono" style={{ fontSize: '9px', color: 'var(--success)', fontWeight: 'bold' }}>CURRENT WINNER</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bid-amount-time">
                                            <span className="bid-history-amount font-mono">${Number(bid.amount).toLocaleString()}</span>
                                            <span className="bid-history-time font-mono">{new Date(bid.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="body-sm text-center" style={{ padding: 'var(--space-lg) 0', color: 'var(--on-surface-variant)' }}>
                                    No bidding history recorded. Be the opening bidder!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetails;
