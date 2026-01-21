import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

const Roles = () => {
    const { api } = useAuth();
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState({ name: '', modules: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoles();
        fetchModules();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles/');
            setRoles(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error al cargar roles. Verifique permisos.');
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await api.get('/modules/');
            setModules(response.data);
        } catch (err) {
            console.error("Error loading modules", err);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setCurrentRole({
                id: role.id,
                name: role.name,
                modules: role.modules.map(m => m.id) // backend returns full objects, we need IDs for editing
            });
            setIsEditing(true);
        } else {
            setCurrentRole({ name: '', modules: [] });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRole({ name: '', modules: [] });
        setError('');
    };

    const handleModuleToggle = (moduleId) => {
        const currentModules = currentRole.modules;
        if (currentModules.includes(moduleId)) {
            setCurrentRole({ ...currentRole, modules: currentModules.filter(id => id !== moduleId) });
        } else {
            setCurrentRole({ ...currentRole, modules: [...currentModules, moduleId] });
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: currentRole.name,
                module_ids: currentRole.modules
            };

            if (isEditing) {
                await api.put(`/roles/${currentRole.id}/`, payload);
            } else {
                await api.post('/roles/', payload);
            }
            fetchRoles();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving role", err);
            setError('Error al guardar el rol. Revise los datos.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este rol?')) {
            try {
                await api.delete(`/roles/${id}/`);
                fetchRoles();
            } catch (err) {
                console.error("Error deleting role", err);
                setError('Error al eliminar. Puede que esté asignado a usuarios.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Roles</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus size={20} />
                    <span>Nuevo Rol</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Role List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulos Acceso</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center">Cargando...</td></tr>
                        ) : roles.map((role) => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {role.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-wrap gap-2">
                                        {role.modules && role.modules.map(m => (
                                            <span key={m.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(role)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Rol</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={currentRole.name}
                                    onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permisos (Módulos)</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded dark:border-gray-600">
                                    {modules.map((mod) => (
                                        <div key={mod.id} className="flex items-center">
                                            <input
                                                id={`mod-${mod.id}`}
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={currentRole.modules.includes(mod.id)}
                                                onChange={() => handleModuleToggle(mod.id)}
                                            />
                                            <label htmlFor={`mod-${mod.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                                {mod.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
