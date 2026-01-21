import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './layout/Sidebar';

const ProtectedRoute = () => {
    const { user, tokens } = useAuth();

    if (!tokens) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default ProtectedRoute;
