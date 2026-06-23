import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPartidos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import { obtenerSesion } from '../utils/sesion';
import Bandera from './Bandera';

export default function ProximosPartidos({ limite = 5, titulo = '⚽ Próximos partidos' }) {
    const [partidos, setPartidos] = useState([]);
    const sesion = obtenerSesion();
    const favoritos = (sesion?.equipos_favoritos || []).map((e) => e.toLowerCase());

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success) setPartidos(partidosFuturos(data.partidos, limite));
            })
            .catch(() => {});
    }, [limite]);

    if (partidos.length === 0) return null;

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <h2 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-1">
                {titulo}
            </h2>
            <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                Elige un partido, compra tu bono y juega tu pronóstico 🔥
            </p>

            <div className="flex flex-col gap-3">
                {partidos.map((p) => {
                    const fecha = new Date(p.fecha_hora_inicio);
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    const esFavorito =
                        favoritos.includes(p.equipo_local?.toLowerCase()) ||
                        favoritos.includes(p.equipo_visitante?.toLowerCase());
                    return (
                    <Link
                        key={p.id}
                        to={`/comprar?partido=${p.id}`}
                        className={`relative flex flex-col gap-2 rounded-2xl border p-4 active:scale-95 transition-all shadow-sm backdrop-blur-lg ${
                            esFavorito
                                ? 'border-[#FCD116] bg-[#FCD116]/5 dark:bg-[#FCD116]/10 shadow-[0_0_12px_rgba(252,209,22,0.2)]'
                                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 dark:shadow-none hover:border-amber-400/40'
                        }`}
                    >
                        {esFavorito && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#FCD116] text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                ⭐ FAVORITO
                            </div>
                        )}
                        <div className="flex justify-center items-baseline gap-1.5 mt-1">
                            <span className="text-amber-500 dark:text-amber-400 text-xs font-bold">
                                {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-400 text-[10px]">
                                {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                {esHoy ? ' (Hoy)' : ''}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Bandera equipo={p.equipo_local} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-zinc-900 dark:text-white font-bold text-sm truncate max-w-[34%]">{p.equipo_local}</span>
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold flex-shrink-0">vs</span>
                            <Bandera equipo={p.equipo_visitante} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-zinc-900 dark:text-white font-bold text-sm truncate max-w-[34%]">{p.equipo_visitante}</span>
                        </div>
                    </Link>
                    );
                })}
            </div>
        </div>
    );
}
