export default function Spinner({ label = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #78716c)' }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border-color, #e8e6e1)',
          borderTopColor: 'var(--primary, #d4af37)',
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
