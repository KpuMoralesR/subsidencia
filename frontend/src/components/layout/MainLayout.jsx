import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-unamBlue selection:bg-unamGold selection:text-unamBlue">
            {/* Sidebar Fixed */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
                <Sidebar isCollapsed={isCollapsed} />
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col h-screen w-full transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-72'}`}>
                <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
                    {/* Visual decoration */}
                    <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-unamBlue/5 to-transparent pointer-events-none"></div>
                    
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
