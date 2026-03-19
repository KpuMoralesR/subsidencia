import { Activity, Users, Database, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex justify-between items-end border-b-2 border-unamBlue/5 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-unamBlue tracking-tighter uppercase italic leading-none">
                        PANEL DE <span className="text-unamGold">CONTROL</span>
                    </h1>
                    <p className="text-[10px] text-unamBlue/40 font-bold tracking-[0.4em] uppercase mt-3">
                        Vigilancia Geotécnica • Monitor de Redes Satelitales
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-unamBlue text-white text-[9px] font-black tracking-widest uppercase [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%,0_20%)]">
                        v6.0 Stable
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Usuarios Activos', val: '1,234', icon: Users, color: 'text-unamBlue' },
                    { label: 'Nodos de Red', val: '86', icon: Database, color: 'text-unamBlue' },
                    { label: 'Alertas Críticas', val: '0', icon: AlertTriangle, color: 'text-[#10b981]' },
                    { label: 'Tendencia Subsid.', val: '+1.2mm', icon: TrendingUp, color: 'text-red-500' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-unamBlue/5 border-l-unamGold p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <stat.icon size={100} />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-unamBlue/40 text-[9px] font-black tracking-widest uppercase">{stat.label}</h3>
                                <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val}</p>
                            </div>
                            <div className="p-2 bg-unamBlue/5 text-unamBlue">
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Sections placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border-2 border-unamBlue/5 p-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 border-b border-unamBlue/5 pb-4">
                        <h2 className="text-unamBlue font-black text-xs tracking-widest uppercase flex items-center gap-3">
                            <Activity size={16} className="text-unamGold" /> Actividad Reciente del Sistema
                        </h2>
                    </div>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-unamBlue/5 text-[10px] text-unamBlue/20 font-black tracking-[0.5em] uppercase italic">
                        Inicializando Monitor de Telemetría...
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-unamBlue text-white p-8 [clip-path:polygon(0_0,100%_0,100%_90%,90%_100%,0_100%)]">
                        <ShieldCheck size={40} className="text-unamGold mb-6" />
                        <h3 className="text-lg font-black tracking-tighter uppercase leading-none mb-2">Seguridad de Red</h3>
                        <p className="text-[10px] text-white/50 leading-relaxed font-bold tracking-widest uppercase pb-6 border-b border-white/10 mb-6">
                            Todos los protocolos de cifrado UNAM v6.0 están activos y operando sin anomalías detectadas.
                        </p>
                        <button className="w-full py-3 border-2 border-unamGold text-unamGold font-black text-[9px] tracking-[0.3em] uppercase hover:bg-unamGold hover:text-unamBlue transition-all">
                            Ver Reporte de Auditoría
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
