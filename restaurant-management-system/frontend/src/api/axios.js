import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
});

// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Content-Type is set for POST/PUT requests
    if (config.data && (config.method === 'post' || config.method === 'put')) {
        config.headers['Content-Type'] = 'application/json';
    }

    // Log outgoing request data for debugging
    if (config.data) {
        console.log('=== OUTGOING REQUEST ===');
        console.log('URL:', config.url);
        console.log('Method:', config.method);
        console.log('Data:', JSON.stringify(config.data, null, 2));
        console.log('Headers:', config.headers);
    }

    return config;
});

// Add response error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status } = error.response || {};
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (status === 401 && !isLoginRequest) {
            // Handle unauthorized access for non-login requests only
            console.error('Authentication required');
            // Optionally redirect to login or show a login modal
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (status === 500) {
            console.error('Server Error:', error.response?.data || 'Internal server error');
        } else {
            console.error('Request failed:', error.message);
        }

        return Promise.reject(error);
    }
);

export default API;
