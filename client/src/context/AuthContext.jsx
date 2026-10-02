import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../lib/api';


export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(!user && !!localStorage.getItem('token'));
    const skipHydrationRef = useRef(false);

    const login = (userData, authToken) => {
        skipHydrationRef.current = true;
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
        setLoading(false);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        window.addEventListener('auth:logout', logout);
        return () => window.removeEventListener('auth:logout', logout);
    }, [logout]);

    useEffect(() => {
        let active = true;

        const hydrateSession = async () => {
            if (skipHydrationRef.current) {
                skipHydrationRef.current = false;
                if (active) {
                    setLoading(false);
                }
                return;
            }

            if (!token) {
                if (active) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            try {
                const response = await api.get('/auth/me');
                if (!active) return;
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
            } catch {
                if (active) logout();
            } finally {
                if (active) setLoading(false);
            }
        };

        hydrateSession();
        return () => {
            active = false;
        };
    }, [token, logout]);

    if (loading && !user && token) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', color: '#C5A880' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(197, 168, 128, 0.2)', borderTopColor: '#C5A880', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', fontSize: '0.85rem' }}>GOLDEN HAMMER AUCTIONS</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
