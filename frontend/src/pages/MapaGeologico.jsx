import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Satellite, MapPin, Database, Activity } from 'lucide-react';

const MapaGeologico = () => {
    const [pozos, setPozos] = useState([]);
    const [insarPoints, setInsarPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const [resPozos, resInsar] = await Promise.all([
                    axios.get('http://localhost:8000/api/pozos/', config),
                    axios.get('http://localhost:8000/api/insar/', config)
                ]);
                setPozos(resPozos.data);
                setInsarPoints(resInsar.data);
            } catch (error) {
                console.error("Error cargando datos del mapa:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="h-screen w-full relative flex flex-col">
            {/* Header Flotante */}
            <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none">
                <div className="bg-unamBlue/90 backdrop-blur-xl border border-unamGold/30 p-4 rounded-2xl shadow-2xl flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-unamGold rounded-xl text-unamBlue">
                            <Satellite size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-widest uppercase">Explorador Geológico</h1>
                            <p className="text-[10px] text-unamGold font-bold tracking-[0.2em] uppercase opacity-70">Visualización de Datos InSAR y Pozos</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <Database size={14} className="text-unamGold" />
                            <span className="text-white text-xs font-bold uppercase">{pozos.length} Pozos</span>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <Activity size={14} className="text-green-400" />
                            <span className="text-white text-xs font-bold uppercase">{insarPoints.length} Puntos InSAR</span>
                        </div>
                    </div>
                </div>
            </div>

            <MapContainer 
                center={[19.4326, -99.1332]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <LayersControl position="bottomright">
                    <LayersControl.BaseLayer checked name="Calles (OSM)">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satelital (Esri)">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Pozos */}
                {pozos.map(p => p.x && p.y && (
                    <Marker 
                        key={`well-${p.id}`} 
                        position={[p.y, p.x]}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2">
                                <h3 className="text-unamBlue font-black border-b border-unamGold mb-2 uppercase text-xs">{p.name}</h3>
                                <div className="space-y-1 text-[10px] font-bold text-gray-600">
                                    <p>TIPO: {p.well_type}</p>
                                    <p>ELEVACIÓN: {p.elevation}m</p>
                                    <p>CAPAS: {p.capas?.length || 0}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Puntos InSAR (Demo con markers si no hay muchos) */}
                {insarPoints.map(i => (
                    <Marker 
                        key={`insar-${i.id}`} 
                        position={[i.lat, i.lon]}
                    >
                        <Popup>
                            <strong>Punto InSAR</strong><br/>
                            Velocidad: {i.subsidence} cm/año
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Leyenda Bottom Left */}
            <div className="absolute bottom-10 left-6 z-[1000] bg-white/95 p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Simbología</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-[10px] font-bold text-gray-700">Pozos de Monitoreo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                        <span className="text-[10px] font-bold text-gray-700">Subsidencia Crítica</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapaGeologico;
