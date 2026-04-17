import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
        if (error.response?.status === 401) {
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