import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const AuctionCard = ({ product }) => {
    // Generate a lot code dynamically using the product id
    const lotCode = `LOT-${String(product.id).padStart(3, '0')}`;

    return (
        <article className="auction-card">
            <div className="card-image-wrapper">
                <img 
                    src={product.imageUrl || '/images/camera-1.avif'} 
                    alt={product.title} 
                    className="card-image"
                />
                <span className="card-badge label-caps">
                    {product.category}
                </span>
                <span className="timer-badge meta-table">
                    <CountdownTimer endTime={product.endTime} />
                </span>
            </div>

            <div className="card-content">
                <div className="card-lot-info">
                    <span className="font-mono label-caps card-category">{lotCode}</span>
                    {product.status === 'ACTIVE' && (
                        <span className="pulse-indicator" title="Live Auction"></span>
                    )}
                </div>
                <h3 className="card-title">
                    {product.title}
                </h3>
                <p className="card-desc body-sm">
                    {product.description}
                </p>

                <div className="card-footer">
                    <div className="bid-info">
                        <span className="bid-label label-caps">Current Bid</span>
                        <span className="bid-price font-mono">
                            ${Number(product.currentBid).toLocaleString()}
                        </span>
                    </div>

                    <div className="action-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-xs)' }}>
                        <span className="bid-count meta-table">
                            {product.bidCount} bids
                        </span>
                        <Link to={`/product/${product.id}`} className="btn btn-primary btn-sm" aria-label={`View details and bid on ${product.title}`}>
                            Bid Now
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default AuctionCard;
