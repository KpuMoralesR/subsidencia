import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Save, UserCheck, UserX } from 'lucide-react';

const Users = () => {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        username: '',
        email: '',
        role: '',
        password: '',
        is_active: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/');
            setUsers(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error al cargar usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles/');
            setRoles(response.data);
        } catch (err) {
            console.error("Error loading roles", err);
        }
    };

    const handleOpenModal = (user = null) => {
        setError('');
        if (user) {
            setCurrentUser({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role, // Assuming backend sends role ID or we map it
                is_active: user.is_active,
                password: '' // Password empty on edit unless changing
            });
            setIsEditing(true);
        } else {
            setCurrentUser({
                username: '',
                email: '',
                role: roles.length > 0 ? roles[0].id : '',
                password: '',
                is_active: true
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser({ username: '', email: '', role: '', password: '', is_active: true });
    };

    const handleSave = async () => {
        try {
            if (!currentUser.username || !currentUser.role) {
                setError('Usuario y Rol son obligatorios.');
                return;
            }

            // Construct payload
            const payload = {
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role, // Expecting ID here
                is_active: currentUser.is_active
            };

            // Only add password if it's set (mandatory for create, optional for update)
            if (currentUser.password) {
                payload.password = currentUser.password;
            } else if (!isEditing) {
                setError('La contraseña es obligatoria para nuevos usuarios.');
                return;
            }

            if (isEditing) {
                await api.patch(`/users/${currentUser.id}/`, payload);
            } else {
                await api.post('/users/', payload);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving user", err);
            // Show more detailed error from backend if available
            if (err.response && err.response.data) {
                const msg = Object.values(err.response.data).flat().join(' ');
                setError(`Error: ${msg}`);
            } else {
                setError('Error al guardar usuario.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                await api.delete(`/users/${id}/`);
                fetchUsers();
            } catch (err) {
                console.error("Error deleting user", err);
                setError('Error al eliminar usuario.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Usuarios</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus size={20} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* User List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Cargando...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {user.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                        {user.role_name || 'Sin Rol'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user.is_active ?
                                        <span className="text-green-600 flex items-center"><UserCheck size={16} className="mr-1" /> Activo</span> :
                                        <span className="text-red-500 flex items-center"><UserX size={16} className="mr-1" /> Inactivo</span>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(user)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    {!user.is_superuser && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
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
                                {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={currentUser.username}
                                    onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                                    disabled={isEditing} // Often good practice not to change username, but optional
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={currentUser.role}
                                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                >
                                    <option value="">Seleccione un Rol</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={currentUser.password}
                                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                                    placeholder={isEditing ? "Dejar en blanco para no cambiar" : "********"}
                                />
                            </div>

                            <div className="flex items-center mt-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={currentUser.is_active}
                                    onChange={(e) => setCurrentUser({ ...currentUser, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    Usuario Activo
                                </label>
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

export default Users;
