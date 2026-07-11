import React, { useEffect, useRef, useCallback } from 'react';

/**
 * TouchRipple — creates a gold burst animation at every touch point.
 * Cleans up each ripple element after the animation completes.
 */
const TouchRipple = () => {
    const containerRef = useRef(null);

    const spawnRipple = useCallback((x, y) => {
        const container = containerRef.current;
        if (!container) return;

        // Outer ring
        const ring = document.createElement('div');
        ring.className = 'touch-ripple-ring';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;

        // Inner burst dot
        const dot = document.createElement('div');
        dot.className = 'touch-ripple-dot';
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;

        // Particle sparks
        const particles = [];
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'touch-ripple-particle';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            const angle = (360 / particleCount) * i;
            const dist = 28 + Math.random() * 20;
            const tx = Math.cos((angle * Math.PI) / 180) * dist;
            const ty = Math.sin((angle * Math.PI) / 180) * dist;
            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);
            container.appendChild(p);
            particles.push(p);
        }

        container.appendChild(ring);
        container.appendChild(dot);

        // Remove after animation completes (600ms)
        setTimeout(() => {
            ring.remove();
            dot.remove();
            particles.forEach(p => p.remove());
        }, 700);
    }, []);

    useEffect(() => {
        const handleTouchStart = (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                spawnRipple(touch.clientX, touch.clientY);
            });
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        return () => window.removeEventListener('touchstart', handleTouchStart);
    }, [spawnRipple]);

    return (
        <div
            ref={containerRef}
            className="touch-ripple-container"
            aria-hidden="true"
            style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9998, overflow: 'hidden' }}
        />
    );
};

export default TouchRipple;
