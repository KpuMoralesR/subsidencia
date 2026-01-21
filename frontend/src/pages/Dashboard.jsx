import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Usuarios Totales</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Ingresos Mensuales</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">$45,678</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Soporte Pendiente</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-2">12</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
