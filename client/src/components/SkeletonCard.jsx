import React from 'react';

const SkeletonCard = () => {
    return (
        <article className="auction-card">
            <div className="card-image-wrapper">
                <div className="skeleton skeleton-img" style={{ height: '220px' }}></div>
            </div>

            <div className="card-content">
                <div className="card-lot-info">
                    <div className="skeleton" style={{ width: '60px', height: '12px' }}></div>
                </div>
                <div className="skeleton skeleton-title" style={{ marginTop: '8px', width: '80%', height: '20px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '12px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '90%', height: '12px' }}></div>

                <div className="card-footer" style={{ marginTop: '16px' }}>
                    <div className="bid-info">
                        <div className="skeleton" style={{ width: '70px', height: '10px', marginBottom: '6px' }}></div>
                        <div className="skeleton" style={{ width: '90px', height: '18px' }}></div>
                    </div>

                    <div className="action-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-xs)' }}>
                        <div className="skeleton" style={{ width: '40px', height: '10px', marginBottom: '6px' }}></div>
                        <div className="skeleton skeleton-btn" style={{ width: '70px', height: '28px' }}></div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default SkeletonCard;
