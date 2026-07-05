import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerRankingInfluencers, urlFotoInfluencer } from '../api';

const MEDALLA = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RETRASO_ANIMACION_MS = 1200;
const TOP_VISIBLE = 30;

export default function RankingInfluencers({ token }) {
    const [ranking, setRanking] = useState(null);
    const [miUsuarioId, setMiUsuarioId] = useState(null);
    const [orden, setOrden] = useState([]);
    const [huboCambios, setHuboCambios] = useState(false);
    const [puntosParaSubir, setPuntosParaSubir] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;

        obtenerRankingInfluencers(token)
            .then((data) => {
                if (!data?.success) {
                    setError(data?.error || 'No se pudo cargar el ranking.');
                    return;
                }

                setRanking(data.ranking);
                setMiUsuarioId(data.mi_usuario_id);

                // Calcular cuántos puntos le faltan al creador para subir un puesto
                const miRow = data.ranking.find(r => r.id === data.mi_usuario_id);
                if (miRow && miRow.posicion > 1) {
                    const arriba = data.ranking.filter(r => r.posicion < miRow.posicion);
                    if (arriba.length > 0) {
                        const ptsArriba = Math.min(...arriba.map(r => r.puntos));
                        setPuntosParaSubir(ptsArriba - miRow.puntos);
                    }
                }

                const snapshotAnterior = data.snapshot_anterior;
                if (snapshotAnterior?.length) {
                    const posicionAnteriorPorId = new Map(snapshotAnterior.map((s) => [s.id, s.posicion]));
                    const cambio = data.ranking.some((r) => posicionAnteriorPorId.get(r.id) !== r.posicion);

                    if (cambio) {
                        const ordenViejo = [...data.ranking]
                            .sort((a, b) => (posicionAnteriorPorId.get(a.id) ?? a.posicion) - (posicionAnteriorPorId.get(b.id) ?? b.posicion))
                            .map((r) => r.id);
                        setOrden(ordenViejo);
                        setHuboCambios(true);
                        const t = setTimeout(() => setOrden(data.ranking.map((r) => r.id)), RETRASO_ANIMACION_MS);
                        return () => clearTimeout(t);
                    }
                }
                setOrden(data.ranking.map((r) => r.id));
            })
            .catch(() => setError('Error de conexión con el servidor.'));
    }, [token]);

    if (error || !ranking || ranking.length === 0) return null;

    const porId = new Map(ranking.map((r) => [r.id, r]));
    const listaOrdenada = orden.map((id) => porId.get(id)).filter(Boolean);
    const top30 = listaOrdenada.filter(r => r.posicion <= TOP_VISIBLE);
    const miRow = ranking.find(r => r.id === miUsuarioId);
    const miFilaFuera = miRow && miRow.posicion > TOP_VISIBLE ? miRow : null;

    function FilaInfluencer({ r }) {
        const esYo = r.id === miUsuarioId;
        return (
            <motion.div
                key={r.id}
                layout
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    esYo
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900'
                }`}
            >
                <span className="w-7 text-center font-black text-lg text-zinc-900 dark:text-white shrink-0">
                    {MEDALLA[r.posicion] || r.posicion}
                </span>

                {r.tiene_foto ? (
                    <img
                        src={urlFotoInfluencer(r.id)}
                        alt={r.nombre}
                        className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-white/10 shrink-0"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                        {r.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                        {r.nombre}
                        {esYo && <span className="text-amber-600 dark:text-amber-400"> (tú)</span>}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                        {r.puntos} pts
                        {r.referidos > 0 && <span className="text-zinc-400 dark:text-zinc-500"> · {r.referidos} referido{r.referidos !== 1 ? 's' : ''}</span>}
                        {' · '}{r.exactos} exactos
                    </p>
                </div>

                {esYo && puntosParaSubir != null && puntosParaSubir > 0 && (
                    <span className="shrink-0 text-[10px] font-black text-amber-500 bg-amber-400/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                        +{puntosParaSubir} para subir
                    </span>
                )}
                {esYo && miRow?.posicion === 1 && (
                    <span className="shrink-0 text-[10px] font-black text-emerald-500 bg-emerald-400/15 px-2 py-0.5 rounded-full">
                        ¡1ro!
                    </span>
                )}
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto mt-6">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                    🎖️ Ranking creadores
                </h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                Compites solo contra otros creadores. Puntaje = predicciones + referidos × 200 pts.
            </p>

            {huboCambios && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-amber-600 dark:text-amber-400 text-xs font-bold mb-3"
                >
                    📈 Hubo cambios en el ranking desde tu última visita
                </motion.p>
            )}

            <div className="overflow-y-auto max-h-[420px] flex flex-col gap-2 pr-0.5" style={{ scrollbarWidth: 'thin' }}>
                {top30.map((r) => <FilaInfluencer key={r.id} r={r} />)}
            </div>

            {miFilaFuera && (
                <>
                    <div className="my-2 flex items-center gap-2">
                        <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-white/10" />
                        <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold px-1">tu posición</span>
                        <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-white/10" />
                    </div>
                    <FilaInfluencer r={miFilaFuera} />
                </>
            )}
        </div>
    );
}
