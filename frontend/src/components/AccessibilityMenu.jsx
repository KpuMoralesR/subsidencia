import React, { useState, useEffect } from 'react';
import { Accessibility, X, Maximize2, Minimize2, Type, Contrast, Sun, Eye, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AccessibilityMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [grayscale, setGrayscale] = useState(false);
    const [fontSize, setFontSize] = useState(1); // 1 = 100%
    const [readingGuide, setReadingGuide] = useState(false);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.style.filter = 'contrast(1.5) invert(0.1)';
            root.classList.add('high-contrast');
        } else {
            root.style.filter = grayscale ? 'grayscale(1)' : 'none';
            root.classList.remove('high-contrast');
        }
        
        if (grayscale && !highContrast) {
            root.style.filter = 'grayscale(1)';
        } else if (!highContrast) {
            root.style.filter = 'none';
        }

        root.style.fontSize = `${fontSize * 100}%`;
    }, [highContrast, grayscale, fontSize]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (readingGuide) {
                setMouseY(e.clientY);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [readingGuide]);

    const reset = () => {
        setHighContrast(false);
        setGrayscale(false);
        setFontSize(1);
        setReadingGuide(false);
    };

    return (
        <>
            {/* Reading Guide Overlay */}
            <AnimatePresence>
                {readingGuide && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        pointerEvents="none"
                        style={{ top: mouseY }}
                        className="fixed left-0 w-full h-1 bg-unamGold/50 z-[9999] shadow-[0_0_20px_rgba(241,196,0,0.8)] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Accessibility Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[5000] w-12 h-12 bg-unamBlue border-2 border-unamGold text-unamGold rounded-full shadow-lg hover:bg-unamBlue/80 transition-all flex items-center justify-center text-xl"
                title="Accesibilidad"
            >
                {isOpen ? <X /> : <Accessibility />}
            </button>

            {/* Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-20 right-6 z-[5000] w-64 bg-unamBlue border-2 border-unamGold shadow-2xl p-6 flex flex-col gap-4 [clip-path:polygon(5%_0,100%_0,100%_95%,95%_100%,0_100%,0_5%)]"
                    >
                        <h3 className="text-unamGold font-black text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
                            <Accessibility size={14} /> Accesibilidad
                        </h3>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <label className="text-white/60 text-[8px] font-black tracking-widest uppercase">Tamaño de Fuente</label>
                            <div className="flex gap-2">
                                <button onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))} className="flex-1 bg-unamBlue/50 border border-unamGold/20 text-unamGold p-2 text-xs hover:border-unamGold transition-colors">-</button>
                                <button className="flex-1 bg-unamBlue/50 border border-unamGold/20 text-white p-2 text-[10px] font-bold">{(fontSize * 100).toFixed(0)}%</button>
                                <button onClick={() => setFontSize(Math.min(2, fontSize + 0.1))} className="flex-1 bg-unamBlue/50 border border-unamGold/20 text-unamGold p-2 text-xs hover:border-unamGold transition-colors">+</button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 gap-2">
                            <button 
                                onClick={() => setHighContrast(!highContrast)}
                                className={`flex items-center gap-3 px-4 py-3 border transition-all text-left ${highContrast ? 'bg-unamGold text-unamBlue border-unamGold' : 'bg-unamBlue/30 text-white/70 border-white/10 hover:border-unamGold/40'}`}
                            >
                                <Contrast size={14} /> <span className="text-[9px] font-bold tracking-widest uppercase">Alto Contraste</span>
                            </button>

                            <button 
                                onClick={() => setGrayscale(!grayscale)}
                                className={`flex items-center gap-3 px-4 py-3 border transition-all text-left ${grayscale ? 'bg-unamGold text-unamBlue border-unamGold' : 'bg-unamBlue/30 text-white/70 border-white/10 hover:border-unamGold/40'}`}
                            >
                                <Eye size={14} /> <span className="text-[9px] font-bold tracking-widest uppercase">Escala de Grises</span>
                            </button>

                            <button 
                                onClick={() => setReadingGuide(!readingGuide)}
                                className={`flex items-center gap-3 px-4 py-3 border transition-all text-left ${readingGuide ? 'bg-unamGold text-unamBlue border-unamGold' : 'bg-unamBlue/30 text-white/70 border-white/10 hover:border-unamGold/40'}`}
                            >
                                <MousePointer2 size={14} /> <span className="text-[9px] font-bold tracking-widest uppercase">Guía de Lectura</span>
                            </button>
                        </div>

                        <button 
                            onClick={reset}
                            className="w-full mt-2 py-2 border-t border-unamGold/20 text-unamGold/40 hover:text-unamGold text-[8px] font-black tracking-[0.3em] uppercase transition-colors"
                        >
                            Resetear Ajustes
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AccessibilityMenu;
