import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import { bandera } from '../utils/banderas';

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    const fechaTexto = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    const horaTexto = fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    return `${fechaTexto} · ${horaTexto}`;
}

export default function UltimosResultados() {
    const [partidos, setPartidos] = useState([]);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (!data?.success || data.partidos.length === 0) return;
                const ahora = Date.now();
                const recientes = data.partidos
                    .filter((p) => new Date(p.fecha_hora_inicio).getTime() <= ahora)
                    .sort((a, b) => new Date(b.fecha_hora_inicio) - new Date(a.fecha_hora_inicio));
                setPartidos(recientes.slice(0, 3));
            })
            .catch(() => {});
    }, []);

    if (partidos.length === 0) return null;

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <h2 className="text-white font-black text-lg mb-3">Resultados recientes</h2>
            <div className="flex flex-col gap-2">
                {partidos.map((partido) => {
                    const inicio = new Date(partido.fecha_hora_inicio);
                    const enVivo = partido.estado === 'activo' && inicio <= new Date();
                    const finalizado = partido.estado === 'cerrado';

                    return (
                        <div
                            key={partido.id}
                            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-2xl">{bandera(partido.equipo_local)}</span>
                                    <span className="text-white font-bold text-sm truncate">{partido.equipo_local}</span>
                                </div>

                                <div className="flex flex-col items-center px-2">
                                    {enVivo ? (
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wide mb-1">
                                            ● En vivo
                                        </span>
                                    ) : finalizado ? (
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide mb-1">
                                            Finalizado
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide mb-1">
                                            Próximo
                                        </span>
                                    )}

                                    {enVivo || finalizado ? (
                                        <span className="font-scoreboard text-xl font-black text-amber-400">
                                            {partido.goles_local} - {partido.goles_visitante}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-zinc-400 whitespace-nowrap">
                                            {formatearFecha(partido.fecha_hora_inicio)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                    <span className="text-white font-bold text-sm truncate text-right">{partido.equipo_visitante}</span>
                                    <span className="text-2xl">{bandera(partido.equipo_visitante)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
