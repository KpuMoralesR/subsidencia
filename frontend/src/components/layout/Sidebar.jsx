import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Shield, UserCircle, Box, BarChart2, Package } from 'lucide-react';
import UserDropdown from './UserDropdown';

const Sidebar = () => {
    const { user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', code: 'DASHBOARD' },
        { name: 'Usuarios', icon: Users, path: '/users', code: 'USERS' },
        { name: 'Roles', icon: Shield, path: '/roles', code: 'ROLES' },
        { name: 'Perfil', icon: UserCircle, path: '/profile', code: 'PROFILE' },
        { name: 'Módulo de Prueba', icon: Box, path: '/modules', code: 'PRUEBA' },
        { name: 'Reportes', icon: BarChart2, path: '/reports', code: 'REPORTES' },
        { name: 'Inventario', icon: Package, path: '/inventario', code: 'INVENTARIO' },
    ];

    const filteredItems = menuItems.filter(item => {
        if (!user) return false;
        if (user.is_superuser) return true;
        return user.module_codes?.includes(item.code);
    });

    return (
        <div className="h-screen w-72 bg-primary-800 text-white flex flex-col fixed left-0 top-0 shadow-2xl z-20 sidebar-gradient border-r border-primary-900">
            {/* Header del Sidebar */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
                        <span className="font-bold text-xl tracking-tighter text-secondary-400">dr</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white leading-none">BaseDR</h2>
                        <p className="text-[10px] text-primary-200 mt-0.5 tracking-wider uppercase font-medium opacity-80">
                            Enterprise Edition
                        </p>
                    </div>
                </div>
            </div>

            {/* Dropdown de Usuario - Visible debajo del logo */}
            <UserDropdown />

            {/* Menu Label */}
            <div className="px-6 py-2 mt-2">
                <span className="text-xs font-semibold text-primary-300 uppercase tracking-widest opacity-80">
                    Menú Principal
                </span>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
                                ? 'bg-secondary-500 text-white font-medium shadow-md'
                                : 'text-primary-100 hover:bg-primary-700 hover:text-white hover:pl-5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={20}
                                    className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span>{item.name}</span>
                                {isActive && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer opcional */}
            <div className="p-4 text-center">
                <p className="text-[10px] text-primary-300 opacity-60">
                    © 2026 Gobierno de México
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
