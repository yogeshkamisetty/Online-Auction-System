import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <main className="container page-spacing" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading admin authorization...
            </main>
        );
    }

    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
    }

    return children;
}
