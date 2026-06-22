import React from 'react';

const SkeletonDetails = () => {
    return (
        <main className="container py-xl">
            {/* Back link skeleton */}
            <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '24px' }}></div>

            <div className="item-details-layout" style={{ marginTop: 'var(--space-md)' }}>
                {/* Left Side: Media Gallery */}
                <div className="item-gallery">
                    <div className="main-image-container">
                        <div className="skeleton skeleton-img" style={{ height: '400px', width: '100%' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <div className="skeleton" style={{ flex: 1, height: '80px', borderRadius: 'var(--rounded-lg)' }}></div>
                        <div className="skeleton" style={{ flex: 1, height: '80px', borderRadius: 'var(--rounded-lg)' }}></div>
                    </div>
                </div>

                {/* Right Side: Item Details & Live Bidding Panel */}
                <div className="item-info-col">
                    <div className="detail-card">
                        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '8px' }}></div>
                                <div className="skeleton skeleton-title" style={{ width: '80%', height: '28px', marginBottom: '8px' }}></div>
                            </div>
                            <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: 'var(--rounded-full)' }}></div>
                        </div>

                        {/* Price row skeleton */}
                        <div className="price-row" style={{ marginTop: '16px' }}>
                            <div>
                                <div className="skeleton" style={{ width: '80px', height: '10px', marginBottom: '6px' }}></div>
                                <div className="skeleton" style={{ width: '150px', height: '42px' }}></div>
                            </div>
                            <div>
                                <div className="skeleton" style={{ width: '80px', height: '10px', marginBottom: '6px' }}></div>
                                <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>
                            </div>
                        </div>

                        {/* Time countdown badge skeleton */}
                        <div className="skeleton" style={{ width: '100%', height: '50px', margin: '20px 0' }}></div>

                        {/* Bid Placement Box skeleton */}
                        <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '20px' }}>
                            <div className="skeleton" style={{ width: '140px', height: '12px', marginBottom: '12px' }}></div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <div className="skeleton" style={{ flex: 1, height: '40px', minWidth: '150px' }}></div>
                                <div className="skeleton skeleton-btn" style={{ width: '120px', height: '40px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Trust and Appraisal Panel skeleton */}
                    <div className="detail-card" style={{ marginTop: '20px' }}>
                        <div className="skeleton skeleton-title" style={{ width: '150px', height: '20px', marginBottom: '12px' }}></div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div className="skeleton-circle" style={{ flexShrink: 0 }}></div>
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '8px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '6px' }}></div>
                                <div className="skeleton" style={{ width: '80%', height: '12px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SkeletonDetails;
