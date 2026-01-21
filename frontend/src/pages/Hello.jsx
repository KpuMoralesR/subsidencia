import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Hello = () => {
    const { api } = useAuth();
    const [message, setMessage] = useState('Cargando...');

    useEffect(() => {
        api.get('/hello/')
            .then(res => setMessage(res.data.message))
            .catch(err => setMessage('Error al cargar mensaje.'));
    }, [api]);
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Módulo de Prueba</h1>
            <div className="p-4 bg-white rounded shadow">
                <p className="text-lg text-gray-700">{message}</p>
            </div>
        </div>
    );
};
export default Hello;