import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(() => {
        const storedTokens = localStorage.getItem('authTokens');
        return storedTokens ? JSON.parse(storedTokens) : null;
    });
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
    });

    // Interceptor to add token to requests
    api.interceptors.request.use(async (config) => {
        if (tokens?.access) {
            config.headers.Authorization = `Bearer ${tokens.access}`;
            // Optional: Check if token is expired and refresh
        }
        return config;
    }, (error) => Promise.reject(error));

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me/');
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user", error);
            logout();
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            });
            const data = response.data;
            setTokens(data);
            localStorage.setItem('authTokens', JSON.stringify(data));

            // Set basic user temporarily, then fetch full details
            // setUser({ username }); 
            // We rely on useEffect[tokens] to fetch full user details
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };

    const value = {
        user,
        tokens,
        login,
        logout,
        api
    };

    useEffect(() => {
        if (tokens) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [tokens]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
