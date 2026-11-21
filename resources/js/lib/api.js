import axios from 'axios';
import { APP_HEADER, IS_APP } from './platform.js';

// Use relative URL - works with Vite's proxy (localhost:5173 → localhost:8000)
// or when frontend and backend are on same origins
const api = axios.create({
    // On the web the API is on the same origin ('/api'). A native app (Capacitor) is built with VITE_API_BASE=https://your-server/api.
    baseURL: import.meta.env.VITE_API_BASE || '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(IS_APP ? APP_HEADER : {}),
    },
});

// Request interceptor: attach Sanctum token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('him_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401 globally
let unauthDispatched = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('him_token');
            localStorage.removeItem('him_user');

            if (!unauthDispatched) {
                unauthDispatched = true;
                window.dispatchEvent(new Event('him:unauthenticated'));

                setTimeout(() => {
                    unauthDispatched = false;
                }, 2000);
            }
        }
        return Promise.reject(error);
    }
);

export default api;