import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on mount
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token) {
            // Optimistically set authenticaticated if token exists
            // In a real app, you might want to validate the token with an API call here
            setIsAuthenticated(true);
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error("Error parsing saved user", e);
                }
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            // Post to backend
            const response = await api.post('/auth/login', credentials);

            // Assume response structure: { token: "...", ...userData } or { token: "...", user: {...} }
            // Adjust based on your actual Backend response. 
            // Common pattern: response.data = { token: "JwtString", email: "...", name: "..." }

            const { token, ...userData } = response.data;

            // If the backend puts user data in a 'user' object:
            const userToSave = userData.user || userData;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userToSave));

            setUser(userToSave);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Re-throw to be handled by the UI (LoginPage)
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);

            // Assume response structure same as login: { token: "...", ...userData }
            const { token, ...data } = response.data;
            const userToSave = data.user || data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userToSave));

            setUser(userToSave);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
