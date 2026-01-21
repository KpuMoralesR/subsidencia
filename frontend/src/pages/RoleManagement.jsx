import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Shield, Save, X } from 'lucide-react';
import api from '../services/api';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', module_ids: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, modulesRes] = await Promise.all([
                api.get('/roles/'),
                api.get('/modules/')
            ]);
            setRoles(rolesRes.data);
            setModules(modulesRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setFormData({
                name: role.name,
                module_ids: role.modules.map(m => m.id)
            });
        } else {
            setCurrentRole(null);
            setFormData({ name: '', module_ids: [] });
        }
        setIsModalOpen(true);
    };

    const handleModuleToggle = (moduleId) => {
        const currentIds = [...formData.module_ids];
        if (currentIds.includes(moduleId)) {
            setFormData({ ...formData, module_ids: currentIds.filter(id => id !== moduleId) });
        } else {
            setFormData({ ...formData, module_ids: [...currentIds, moduleId] });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                await api.delete(`/roles/${id}/`);
                fetchData();
            } catch (error) {
                console.error("Failed to delete role", error);
                alert("Failed to delete role");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await api.patch(`/roles/${currentRole.id}/`, formData);
            } else {
                await api.post('/roles/', formData);
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
                <h2 className="text-2xl font-bold text-secondary-900">Role Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-primary-500/20 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 hover:border-primary-400 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenModal(role)}
                                    className="p-1 hover:bg-secondary-100 rounded text-secondary-400 hover:text-primary-600 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="p-1 hover:bg-red-50 rounded text-secondary-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 mb-2">{role.name}</h3>
                        <p className="text-sm text-secondary-500 mb-4">Access Level</p>
                        <div className="flex flex-wrap gap-2">
                            {role.modules && role.modules.map((mod) => (
                                <span key={mod.id} className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded text-xs font-medium">
                                    {mod.name}
                                </span>
                            ))}
                            {(!role.modules || role.modules.length === 0) && <span className="text-xs text-secondary-400 italic">No modules assigned</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
                            <h3 className="text-lg font-bold text-secondary-900">{currentRole ? 'Edit Role' : 'Create Role'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Access Modules</label>
                                <div className="space-y-2 border border-secondary-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {modules.map(mod => (
                                        <div key={mod.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`mod_${mod.id}`}
                                                checked={formData.module_ids.includes(mod.id)}
                                                onChange={() => handleModuleToggle(mod.id)}
                                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4 mr-2"
                                            />
                                            <label htmlFor={`mod_${mod.id}`} className="text-sm text-secondary-700 select-none cursor-pointer">
                                                {mod.name} <span className="text-xs text-secondary-400 ml-1">({mod.code})</span>
                                            </label>
                                        </div>
                                    ))}
                                    {modules.length === 0 && <p className="text-sm text-secondary-400">No modules available.</p>}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-medium flex items-center shadow-lg shadow-primary-500/20">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
