// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from "jwt-decode"
import api from "../services/api";



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

    useEffect(() => {
        auth().catch(() => setIsAuthenticated(false))
    }, [])


    const refreshToken = async () => {
        console.log("tich");
        const refreshToken = localStorage.getItem('refresh_token');
        try {
            const res = await api.post("/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem('access_token', res.data.access)
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthenticated(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthenticated(true);
        }
    };

    const login = (token) => {
        localStorage.setItem('access_token', token.access);
        localStorage.setItem('refresh_token', token.refresh);
        setIsAuthenticated(true); // Update state, triggering re-renders
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false); // Update state, triggering re-renders
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;