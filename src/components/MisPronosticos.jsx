import { useEffect, useState } from 'react';
import { obtenerMisPronosticos, obtenerMisPronosticosToken } from '../api';
import Bandera from './Bandera';

// Espejo de puntajesFase.js del backend — única fuente de verdad en Render.
// Si se cambian allá, actualizar acá también.
const EXACTO_POR_FASE = {
    grupos: 100, dieciseisavos: 200, octavos: 200,
    cuartos: 600, semifinal: 600, final: 2000,
};

const ESTADO_CONFIG = {
    exacto:    { label: 'EXACTO',    clase: 'bg-green-500/15 border-green-500/40 text-green-400',    icono: '🎯' },
    tendencia: { label: '+PUNTOS',   clase: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400', icono: '✅' },
    fallo:     { label: 'FALLÓ',     clase: 'bg-red-500/15 border-red-500/40 text-red-400',          icono: '❌' },
    pendiente: { label: 'PENDIENTE', clase: 'bg-amber-500/10 border-amber-400/40 text-amber-400',   icono: '⏳' },
};

function clasificarPronostico(puntos, fase) {
    if (puntos === null || puntos === undefined) return ESTADO_CONFIG.pendiente;
    if (Number(puntos) === 0) return ESTADO_CONFIG.fallo;
    const maxExacto = EXACTO_POR_FASE[fase] ?? 100;
    return Number(puntos) >= maxExacto ? ESTADO_CONFIG.exacto : ESTADO_CONFIG.tendencia;
}

function formatFecha(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

export default function MisPronosticos({ usuarioId, tokenAcceso }) {
    const [pronosticos, setPronosticos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [expandido, setExpandido] = useState(false);

    useEffect(() => {
        if (tokenAcceso) {
            obtenerMisPronosticosToken(tokenAcceso)
                .then(d => { if (d?.success) setPronosticos(d.pronosticos ?? []); })
                .catch(() => {})
                .finally(() => setCargando(false));
        } else if (usuarioId) {
            obtenerMisPronosticos()
                .then(d => { if (d?.success) setPronosticos(d.pronosticos ?? []); })
                .catch(() => {})
                .finally(() => setCargando(false));
        }
    }, [usuarioId, tokenAcceso]);

    if (cargando) return null;
    if (pronosticos.length === 0) return null;

    const visibles = expandido ? pronosticos : pronosticos.slice(0, 4);
    const totalPuntos = pronosticos.reduce((acc, p) => acc + (Number(p.puntos_partido) || 0), 0);
    const exactos = pronosticos.filter(p => p.puntos_partido !== null && p.puntos_partido !== undefined && Number(p.puntos_partido) >= (EXACTO_POR_FASE[p.fase] ?? 100)).length;
    const cerrados = pronosticos.filter(p => p.estado === 'cerrado').length;

    return (
        <div className="w-full mb-4">
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
                {visibles.filter(Boolean).map((p) => {
                    const cfg = clasificarPronostico(p.puntos_partido, p.fase);
                    const cerrado = p.estado === 'cerrado';

                    return (
                        <div
                            key={p.id}
                            className="rounded-xl bg-zinc-900 border border-white/5 px-3 py-2.5 flex items-center gap-3"
                        >
                            <div className={`flex-shrink-0 rounded-xl border px-2.5 py-2 text-center min-w-[64px] ${cfg.clase}`}>
                                <p className="text-lg leading-none">{cfg.icono}</p>
                                <p className="font-black text-[10px] leading-tight mt-1 uppercase tracking-wide">{cfg.label}</p>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate flex items-center gap-1">
                                    <Bandera equipo={p.equipo_local} className="w-4 h-4 flex-shrink-0" />
                                    {p.equipo_local} vs {p.equipo_visitante}
                                    <Bandera equipo={p.equipo_visitante} className="w-4 h-4 flex-shrink-0" />
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
                                                Resultado: <span className={`font-bold ${cfg === ESTADO_CONFIG.exacto ? 'text-green-400' : cfg === ESTADO_CONFIG.tendencia ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                                    {p.res_local}–{p.res_visitante}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

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
