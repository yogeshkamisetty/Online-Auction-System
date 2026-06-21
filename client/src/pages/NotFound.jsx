import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <main className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <span className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '14px' }}>
                Error Code 404
            </span>
            <h1 className="display-lg" style={{ color: 'var(--secondary)', fontSize: '48px', margin: 0 }}>
                Asset Not Located.
            </h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '480px', margin: '0 auto' }}>
                The database registry could not retrieve a file matching this path address. It may have been archived or removed.
            </p>
            <div style={{ marginTop: '12px' }}>
                <Link to="/" className="btn btn-primary">
                    Return to Registry Home
                </Link>
            </div>
        </main>
    );
}
