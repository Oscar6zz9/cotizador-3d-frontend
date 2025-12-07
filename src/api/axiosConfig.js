import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token');
        if (token) {
            token = token.replace(/^"|"$/g, '');
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log("🚀 Enviando Token:", `Bearer ${token.substring(0, 10)}...`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
