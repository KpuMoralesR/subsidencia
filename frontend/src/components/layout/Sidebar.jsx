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
        { name: 'Mapa', icon: Satellite, path: '/mapa', code: 'MAPA' },
        { name: 'Análisis', icon: MapIcon, path: '/analisis', code: 'ANALISIS' },
        { name: 'Inventario', icon: Package, path: '/inventario', code: 'INVENTARIO' },
        { name: 'Usuarios', icon: Users, path: '/users', code: 'USERS' },
        { name: 'Roles', icon: Shield, path: '/roles', code: 'ROLES' },
        { name: 'Perfil', icon: UserCircle, path: '/profile', code: 'PROFILE' },
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
                <div className="px-3 mb-6">
                    <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Administración</p>
                    <nav className="space-y-1">
                        <NavItem to="/users" icon={Users} label="Usuarios" />
                        <NavItem to="/roles" icon={Shield} label="Roles" />
                        <NavItem to="/modules" icon={Box} label="Módulos" />
                    </nav>
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
