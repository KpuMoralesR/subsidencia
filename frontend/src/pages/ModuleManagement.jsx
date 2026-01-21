import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Box, Save, X } from 'lucide-react';
import api from '../services/api';

const ModuleManagement = () => {
    const [modules, setModules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModule, setCurrentModule] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/modules/');
            setModules(response.data);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        }
    };

    const handleOpenModal = (module = null) => {
        if (module) {
            setCurrentModule(module);
            setFormData({
                name: module.name,
                code: module.code,
                description: module.description || ''
            });
        } else {
            setCurrentModule(null);
            setFormData({ name: '', code: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this module?")) {
            try {
                await api.delete(`/modules/${id}/`);
                fetchData();
            } catch (error) {
                console.error("Failed to delete module", error);
                alert("Failed to delete module");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentModule) {
                await api.patch(`/modules/${currentModule.id}/`, formData);
            } else {
                await api.post('/modules/', formData);
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
                <h2 className="text-2xl font-bold text-secondary-900">Module Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-primary-500/20 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Module
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {modules.map(mod => (
                    <div key={mod.id} className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 hover:border-primary-400 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <Box className="w-6 h-6" />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenModal(mod)}
                                    className="p-1 hover:bg-secondary-100 rounded text-secondary-400 hover:text-primary-600 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(mod.id)}
                                    className="p-1 hover:bg-red-50 rounded text-secondary-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 mb-2">{mod.name}</h3>
                        <div className="mb-4">
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded text-xs font-medium font-mono">
                                {mod.code}
                            </span>
                        </div>
                        <p className="text-sm text-secondary-500 line-clamp-2">
                            {mod.description || "No description provided."}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
                            <h3 className="text-lg font-bold text-secondary-900">{currentModule ? 'Edit Module' : 'Create Module'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Module Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Module Code (Unique)</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                                    required
                                    placeholder="e.g., reports"
                                />
                                <p className="text-xs text-secondary-400 mt-1">Used for permission checks in code.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none h-24 resize-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-medium flex items-center shadow-lg shadow-primary-500/20">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleManagement;
