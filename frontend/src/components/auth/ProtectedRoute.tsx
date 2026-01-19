import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

interface ProtectedRoutesProps {
    allowedRoles?: string[];
}

export const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
    const { user } = useAuth();
    const location = useLocation();
    
    const storedUserString = localStorage.getItem('user_data');
    const currentUser = user || (storedUserString ? JSON.parse(storedUserString) : null);

    let token = localStorage.getItem('token');
    
    if (!token && currentUser?.token) {
        token = currentUser.token;
    }

    if (!currentUser || !token || token === "undefined" || token === "null") {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/search" replace />;
    }

    return <Outlet />;
};