import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, X, Save, Lock } from 'lucide-react';
import api from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // If null, creating new user
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: '', is_active: true });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/users/');
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }

        try {
            const rolesRes = await api.get('/roles/');
            setRoles(rolesRes.data);
        } catch (error) {
            console.error("Failed to fetch roles (likely permission denied)", error);
            // Non-critical: we just won't be able to edit roles if we can't fetch them
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Don't show existing password
                role: user.role || '',
                is_active: user.is_active
            });
        } else {
            setCurrentUser(null);
            setFormData({ username: '', email: '', password: '', role: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/users/${id}/`);
                fetchData();
            } catch (error) {
                console.error("Failed to delete user", error);
                alert("Failed to delete user");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password; // Don't send empty password on edit

            if (currentUser) {
                await api.patch(`/users/${currentUser.id}/`, dataToSend);
            } else {
                await api.post('/users/', dataToSend);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Operation failed", error);
            alert("Operation failed");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">User Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-primary-500/20 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="p-4 border-b border-secondary-200 bg-secondary-50 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary-50 text-secondary-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold mr-3">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-secondary-900">{user.username}</div>
                                            <div className="text-xs text-secondary-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary-200 text-secondary-700">
                                        {user.role_name || 'No Role'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleOpenModal(user)}
                                        className="text-secondary-400 hover:text-primary-600 mr-3 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-secondary-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="p-8 text-center text-secondary-500">No users found.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
                            <h3 className="text-lg font-bold text-secondary-900">{currentUser ? 'Edit User' : 'Create User'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Password {currentUser && <span className="text-xs text-secondary-400 font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required={!currentUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4 mr-2"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-secondary-700">Active Account</label>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-medium flex items-center shadow-lg shadow-primary-500/20">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
