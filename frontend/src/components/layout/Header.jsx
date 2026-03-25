import React from 'react';
import { Menu, Bell, User, Search, Settings } from 'lucide-react';
import { HillAvalanche } from '../UnamIcons';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar, isCollapsed }) => {
    const { user } = useAuth();

    return (
        <header className="bg-unamBlue border-b-2 border-unamGold h-[70px] flex items-center justify-between px-8 z-40 shadow-xl [clip-path:polygon(0_0,100%_0,100%_90%,98%_100%,2%_100%,0_90%)] relative">
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-unamGold hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title={isCollapsed ? "Expandir Menú" : "Colapsar Menú"}
                >
                    <Menu size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
