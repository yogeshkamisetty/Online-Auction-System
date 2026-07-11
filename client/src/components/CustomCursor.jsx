import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — golden gavel-themed cursor with trailing glow ring.
 * Hidden on touch-only devices; activates on mousemove.
 */
const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isPointer, setIsPointer] = useState(false);

    // Smooth ring position via lerp
    const ringPos = useRef({ x: -100, y: -100 });
    const dotPos = useRef({ x: -100, y: -100 });
    const rafId = useRef(null);

    useEffect(() => {
        const isTouchOnly = window.matchMedia('(hover: none)').matches;
        if (isTouchOnly) return;

        const lerp = (a, b, t) => a + (b - a) * t;

        const moveDot = (x, y) => {
            dotPos.current = { x, y };
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
            }
        };

        const animate = () => {
            ringPos.current.x = lerp(ringPos.current.x, dotPos.current.x, 0.12);
            ringPos.current.y = lerp(ringPos.current.y, dotPos.current.y, 0.12);
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
            }
            rafId.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            moveDot(e.clientX, e.clientY);
        };

        const handleMouseOver = (e) => {
            const el = e.target.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]');
            setIsPointer(!!el);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(rafId.current);
        };
    }, [isVisible]);

    return (
        <>
            {/* Inner dot */}
            <div
                ref={dotRef}
                className={`custom-cursor-dot ${isPointer ? 'cursor-pointer-state' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
                aria-hidden="true"
            />
            {/* Outer trailing ring */}
            <div
                ref={ringRef}
                className={`custom-cursor-ring ${isPointer ? 'cursor-pointer-state' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
                aria-hidden="true"
            />
        </>
    );
};

export default CustomCursor;
