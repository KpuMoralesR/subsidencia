import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="bg-primary-800 shadow-md h-16 flex items-center justify-between px-6 z-10 border-b border-primary-900">
            <div className="flex items-center gap-4">
                {/* Mobile sidebar toggle - visible only on small screens if we implement responsivness later */}
                {/* <button onClick={toggleSidebar} className="text-white md:hidden">
                    <Menu size={24} />
                </button> */}

                {/* Logos Institucionales Placeholders */}
                <div className="flex items-center gap-4">
                    {/* Logo Gobierno */}
                    <div className="flex flex-col">
                        <span className="text-white font-serif text-lg leading-tight">Gobierno de</span>
                        <span className="text-white font-bold text-lg leading-tight">México</span>
                    </div>

                    <div className="h-8 w-px bg-primary-600 mx-2"></div>

                    {/* Logo CNE */}
                    <div className="flex items-center gap-2">
                        {/* Placeholder icon CNE */}
                        <div className="text-secondary-500 font-bold text-2xl tracking-tighter">
                            CNE
                        </div>
                        <span className="text-white text-xs max-w-[100px] leading-tight hidden md:block opacity-80">
                            Comisión Nacional de Energía
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Right side content - search, notifications etc can go here */}
                <div className="text-white text-sm opacity-80 italic">
                    Sistema de Gestión
                </div>
            </div>
        </header>
    );
};

export default Header;
