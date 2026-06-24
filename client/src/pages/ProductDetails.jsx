import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE } from '../config';
import SkeletonDetails from '../components/SkeletonDetails';

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
    const toast = useToast();

    const [bidAmount, setBidAmount] = useState('');

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

    const isWatched = watchlist.some(item => String(item.id) === String(id));

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
            toast.error(err.message || 'Failed to update watchlist');
        }
    });

    const handleWatchToggle = () => {
        if (!token) {
            toast.error('Please log in to watch items.');
            return;
        }
        watchMutation.mutate();
    };

    // Socket.io real-time updates — matches the backend's room + event contract
    useEffect(() => {
        const socket = io(API_BASE, { transports: ['websocket', 'polling'] });

        socket.on('connect', () => {
            socket.emit('join:auction', id);
        });

        socket.on('bid:new', (data) => {
            queryClient.setQueryData(['auction', id], (oldProduct) => {
                if (!oldProduct) return oldProduct;
                const bidExists = oldProduct.bids?.some(
                    b => b.id === data.id || (b.amount === data.amount && b.createdAt === data.createdAt)
                );
                const newBids = bidExists ? oldProduct.bids : [
                    {
                        id: data.id || `${data.amount}-${data.createdAt}`,
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
        });

        socket.on('auction:closed', () => {
            queryClient.setQueryData(['auction', id], (oldProduct) => {
                if (!oldProduct) return oldProduct;
                return { ...oldProduct, status: 'CLOSED' };
            });
        });

        return () => {
            socket.emit('leave:auction', id);
            socket.disconnect();
        };
    }, [id, queryClient]);

    const handleBid = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Please log in to place a bid.');
            return;
        }

        try {
            await api.post('/bids', {
                auctionId: id,
                amount: parseFloat(bidAmount)
            });
            toast.success('Bid placed successfully.');
            refetch();
        } catch (err) {
            toast.error(err.message || 'Failed to place bid');
        }
    };

    if (isLoading) {
        return <SkeletonDetails />;
    }

    if (isError || !product) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Asset Not Found</h2>
                <p className="body-md">The requested auction record does not exist or failed to load.</p>
                <Link to="/browse" className="btn btn-primary mt-md">Back to Catalog</Link>
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

            <div className="item-details-layout mt-md">
                {/* Left Side: Media Gallery */}
                <div className="item-gallery">
                    <div className="main-image-container">
                        <img 
                            src={product.imageUrl || '/images/camera-1.avif'} 
                            alt={product.title} 
                            className="main-item-image" 
                        />
                    </div>
                    <div className="row gap-sm">
                        <div className="gallery-thumbnail-placeholder"></div>
                        <div className="gallery-thumbnail-placeholder"></div>
                    </div>
                </div>

                {/* Right Side: Item Details & Live Bidding Panel */}
                <div className="item-info-col">
                    <div className="detail-card">
                        <div className="detail-header cluster between align-start gap-sm">
                            <div>
                                <span className="font-mono label-caps text-primary d-block mb-xs" style={{ fontSize: '11px' }}>
                                    {lotCode}
                                </span>
                                <h1 className="headline-lg text-secondary">{product.title}</h1>
                            </div>
                            
                            <div className="row gap-md">
                                {product.status === 'ACTIVE' ? (
                                    <span className="badge-live">
                                        <span className="pulse-indicator" aria-hidden="true"></span> LIVE BIDDING
                                    </span>
                                ) : (
                                    <span className="badge-ended">ENDED</span>
                                )}

                                {product.verificationStatus === 'VERIFIED' && (
                                    <span className="verified-pill meta-table" aria-label="Expert verified provenance">
                                        <span className="material-symbols-outlined" aria-hidden="true">verified</span> VERIFIED
                                    </span>
                                )}
                                
                                {token && (
                                    <button 
                                        onClick={handleWatchToggle}
                                        className={`btn btn-ghost btn-watchlist-toggle ${isWatched ? 'is-watching' : ''}`}
                                        aria-label={isWatched ? `Remove ${product.title} from watchlist` : `Add ${product.title} to watchlist`}
                                    >
                                        {isWatched ? '★ Watching' : '☆ Watch'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="item-meta">
                            Category: <span className="font-semibold text-secondary">{product.category}</span> • 
                            Seller: <span className="font-semibold text-primary">{product.seller?.name || 'Authorized Agent'}</span>
                        </p>

                        <p className="item-description body-md">
                            {product.description}
                        </p>

                        {/* Timer remaining */}
                        <div className="timer-box">
                            <div className="timer-label">WebSocket Countdown Ticker</div>
                            {product.status !== 'ACTIVE' ? (
                                <div className="body-md text-danger font-bold mt-xs">
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
                                <span className="price-current font-mono">${Number(product.currentBid).toLocaleString('en-US')}</span>
                            </div>
                            <div className="price-col">
                                <span className="price-label">Opening Est. Valuation</span>
                                <span className="price-starting font-mono">${Number(product.startPrice).toLocaleString('en-US')}</span>
                            </div>
                        </div>

                        {/* Bid Placement or Settlement */}
                        <div className="bidding-section">
                            {product.status === 'ACTIVE' ? (
                                <>
                                    <div className="bid-labels">
                                        <label htmlFor="bid-amount-input" className="label-caps text-secondary">Place Ascending Bid</label>
                                        <span className="min-increment font-mono">Next bid must exceed current high bid</span>
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
                                </>
                            ) : product.status === 'CLOSED' ? (
                                isWinner ? (
                                    <div className="detail-card text-center winner-celebration-card">
                                        <span className="material-symbols-outlined text-primary font-fill" style={{ fontSize: '36px' }} aria-hidden="true">
                                            emoji_events
                                        </span>
                                        <h3 className="headline-lg text-secondary mt-md" style={{ fontSize: '20px' }}>
                                            You Won the Auction!
                                        </h3>
                                        <p className="body-sm text-muted mt-xs mb-md">
                                            Congratulations! You placed the winning bid. Settle the transaction securely.
                                        </p>
                                        <Link to={`/checkout/${id}`} className="btn btn-primary w-full" aria-label="Proceed to secure checkout session">
                                            Proceed to Secure Checkout
                                        </Link>
                                    </div>
                                ) : product.sellerId === user?.id ? (
                                    <div className="detail-card text-center surface-low-card">
                                        <h3 className="headline-lg text-secondary" style={{ fontSize: '18px' }}>Asset Auction Ended</h3>
                                        <p className="body-sm text-muted mt-xs">
                                            Sold for <strong className="font-mono">${Number(product.currentBid).toLocaleString('en-US')}</strong>. Awaiting winning buyer settlement checkouts.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="detail-card text-center surface-low-card">
                                        <h3 className="headline-lg text-muted" style={{ fontSize: '18px' }}>Auction Concluded</h3>
                                        <p className="body-sm text-muted mt-xs">
                                            Sold to the highest bidder for <strong className="font-mono">${Number(product.currentBid).toLocaleString('en-US')}</strong>.
                                        </p>
                                    </div>
                                )
                            ) : product.status === 'SETTLED' ? (
                                isWinner ? (
                                    <div className="detail-card text-center settled-buyer-card">
                                        <span className="material-symbols-outlined text-success" style={{ fontSize: '32px' }} aria-hidden="true">task_alt</span>
                                        <h3 className="headline-lg text-secondary mt-md" style={{ fontSize: '18px' }}>Purchase Settled</h3>
                                        <p className="body-sm text-muted mt-xs mb-sm">
                                            Your transaction has been securely processed. Monitor shipment journey on your checkout sheet.
                                        </p>
                                        <Link to={`/checkout/${id}`} className="btn btn-secondary w-full" aria-label="View acquisition and delivery logs">
                                            View Acquisition Journey
                                        </Link>
                                    </div>
                                ) : product.sellerId === user?.id ? (
                                    <div className="detail-card surface-low-card">
                                        <h3 className="headline-lg text-secondary" style={{ fontSize: '18px' }}>Sale Settled & Paid</h3>
                                        <p className="body-sm text-muted mt-xs">
                                            Winner has completed settlement. Platform commission deducted. Net earnings released: 
                                            <strong className="font-mono font-mono-lg-success">
                                                ${(Number(product.currentBid) - Number(product.platformFee || 0)).toLocaleString('en-US')}
                                            </strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="detail-card text-center surface-low-card">
                                        <h3 className="headline-lg text-muted" style={{ fontSize: '18px' }}>Transaction Finalized</h3>
                                        <p className="body-sm text-muted mt-xs">
                                            This asset was sold and settled at <strong className="font-mono">${Number(product.currentBid).toLocaleString('en-US')}</strong>.
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
                                <span className="badge-live badge-mini">WebSocket Sync</span>
                            )}
                        </h3>
                        <div className="bid-history-list" aria-live="polite" aria-relevant="additions" aria-label="Live bid transaction log">
                            {product.bids?.length > 0 ? (
                                product.bids.map((bid, index) => (
                                    <div className={`bid-history-item ${index === 0 && product.status === 'ACTIVE' ? 'winning-bid' : ''}`} key={bid.id}>
                                        <div className="row gap-sm">
                                            <div className="avatar-large avatar-sm">
                                                {(bid.user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="bidder-name">{bid.user?.name || 'Anonymous Bidder'}</p>
                                                {index === 0 && product.status === 'ACTIVE' && (
                                                    <span className="font-mono text-success font-bold" style={{ fontSize: '9px' }}>CURRENT WINNER</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bid-amount-time">
                                            <span className="bid-history-amount font-mono">${Number(bid.amount).toLocaleString('en-US')}</span>
                                            <span className="bid-history-time font-mono">{new Date(bid.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="body-sm text-center text-muted py-lg">
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
