import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from './Toast';

export default function AdminRoute({ children }) {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    if (!user) return <Navigate to="/admin-login" replace />;

    if (user.role !== 'admin') {
        toast?.error('Access denied. Admin only.');
        return <Navigate to="/" replace />;
    }
    return children;
}
