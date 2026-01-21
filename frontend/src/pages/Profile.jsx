import { useEffect, useState } from 'react';
import { User, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { api } = useAuth();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role_name: '',
        module_codes: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Cargar perfil al montar el componente
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/profile/');
            setProfile(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar el perfil');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            // Solo enviar campos editables
            const updateData = {
                username: profile.username,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name
            };

            const response = await api.patch('/users/profile/', updateData);
            setProfile(response.data);
            setSuccess(true);

            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar el perfil');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-gray-600">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-8 h-8" />
                    Mi Perfil
                </h1>
                <p className="text-gray-600 mt-1">
                    Actualiza tu información personal
                </p>
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Perfil actualizado exitosamente
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de edición */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Información Personal
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de Usuario
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Botón Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition ${saving
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Información de solo lectura */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Información del Sistema
                        </h2>

                        <div className="space-y-4">
                            {/* Rol */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Rol Asignado
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span className="text-gray-800 font-medium">
                                        {profile.role_name}
                                    </span>
                                </div>
                            </div>

                            {/* Módulos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Módulos Permitidos
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                    {profile.module_codes && profile.module_codes.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.module_codes.map((code, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                                >
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">
                                            Sin módulos asignados
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Nota informativa */}
                            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    <strong>Nota:</strong> El rol y los módulos son asignados por un administrador y no pueden ser modificados desde aquí.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
