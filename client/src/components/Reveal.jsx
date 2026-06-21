import { useRef, useEffect, useState } from 'react';

/**
 * Wraps content and reveals it on scroll via IntersectionObserver.
 * Adds `.is-visible` once the element enters the viewport (one-shot).
 *
 *   <Reveal>...</Reveal>                  → fade/slide up
 *   <Reveal stagger as="div">...</Reveal> → stagger direct children
 */
export default function Reveal({ children, stagger = false, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const revealAttr = stagger ? { 'data-reveal-stagger': '' } : { 'data-reveal': '' };

  return (
    <Tag ref={ref} className={`${className} ${visible ? 'is-visible' : ''}`.trim()} {...revealAttr} {...rest}>
      {children}
    </Tag>
  );
}
