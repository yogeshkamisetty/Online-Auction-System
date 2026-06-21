import { useId } from 'react';

/**
 * Lightweight CSS tooltip. Accessible: content is exposed via aria-describedby.
 *   <Tooltip label="Expert-verified provenance"><span>✓</span></Tooltip>
 * `position` = top | bottom | left | right (default top).
 */
export default function Tooltip({ label, position = 'top', children }) {
  const id = useId();
  return (
    <span className="tooltip-wrap">
      <span aria-describedby={id} tabIndex={0} className="tooltip-trigger">
        {children}
      </span>
      <span role="tooltip" id={id} className={`tooltip tooltip--${position}`}>
        {label}
      </span>
    </span>
  );
}
