// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));


    const login = (token) => {
        localStorage.setItem('access_token', token.access);
        localStorage.setItem('refresh_token', token.refresh);
        setIsAuthenticated(true); // Update state, triggering re-renders
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setIsAuthenticated(false); // Update state, triggering re-renders
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
