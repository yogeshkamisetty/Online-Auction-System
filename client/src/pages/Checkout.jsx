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

            <div className="item-details-layout checkout-details-layout">
                {/* Left Column: Congratulations & Details */}
                <div className="checkout-column">
                    {/* Celebration Header */}
                    <section className="detail-card checkout-celebration">
                        <div>
                            <span className="material-symbols-outlined checkout-celebration-icon">
                                emoji_events
                            </span>
                            <h1 className="display-lg checkout-celebration-title">
                                {settledSuccess || isAlreadySettled ? 'Acquisition Commenced!' : 'Congratulations!'}
                            </h1>
                            <p className="body-md checkout-celebration-text">
                                {settledSuccess || isAlreadySettled ? 'Your transaction is successfully secured.' : 'You Won This Luxury Asset Auction'}
                            </p>
                        </div>
                    </section>

                    {/* Product Summary */}
                    <section className="detail-card checkout-summary-card">
                        <div className="checkout-summary-img-container">
                            <img 
                                src={auction.imageUrl || '/images/camera-1.avif'} 
                                alt={auction.title} 
                                className="checkout-summary-img" 
                            />
                        </div>
                        <div className="checkout-summary-info">
                            <div className="checkout-summary-badge-row">
                                <span className="badge-live checkout-lot-badge">
                                    LOT-{String(auction.id).padStart(3, '0')}
                                </span>
                                <span className="badge-live">
                                    ✓ Authenticated
                                </span>
                            </div>
                            <h2 className="headline-lg checkout-summary-title">{auction.title}</h2>
                            <p className="body-sm checkout-summary-desc">{auction.description}</p>
                        </div>
                    </section>

                    {/* Timeline Journey */}
                    <section className="detail-card">
                        <h3 className="panel-heading checkout-panel-heading">
                            Acquisition Journey
                        </h3>
                        <div className="timeline-list checkout-timeline-container">
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
                <div className="checkout-column">
                    <div className="detail-card glass-panel checkout-invoice-card">
                        <h3 className="panel-heading checkout-invoice-title">
                            Financial Invoice
                        </h3>

                        <div className="space-y-sm checkout-invoice-items">
                            <div className="flex-between body-md">
                                <span className="text-muted">Hammer Bid Price</span>
                                <span className="font-mono checkout-invoice-price">${bidAmount.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span className="text-muted">Buyer's Premium (15%)</span>
                                <span className="font-mono checkout-invoice-price">${buyersPremium.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span className="text-muted">Taxes & Duties (Est.)</span>
                                <span className="font-mono checkout-invoice-price">${taxes.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span className="text-muted">White Glove Courier Shipping</span>
                                <span className="font-mono checkout-invoice-price">${shipping.toLocaleString('en-US')}</span>
                            </div>
                        </div>

                        <div className="flex-between checkout-total-row">
                            <span className="headline-lg checkout-total-label">Total Due</span>
                            <span className="display-lg checkout-total-val">
                                ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {errorMessage && (
                            <div className="alert alert-error checkout-alert-margin">
                                {errorMessage}
                            </div>
                        )}

                        {settledSuccess || isAlreadySettled ? (
                            <div className="alert alert-success text-center">
                                <p style={{ fontWeight: 'bold' }}>Payment Complete</p>
                                <p className="body-sm checkout-success-note">Funds are held in secure escrow. You will be updated when authentication is completed.</p>
                                <Link to="/dashboard" className="btn btn-ghost w-full checkout-success-btn">Go to Dashboard</Link>
                            </div>
                        ) : (
                            <div>
                                <button 
                                    className="btn btn-primary checkout-pay-btn" 
                                    onClick={handleConfirmPayment}
                                    disabled={settleMutation.isPending}
                                    aria-label="Authorize secure escrow settlement payment"
                                >
                                    {settleMutation.isPending ? 'Processing Escrow...' : 'Secure Settlement Checkout'}
                                </button>
                                <p className="body-sm text-center checkout-pay-note">
                                    Wire transfer is preferred for settlements exceeding $100,000. Under bank grade escrow security.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Trust and Security Section */}
                    <div className="detail-card checkout-trust-card">
                        <div className="checkout-trust-item">
                            <span className="material-symbols-outlined checkout-trust-icon">shield</span>
                            <div>
                                <h4 className="body-md checkout-trust-title">Escrow Custody Protection</h4>
                                <p className="body-sm checkout-trust-desc">Funds are locked in credit-backed bank accounts until physical transfer validation.</p>
                            </div>
                        </div>
                        <div className="checkout-trust-item">
                            <span className="material-symbols-outlined checkout-trust-icon">local_shipping</span>
                            <div>
                                <h4 className="body-md checkout-trust-title">Fully Insured Climate Shipping</h4>
                                <p className="body-sm checkout-trust-desc">Assets are placed in climate-sealed casings and escorted by armed security staff.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
