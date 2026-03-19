import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SatelliteDish, Microchip, ArrowRight, UserLock, House, Map as MapIcon, Accessibility } from 'lucide-react';
import { HillAvalanche, ShieldHalfway } from '../components/UnamIcons';
import LoginModal from '../components/LoginModal';
import AccessibilityMenu from '../components/AccessibilityMenu';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-unamGold selection:text-unamBlue">
            {/* Navbar HUD */}
            <nav className="fixed top-0 left-0 w-full h-[60px] bg-unamBlue/85 backdrop-blur-md border-b-2 border-unamGold z-[4000] flex items-center px-4 md:px-8 text-white [clip-path:polygon(0_0,100%_0,100%_80%,98%_100%,2%_100%,0_80%)]">
                <div className="flex justify-between items-center w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 font-black tracking-widest text-[14px]">
                        <HillAvalanche className="text-unamGold w-6 h-6" />
                        <span>UNAM <span className="text-unamGold font-light">SUBSIDENCIA</span></span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex gap-8">
                        <Link to="/" className="text-unamGold text-[10px] font-extrabold tracking-widest flex items-center gap-2 hover:text-unamGold hover:drop-shadow-[0_0_10px_rgba(241,196,0,0.5)] transition-all">
                            <House size={14} /> INICIO
                        </Link>
                        <Link to="/map" className="text-white/70 text-[10px] font-extrabold tracking-widest flex items-center gap-2 hover:text-unamGold hover:drop-shadow-[0_0_10px_rgba(241,196,0,0.5)] transition-all">
                            <MapIcon size={14} /> MAPA
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setLoginModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-unamGold text-unamBlue font-black text-[10px] tracking-widest rounded skew-x-[-15deg] hover:bg-white transition-all transition-transform"
                        >
                            <span className="skew-x-[15deg] flex items-center gap-2">
                                <UserLock size={12} /> LOGIN
                            </span>
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-[#10b981] text-[9px] font-bold">
                            <span className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main id="landingPage" className="relative pt-[60px] min-h-screen bg-white flex flex-col items-center justify-center p-8 overflow-hidden border-t-4 border-unamGold">
                {/* Background effects */}
                <div className="absolute top-0 left-0 w-full h-8 bg-unamBlue/5"></div>
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="w-full h-[2px] bg-unamBlue/5 absolute z-50 animate-[scan_4s_linear_infinite]"></div>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl text-center space-y-12 z-10"
                >
                    <div className="inline-block px-4 py-1 bg-unamBlue text-unamGold text-[10px] tracking-[0.5em] uppercase mb-4 font-black shadow-lg">
                        Sistema de Vigilancia Geotécnica v6.0
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black text-unamBlue italic tracking-tighter uppercase leading-none [text-shadow:0_0_30px_rgba(0,59,92,0.1)]">
                        ANÁLISIS DE <span className="text-unamGold">SUBSIDENCIA</span>
                    </h1>

                    <p className="text-unamBlue/60 font-mono text-xs md:text-sm tracking-[0.3em] uppercase max-w-2xl mx-auto leading-loose">
                        Plataforma Táctica de Monitoreo Diferencial por Satélite y Modelado de Deformación de Suelos • CDMX
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
                        <div className="bg-unamBlue/5 border-l-2 border-unamGold p-6 backdrop-blur-md hover:bg-unamBlue/10 transition-all cursor-default">
                            <SatelliteDish className="w-8 h-8 text-unamGold mb-4" />
                            <h3 className="text-unamBlue font-black text-xs tracking-widest uppercase mb-2">Precisión InSAR</h3>
                            <p className="text-unamBlue/40 text-[9px] leading-relaxed uppercase">Resolución milimétrica mediante interferometría de radar satelital persistente.</p>
                        </div>
                        <div className="bg-unamBlue/5 border-l-2 border-unamGold p-6 backdrop-blur-md hover:bg-unamBlue/10 transition-all cursor-default">
                            <Microchip className="w-8 h-8 text-unamGold mb-4" />
                            <h3 className="text-unamBlue font-black text-xs tracking-widest uppercase mb-2">Motor de Análisis</h3>
                            <p className="text-unamBlue/40 text-[9px] leading-relaxed uppercase">Procesamiento cinemático de datos masivos para la detección de anomalías locales.</p>
                        </div>
                        <div className="bg-white border-2 border-unamBlue/10 border-l-unamGold p-6 backdrop-blur-md hover:shadow-xl transition-all cursor-default">
                            <ShieldHalfway className="w-8 h-8 text-unamGold mb-4" />
                            <h3 className="text-unamBlue font-black text-xs tracking-widest uppercase mb-2">Seguridad Civil</h3>
                            <p className="text-unamBlue/40 text-[9px] leading-relaxed uppercase">Protocolos de alerta temprana y mitigación de riesgos estructurales urbanos.</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16">
                        <button 
                            onClick={() => navigate('/map')}
                            className="group relative px-12 py-5 bg-unamBlue text-white font-black text-xs tracking-[0.4em] uppercase hover:bg-unamGold hover:text-unamBlue transition-all overflow-hidden shadow-[0_0_30px_rgba(0,59,92,0.1)]"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                INICIAR OPERACIÓN MAPPING <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <div className="absolute inset-0 bg-unamGold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Accessibility Button */}
            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            <AccessibilityMenu />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}} />
        </div>
    );
};

export default LandingPage;
