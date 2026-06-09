// Single source of truth for the API base URL.
// Local dev reads from .env.local; production (Vercel) sets VITE_API_BASE in the dashboard.
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
