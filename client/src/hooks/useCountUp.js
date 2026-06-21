import { useRef, useEffect, useState } from 'react';

/**
 * Animates a number from 0 → `end` once the element scrolls into view.
 * Returns [ref, displayValue]. `format` shapes the rendered string.
 */
export default function useCountUp(end, { duration = 1600, decimals = 0, format } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (nowTs) => {
              const progress = Math.min((nowTs - start) / duration, 1);
              // easeOutExpo
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              setValue(end * eased);
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = format ? format(value) : value.toFixed(decimals);
  return [ref, display];
}
