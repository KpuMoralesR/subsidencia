import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserDropdown = () => {
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
        <div className="relative px-4 pb-4" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border border-transparent ${isOpen
                        ? 'bg-primary-700 border-primary-600 shadow-lg'
                        : 'bg-primary-900/50 hover:bg-primary-800 hover:border-primary-700'
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Avatar Circle */}
                    <div className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm border-2 border-primary-800">
                        {user.username.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-semibold text-white truncate w-full text-left">
                            {user.first_name || user.username}
                        </span>
                        <span className="text-xs text-secondary-200 truncate w-full text-left uppercase tracking-wider font-medium">
                            {user.role_name || 'Usuario'}
                        </span>
                    </div>
                </div>

                <div className={`text-secondary-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-4 right-4 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    <div className="py-1">
                        <NavLink
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-800 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
                                }`
                            }
                        >
                            <User size={18} />
                            Mi Perfil
                        </NavLink>

                        <div className="h-px bg-gray-100 mx-4 my-1"></div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
