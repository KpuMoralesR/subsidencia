import axios from 'axios';

const api = axios.create({
    baseURL: '/api/', // Proxy handles localhost:8000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Basic ${token}`; // Using Basic for simplicity/DRF default unless JWT configured. 
            // Ideally should be Token or Bearer if TokenAuthentication/JWT is used.
            // DRF default SessionAuth/BasicAuth. For TokenAuth we need to install it.
            // For now, let's assume we can use a custom logic or just Basic auth for MVP, 
            // but "Basic" sends user:pass encoded. 
            // Real "Token" auth requires 'rest_framework.authtoken'.

            // Let's assume we store the base64 encoded creds or a real token.
            // Since I didn't set up TokenAuthentication in settings.py, I will use Session Auth (cookies) or Basic Auth.
            // However, frontend usually prefers Token.

            // REVISIT: I should probably enable TokenAuthentication in Backend to be standard.
            // For now, I will use what I have. If I don't use Tokens, I might have CSRF issues with Session auth.
            // I will assume I will fix backend to use TokenAuth or SimpleJWT later if needed.
            // For now, let's assume 'token' is actually 'username:password' base64 for Basic Auth (simple start).
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
