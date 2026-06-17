import { useEffect, useState } from 'react';
import { obtenerMisPronosticos } from '../api';

const ESTADO_CONFIG = {
    3:    { label: 'EXACTO',   clase: 'bg-green-500/15 border-green-500/40 text-green-400',  icono: '🎯' },
    1:    { label: '+1 PT',    clase: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400', icono: '✅' },
    0:    { label: 'FALLÓ',    clase: 'bg-red-500/15 border-red-500/40 text-red-400',          icono: '❌' },
    null: { label: 'PENDIENTE', clase: 'bg-zinc-700/40 border-zinc-600/40 text-zinc-400',     icono: '⏳' },
};

function formatFecha(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

export default function MisPronosticos({ usuarioId }) {
    const [pronosticos, setPronosticos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [expandido, setExpandido] = useState(false);

    useEffect(() => {
        if (!usuarioId) return;
        obtenerMisPronosticos(usuarioId)
            .then(d => { if (d?.success) setPronosticos(d.pronosticos); })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [usuarioId]);

    if (cargando) return null;
    if (pronosticos.length === 0) return null;

    const visibles = expandido ? pronosticos : pronosticos.slice(0, 4);
    const totalPuntos = pronosticos.reduce((acc, p) => acc + (p.puntos_partido || 0), 0);
    const exactos = pronosticos.filter(p => p.puntos_partido === 3).length;
    const cerrados = pronosticos.filter(p => p.estado === 'cerrado').length;

    return (
        <div className="w-full max-w-md px-4 mt-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#FCD116] rounded-full" />
                    <p className="text-white font-bold text-sm">Mis pronósticos</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#FCD116] font-black text-xs">{totalPuntos} pts</span>
                    {cerrados > 0 && (
                        <span className="text-zinc-500 text-[10px]">· {exactos}/{cerrados} exactos</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {visibles.map((p) => {
                    const cfg = ESTADO_CONFIG[p.puntos_partido];
                    const cerrado = p.estado === 'cerrado';

                    return (
                        <div
                            key={p.id}
                            className="rounded-xl bg-zinc-900 border border-white/5 px-3 py-2.5 flex items-center gap-3"
                        >
                            {/* Badge de resultado */}
                            <div className={`flex-shrink-0 rounded-lg border px-2 py-1.5 text-center min-w-[62px] ${cfg.clase}`}>
                                <p className="text-base leading-none">{cfg.icono}</p>
                                <p className="font-black text-[10px] leading-tight mt-0.5">{cfg.label}</p>
                            </div>

                            {/* Partido info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">
                                    {p.equipo_local} vs {p.equipo_visitante}
                                    {p.es_flash && <span className="ml-1 text-[#FCD116] text-[9px] font-black">⚡FLASH</span>}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-zinc-400 text-[10px]">
                                        Mi pred: <span className="text-white font-bold">{p.pred_local}–{p.pred_visitante}</span>
                                    </span>
                                    {cerrado && (
                                        <>
                                            <span className="text-zinc-600 text-[10px]">·</span>
                                            <span className="text-zinc-400 text-[10px]">
                                                Resultado: <span className={`font-bold ${p.puntos_partido === 3 ? 'text-green-400' : p.puntos_partido === 1 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                                    {p.res_local}–{p.res_visitante}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Fecha */}
                            <span className="flex-shrink-0 text-zinc-600 text-[10px]">{formatFecha(p.fecha_hora_inicio)}</span>
                        </div>
                    );
                })}
            </div>

            {pronosticos.length > 4 && (
                <button
                    onClick={() => setExpandido(v => !v)}
                    className="w-full mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors py-1"
                >
                    {expandido ? 'Ver menos' : `Ver todos (${pronosticos.length})`}
                </button>
            )}
        </div>
    );
}
