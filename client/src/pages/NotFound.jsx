import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container page-spacing" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--primary, #d4af37)' }}>404</h1>
      <p style={{ color: 'var(--text-muted)' }}>This page doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Back to Home
      </Link>
    </main>
  );
}
