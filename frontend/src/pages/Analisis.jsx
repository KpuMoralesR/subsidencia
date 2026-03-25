import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Componente para manejar el dibujado manualmente sin depender de react-leaflet-draw
const DrawingLayer = ({ onCreated }) => {
    const map = useMap();
    const featureGroupRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        map.addLayer(featureGroupRef.current);

        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: featureGroupRef.current
            },
            draw: {
                polygon: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
                polyline: {
                    shapeOptions: {
                        color: '#F1C400',
                        weight: 4
                    }
                }
            }
        });

        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, (e) => {
            const { layerType, layer } = e;
            featureGroupRef.current.addLayer(layer);
            if (onCreated) onCreated(e);
        });

        return () => {
            map.removeControl(drawControl);
            map.off(L.Draw.Event.CREATED);
        };
    }, [map, onCreated]);

    return null;
};
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Analisis = () => {
    const [pozos, setPozos] = useState([]);
    const [transectData, setTransectData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);

    // Cargar pozos al inicio
    useEffect(() => {
        const fetchPozos = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/pozos/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setPozos(response.data);
            } catch (error) {
                console.error("Error cargando pozos:", error);
            }
        };
        fetchPozos();
    }, []);

    const onCreated = async (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polyline') {
            const latlngs = layer.getLatLngs();
            const start = latlngs[0];
            const end = latlngs[latlngs.length - 1];
            
            // Nota: El backend espera UTM x1, y1 para el calculo exacto del script original,
            // pero para esta demo usaremos la logica de proyeccion que implementamos que acepta decimales si los tratamos como X e Y planos
            // O mejor, el backend ya tiene la logica. 
            // En México City zona 14N:
            setCoords({ x1: start.lng, y1: start.lat, x2: end.lng, y2: end.lat });
            fetchTransect(start.lng, start.lat, end.lng, end.lat);
        }
    };

    const fetchTransect = async (x1, y1, x2, y2) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/pozos/transecto/', {
                params: { x1, y1, x2, y2, buffer: 0.05 }, // Buffer pequeño porque usamos grados decimales como "UTM" simplificado en este ejemplo
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTransectData(response.data);
        } catch (error) {
            console.error("Error calculando transecto:", error);
        } finally {
            setLoading(false);
        }
    };

    // Preparar datos para el gráfico de barras apiladas (litología)
    const chartData = {
        labels: transectData.map(d => d.pozo.name),
        datasets: []
    };

    // Esto es complejo de mapear dinamicamente para un grafico de barras, 
    // pero podemos mostrar una representacion simple de la profundidad maxima
    if (transectData.length > 0) {
        chartData.datasets = [
            {
                label: 'Profundidad Máxima (m)',
                data: transectData.map(d => {
                    const layers = d.pozo.capas || [];
                    return layers.length > 0 ? Math.max(...layers.map(l => l.depth)) : 0;
                }),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }
        ];
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-unamBlue tracking-tighter uppercase italic">
                    Análisis de <span className="text-unamGold">Subsidencia</span>
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mapa */}
                <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 h-[500px] overflow-hidden relative">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-unamGold rounded-full animate-pulse"></div>
                        Generador de Transectos
                    </h2>
                    <MapContainer center={[19.4326, -99.1332]} zoom={12} style={{ height: '90%', width: '100%', borderRadius: '1rem' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <DrawingLayer onCreated={onCreated} />
                        {pozos.map(p => p.x && p.y && (
                            <Marker key={p.id} position={[p.y, p.x]}>
                                <Popup>
                                    <strong>{p.name}</strong><br/>
                                    Tipo: {p.well_type}<br/>
                                    Elev: {p.elevation}m
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    <div className="absolute bottom-6 left-10 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm text-[10px] z-[1000]">
                        Dibuja una línea para generar el perfil geológico.
                    </div>
                </div>

                {/* Resultados del Transecto */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[500px]">
                    <h2 className="text-lg font-bold mb-4">Perfil Geológico Localizado</h2>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unamGold"></div>
                        </div>
                    ) : transectData.length > 0 ? (
                        <div className="flex-1 overflow-y-auto space-y-4">
                            <div className="h-64 mb-4">
                                <Bar 
                                    data={chartData} 
                                    options={{ 
                                        indexAxis: 'y',
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } }
                                    }} 
                                />
                            </div>
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-400 uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="p-2">Pozo</th>
                                        <th className="p-2">Dist. Along (m)</th>
                                        <th className="p-2">Material Principal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transectData.map((d, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-2 font-bold">{d.pozo.name}</td>
                                            <td className="p-2">{d.dist_along.toFixed(2)}</td>
                                            <td className="p-2">{d.pozo.capas?.[0]?.material || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
                            <p className="max-w-[200px]">No se han proyectado pozos. Dibuja una línea en el mapa que pase cerca de los puntos azules.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analisis;
