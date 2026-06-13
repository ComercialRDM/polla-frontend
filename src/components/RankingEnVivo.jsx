import { useEffect, useState } from 'react';
import { obtenerRanking } from '../api';

const MEDALLAS = [
    'bg-gradient-to-r from-amber-300 to-yellow-600 text-slate-950 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
    'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 shadow-[0_0_8px_rgba(203,213,225,0.4)]',
    'bg-gradient-to-r from-orange-400 to-amber-700 text-slate-950 shadow-[0_0_8px_rgba(217,119,6,0.4)]',
];

function enmascarar(nombre) {
    const partes = (nombre || '').trim().split(/\s+/);
    const primero = partes[0] || 'Jugador';
    const inicial = partes[1] ? `${partes[1][0]}.` : '';
    return `${primero} ${inicial}`.trim();
}

function tiempoRelativo(fecha) {
    const diffMs = Date.now() - new Date(fecha).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    return new Date(fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function RankingEnVivo({ partidoId }) {
    const [ranking, setRanking] = useState(null);

    useEffect(() => {
        if (!partidoId) return;
        let activo = true;

        function cargar() {
            obtenerRanking(partidoId)
                .then((data) => {
                    if (activo && data?.success) setRanking(data);
                })
                .catch(() => {});
        }

        cargar();
        const intervalo = setInterval(cargar, 30000);
        return () => {
            activo = false;
            clearInterval(intervalo);
        };
    }, [partidoId]);

    if (!ranking || !ranking.marcador) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.12)] p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-black text-base sm:text-lg flex items-center gap-2">
                    🏆 Ranking en Vivo
                </h2>
                <span className="font-scoreboard text-lime-400 neon-green bg-black rounded-md px-3 py-1 text-sm font-bold border border-white/10">
                    {ranking.marcador.goles_local} - {ranking.marcador.goles_visitante}
                </span>
            </div>

            {ranking.ganadores.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center py-4">
                    Nadie ha acertado el marcador todavía. ¡Puedes ser el primero! 🍀
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {ranking.ganadores.map((g) => (
                        <div
                            key={`${g.usuario_id}-${g.posicion}`}
                            className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-3 py-2"
                        >
                            <span
                                className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shrink-0 ${
                                    MEDALLAS[g.posicion - 1] || 'bg-white/10 text-white'
                                }`}
                            >
                                {g.posicion <= 3 ? ['🥇', '🥈', '🥉'][g.posicion - 1] : g.posicion}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">{enmascarar(g.nombre)}</p>
                                <p className="text-zinc-400 text-xs flex items-center gap-1">
                                    🕐 {tiempoRelativo(g.fecha_registro)}
                                </p>
                            </div>
                            <span className="font-scoreboard text-amber-400 neon-gold font-bold text-sm">
                                {ranking.marcador.goles_local}-{ranking.marcador.goles_visitante}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
