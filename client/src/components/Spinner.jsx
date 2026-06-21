export default function Spinner({ label = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--outline-variant)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'gh-spin 0.8s linear infinite',
        }}
      />
      <p>{label}</p>
      <style>{`@keyframes gh-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
