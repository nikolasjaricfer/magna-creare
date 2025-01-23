// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));


    const login = (token) => {
        localStorage.setItem('access_token', token.access);
        localStorage.setItem('refresh_token', token.refresh);
        setIsAuthenticated(true); // Update state, triggering re-renders
    };

    const logout = async () => {
        const token = localStorage.getItem('token');
        await api.post('api/logout/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('appliedQuizzes');
        localStorage.removeItem('myLat');
        localStorage.removeItem('myLng');
        setIsAuthenticated(false); // Update state, triggering re-renders
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
