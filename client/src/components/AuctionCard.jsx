import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const AuctionCard = ({ product }) => {
    return (
        <article className="auction-card">
            <div className="card-image-wrapper">
                <img 
                    src={product.imageUrl || '/images/camera-1.avif'} 
                    alt={product.title} 
                    className="card-image"
                />
                <span className="badge category-badge">
                    {product.category}
                </span>
                <span className="badge timer-badge left">
                    Ends in:
                </span>
                <CountdownTimer endTime={product.endTime} />
            </div>

            <div className="card-content">
                <h3 className="card-title">
                    {product.title}
                </h3>
                <p className="card-desc">
                    {product.description.substring(0, 100)}{product.description.length > 100 ? '...' : ''}
                </p>

                <div className="card-footer">
                    <div className="bid-info">
                        <span className="bid-label">CURRENT BID</span>
                        <span className="bid-price">
                            ${Number(product.currentBid).toLocaleString()}
                        </span>
                    </div>

                    <div className="action-info">
                        <span className="bid-count">
                            {product.bidCount} bids
                        </span>
                        <Link to={`/product/${product.id}`} className="btn btn-light-primary">
                            Bid Now
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default AuctionCard;
