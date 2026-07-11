import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Checkout = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [settledSuccess, setSettledSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [settlementSummary, setSettlementSummary] = useState(null);

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
        onSuccess: (data) => {
            setSettlementSummary(data.summary || null);
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
            <div className="flex-center min-h-page">
                <Spinner />
            </div>
        );
    }

    if (isError || !auction) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Something went wrong</h2>
                <p className="body-md">We couldn't load this auction. Please make sure you have access.</p>
                <Link to="/dashboard" className="btn btn-primary mt-md">Back to Dashboard</Link>
            </div>
        );
    }

    const winningBid = auction.bids?.length
        ? [...auction.bids].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
        : null;
    const winnerId = winningBid?.userId ?? winningBid?.user?.id;
    const isWinner = winnerId != null && user?.id != null && String(winnerId) === String(user.id);
    const isClosed = auction.status === 'CLOSED';
    const isAlreadySettled = auction.status === 'SETTLED';

    if (!isWinner) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg text-danger">Access Denied</h2>
                <p className="body-md">Only the winning bidder can complete payment for this item.</p>
                <Link to="/dashboard" className="btn btn-primary mt-md">Back to Dashboard</Link>
            </div>
        );
    }

    if (!isClosed && !isAlreadySettled) {
        return (
            <div className="container py-xl text-center">
                <h2 className="headline-lg">Auction Still Active</h2>
                <p className="body-md">This auction hasn't ended yet. Payment will be available once it closes.</p>
                <Link to={'/product/' + id} className="btn btn-primary mt-md">Back to Auction</Link>
            </div>
        );
    }

    const invoice = settlementSummary ?? auction.settlementSummary;
    const bidAmount = Number(invoice?.hammerPrice ?? winningBid?.amount ?? auction.currentBid ?? 0);
    const buyersPremium = Number(invoice?.buyerPremium ?? auction.buyerPremium ?? 0);
    const totalDue = Number(invoice?.totalPaid ?? bidAmount + buyersPremium);
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
                                {settledSuccess || isAlreadySettled ? 'Payment Complete!' : 'Congratulations!'}
                            </h1>
                            <p className="body-md checkout-celebration-text">
                                {settledSuccess || isAlreadySettled ? 'Your purchase has been confirmed.' : 'You won this auction!'}
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
                            What Happens Next
                        </h3>
                        <div className="timeline-list checkout-timeline-container">
                            <div className="timeline-step completed">
                                <h4 className="timeline-title">Auction Closed — You Won</h4>
                                <p className="timeline-desc">You placed the highest bid when the auction ended.</p>
                            </div>
                            <div className={`timeline-step ${settledSuccess || isAlreadySettled ? 'completed' : 'active'}`}>
                                <h4 className="timeline-title">Payment</h4>
                                <p className="timeline-desc">
                                    {settledSuccess || isAlreadySettled ? 'Payment confirmed.' : 'Waiting for your payment.'}
                                </p>
                            </div>
                            <div className={`timeline-step ${settledSuccess || isAlreadySettled ? 'active' : ''}`}>
                                <h4 className="timeline-title">Item Inspection</h4>
                                <p className="timeline-desc">An expert inspects the item before it ships.</p>
                            </div>
                            <div className="timeline-step">
                                <h4 className="timeline-title">Delivery</h4>
                                <p className="timeline-desc">Your item is shipped safely to your address.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Checkout Breakdown Sidebar */}
                <div className="checkout-column">
                    <div className="detail-card glass-panel checkout-invoice-card">
                        <h3 className="panel-heading checkout-invoice-title">
                            Payment Summary
                        </h3>

                        <div className="space-y-sm checkout-invoice-items">
                            <div className="flex-between body-md">
                                <span className="text-muted">Winning Bid</span>
                                <span className="font-mono checkout-invoice-price">${bidAmount.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex-between body-md">
                                <span className="text-muted">Buyer's Premium</span>
                                <span className="font-mono checkout-invoice-price">${buyersPremium.toLocaleString('en-US')}</span>
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
                                <p className="font-bold">Payment Complete</p>
                                <p className="body-sm checkout-success-note">Your payment is confirmed. We'll keep you updated on delivery.</p>
                                <Link to="/dashboard" className="btn btn-ghost w-full checkout-success-btn">Go to Dashboard</Link>
                            </div>
                        ) : (
                            <div>
                                <button 
                                    className="btn btn-primary checkout-pay-btn" 
                                    onClick={handleConfirmPayment}
                                    disabled={settleMutation.isPending}
                                    aria-label="Confirm payment"
                                >
                                    {settleMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                                </button>
                                <p className="body-sm text-center checkout-pay-note">
                                    Your payment is protected and held securely until the item is verified.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Trust and Security Section */}
                    <div className="detail-card checkout-trust-card">
                        <div className="checkout-trust-item">
                            <span className="material-symbols-outlined checkout-trust-icon">shield</span>
                            <div>
                                <h4 className="body-md checkout-trust-title">Secure Payment</h4>
                                <p className="body-sm checkout-trust-desc">Your payment is held safely until the item is delivered and verified.</p>
                            </div>
                        </div>
                        <div className="checkout-trust-item">
                            <span className="material-symbols-outlined checkout-trust-icon">local_shipping</span>
                            <div>
                                <h4 className="body-md checkout-trust-title">Insured Shipping</h4>
                                <p className="body-sm checkout-trust-desc">Your item is fully insured and carefully packaged during transit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
