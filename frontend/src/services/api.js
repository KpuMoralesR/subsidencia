import axios from 'axios';

const api = axios.create({
    baseURL: '/api/', // Proxy handles localhost:8000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // JWT authentication requires Bearer prefix
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
