import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Scatter, Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    House, Map as MapIcon, Layers, ChartLine,
    UserLock, X, Pencil, Circle, BoxSelect, RotateCcw,
    Satellite, MapPin, Clock, Settings, Globe, Database, Minus, Plus, Trash2
} from 'lucide-react';
import { HillAvalanche } from '../components/UnamIcons';
import LoginModal from '../components/LoginModal';
import AccessibilityMenu from '../components/AccessibilityMenu';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(...registerables);

// ── Íconos Leaflet ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getWellIcon = (type) => {
    const color = WELL_TYPE_COLORS[type] || WELL_TYPE_COLORS['Solo Ubicación'];
    return L.divIcon({
        className: '',
        html: `<div style="width:8px;height:8px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px ${color}CC"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
    });
};

const WELL_TYPE_COLORS = {
    'Profunda (> 400m)':    '#001628', // Azul muy oscuro
    'Media-Alta (200-400m)':'#003B5C', // Azul UNAM
    'Media (100-200m)':     '#1E88E5', // Azul vibrante
    'Somera (< 100m)':      '#F1C400', // Oro UNAM
    'Sin Estratigrafía':    '#ef4444', // Rojo alerta
};

const getClass = (p) => {
    if (!p.capas || p.capas.length === 0) return 'Sin Estratigrafía';
    const maxDepth = Math.max(...p.capas.map(c => c.depth || 0));
    if (maxDepth > 400) return 'Profunda (> 400m)';
    if (maxDepth > 200) return 'Media-Alta (200-400m)';
    if (maxDepth > 100) return 'Media (100-200m)';
    return 'Somera (< 100m)';
};

// ── DrawingHandler ────────────────────────────────────────────────────────
const DrawingHandler = ({ activeTool, onCreated }) => {
    const map = useMap();
    const toolRef = useRef(null);
    const featureGroupRef = useRef(null);

    useEffect(() => {
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
            map.addLayer(featureGroupRef.current);
        }
        const handler = (e) => {
            featureGroupRef.current.clearLayers();
            if (onCreated) onCreated(e);
        };
        map.on('draw:created', handler);
        return () => { map.off('draw:created', handler); };
    }, [map, onCreated]);

    useEffect(() => {
        if (toolRef.current) { try { toolRef.current.disable(); } catch (_) {} toolRef.current = null; }
        if (!activeTool) return;
        let instance = null;
        if (activeTool === 'polyline') instance = new L.Draw.Polyline(map, { shapeOptions: { color: '#F1C400', weight: 4, opacity: 1 } });
        else if (activeTool === 'polygon') instance = new L.Draw.Polygon(map, { shapeOptions: { color: '#0ea5e9' } });
        else if (activeTool === 'circle')  instance = new L.Draw.Circle(map,  { shapeOptions: { color: '#f97316' } });
        if (instance) { toolRef.current = instance; instance.enable(); }
    }, [activeTool, map]);

    return null;
};

// ── Custom Map Controls (Zoom) ──────────────────────────────────────────
const CustomMapControls = () => {
    const map = useMap();
    return (
        <div className="absolute top-[70px] left-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
            <button
                onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
                title="Acercar"
                className="w-10 h-10 bg-[#003B5C]/90 backdrop-blur-md border border-[#F1C400]/40 rounded-lg flex items-center justify-center text-[#F1C400] hover:bg-[#F1C400] hover:text-[#003B5C] transition-all shadow-xl"
            >
                <Plus size={20} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
                title="Alejar"
                className="w-10 h-10 bg-[#003B5C]/90 backdrop-blur-md border border-[#F1C400]/40 rounded-lg flex items-center justify-center text-[#F1C400] hover:bg-[#F1C400] hover:text-[#003B5C] transition-all shadow-xl"
            >
                <Minus size={20} />
            </button>
        </div>
    );
};

// ── Menú radial helpers ────────────────────────────────────────────────────
const polarToCartesian = (x, y, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180.0;
    return { x: x + r * Math.cos(rad), y: y + r * Math.sin(rad) };
};
const createPath = (x, y, ri, ro, s, e) => {
    const sI = polarToCartesian(x, y, ri, e), eI = polarToCartesian(x, y, ri, s);
    const sO = polarToCartesian(x, y, ro, e), eO = polarToCartesian(x, y, ro, s);
    const la = e - s > 180 ? 1 : 0;
    return ["M",sI.x,sI.y,"L",sO.x,sO.y,"A",ro,ro,0,la,0,eO.x,eO.y,"L",eI.x,eI.y,"A",ri,ri,0,la,1,sI.x,sI.y,"Z"].join(" ");
};

// ── Panel de análisis de transecto ────────────────────────────────────────
const TransectPanel = ({ panel, focused, containerRef, onClose, onArchive }) => {
    const { id, data: wells, lineLength, buffer } = panel;

    const offsetDatasets = Object.entries(WELL_TYPE_COLORS).map(([wtype, color]) => {
        const pts = wells.filter(w => getClass(w.pozo) === wtype);
        if (!pts.length) return null;
        return {
            label: `${wtype} (n=${pts.length})`,
            data: pts.map(w => ({ x: w.dist_along, y: w.dist_off_signed ?? w.dist_off })),
            backgroundColor: color + 'CC', borderColor: color,
            pointRadius: 7, pointHoverRadius: 10,
        };
    }).filter(Boolean);

    const refDatasets = [
        { label: 'Transecto',    data: [{ x: 0, y: 0 }, { x: lineLength, y: 0 }],       borderColor: '#1A6FBF', borderWidth: 2, pointRadius: 0, type: 'line' },
        { label: `+${buffer}m`,  data: [{ x: 0, y: buffer }, { x: lineLength, y: buffer }],  borderColor: '#E02020', borderWidth: 1.5, pointRadius: 0, type: 'line', borderDash: [6, 4] },
        { label: `-${buffer}m`,  data: [{ x: 0, y: -buffer }, { x: lineLength, y: -buffer }], borderColor: '#E02020', borderWidth: 1.5, pointRadius: 0, type: 'line', borderDash: [6, 4] },
    ];

    const scatterOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#334155', font: { size: 8, weight: 'bold' }, boxWidth: 12 } },
            tooltip: { callbacks: { label: (ctx) => { const w = wells[ctx.dataIndex]; return w ? `${w.pozo?.name ?? 'Pozo'} | ${ctx.parsed.x.toFixed(0)} m | offset: ${ctx.parsed.y.toFixed(0)} m` : ''; } } }
        },
        scales: {
            x: { title: { display: true, text: 'Distancia a lo largo del transecto (m)', color: '#475569', font: { size: 9 } }, grid: { color: '#e2e8f0' }, ticks: { color: '#475569', font: { size: 8 } }, min: 0, max: lineLength * 1.02 },
            y: { title: { display: true, text: 'Offset perpendicular (m)', color: '#475569', font: { size: 9 } }, grid: { color: '#e2e8f0' }, ticks: { color: '#475569', font: { size: 8 } } }
        }
    };

    const elevWells = wells.filter(w => w.pozo?.elevation != null).sort((a, b) => a.dist_along - b.dist_along);
    const elevData = {
        labels: elevWells.map(w => w.dist_along.toFixed(0)),
        datasets: [{
            label: 'Elevación (m.s.n.m.)',
            data: elevWells.map(w => w.pozo.elevation),
            borderColor: '#F1C400', backgroundColor: 'rgba(241,196,0,0.15)',
            pointBackgroundColor: elevWells.map(w => WELL_TYPE_COLORS[getClass(w.pozo)]),
            pointBorderColor: '#fff', pointRadius: 5, tension: 0.35, fill: true,
        }]
    };
    const elevOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#334155', font: { size: 8, weight: 'bold' }, boxWidth: 12 } } },
        scales: {
            x: { title: { display: true, text: 'Distancia (m)', color: '#475569', font: { size: 9 } }, ticks: { color: '#475569', font: { size: 8 } }, grid: { color: '#e2e8f0' } },
            y: { title: { display: true, text: 'Elevación (m.s.n.m.)', color: '#475569', font: { size: 9 } }, ticks: { color: '#475569', font: { size: 8 } }, grid: { color: '#e2e8f0' } }
        }
    };

    return (
        <motion.div
            drag dragConstraints={containerRef} dragMomentum={false}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className="w-[560px] bg-[#003B5C] rounded-lg overflow-hidden shadow-2xl"
            style={{
                border: focused ? '2px solid #F1C400' : '1px solid rgba(241,196,0,0.3)',
                boxShadow: focused ? '0 0 40px rgba(241,196,0,0.3)' : '0 8px 40px rgba(0,0,0,0.6)',
            }}
        >
            {/* Header sólido */}
            <div className="flex justify-between items-center px-4 py-2.5 cursor-grab active:cursor-grabbing bg-[#003B5C] border-b border-[#F1C400]/30 select-none">
                <div className="flex items-center gap-2">
                    <ChartLine size={13} className="text-[#F1C400]" />
                    <h2 className="text-white font-black text-[11px] tracking-[0.15em] uppercase">
                        Perfil <span className="text-[#F1C400]">{id}</span>
                    </h2>
                    <span className="text-[#94a3b8] text-[8px] ml-1">{wells.length} pozos · {(lineLength / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onArchive}
                        className="flex items-center gap-1 text-[#94a3b8] hover:text-[#F1C400] px-2 py-1 rounded hover:bg-white/10 transition-all text-[8px] font-black tracking-wider uppercase"
                        title="Archivar — minimiza el panel al costado derecho"
                    >
                        <Minus size={11} /> 
                    </button>
                    <button onClick={onClose} className="text-[#94a3b8] hover:text-red-400 p-1.5 rounded hover:bg-white/10 transition-all" title="Eliminar línea y panel">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 space-y-4 bg-[#003B5C]">
                <div className="bg-white rounded-lg p-3 shadow-inner">
                    <p className="text-[#003B5C] text-[9px] font-black tracking-widest uppercase mb-2">Perfil de Offset Lateral</p>
                    <div className="h-52">
                        <Scatter data={{ datasets: [...offsetDatasets, ...refDatasets] }} options={scatterOptions} />
                    </div>
                </div>
                {elevWells.length >= 2 && (
                    <div className="bg-white rounded-lg p-3 shadow-inner">
                        <p className="text-[#003B5C] text-[9px] font-black tracking-widest uppercase mb-2">Perfil de Elevación</p>
                        <div className="h-44">
                            <Line data={elevData} options={elevOptions} />
                        </div>
                    </div>
                )}
                <div>
                    <p className="text-[#F1C400] text-[9px] font-black tracking-widest uppercase mb-2">Pozos en el Buffer</p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#F1C400 #002a45' }}>
                        {wells.map((w, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-[9px]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" title={getClass(w.pozo)} style={{ background: WELL_TYPE_COLORS[getClass(w.pozo)] }} />
                                    <span className="text-[#F1C400] font-black truncate">{w.pozo?.name ?? `Pozo ${w.id}`}</span>
                                </div>
                                <span className="text-white/50">@ {w.dist_along.toFixed(0)} m</span>
                                <span className={`font-bold ${(w.side ?? 0) >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>
                                    {(w.dist_off_signed ?? w.dist_off) >= 0 ? '+' : ''}{(w.dist_off_signed ?? w.dist_off).toFixed(0)} m
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────
const PublicMap = () => {
    const containerRef = useRef(null);

    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [menuState, setMenuState]           = useState(0);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeBaseLayer, setActiveBaseLayer] = useState('streets');
    const [activeTool, setActiveTool]         = useState(null);
    const [loading, setLoading]               = useState(false);
    const [hoveredLabel, setHoveredLabel]     = useState(null);
    const [mousePos, setMousePos]             = useState({ x: 0, y: 0 });
    const [pozos, setPozos]                   = useState([]);
    const [showWells, setShowWells]           = useState(false);
    const [showFaults, setShowFaults]         = useState(false);
    const [activeWellTypes, setActiveWellTypes] = useState(
        Object.keys(WELL_TYPE_COLORS).reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );
    const [panels, setPanels]                 = useState([]);     // {id, data, lineLength, buffer, latlngs, archived}
    const [focusedId, setFocusedId]           = useState(null);
    const panelCounterRef                     = useRef(0);

    const faultLines = [
        { id: 'f1', name: 'Falla Santa Catarina', pts: [[19.33, -99.02], [19.28, -98.98]] },
        { id: 'f2', name: 'Fractura Iztapalapa', pts: [[19.35, -99.08], [19.34, -99.05], [19.32, -99.04]] },
        { id: 'f3', name: 'Falla Mixhuca', pts: [[19.41, -99.10], [19.39, -99.08]] }
    ];

    useEffect(() => {
        setLoading(true);
        axios.get('http://127.0.0.1:8000/api/pozos/')
            .then(r => { 
                console.log(`DATABASE SYNC: ${r.data.length} pozos.`);
                setPozos(r.data); 
                setLoading(false); 
            })
            .catch((err) => { 
                console.error("API Error:", err);
                setLoading(false); 
            });
    }, []);

    const handleCreated = useCallback(async (e) => {
        const { layerType, layer } = e;
        setActiveTool(null);
        if (layerType !== 'polyline') return;
        const latlngs = layer.getLatLngs();
        if (latlngs.length < 2) return;
        const start = latlngs[0];
        const end   = latlngs[latlngs.length - 1];
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/pozos/transecto/', {
                params: { x1: start.lng, y1: start.lat, x2: end.lng, y2: end.lat, buffer: 800 }
            });
            const { wells, line_length, buffer } = res.data;
            if (wells && wells.length > 0) {
                panelCounterRef.current += 1;
                const newId = `#${panelCounterRef.current}`;
                const coordsForMap = latlngs.map(ll => [ll.lat, ll.lng]);
                setPanels(prev => [...prev, { id: newId, data: wells, lineLength: line_length, buffer, latlngs: coordsForMap, archived: false }]);
                setFocusedId(newId);
            } else {
                alert('No se encontraron pozos en un radio de 800 m. Traza la línea sobre la zona central donde están los marcadores.');
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    const closePanel   = useCallback((id) => { setPanels(p => p.filter(x => x.id !== id)); setFocusedId(p => p === id ? null : p); }, []);
    const archivePanel = useCallback((id) => { setPanels(p => p.map(x => x.id === id ? { ...x, archived: true }  : x)); setFocusedId(p => p === id ? null : p); }, []);
    const restorePanel = useCallback((id) => { setPanels(p => p.map(x => x.id === id ? { ...x, archived: false } : x)); setFocusedId(id); }, []);

    const handleAction = (act) => {
        if (['polyline', 'polygon', 'circle'].includes(act)) { setActiveTool(act); setMenuState(0); setActiveCategory(null); }
        else if (act === 'topo')    setActiveBaseLayer('topo');
        else if (act === 'terrain') setActiveBaseLayer('terrain');
        else if (act === 'sat')     setActiveBaseLayer('sat');
        else if (act === 'streets') setActiveBaseLayer('streets');
        else if (act === 'toggle_wells')  { setShowWells(!showWells); setMenuState(0); setActiveCategory(null); }
        else if (act === 'toggle_faults') { setShowFaults(!showFaults); setMenuState(0); setActiveCategory(null); }
        else if (act === 'reset')   window.location.reload();
    };

    const CATEGORIES = [
        { name: 'DIBUJO', icon: Pencil,   color: '#F1C400', sub: [{ n: 'Perfil', i: ChartLine, a: 'polyline' }, { n: 'Zona', i: BoxSelect, a: 'polygon' }, { n: 'Radio', i: Circle, a: 'circle' }] },
        { name: 'CAPAS',  icon: Globe,    color: '#0ea5e9', sub: [{ n: 'Relieve', i: MapIcon, a: 'topo' }, { n: 'Sombreado', i: Layers, a: 'terrain' }, { n: 'Satélite', i: Satellite, a: 'sat' }, { n: 'Calles', i: Globe, a: 'streets' }] },
        { name: 'DATOS',  icon: Database, color: '#f97316', sub: [{ n: 'Pozos', i: MapPin, a: 'toggle_wells' }, { n: 'Fallas', i: HillAvalanche, a: 'toggle_faults' }, { n: 'Reset', i: RotateCcw, a: 'reset' }] },
        { name: 'CONFIG', icon: Settings, color: '#10b981', sub: [{ n: 'Inicio', i: House, a: 'go_home' }, { n: 'Reset', i: RotateCcw, a: 'reset' }] },
    ];

    const openPanels     = panels.filter(p => !p.archived);
    const archivedPanels = panels.filter(p =>  p.archived);

    return (
        <div ref={containerRef} className="h-screen w-screen overflow-hidden font-sans bg-[#0a0f1a] relative">

            {/* ── Navbar ─────────────────────────────────────────────── */}
            <nav className="absolute top-0 left-0 w-full h-[58px] bg-[#003B5C] border-b-2 border-[#F1C400] z-[4000] flex items-center px-6 text-white shadow-2xl">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3 font-black tracking-widest text-[14px]">
                        <HillAvalanche className="text-[#F1C400] w-6 h-6" />
                        <span>UNAM <span className="text-[#F1C400] font-light">SUBSIDENCIA</span></span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link to="/" className="text-white/70 text-[10px] font-extrabold tracking-widest flex items-center gap-2 hover:text-[#F1C400] transition-all">
                            <House size={13} /> INICIO
                        </Link>
                        {archivedPanels.length > 0 && (
                            <span className="text-[#F1C400] text-[9px] font-bold bg-[#F1C400]/10 border border-[#F1C400]/30 px-2 py-1 rounded-full">
                                {archivedPanels.length} archivado{archivedPanels.length > 1 ? 's' : ''}
                            </span>
                        )}
                        <button onClick={() => setLoginModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-[#F1C400] text-[#003B5C] font-black text-[10px] tracking-widest rounded hover:bg-white transition-all">
                            <UserLock size={12} /> Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mapa ───────────────────────────────────────────────── */}
            <MapContainer center={[19.32, -99.13]} zoom={12} zoomControl={false} className="h-full w-full z-0">
                <CustomMapControls />
                {activeBaseLayer === 'topo' ? (
                    <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="OpenTopoMap" />
                ) : activeBaseLayer === 'terrain' ? (
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}" attribution="Esri World Shaded Relief" />
                ) : activeBaseLayer === 'sat' ? (
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                ) : (
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
                )}
                <DrawingHandler activeTool={activeTool} onCreated={handleCreated} />
                
                {showWells && pozos
                    .filter(p => activeWellTypes[getClass(p)])
                    .map(p => p.x && p.y && (
                    <Marker key={`w-${p.id}`} position={[p.y, p.x]} icon={getWellIcon(getClass(p))}>
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[200px]">
                                <div className="border-b border-[#F1C400] pb-2 mb-2">
                                    <h3 className="font-black text-[#003B5C] text-[14px] leading-tight m-0">{p.name}</h3>
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">ID: {p.id}</span>
                                </div>
                                
                                <div className="space-y-1.5 text-[11px]">
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Tipo:</span> <span>{getClass(p)}</span></p>
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Elevación:</span> <span>{p.elevation ? `${p.elevation} msnm` : 'N/D'}</span></p>
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Latitud:</span> <span>{p.y.toFixed(5)}°</span></p>
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Longitud:</span> <span>{p.x.toFixed(5)}°</span></p>
                                </div>

                                <div className={`mt-3 pt-2 border-t text-center text-[10px] font-bold py-1 rounded ${p.capas && p.capas.length > 0 ? 'bg-[#003B5C]/10 text-[#003B5C] border-[#003B5C]/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                    {p.capas && p.capas.length > 0 
                                        ? `Estratigrafía: ${p.capas.length} capas` 
                                        : 'Sin datos estratigráficos'}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {showFaults && faultLines.map(f => (
                    <Polyline 
                        key={f.id} 
                        positions={f.pts} 
                        pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.8 }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[150px]">
                                <div className="border-b border-[#ef4444] pb-2 mb-2">
                                    <h3 className="font-black text-[#ef4444] text-[14px] leading-tight m-0">{f.name}</h3>
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Falla Geológica</span>
                                </div>
                                <div className="space-y-1.5 text-[11px]">
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Riesgo:</span> <span className="text-[#ef4444] font-bold">Alto</span></p>
                                    <p className="flex justify-between m-0"><span className="font-bold text-gray-600">Nodos:</span> <span>{f.pts.length}</span></p>
                                </div>
                            </div>
                        </Popup>
                    </Polyline>
                ))}

                {panels.map(panel => (
                    <Polyline
                        key={`ln-${panel.id}`}
                        positions={panel.latlngs}
                        pathOptions={{
                            color:     focusedId === panel.id ? '#ffffff' : '#F1C400',
                            weight:    focusedId === panel.id ? 5 : 4,
                            opacity:   1,
                            dashArray: focusedId === panel.id ? null : '10 5',
                            lineCap: 'round',
                            lineJoin: 'round'
                        }}
                        eventHandlers={{ 
                            click: (e) => { 
                                L.DomEvent.stopPropagation(e);
                                restorePanel(panel.id); 
                            } 
                        }}
                    >
                        <Popup><div className="p-1 text-[11px]"><b>Transecto {panel.id}</b><br />{panel.data.length} pozos · {(panel.lineLength / 1000).toFixed(1)} km</div></Popup>
                    </Polyline>
                ))}
            </MapContainer>

            {/* ── Spinner ──────────────────────────────────────────────── */}
            {loading && (
                <div className="absolute top-20 right-8 z-[5000] bg-[#003B5C] border border-[#F1C400] p-3 rounded-full shadow-2xl">
                    <Clock className="text-[#F1C400] animate-spin" size={20} />
                </div>
            )}

            {/* ── Leyenda ──────────────────────────────────────────────── */}
            {showWells && (
                <div className="absolute bottom-6 left-6 z-[1001] bg-[#003B5C]/95 backdrop-blur border-l-4 border-[#F1C400] p-4 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-r-lg">
                    <h3 className="text-[#F1C400] font-black text-[10px] tracking-widest mb-3 uppercase flex justify-between items-center">
                        <span>Pozos</span>
                        <span className="text-white/60 bg-black/20 px-1.5 rounded ml-4">{pozos.filter(p => activeWellTypes[getClass(p)]).length}</span>
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(WELL_TYPE_COLORS).map(([type, color]) => (
                            <div 
                                key={type} 
                                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 -mx-1 rounded transition-colors"
                                onClick={() => setActiveWellTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={activeWellTypes[type]} 
                                    readOnly 
                                    className="w-3 h-3 accent-[#F1C400] pointer-events-none" 
                                />
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: color, opacity: activeWellTypes[type] ? 1 : 0.4 }} />
                                <span className={`text-[9.5px] font-bold ${activeWellTypes[type] ? 'text-white' : 'text-white/40'}`}>{type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Banner herramienta activa ─────────────────────────────── */}
            <AnimatePresence>
                {activeTool && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 left-1/2 -translate-x-1/2 z-[5000] bg-[#F1C400] text-[#003B5C] px-5 py-2 font-black text-[10px] tracking-widest rounded shadow-2xl flex items-center gap-3">
                        <Pencil size={13} />
                        {activeTool === 'polyline' ? 'Haz clic para trazar el transecto · Doble clic para finalizar' : activeTool.toUpperCase()}
                        <button onClick={() => setActiveTool(null)} className="ml-2 p-1 bg-[#003B5C] text-[#F1C400] rounded"><X size={11} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Paneles ABIERTOS — arrastrables ──────────────────────── */}
            <AnimatePresence>
                {openPanels.map((panel, i) => (
                    <motion.div
                        key={panel.id}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 80 }}
                        onMouseDown={() => setFocusedId(panel.id)}
                        style={{
                            position: 'absolute',
                            top: 76 + i * 32,
                            right: 24,
                            zIndex: focusedId === panel.id ? 5002 : 5001,
                        }}
                    >
                        <TransectPanel
                            panel={panel}
                            focused={focusedId === panel.id}
                            containerRef={containerRef}
                            onClose={() => closePanel(panel.id)}
                            onArchive={() => archivePanel(panel.id)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ── Chips ARCHIVADOS — horizontales, centrados verticalmente en borde derecho */}
            {archivedPanels.length > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 right-0 z-[5003] flex flex-col items-end gap-1.5 pointer-events-none">
                    <AnimatePresence>
                        {archivedPanels.map(panel => (
                            <motion.button
                                key={panel.id}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 60 }}
                                onClick={() => restorePanel(panel.id)}
                                className="pointer-events-auto flex items-center gap-1.5 bg-[#003B5C] border border-r-0 border-[#F1C400]/70 hover:border-[#F1C400] hover:bg-[#004a78] text-white transition-all rounded-l-lg px-3 py-2"
                                style={{ boxShadow: '-2px 0 12px rgba(241,196,0,0.15)' }}
                                title={`Restaurar perfil ${panel.id}`}
                            >
                                <ChartLine size={13} className="text-[#F1C400]" />
                                <span className="text-[11px] font-black tracking-widest text-[#F1C400] uppercase">Perfil {panel.id}</span>
                                <span className="text-[9px] font-bold text-white/60 ml-0.5">{panel.data.length}p</span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ── Loading Overlay Global ── */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-[#003B5C] flex flex-col items-center justify-center gap-6 backdrop-blur-md"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                        >
                            <HillAvalanche className="text-[#F1C400] w-24 h-24 drop-shadow-[0_0_15px_rgba(241,196,0,0.4)]" />
                        </motion.div>
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-white font-black text-[18px] tracking-[0.3em] uppercase">UNAM <span className="text-[#F1C400]">SUBSIDENCIA</span></h2>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-[#F1C400] border-t-transparent rounded-full animate-spin" />
                                <span className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase">Sincronizando 998 pozos...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Tooltip Seguidor de Mouse ── */}
            <AnimatePresence>
                {hoveredLabel && menuState > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed z-[9000] pointer-events-none bg-[#003B5C]/95 border border-[#F1C400] px-3 py-1.5 rounded shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
                        style={{ left: mousePos.x + 18, top: mousePos.y + 18 }}
                    >
                        <span className="text-[#F1C400] text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
                            {hoveredLabel}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {!activeTool && (
                <div 
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    className="fixed bottom-[-265px] left-1/2 -translate-x-1/2 z-[2000] w-[600px] h-[600px] flex justify-center items-center pointer-events-none"
                >
                    <div className="relative w-full h-full flex justify-center items-center pointer-events-none">

                        <svg width="600" height="600" viewBox="0 0 600 600" className="drop-shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-visible pointer-events-none">
                            <AnimatePresence>
                                {menuState === 2 && activeCategory !== null && (
                                    <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                                        {CATEGORIES[activeCategory].sub.map((sub, j) => {
                                            const subW = 180 / CATEGORIES[activeCategory].sub.length;
                                            const s = 270 + j * subW, en = s + subW, mid = s + subW / 2;
                                            const pos = polarToCartesian(300, 300, 200, mid);
                                            const Icon = sub.i;
                                            return (
                                                <g key={j} className="cursor-pointer pointer-events-auto" 
                                                    onMouseEnter={() => setHoveredLabel(sub.n)}
                                                    onMouseLeave={() => setHoveredLabel(null)}
                                                    onClick={() => handleAction(sub.a)}
                                                >
                                                    <title>{sub.n}</title>
                                                    <path d={createPath(300, 300, 160, 240, s, en)} fill="rgba(0,59,92,0.97)" stroke={CATEGORIES[activeCategory].color} strokeWidth="1" />
                                                    <foreignObject x={pos.x - 20} y={pos.y - 18} width="40" height="36" className="pointer-events-none">
                                                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
                                                            <Icon size={15} color={CATEGORIES[activeCategory].color} />
                                                            <span style={{ color:'white', fontSize:'7px', fontWeight:'bold', textAlign:'center' }}>{sub.n}</span>
                                                        </div>
                                                    </foreignObject>
                                                </g>
                                            );
                                        })}
                                    </motion.g>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {menuState >= 1 && (
                                    <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                        {CATEGORIES.map((cat, i) => {
                                            const angles = [270, 315, 360, 405];
                                            const mid = angles[i] + 22.5;
                                            const pos = polarToCartesian(300, 300, 115, mid);
                                            const Icon = cat.icon;
                                            const active = activeCategory === i;
                                            return (
                                                <g key={i} className="cursor-pointer pointer-events-auto" 
                                                    onMouseEnter={() => setHoveredLabel(cat.name)}
                                                    onMouseLeave={() => setHoveredLabel(null)}
                                                    onClick={(ev) => { ev.stopPropagation(); setActiveCategory(i); setMenuState(2); }}
                                                >
                                                    <title>{cat.name}</title>
                                                    <path d={createPath(300, 300, 70, 158, angles[i], angles[i]+45)} fill={active ? "rgba(0,59,92,1)" : "rgba(0,59,92,0.85)"} stroke={active ? cat.color : "rgba(241,196,0,0.15)"} strokeWidth="2" />
                                                    <foreignObject x={pos.x-14} y={pos.y-14} width="28" height="28" className="pointer-events-none">
                                                        <Icon size={24} color={cat.color} />
                                                    </foreignObject>
                                                </g>
                                            );
                                        })}
                                    </motion.g>
                                )}
                            </AnimatePresence>
                            <circle cx="300" cy="300" r="70" fill="#003B5C" stroke="#F1C400" strokeWidth="3" className="cursor-pointer pointer-events-auto"
                                onClick={() => { if (menuState === 0) setMenuState(1); else { setMenuState(0); setActiveCategory(null); setHoveredLabel(null); } }} />
                            <foreignObject pointerEvents="none" x="275" y="275" width="50" height="50">
                                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#F1C400' }}>
                                    {menuState === 0 ? <Layers size={32} /> : <X size={32} />}
                                </div>
                            </foreignObject>
                        </svg>
                    </div>
                </div>
            )}

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            <AccessibilityMenu />
        </div>
    );
};

export default PublicMap;
