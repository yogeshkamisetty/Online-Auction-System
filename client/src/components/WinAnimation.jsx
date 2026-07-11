import React, { useEffect, useRef, useCallback } from 'react';

/**
 * WinAnimation
 * Full-screen celebration when user wins a bid/auction.
 * Confetti rain + trophy burst + "YOU WON" headline.
 *
 * Props:
 *   show {boolean} — triggers animation
 *   title {string} — auction item name
 *   amount {number|string} — winning bid amount
 *   onClose {function} — dismiss callback
 */
const CONFETTI_COLORS = [
    '#D4AF37', '#FFD700', '#FFF8DC',
    '#C0A020', '#ffffff', '#f0c040',
    '#B8860B', '#DAA520',
];

const WinAnimation = ({ show, title, amount, onClose }) => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const confettiRef = useRef([]);

    const initConfetti = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const W = canvas.width = window.innerWidth;
        const H = canvas.height = window.innerHeight;

        confettiRef.current = Array.from({ length: 140 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H - H,
            w: 6 + Math.random() * 8,
            h: 3 + Math.random() * 5,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            vx: -1.5 + Math.random() * 3,
            vy: 2 + Math.random() * 4,
            rotation: Math.random() * 360,
            rotSpeed: -2 + Math.random() * 4,
            opacity: 0.7 + Math.random() * 0.3,
        }));

        const ctx = canvas.getContext('2d');
        let startTime = null;
        const DURATION = 4000;

        const draw = (ts) => {
            if (!startTime) startTime = ts;
            const elapsed = ts - startTime;

            ctx.clearRect(0, 0, W, H);

            confettiRef.current.forEach(c => {
                c.x += c.vx;
                c.y += c.vy;
                c.rotation += c.rotSpeed;

                // Fade out after 3s
                if (elapsed > 2800) {
                    c.opacity = Math.max(0, c.opacity - 0.012);
                }

                // Wrap around bottom
                if (c.y > H) {
                    c.y = -10;
                    c.x = Math.random() * W;
                }

                ctx.save();
                ctx.globalAlpha = c.opacity;
                ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
                ctx.rotate((c.rotation * Math.PI) / 180);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                ctx.restore();
            });

            if (elapsed < DURATION) {
                animFrameRef.current = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, W, H);
            }
        };

        animFrameRef.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        if (!show) return;

        initConfetti();

        // Auto-dismiss after 5.5s
        const timer = setTimeout(() => {
            onClose?.();
        }, 5500);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [show, initConfetti, onClose]);

    if (!show) return null;

    return (
        <div className="win-overlay" role="dialog" aria-modal="true" aria-label="Auction won celebration">
            {/* Confetti canvas */}
            <canvas ref={canvasRef} className="win-confetti-canvas" aria-hidden="true" />

            {/* Content panel */}
            <div className="win-panel">
                {/* Trophy glow */}
                <div className="win-trophy-wrap">
                    <div className="win-trophy-glow" />
                    <span className="material-symbols-outlined win-trophy-icon">emoji_events</span>
                </div>

                {/* Text */}
                <p className="win-eyebrow">🎉 Congratulations!</p>
                <h1 className="win-headline">You Won!</h1>
                {title && <p className="win-subtitle">{title}</p>}
                {amount && (
                    <div className="win-amount-badge">
                        <span className="win-amount-label">Winning Bid</span>
                        <span className="win-amount-value">${Number(amount).toLocaleString()}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="win-actions">
                    <button className="btn-gold-gradient win-btn-primary" onClick={onClose}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                        Confirm & Pay
                    </button>
                    <button className="btn-ghost win-btn-secondary" onClick={onClose}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinAnimation;
