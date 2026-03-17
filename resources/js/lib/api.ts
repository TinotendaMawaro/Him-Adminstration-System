import axios, { AxiosInstance, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ── Request interceptor: attach Sanctum token ─────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('him_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('him_token');
            localStorage.removeItem('him_user');
            // Dispatch custom event — App.jsx listens and resets state
            window.dispatchEvent(new Event('him:unauthenticated'));
        }
        return Promise.reject(error);
    }
);

export default api;
