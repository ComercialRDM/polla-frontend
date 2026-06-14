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
                {partidos.map((p) => (
                    <Link
                        key={p.id}
                        to={`/comprar?partido=${p.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 active:scale-95 hover:border-amber-400/40 transition-all"
                    >
                        <span className="flex items-center gap-2 text-white font-bold text-sm truncate">
                            <Bandera equipo={p.equipo_local} className="w-6 h-6" />
                            {p.equipo_local} vs
                            <Bandera equipo={p.equipo_visitante} className="w-6 h-6" />
                            {p.equipo_visitante}
                        </span>
                        <span className="flex-shrink-0 text-right">
                            <span className="block text-amber-400 text-xs font-bold">
                                {new Date(p.fecha_hora_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="block text-zinc-400 text-[10px]">
                                {new Date(p.fecha_hora_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
