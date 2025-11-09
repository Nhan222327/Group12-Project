import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users/profile');
            setUser(res.data.user);
        } catch (error) {
            console.error('Fetch profile error:', error);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    // Set token vào axios headers
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            // Lấy thông tin user
            fetchProfile();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const signup = async (name, email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/signup', {
                name,
                email,
                password
            });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, message: res.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Sign up failed' 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, message: res.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        signup,
        login,
        logout,
        fetchProfile,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};