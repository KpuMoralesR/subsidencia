import React, { useState } from 'react';
import { UserLock, X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(username, password);
        
        if (success) {
            onClose();
            navigate('/dashboard');
        } else {
            setError('Credenciales inválidas. Verifique su ID de Operador y Clave.');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[5000] flex items-center justify-center bg-unamBlue/40 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-[400px] bg-unamBlue border-2 border-unamGold shadow-[0_0_50px_rgba(241,196,0,0.2)] overflow-hidden [clip-path:polygon(5%_0,100%_0,100%_90%,95%_100%,0_100%,0_10%)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center bg-unamBlue/50 border-b border-unamGold/20 px-6 py-4">
                        <h2 className="text-unamGold font-black text-[10px] tracking-widest flex items-center gap-3 uppercase">
                            <UserLock size={16} /> Acceso al Sistema
                        </h2>
                        <button onClick={onClose} className="text-unamGold/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border-l-4 border-red-500 p-3 flex items-center gap-3 text-red-500 text-[9px] font-bold uppercase tracking-widest"
                            >
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-unamGold text-[8px] font-black tracking-[0.3em] uppercase opacity-70">
                                    Identificador de Operador
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-unamBlue/50 border border-unamGold/20 text-white p-3 text-xs focus:outline-none focus:border-unamGold transition-colors placeholder:text-white/10"
                                    placeholder="ID_OPERADOR_UNAM"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-unamGold text-[8px] font-black tracking-[0.3em] uppercase opacity-70">
                                    Clave de Seguridad
                                </label>
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-unamBlue/50 border border-unamGold/20 text-white p-3 text-xs focus:outline-none focus:border-unamGold transition-colors placeholder:text-white/10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="group relative w-full bg-unamGold text-unamBlue font-black py-4 text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all overflow-hidden disabled:bg-gray-600 disabled:text-gray-400"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                {loading ? 'Validando...' : 'Iniciar Secuencia'}
                            </span>
                        </button>

                        <div className="pt-4 border-t border-unamGold/10 flex justify-center">
                            <span className="text-unamGold/30 text-[7px] font-bold tracking-[0.5em] uppercase text-center">
                                Encriptación Estándar UNAM v6.0
                            </span>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginModal;
