import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Checkout = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [settledSuccess, setSettledSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch auction details
    const { data: auction, isLoading, isError } = useQuery({
        queryKey: ['auctionCheckout', id],
        queryFn: async () => {
            const res = await api.get(`/auctions/${id}`);
            return res.data;
        },
        enabled: !!id && !!token
    });

    // Mutation to settle the auction
    const settleMutation = useMutation({
        mutationFn: async () => {
            const res = await api.patch(`/auctions/${id}/settle`);
            return res.data;
        },
        onSuccess: () => {
            setSettledSuccess(true);
            queryClient.invalidateQueries(['auctionCheckout', id]);
            queryClient.invalidateQueries(['myBids']);
            toast.success('Purchase settled securely. Thank you.');
        },
        onError: (err) => {
            const text = err.message || 'Payment settlement failed.';
            setErrorMessage(text);
            toast.error(text);
        }
    });

    if (isLoading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (isError || !auction) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Error</h2>
                <p className="body-md">Failed to retrieve won auction details. Please ensure you are authorized.</p>
                <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Back to Dashboard</Link>
            </div>
        );
    }

    const isWinner = auction.currentBidderId === user?.id;
    const isClosed = auction.status === 'CLOSED';
    const isAlreadySettled = auction.status === 'SETTLED';

    if (!isWinner) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Access Denied</h2>
                <p className="body-md">Only the winning bidder can settle payments for this asset.</p>
                <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Back to Dashboard</Link>
            </div>
        );
    }

    // Financial calculations
    const bidAmount = Number(auction.currentBid);
    const buyersPremium = bidAmount * 0.15;
    const taxes = bidAmount * 0.092;
    const shipping = 5000;
    const totalDue = bidAmount + buyersPremium + taxes + shipping;

    const handleConfirmPayment = () => {
        setErrorMessage('');
        settleMutation.mutate();
    };

    return (
        <main className="container py-xl" aria-label="Settlement checkout page">
            <Link to="/dashboard" className="back-link body-sm" aria-label="Return to Dashboard">
                &larr; Back to Dashboard
            </Link>

            <div className="item-details-layout" style={{ marginTop: 'var(--space-lg)' }}>
                {/* Left Column: Congratulations & Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Celebration Header */}
                    <section className="detail-card" style={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        overflow: 'hidden', 
                        background: 'linear-gradient(135deg, rgba(255,212,95,0.08) 0%, rgba(255,255,255,0) 100%)'
                    }}>
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>
                                emoji_events
                            </span>
                            <h1 className="display-lg" style={{ fontSize: '32px', color: 'var(--secondary)', marginTop: 'var(--space-base)' }}>
                                {settledSuccess || isAlreadySettled ? 'Acquisition Commenced!' : 'Congratulations!'}
                            </h1>
                            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>
                                {settledSuccess || isAlreadySettled ? 'Your transaction is successfully secured.' : 'You Won This Luxury Asset Auction'}
                            </p>
                        </div>
                    </section>

                    {/* Product Summary */}
                    <section className="detail-card" style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', padding: 'var(--space-lg)' }}>
                        <div style={{ flex: '1 1 200px', height: '160px', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', border: '1px solid var(--outline-variant)' }}>
                            <img 
                                src={auction.imageUrl || '/images/camera-1.avif'} 
                                alt={auction.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        </div>
                        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-base)', marginBottom: 'var(--space-base)' }}>
                                <span className="badge-live" style={{ background: 'var(--primary-container)', color: 'var(--on-surface)', fontWeight: 700 }}>
                                    LOT-{String(auction.id).padStart(3, '0')}
                                </span>
                                <span className="badge-live">
                                    ✓ Authenticated
                                </span>
                            </div>
                            <h2 className="headline-lg" style={{ fontSize: '22px', color: 'var(--secondary)' }}>{auction.title}</h2>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-xs)' }}>{auction.description}</p>
                        </div>
                    </section>

                    {/* Timeline Journey */}
                    <section className="detail-card">
                        <h3 className="panel-heading" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--space-base)' }}>
                            Acquisition Journey
                        </h3>
                        <div className="timeline-list" style={{ marginTop: 'var(--space-lg)' }}>
                            <div className="timeline-step completed">
                                <h4 className="timeline-title">Auction Closed & Won</h4>
                                <p className="timeline-desc">You are the highest bidder at closing time.</p>
                            </div>
                            <div className={`timeline-step ${settledSuccess || isAlreadySettled ? 'completed' : 'active'}`}>
                                <h4 className="timeline-title">Secure Settlement & Escrow</h4>
                                <p className="timeline-desc">
                                    {settledSuccess || isAlreadySettled ? 'Payment settled in full.' : 'Pending transaction confirmation.'}
                                </p>
                            </div>
                            <div className={`timeline-step ${settledSuccess || isAlreadySettled ? 'active' : ''}`}>
                                <h4 className="timeline-title">Independent Fine Art Appraisal</h4>
                                <p className="timeline-desc">Appraiser inspects physical asset state before logistics.</p>
                            </div>
                            <div className="timeline-step">
                                <h4 className="timeline-title">White Glove Insured Courier Delivery</h4>
                                <p className="timeline-desc">Armored, climate-controlled shipping to your registered address.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Checkout Breakdown Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="detail-card glass-panel" style={{ padding: 'var(--space-lg)' }}>
                        <h3 className="panel-heading" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--space-base)', fontSize: '18px' }}>
                            Financial Invoice
                        </h3>

                        <div className="space-y-sm" style={{ marginTop: 'var(--space-md)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--space-md)' }}>
                            <div className="flex-between body-md">
                                <span style={{ color: 'var(--on-surface-variant)' }}>Hammer Bid Price</span>
                                <span className="font-mono" style={{ fontWeight: 600 }}>${bidAmount.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span style={{ color: 'var(--on-surface-variant)' }}>Buyer's Premium (15%)</span>
                                <span className="font-mono" style={{ fontWeight: 600 }}>${buyersPremium.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span style={{ color: 'var(--on-surface-variant)' }}>Taxes & Duties (Est.)</span>
                                <span className="font-mono" style={{ fontWeight: 600 }}>${taxes.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span style={{ color: 'var(--on-surface-variant)' }}>White Glove Courier Shipping</span>
                                <span className="font-mono" style={{ fontWeight: 600 }}>${shipping.toLocaleString('en-US')}</span>
                            </div>
                        </div>

                        <div className="flex-between" style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                            <span className="headline-lg" style={{ fontSize: '18px', color: 'var(--secondary)' }}>Total Due</span>
                            <span className="display-lg" style={{ fontSize: '24px', color: 'var(--primary)' }}>
                                ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {errorMessage && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
                                {errorMessage}
                            </div>
                        )}

                        {settledSuccess || isAlreadySettled ? (
                            <div className="alert alert-success text-center">
                                <p style={{ fontWeight: 'bold' }}>Payment Complete</p>
                                <p className="body-sm" style={{ marginTop: 'var(--space-xs)' }}>Funds are held in secure escrow. You will be updated when authentication is completed.</p>
                                <Link to="/dashboard" className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-sm)' }}>Go to Dashboard</Link>
                            </div>
                        ) : (
                            <div>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleConfirmPayment}
                                    disabled={settleMutation.isPending}
                                    style={{ width: '100%', padding: '12px', fontSize: '14px', letterSpacing: '0.05em' }}
                                    aria-label="Authorize secure escrow settlement payment"
                                >
                                    {settleMutation.isPending ? 'Processing Escrow...' : 'Secure Settlement Checkout'}
                                </button>
                                <p className="body-sm text-center" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-base)', fontSize: '12px' }}>
                                    Wire transfer is preferred for settlements exceeding $100,000. Under bank grade escrow security.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Trust and Security Section */}
                    <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>shield</span>
                            <div>
                                <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)' }}>Escrow Custody Protection</h4>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>Funds are locked in credit-backed bank accounts until physical transfer validation.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>local_shipping</span>
                            <div>
                                <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)' }}>Fully Insured Climate Shipping</h4>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>Assets are placed in climate-sealed casings and escorted by armed security staff.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
