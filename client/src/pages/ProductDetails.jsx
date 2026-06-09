import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

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
                <span className="time-value">{timeLeft.days}</span><span className="time-text">DAYS</span>
            </div>
            <div className="time-unit">
                <span className="time-value">{timeLeft.hours}</span><span className="time-text">HOURS</span>
            </div>
            <div className="time-unit">
                <span className="time-value">{timeLeft.mins}</span><span className="time-text">MINS</span>
            </div>
            <div className="time-unit">
                <span className="time-value">{timeLeft.secs}</span><span className="time-text">SECS</span>
            </div>
        </div>
    );
};

const ProductDetails = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/auctions/${id}`);
                setProduct(res.data);
                setBidAmount(Math.floor(Number(res.data.currentBid)) + 10);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        const socket = io('http://localhost:3001', { transports: ['websocket'] });
        socket.emit('join:auction', id);

        socket.on('bid:new', (data) => {
            setProduct(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    currentBid: data.currentBid,
                    bids: [
                        {
                            id: data.id || Math.random().toString(),
                            amount: data.amount,
                            createdAt: data.createdAt,
                            user: { name: data.bidder }
                        },
                        ...prev.bids
                    ]
                };
            });
            setBidAmount(Math.floor(Number(data.currentBid)) + 10);
        });

        socket.on('auction:closed', () => {
            setProduct(prev => {
                if (!prev) return prev;
                return { ...prev, status: 'CLOSED' };
            });
        });

        return () => socket.disconnect();
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        setBidMessage({ text: '', type: '' });

        if (!token) {
            setBidMessage({ text: 'Please log in to place a bid.', type: 'error' });
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/bids', {
                auctionId: id,
                amount: parseFloat(bidAmount)
            });
            setBidMessage({ text: 'Bid placed successfully!', type: 'success' });
            // Socket will update the UI automatically
        } catch (err) {
            setBidMessage({ 
                text: err.response?.data?.error || err.message || 'Failed to place bid', 
                type: 'error' 
            });
        }
    };

    if (loading) return <main className="container item-page"><p style={{padding: '2rem'}}>Loading product details...</p></main>;
    if (!product) return <main className="container item-page"><p style={{padding: '2rem'}}>Product not found.</p></main>;

    return (
        <main className="container item-page">
            <Link to="/browse" className="back-link">&larr; Back to Auctions</Link>

            <div className="item-details-layout">
                <div className="item-gallery">
                    <div className="main-image-container">
                        <img 
                            src={product.imageUrl || '/images/camera-1.avif'} 
                            alt={product.title} 
                            className="main-item-image" 
                        />
                    </div>
                    <div className="thumbnail-list">
                        <div className="thumbnail placeholder"></div>
                        <div className="thumbnail placeholder"></div>
                    </div>
                </div>

                <div className="item-info-col">
                    <div className="detail-card">
                        <div className="detail-header">
                            <h1 className="item-title">{product.title}</h1>
                            <span className="badge-live">{product.status}</span>
                        </div>

                        <p className="item-meta">
                            Seller: <Link to="#" className="seller-link">{product.seller?.name || 'ProSeller'}</Link> • {product.category}
                        </p>

                        <p className="item-description">
                            {product.description}
                        </p>

                        <div className="timer-box">
                            <div className="timer-label">TIME REMAINING</div>
                            {product.status === 'CLOSED' ? (
                                <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>Auction Ended</div>
                            ) : (
                                <DetailedCountdown endTime={product.endTime} />
                            )}
                        </div>

                        <div className="price-row">
                            <div className="price-col">
                                <span className="price-label">Current Price</span>
                                <span className="price-current">${Number(product.currentBid).toLocaleString()}</span>
                            </div>
                            <div className="price-col">
                                <span className="price-label">Starting Price</span>
                                <span className="price-starting">${Number(product.startPrice).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bidding-section">
                            {product.status === 'CLOSED' ? (
                                <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                                    <strong style={{ color: '#b91c1c' }}>This auction has ended.</strong>
                                    <p style={{ margin: '0.5rem 0 0', color: '#78716c', fontSize: '0.9rem' }}>
                                        Check <Link to="/dashboard" style={{ color: 'var(--primary)' }}>your dashboard</Link> to see if you won.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bid-labels">
                                        <label>Place your bid</label>
                                        <span className="min-increment">Min Increment: $10</span>
                                    </div>

                                    <form className="bid-form" onSubmit={handleBid}>
                                        <div className="input-wrapper">
                                            <span className="currency-symbol">$</span>
                                            <input 
                                                type="number" 
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary bid-submit-btn">
                                            Bid
                                        </button>
                                    </form>

                                    {bidMessage.text && (
                                        <div className={`alert ${bidMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: '15px', color: bidMessage.type === 'error' ? '#e11d48' : '#166534', fontWeight: '600' }}>
                                            {bidMessage.text}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bid-history">
                        <h3 className="history-title">Bid History</h3>
                        <div className="history-list">
                            {product.bids?.length > 0 ? (
                                product.bids.map(bid => (
                                    <div className="history-item" key={bid.id}>
                                        <div className="bidder-info">
                                            <div className="avatar">{bid.user.name.charAt(0).toUpperCase()}</div>
                                            <div className="bidder-details">
                                                <span className="bidder-name">{bid.user.name}</span>
                                                <span className="bid-time">{new Date(bid.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="bid-amount">${Number(bid.amount).toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No bids yet. Be the first to bid!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetails;
