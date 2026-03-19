import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserDropdown = ({ isCollapsed }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) return null;

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className={`relative transition-all duration-300 ${isCollapsed ? 'px-0' : 'px-2'}`} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-300 border border-transparent ${isOpen
                        ? 'bg-white/10 border-unamGold/30 shadow-2xl'
                        : 'bg-white/5 hover:bg-white/10 hover:border-unamGold/20'
                    }`}
            >
                <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'mx-auto' : ''}`}>
                    {/* Avatar Circle */}
                    <div className="w-10 h-10 rounded-full bg-unamGold flex items-center justify-center text-unamBlue font-black text-xs shrink-0 shadow-lg border-2 border-unamBlue">
                        {user.username.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    {!isCollapsed && (
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-[10px] font-black text-white tracking-widest truncate w-full text-left uppercase">
                                {user.first_name || user.username}
                            </span>
                            <span className="text-[8px] text-unamGold font-bold truncate w-full text-left uppercase tracking-widest opacity-70">
                                {user.role_name || 'Operador'}
                            </span>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className={`text-unamGold/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} />
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`absolute ${isCollapsed ? 'left-full ml-4' : 'left-2 right-2'} mt-2 bg-unamBlue border border-unamGold/20 rounded-xl shadow-2xl overflow-hidden z-[100] min-w-[180px]`}
                    >
                        <div className="py-2">
                            <NavLink
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-4 text-[10px] font-black tracking-widest uppercase transition-all ${isActive
                                        ? 'bg-unamGold text-unamBlue'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <User size={16} />
                                Mi Perfil
                            </NavLink>

                            <div className="h-px bg-white/5 mx-4 my-2"></div>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-black tracking-widest uppercase text-red-400 hover:bg-red-500/10 transition-all text-left"
                            >
                                <LogOut size={16} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDropdown;
