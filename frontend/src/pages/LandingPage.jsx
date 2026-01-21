import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold mb-4">Bienvenido a BaseDR</h1>
            <p className="text-xl text-gray-400 mb-8">Plataforma Empresarial Segura</p>
            <div className="space-x-4">
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200">
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
