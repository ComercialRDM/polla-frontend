import { useEffect, useState } from 'react';
import { obtenerRankingGeneral } from '../api';

const TOP_COMPACT = 5;

const MEDALLA = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingGeneral({ token }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!token) return;
        obtenerRankingGeneral(token)
            .then((res) => {
                if (!res?.success) { setError(res?.error || 'No se pudo cargar el ranking.'); return; }
                setData(res);
            })
            .catch(() => setError('Error de conexión con el servidor.'));
    }, [token]);

    if (error || !data) return null;

    const { ranking, mi_posicion, mi_puntos, puntos_para_subir, total_participantes } = data;

    const top30 = ranking.filter(r => r.posicion <= 30);
    const miRow = ranking.find(r => r.es_yo);
    // Fuera del scroll: posición 31+ siempre, o posición 6-30 cuando está comprimido
    const miFilaFuera = mi_posicion > 30
        ? miRow
        : (!expanded && miRow?.posicion > TOP_COMPACT ? miRow : null);
    const visibleRows = expanded ? top30 : top30.slice(0, TOP_COMPACT);

    function FilaRanking({ r }) {
        const esYo = r.es_yo;
        return (
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                esYo
                    ? 'bg-amber-400/15 border border-amber-400/50'
                    : 'bg-transparent'
            }`}>
                <span className={`w-7 text-center font-black text-base shrink-0 ${esYo ? 'text-amber-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {MEDALLA[r.posicion] || r.posicion}
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 text-sm shrink-0">
                    {r.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${esYo ? 'text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                        {r.nombre}{esYo && <span className="font-normal"> (tú)</span>}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">{r.puntos} pts · {r.exactos} exactos</p>
                </div>
                {esYo && puntos_para_subir != null && puntos_para_subir > 0 && (
                    <span className="shrink-0 text-[10px] font-black text-amber-500 bg-amber-400/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                        +{puntos_para_subir} para subir
                    </span>
                )}
                {esYo && (puntos_para_subir == null || puntos_para_subir === 0) && mi_posicion === 1 && (
                    <span className="shrink-0 text-[10px] font-black text-emerald-500 bg-emerald-400/15 px-2 py-0.5 rounded-full">
                        ¡1ro!
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                    <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                        🏆 Ranking general
                    </h2>
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                    {total_participantes} participantes
                </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                Top 30 · Solo compiten clientes reales (tú incluido{mi_posicion ? `, vas #${mi_posicion}` : ''})
            </p>

            <div
                className={`flex flex-col gap-1 pr-0.5 ${expanded ? 'overflow-y-auto max-h-[420px]' : ''}`}
                style={expanded ? { scrollbarWidth: 'thin' } : {}}
            >
                {visibleRows.map(r => <FilaRanking key={r.posicion} r={r} />)}
                {top30.length === 0 && (
                    <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center py-6">
                        Aún no hay pronósticos cerrados — ¡el ranking se activará con el primer resultado!
                    </p>
                )}
            </div>

            {top30.length > TOP_COMPACT && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="mt-1 w-full py-2 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors text-center"
                >
                    {expanded ? '↑ Ver menos' : `Ver ranking completo (${top30.length}) →`}
                </button>
            )}

            {/* Fila propia fuera del top 30, separada del scroll */}
            {miFilaFuera && (
                <>
                    <div className="my-2 flex items-center gap-2">
                        <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-white/10" />
                        <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold px-1">tu posición</span>
                        <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-white/10" />
                    </div>
                    <FilaRanking r={miFilaFuera} />
                </>
            )}

            {/* Si el usuario ni siquiera ha comprado / no aparece */}
            {mi_posicion === null && (
                <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center mt-3">
                    Aún no tienes puntaje — predice el próximo partido para aparecer en el ranking.
                </p>
            )}
        </div>
    );
}
