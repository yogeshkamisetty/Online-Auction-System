import axios from 'axios';
import { API_BASE } from '../config';

// Central axios instance. Every request automatically carries the JWT if present.
const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — normalize errors and auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.message || 'Something went wrong';

    if (status === 401) {
      // Token expired or invalid — clear and let AuthContext react
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
