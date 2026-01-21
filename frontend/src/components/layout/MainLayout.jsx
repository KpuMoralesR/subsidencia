import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-secondary-50 overflow-hidden font-sans text-gray-800">
            {/* Sidebar Fixed - Width 72 (18rem) matches Sidebar component */}
            <div className="fixed inset-y-0 left-0 z-50 w-72">
                <Sidebar />
            </div>

            {/* Main Content Area - Padding Left 72 to account for fixed Sidebar */}
            <div className="flex-1 flex flex-col pl-72 h-screen w-full transition-all duration-300">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative">
                    {/* Background decoration optional */}
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
