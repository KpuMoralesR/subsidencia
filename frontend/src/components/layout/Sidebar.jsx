import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Shield, UserCircle, Box, BarChart2, Package, Satellite, Globe, Map as MapIcon } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { HillAvalanche } from '../UnamIcons';

const Sidebar = ({ isCollapsed }) => {
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
        <div className={`h-screen bg-unamBlue text-white flex flex-col fixed left-0 top-0 shadow-2xl z-20 border-r border-unamGold/20 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Header del Sidebar */}
            <div className={`p-8 pb-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white/5 border border-unamGold/20 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-md">
                            <HillAvalanche className="text-unamGold w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tighter text-white leading-none uppercase">BaseDR</h2>
                            <p className="text-[9px] text-unamGold font-bold mt-1.5 tracking-[0.2em] uppercase opacity-80">
                                UNAM Subsidencia
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dropdown de Usuario - Visible debajo del logo */}
            <div className={`${isCollapsed ? 'p-2 mt-4' : 'px-4 mb-4'}`}>
                <UserDropdown isCollapsed={isCollapsed} />
            </div>

            {/* Menu Label */}
            {!isCollapsed && (
                <div className="px-6 py-2 mt-2">
                    <span className="text-xs font-semibold text-primary-300 uppercase tracking-widest opacity-80">
                        Menú Principal
                    </span>
                </div>
            )}

            {/* Navegación */}
            <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                ? 'bg-unamGold text-unamBlue font-black shadow-[0_0_20px_rgba(241,196,0,0.3)]'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={18}
                                    className={`transition-all duration-300 flex-shrink-0 ${isActive ? 'text-unamBlue' : 'text-unamGold/40 group-hover:text-unamGold'} ${isCollapsed ? 'mx-auto' : ''}`}
                                    strokeWidth={isActive ? 3 : 2}
                                />
                                {!isCollapsed && <span className="text-[10px] tracking-widest uppercase truncate">{item.name}</span>}
                                {isActive && !isCollapsed && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-unamBlue/20" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer opcional */}
            {!isCollapsed && (
                <div className="p-6 text-center border-t border-white/5">
                    <p className="text-[8px] text-white/20 font-bold tracking-widest uppercase">
                        © 2026 UNAM • SUBSIDENCIA
                    </p>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
