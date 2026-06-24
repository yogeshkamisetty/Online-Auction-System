import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../lib/api';


export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
