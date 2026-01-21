import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './layout/MainLayout';

const ProtectedRoute = () => {
    const { user, tokens } = useAuth();

    if (!tokens) {
        return <Navigate to="/login" replace />;
    }

    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

export default ProtectedRoute;
