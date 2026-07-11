import React, { useEffect, useRef } from 'react';

/**
 * BidSuccessAnimation
 * Shown when user places a successful bid.
 * Gold particle burst + "BID PLACED" stamp that fades out.
 * 
 * Props:
 *   show {boolean} — triggers the animation
 *   amount {number|string} — the bid amount
 *   onComplete {function} — called when animation finishes (to reset `show`)
 */
const BidSuccessAnimation = ({ show, amount, onComplete }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!show || !containerRef.current) return;

        const container = containerRef.current;
        const particleCount = 20;
        const particles = [];

        // Spawn gold particles
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'bid-particle';

            const angle = Math.random() * 360;
            const dist = 60 + Math.random() * 80;
            const tx = Math.cos((angle * Math.PI) / 180) * dist;
            const ty = Math.sin((angle * Math.PI) / 180) * dist - 40;
            const size = 4 + Math.random() * 6;
            const delay = Math.random() * 150;
            const isGold = Math.random() > 0.4;

            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${isGold ? '#D4AF37' : '#ffffff'};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                --tx: ${tx}px;
                --ty: ${ty}px;
                animation-delay: ${delay}ms;
            `;

            container.appendChild(p);
            particles.push(p);
        }

        const timeout = setTimeout(() => {
            particles.forEach(p => p.remove());
            onComplete?.();
        }, 1200);

        return () => {
            clearTimeout(timeout);
            particles.forEach(p => p.remove());
        };
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="bid-success-overlay" aria-live="assertive" role="status">
            <div ref={containerRef} className="bid-particle-container" />
            <div className="bid-success-stamp">
                <span className="material-symbols-outlined bid-success-icon">gavel</span>
                <span className="bid-success-label">BID PLACED</span>
                {amount && (
                    <span className="bid-success-amount">${Number(amount).toLocaleString()}</span>
                )}
            </div>
        </div>
    );
};

export default BidSuccessAnimation;
