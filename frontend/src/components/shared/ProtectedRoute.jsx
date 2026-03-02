import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps a route so that only authenticated users (those with a token in
 * localStorage) can access it. Everyone else is redirected to /login.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
