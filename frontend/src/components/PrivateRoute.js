import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('access_token');

    if (!isAuthenticated) {
        return <Navigate to="/register" />; // Redirect to register if not authenticated
    }

    return children;
};

export default PrivateRoute;
