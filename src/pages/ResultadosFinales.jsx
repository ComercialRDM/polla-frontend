import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResultadosFinales } from '../api';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const COLORES = [
    'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    'border-zinc-300 bg-zinc-50 dark:bg-zinc-800/40',
    'border-orange-300 bg-orange-50 dark:bg-orange-900/20',
];
const PREMIOS_NOMBRE = ['primero', 'segundo', 'tercero'];

function formatCOP(v) {
    return `$${Number(v).toLocaleString('es-CO')} COP`;
}

export default function ResultadosFinales() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerResultadosFinales()
            .then((d) => { if (d?.success) setDatos(d); })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-4 sm:px-6 py-10 flex flex-col items-center pb-28">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">
                    &larr; Volver al inicio
                </Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">
                    🏆 Tabla de posiciones
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    Ranking en tiempo real de la Polla Mundialista · La Retoucherie
                </p>

                {cargando && (
                    <div className="text-center text-zinc-400 py-10">Cargando resultados...</div>
                )}

                {!cargando && !datos && (
                    <div className="text-center text-red-400 py-10">No se pudieron cargar los resultados.</div>
                )}

                {!cargando && datos && (
                    <>
                        {/* Podio top 3 */}
                        <div className="flex flex-col gap-4 mb-8">
                            {datos.top3.map((u, i) => (
                                <div
                                    key={u.posicion}
                                    className={`rounded-2xl border-2 p-5 ${COLORES[i]}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{MEDALLAS[i]}</span>
                                            <div>
                                                <p className="font-black text-zinc-900 dark:text-white text-base leading-tight">
                                                    {u.nombre}
                                                </p>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                    {u.exactos} {u.exactos === 1 ? 'acierto exacto' : 'aciertos exactos'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-amber-500 dark:text-amber-400 text-xl leading-tight">
                                                {u.puntos.toLocaleString('es-CO')} pts
                                            </p>
                                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-0.5">
                                                {formatCOP(datos.premios[PREMIOS_NOMBRE[i]])}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {datos.top3.length === 0 && (
                                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 p-8 text-center text-zinc-400">
                                    Aún no hay pronósticos registrados. ¡Sé el primero!
                                </div>
                            )}
                        </div>

                        {/* Resumen del pozo */}
                        <div className="rounded-2xl border border-amber-400/30 bg-white dark:bg-slate-900/60 p-5 mb-6">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mb-3 text-center">
                                Pozo de premios actual
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {['primero', 'segundo', 'tercero'].map((k, i) => (
                                    <div key={k}>
                                        <p className="text-lg">{MEDALLAS[i]}</p>
                                        <p className="font-black text-sm text-amber-500 dark:text-amber-400">
                                            {formatCOP(datos.premios[k])}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total participantes */}
                        <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mb-6">
                            {datos.total_participantes} participante{datos.total_participantes !== 1 ? 's' : ''} en la competencia
                        </p>

                        <div className="text-center">
                            <Link
                                to="/comprar"
                                className="inline-block px-6 py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            >
                                ¡Consigue tus cupos y sube al podio!
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
