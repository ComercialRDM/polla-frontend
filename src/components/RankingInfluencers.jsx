import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerRankingInfluencers, urlFotoInfluencer } from '../api';

const MEDALLA = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Cuánto tiempo se muestra el orden "viejo" antes de animar hacia el orden
// actual, para que el cambio de posición se note en vez de aparecer ya resuelto.
const RETRASO_ANIMACION_MS = 1200;

export default function RankingInfluencers({ token }) {
    const [ranking, setRanking] = useState(null);
    const [miUsuarioId, setMiUsuarioId] = useState(null);
    const [orden, setOrden] = useState([]);
    const [huboCambios, setHuboCambios] = useState(false);
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

    return (
        <div className="w-full max-w-md mx-auto mt-6">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                    🎖️ Ranking creadores
                </h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                Compites solo contra otros creadores de contenido. Los 3 mejores ganan premio.
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

            <div className="flex flex-col gap-2">
                {listaOrdenada.map((r) => (
                    <motion.div
                        key={r.id}
                        layout
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className={`flex items-center gap-3 rounded-2xl border p-3 ${
                            r.id === miUsuarioId
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
                                {r.id === miUsuarioId && <span className="text-amber-600 dark:text-amber-400"> (tú)</span>}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">{r.puntos} pts · {r.exactos} exactos</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
