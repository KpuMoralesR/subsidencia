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
        // Try to get token from authTokens object first (standard for this app - used by AuthContext)
        const storedTokens = localStorage.getItem('authTokens');
        let token = null;

        if (storedTokens) {
            try {
                const parsed = JSON.parse(storedTokens);
                token = parsed.access;
            } catch (e) {
                console.error("Error parsing authTokens", e);
            }
        }

        // Fallback to simple 'token' key if exists (for backwards compatibility or simple usage)
        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            // JWT authentication requires Bearer prefix
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
