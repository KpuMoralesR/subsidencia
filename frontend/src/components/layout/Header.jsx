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

                {/* UNAM Logo Mini */}
                <div className="flex items-center gap-3">
                    <HillAvalanche className="text-unamGold w-8 h-8 drop-shadow-[0_0_8px_rgba(241,196,0,0.4)]" />
                    <div className="flex flex-col">
                        <span className="text-white font-black text-[10px] tracking-[0.3em] leading-none uppercase">BaseDR</span>
                        <span className="text-unamGold font-bold text-[8px] tracking-[0.2em] uppercase opacity-80 mt-1">UNAM Subsidencia</span>
                    </div>
                </div>

                <div className="h-6 w-[2px] bg-white/10 mx-2"></div>

                <div className="hidden lg:flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[8px] font-black text-white/40 tracking-widest uppercase italic">Sistema Operativo Conectado</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Quick actions? */}
                <div className="hidden md:flex items-center gap-4 text-white/40">
                    <button className="hover:text-unamGold transition-colors"><Search size={16} /></button>
                    <button className="hover:text-unamGold transition-colors"><Bell size={16} /></button>
                    <button className="hover:text-unamGold transition-colors"><Settings size={16} /></button>
                </div>

                <div className="h-6 w-[1px] bg-white/10"></div>

                <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col">
                        <span className="text-white font-black text-[10px] tracking-widest uppercase">{user?.username || 'USUARIO_UNAM'}</span>
                        <span className="text-unamGold font-bold text-[8px] tracking-widest uppercase opacity-70">ADMIN_R_SUBS</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
