import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPartidos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import Bandera from './Bandera';

export default function ProximosPartidos() {
    const [partidos, setPartidos] = useState([]);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success) setPartidos(partidosFuturos(data.partidos, 5));
            })
            .catch(() => {});
    }, []);

    if (partidos.length === 0) return null;

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <h2 className="text-center text-white font-black text-xl mb-1">
                ⚽ Próximos partidos
            </h2>
            <p className="text-center text-zinc-400 text-sm mb-4">
                Elige un partido, compra tu bono y juega tu pronóstico 🔥
            </p>

            <div className="flex flex-col gap-3">
                {partidos.map((p) => {
                    const fecha = new Date(p.fecha_hora_inicio);
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    return (
                    <Link
                        key={p.id}
                        to={`/comprar?partido=${p.id}`}
                        className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 active:scale-95 hover:border-amber-400/40 transition-all"
                    >
                        <div className="flex justify-center items-baseline gap-1.5">
                            <span className="text-amber-400 text-xs font-bold">
                                {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-zinc-400 text-[10px]">
                                {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                {esHoy ? ' (Hoy)' : ''}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Bandera equipo={p.equipo_local} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-white font-bold text-sm truncate max-w-[34%]">{p.equipo_local}</span>
                            <span className="text-zinc-500 text-xs font-semibold flex-shrink-0">vs</span>
                            <Bandera equipo={p.equipo_visitante} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-white font-bold text-sm truncate max-w-[34%]">{p.equipo_visitante}</span>
                        </div>
                    </Link>
                    );
                })}
            </div>
        </div>
    );
}
