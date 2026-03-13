import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const __COMPONENT__ = () => {
    const { api } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/__PATH_SLUG__/');
            setItems(res.data);
            setError('');
        } catch (err) {
            setError('Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (currentItem) {
                await api.put(`/__PATH_SLUG__/${currentItem.id}/`, form);
            } else {
                await api.post('/__PATH_SLUG__/', form);
            }
            fetchData();
            setIsModalOpen(false);
            setForm({ name: '', description: '' });
            setCurrentItem(null);
        } catch (err) {
            setError('Error al guardar.');
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setForm({ name: item.name, description: item.description || '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Confirma eliminar este registro?')) {
            await api.delete(`/__PATH_SLUG__/${id}/`);
            fetchData();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">__NAME__</h1>
                <button
                    onClick={() => { setCurrentItem(null); setForm({ name: '', description: '' }); setIsModalOpen(true); }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus size={20} />
                    <span>Nuevo</span>
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center">Cargando...</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.description}</td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {currentItem ? 'Editar' : 'Nuevo'} registro
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 resize-none" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
                                <Save size={18} className="mr-2" /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default __COMPONENT__;
