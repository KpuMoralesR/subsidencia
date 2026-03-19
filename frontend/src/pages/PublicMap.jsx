import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as turf from '@turf/turf';
import { 
    House, Map as MapIcon, Layers, ChartLine, 
    UserLock, Box, BarChart2, Settings, Users, Shield, 
    FileText, Bell, Wrench, Star, Globe, Database, Package, 
    Accessibility, X, Minus, BoxSelect, Trash2, Upload,
    Pencil, MousePointer2, Circle, Square, Type, RotateCcw,
    Satellite, MapPin, BarChart, Clock
} from 'lucide-react';
import { HillAvalanche, ShieldHalfway } from '../components/UnamIcons';
import LoginModal from '../components/LoginModal';
import AccessibilityMenu from '../components/AccessibilityMenu';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(...registerables);

// Mock Data
const subsidenceData = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "name": "Iztapalapa (Centro)", "rate": 38, "risk": "Critical" }, "geometry": { "type": "Polygon", "coordinates": [[[-99.08, 19.34], [-99.05, 19.34], [-99.05, 19.37], [-99.08, 19.37], [-99.08, 19.34]]] } },
        { "type": "Feature", "properties": { "name": "Zócalo / Centro Histórico", "rate": 25, "risk": "High" }, "geometry": { "type": "Polygon", "coordinates": [[[-99.14, 19.42], [-99.12, 19.42], [-99.12, 19.44], [-99.14, 19.44], [-99.14, 19.42]]] } },
        { "type": "Feature", "properties": { "name": "Aeropuerto (AICM)", "rate": 32, "risk": "Critical" }, "geometry": { "type": "Polygon", "coordinates": [[[-99.09, 19.42], [-99.05, 19.42], [-99.05, 19.45], [-99.09, 19.45], [-99.09, 19.42]]] } },
        { "type": "Feature", "properties": { "name": "Tláhuac", "rate": 29, "risk": "High" }, "geometry": { "type": "Polygon", "coordinates": [[[-99.03, 19.28], [-98.99, 19.28], [-98.99, 19.31], [-99.03, 19.31], [-99.03, 19.28]]] } }
    ]
};

// Radial Menu Configuration
const CATEGORIES = [
    { name: "DIBUJO", icon: Pencil, color: "#F1C400", sub: [{ n: "Línea", i: Type, a: "polyline" }, { n: "Poli", i: BoxSelect, a: "polygon" }, { n: "Circ", i: Circle, a: "circle" }] },
    { name: "CAPAS", icon: Globe, color: "#0ea5e9", sub: [{ n: "Sat", i: Satellite, a: "sat" }, { n: "Calles", i: MapIcon, a: "streets" }] },
    { name: "STATS", icon: BarChart, color: "#f97316", sub: [{ n: "Temp", i: Clock, a: "temporal" }, { n: "Prof", i: ChartLine, a: "perfil" }] },
    { name: "UNAM", icon: RotateCcw, color: "#10b981", sub: [{ n: "Up", i: Upload, a: "upload" }, { n: "Reset", i: RotateCcw, a: "reset" }] }
];

const polarToCartesian = (x, y, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180.0;
    return { x: x + (r * Math.cos(rad)), y: y + (r * Math.sin(rad)) };
};

const createPath = (x, y, ri, ro, s, e) => {
    const sI = polarToCartesian(x, y, ri, e), eI = polarToCartesian(x, y, ri, s);
    const sO = polarToCartesian(x, y, ro, e), eO = polarToCartesian(x, y, ro, s);
    const largeArc = e - s > 180 ? 1 : 0;
    return ["M", sI.x, sI.y, "L", sO.x, sO.y, "A", ro, ro, 0, largeArc, 0, eO.x, eO.y, "L", eI.x, eI.y, "A", ri, ri, 0, largeArc, 1, sI.x, sI.y, "Z"].join(" ");
};

const PublicMap = () => {
    const containerRef = useRef(null);
    const [modals, setModals] = useState([]);
    const [archive, setArchive] = useState([]);
    const [activeBaseLayer, setActiveBaseLayer] = useState('streets');
    const [menuState, setMenuState] = useState(0); 
    const [activeCategory, setActiveCategory] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const getStyle = (rate) => ({
        fillColor: rate > 30 ? '#dc2626' : rate > 15 ? '#f97316' : '#facc15',
        weight: 1, opacity: 1, color: '#003B5C', fillOpacity: 0.5
    });

    const openModal = (type, dataOverride = null) => {
        const id = Date.now();
        const newModal = {
            id,
            type,
            title: type === 'temporal' ? `HISTORIAL TEMPORAL #${modals.length + 1}` : `PERFIL ESPACIAL #${modals.length + 1}`,
            data: dataOverride || {
                labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                datasets: [{
                    label: 'Análisis (cm)',
                    data: [15, 21, 28, 35, 42, 50],
                    borderColor: '#F1C400',
                    backgroundColor: 'rgba(241, 196, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            minimized: false,
            x: 150 + (modals.length % 5) * 30,
            y: 100 + (modals.length % 5) * 30
        };
        setModals([...modals, newModal]);
    };

    const handleAction = (act) => {
        if (act === 'sat') setActiveBaseLayer('sat');
        else if (act === 'streets') setActiveBaseLayer('streets');
        else if (act === 'temporal') openModal('temporal');
        else if (act === 'perfil') openModal('perfil');
        else if (act === 'upload') alert("Funcionalidad de carga de GeoJSON en desarrollo para React.");
        else if (act === 'reset') window.location.reload();
        else if (['polyline', 'polygon', 'circle'].includes(act)) alert(`Herramienta de dibujo [${act}] seleccionada.`);
    };

    return (
        <div ref={containerRef} className="h-screen w-screen overflow-hidden font-sans bg-[#f8fafc] selection:bg-unamGold selection:text-unamBlue relative">
            {/* Navbar HUD */}
            <nav className="absolute top-0 left-0 w-full h-[60px] bg-unamBlue/85 backdrop-blur-md border-b-2 border-unamGold z-[4000] flex items-center px-4 md:px-8 text-white [clip-path:polygon(0_0,100%_0,100%_80%,98%_100%,2%_100%,0_80%)]">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3 font-black tracking-widest text-[14px]">
                        <HillAvalanche className="text-unamGold w-6 h-6" />
                        <span>UNAM <span className="text-unamGold font-light">SUBSIDENCIA</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-white/70 text-[10px] font-extrabold tracking-widest flex items-center gap-2 hover:text-unamGold transition-all">
                            <House size={14} /> INICIO
                        </Link>
                        <button 
                            onClick={() => setLoginModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-unamGold text-unamBlue font-black text-[10px] tracking-widest rounded skew-x-[-15deg] hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                        >
                            <span className="skew-x-[15deg] flex items-center gap-2 uppercase">
                                <UserLock size={12} /> Login
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            <MapContainer center={[19.38, -99.13]} zoom={11} zoomControl={false} className="h-full w-full z-0">
                {activeBaseLayer === 'streets' ? (
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
                ) : (
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                )}
                <GeoJSON data={subsidenceData} style={(f) => getStyle(f.properties.rate)} />
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-[1001] bg-unamBlue/95 border-l-4 border-unamGold p-4 text-white shadow-2xl skew-x-[-5deg]">
                <h3 className="text-unamGold font-black text-xs tracking-widest mb-1 italic">Analizador de subsidencia</h3>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600"></div><span className="text-[8px] font-bold text-white/50">{"> 30 CM/AÑO"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500"></div><span className="text-[8px] font-bold text-white/50">15-30 CM/AÑO</span>
                    </div>
                </div>
            </div>

            {/* RADIAL WHEEL MENU (Refined) */}
            <div className="fixed bottom-[-280px] left-1/2 -translate-x-1/2 z-[2000] w-[600px] h-[600px] flex justify-center items-center hover:bottom-[-250px] transition-all duration-700 pointer-events-none group">
                <div className="relative w-full h-full flex justify-center items-center pointer-events-auto">
                    <svg id="wheel-svg" width="600" height="600" viewBox="0 0 600 600" className="drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-visible">
                        {/* Outer Ring (Subcategories) */}
                        <AnimatePresence>
                            {menuState === 2 && activeCategory !== null && (
                                <motion.g
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    {CATEGORIES[activeCategory].sub.map((sub, j) => {
                                        const subW = 180 / CATEGORIES[activeCategory].sub.length;
                                        const s = 270 + (j * subW);
                                        const e = s + subW;
                                        const mid = s + subW / 2;
                                        const pos = polarToCartesian(300, 300, 200, mid);
                                        const Icon = sub.i;
                                        return (
                                            <g key={j} className="cursor-pointer group" onClick={() => handleAction(sub.a)}>
                                                <path 
                                                    d={createPath(300, 300, 160, 240, s, e)} 
                                                    fill="rgba(0,59,92,0.95)" 
                                                    stroke={CATEGORIES[activeCategory].color}
                                                    strokeWidth="1"
                                                    className="hover:fill-unamBlue transition-colors"
                                                />
                                                <foreignObject x={pos.x - 12} y={pos.y - 12} width="24" height="24">
                                                    <Icon size={20} color={CATEGORIES[activeCategory].color} className="group-hover:scale-125 transition-transform" />
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </motion.g>
                            )}
                        </AnimatePresence>

                        {/* Middle Ring (Categories) */}
                        <AnimatePresence>
                            {menuState >= 1 && (
                                <motion.g
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    {CATEGORIES.map((cat, i) => {
                                        const angles = [270, 315, 360, 405, 450];
                                        const active = activeCategory === i;
                                        const mid = angles[i] + 22.5;
                                        const pos = polarToCartesian(300, 300, 115, mid);
                                        const Icon = cat.icon;
                                        return (
                                            <g key={i} className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); setActiveCategory(i); setMenuState(2); }}>
                                                <path 
                                                    d={createPath(300, 300, 70, 160, angles[i], angles[i+1])} 
                                                    fill={active ? "rgba(0,59,92,1)" : "rgba(0,59,92,0.85)"}
                                                    stroke={active ? cat.color : "rgba(241,196,0,0.1)"}
                                                    strokeWidth="2"
                                                    className="hover:fill-unamBlue transition-colors"
                                                />
                                                <foreignObject x={pos.x - 16} y={pos.y - 16} width="32" height="32">
                                                    <Icon size={28} color={cat.color} className="group-hover:scale-110 transition-transform" />
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </motion.g>
                            )}
                        </AnimatePresence>

                        {/* Core Button */}
                        <circle 
                            cx="300" cy="300" r="70" 
                            fill="#003B5C" stroke="#F1C400" strokeWidth="3" 
                            className="cursor-pointer hover:fill-unamBlue transition-colors"
                            onClick={() => {
                                if (menuState === 0) setMenuState(1);
                                else { setMenuState(0); setActiveCategory(null); }
                            }}
                        />
                        <foreignObject pointerEvents="none" x="275" y="275" width="50" height="50">
                            <div className="w-full h-full flex items-center justify-center text-unamGold">
                                {menuState === 0 ? <Layers size={32} /> : <X size={32} />}
                            </div>
                        </foreignObject>
                    </svg>
                </div>
            </div>

            {/* Archive Zone */}
            <div className="absolute right-0 top-[15%] w-[220px] flex flex-col gap-3 items-end z-[2500] p-4 pointer-events-none">
                {archive.map(m => (
                    <div key={m.id} className="pointer-events-auto bg-unamBlue text-unamGold px-4 py-2 border-r-4 border-unamGold font-black text-[9px] uppercase tracking-widest cursor-pointer shadow-xl hover:translate-x-0 translate-x-2 transition-all flex items-center gap-2" onClick={() => { setModals([...modals, m]); setArchive(archive.filter(ar => ar.id !== m.id)); }}>
                        <ChartLine size={12} /> {m.title}
                    </div>
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modals.map(m => (
                    <motion.div 
                        key={m.id} 
                        drag
                        dragConstraints={containerRef}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        style={{ top: m.y, left: m.x }} 
                        className="absolute w-[450px] bg-unamBlue border-2 border-unamGold z-[3001] shadow-2xl [clip-path:polygon(5%_0,100%_0,100%_90%,95%_100%,0_100%,0_10%)] flex flex-col"
                    >
                        <div className="flex justify-between items-center border-b border-unamGold/20 p-3 cursor-grab active:cursor-grabbing bg-unamBlue/80">
                            <h2 className="text-unamGold font-black text-[10px] tracking-widest flex items-center gap-2 uppercase pointer-events-none">
                                <Box size={14} /> {m.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setArchive([...archive, m]); setModals(modals.filter(mo => mo.id !== m.id)); }} className="text-unamGold/40 hover:text-unamGold p-1 transition-colors"><Package size={14} /></button>
                                <button onClick={() => setModals(modals.filter(mod => mod.id !== m.id))} className="text-unamGold/40 hover:text-unamGold p-1 transition-colors"><X size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-950/40 min-h-[250px]">
                            <Line data={m.data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#F1C400', font: { size: 9 } } } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 8 } }, grid: { display: false } }, y: { ticks: { color: '#94a3b8', font: { size: 8 } }, grid: { color: 'rgba(241,196,0,0.05)' } } } }} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            <AccessibilityMenu />
        </div>
    );
};

export default PublicMap;
