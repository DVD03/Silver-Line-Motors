import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    return children;
}
