import React from 'react';

const __COMPONENT__ = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">__NAME__</h1>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Módulo: <span className="font-mono font-bold">__CODE__</span>
                </p>
                <p className="text-gray-400 mt-2 text-sm">Contenido del módulo en construcción.</p>
            </div>
        </div>
    );
};

export default __COMPONENT__;
