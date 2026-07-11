import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <main className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '14px' }}>
                404
            </span>
            <h1 className="display-lg" style={{ color: 'var(--secondary)', fontSize: '48px', margin: 0 }}>
                Page Not Found
            </h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '480px', margin: '0 auto' }}>
                We couldn't find the page you're looking for. It may have been moved or removed.
            </p>
            <div style={{ marginTop: '12px' }}>
                <Link to="/" className="btn btn-primary">
                    Go Back Home
                </Link>
            </div>
        </main>
    );
}
