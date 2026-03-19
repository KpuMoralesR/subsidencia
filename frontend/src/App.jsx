import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PublicMap from './pages/PublicMap';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Users from './pages/Users';
import Roles from './pages/Roles';
import Profile from './pages/Profile';
import ModuleManagement from './pages/ModuleManagement';

import Reports from './pages/Reports';

import Inventario from './pages/Inventario';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/map" element={<PublicMap />} />

                    {/* Protected Routes Wrapper */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/modules" element={<ModuleManagement />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/inventario" element={<Inventario />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
