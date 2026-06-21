import useCountUp from '../hooks/useCountUp';

function Stat({ end, suffix = '', prefix = '', decimals = 0, label, bars }) {
  const [ref, val] = useCountUp(end, {
    decimals,
    format: (v) => prefix + Number(v).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix,
  });

  return (
    <div className="stat-cell" ref={ref}>
      <span className="stat-value">{val}</span>
      <span className="stat-label">{label}</span>
      {bars && (
        <div className="sparkbars" aria-hidden="true">
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Animated infographic band — count-up KPIs with a mini bar visualization.
 * Numbers animate when the band scrolls into view.
 */
export default function StatsBand() {
  return (
    <div className="stats-band">
      <div className="stats-grid">
        <Stat end={1.4} decimals={1} prefix="$" suffix="B" label="Q3 Transaction Volume"
              bars={[40, 55, 48, 70, 62, 85, 78, 96]} />
        <Stat end={94.2} decimals={1} suffix="%" label="Lot Clearance Rate"
              bars={[60, 72, 68, 80, 88, 84, 92, 94]} />
        <Stat end={12480} label="Verified Collectors"
              bars={[30, 45, 52, 60, 68, 74, 82, 90]} />
        <Stat end={38} suffix="ms" label="Avg. Bid Latency"
              bars={[90, 70, 75, 55, 60, 48, 42, 38]} />
      </div>
    </div>
  );
}
