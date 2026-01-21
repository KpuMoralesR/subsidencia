import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Shield, Settings, FileBarChart, LogOut, Hand } from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useAuth();

    // Mock logic for determining roles/modules, ideally this comes from 'user' object
    // For now, we show all if no roles defined (or just for demo)
    // In real implementation, check: user.role.modules.includes('MODULE_CODE')

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', code: 'DASHBOARD' },
        { name: 'Usuarios', icon: Users, path: '/users', code: 'USERS' },
        { name: 'Roles', icon: Shield, path: '/roles', code: 'ROLES' },
        { name: 'Reportes', icon: FileBarChart, path: '/reports', code: 'REPORTS' },
        { name: 'Configuración', icon: Settings, path: '/settings', code: 'SETTINGS' },
        { name: 'Hola', icon: Hand, path: '/hello', code: 'HELLO' },
    ];

    // Filter menu items based on user permissions
    // Superusers usually have all permissions, but data payload usually reflects that in module_codes or we check is_superuser

    const filteredItems = menuItems.filter(item => {
        if (!user) return false;
        if (user.is_superuser) return true;

        // Ensure user.module_codes exists (array of strings like 'DASHBOARD', 'USERS', etc.)
        return user.module_codes?.includes(item.code);
    });

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-wider">BaseDR</h2>
                <p className="text-xs text-gray-400 mt-1">Enterprise Edition</p>
                {user && <p className="text-xs text-gray-500 mt-4 capitalize">Hola, {user.username}</p>}
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
