import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPartidos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import { obtenerSesion } from '../utils/sesion';
import { agregarMarcadorPendiente, quitarMarcadorPendiente, obtenerMarcadoresPendientes } from '../utils/marcadorPendiente';
import { COSTO_CUPO_FASE, calcularMontoPorPredicciones, formatoPesos } from '../config/planes';
import Bandera from './Bandera';

const OPCIONES_GOLES = Array.from({ length: 11 }, (_, i) => i);

export default function ProximosPartidos({ limite = 5, titulo = '⚽ Próximos partidos' }) {
    const navigate = useNavigate();
    const [partidos, setPartidos] = useState([]);
    const [predicciones, setPredicciones] = useState({});
    const sesion = obtenerSesion();
    const favoritos = (sesion?.equipos_favoritos || []).map((e) => e.toLowerCase());

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success) setPartidos(partidosFuturos(data.partidos, limite));
            })
            .catch(() => {});

        const pendientes = obtenerMarcadoresPendientes();
        if (pendientes.length > 0) {
            const inicial = {};
            pendientes.forEach((p) => { inicial[p.partido_id] = { local: String(p.local), visitante: String(p.visitante) }; });
            setPredicciones(inicial);
        }
    }, [limite]);

    if (partidos.length === 0) return null;

    function actualizarPrediccion(partidoId, campo, valor) {
        setPredicciones((prev) => {
            const actual = { ...(prev[partidoId] || { local: '', visitante: '' }), [campo]: valor };
            const siguiente = { ...prev, [partidoId]: actual };

            if (actual.local !== '' && actual.visitante !== '') {
                agregarMarcadorPendiente({ partido_id: partidoId, local: Number(actual.local), visitante: Number(actual.visitante) });
            } else {
                quitarMarcadorPendiente(partidoId);
            }
            return siguiente;
        });
    }

    const partidosConPrediccion = Object.entries(predicciones).filter(
        ([, m]) => m.local !== '' && m.visitante !== ''
    );
    const cantidadPredicciones = partidosConPrediccion.length;
    const { cupos, monto } = cantidadPredicciones > 0
        ? calcularMontoPorPredicciones(
            partidosConPrediccion.map(([partidoId, m]) => ({ partido_id: Number(partidoId), local: Number(m.local), visitante: Number(m.visitante) })),
            partidos
        )
        : { cupos: 0, monto: 0 };

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <h2 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-1">
                {titulo}
            </h2>
            <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                Predice el marcador de los que quieras y compra tu bono al final 🔥
            </p>

            <div className="flex flex-col gap-3">
                {partidos.map((p) => {
                    const fecha = new Date(p.fecha_hora_inicio);
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    const esFavorito =
                        favoritos.includes(p.equipo_local?.toLowerCase()) ||
                        favoritos.includes(p.equipo_visitante?.toLowerCase());
                    const m = predicciones[p.id] || { local: '', visitante: '' };
                    const cuposCosto = COSTO_CUPO_FASE[p.fase] ?? 1;

                    return (
                    <div
                        key={p.id}
                        className={`relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur-lg ${
                            esFavorito
                                ? 'border-[#FCD116] bg-[#FCD116]/5 dark:bg-[#FCD116]/10 shadow-[0_0_12px_rgba(252,209,22,0.2)]'
                                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 dark:shadow-none'
                        }`}
                    >
                        {esFavorito && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#FCD116] text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                ⭐ FAVORITO
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <span className="text-[10px] bg-amber-400/15 text-amber-600 dark:text-amber-400 rounded-full px-2 py-0.5 font-bold">
                                {cuposCosto} {cuposCosto === 1 ? 'cupo' : 'cupos'}
                            </span>
                        </div>

                        <div className="flex justify-center items-baseline gap-1.5 mt-1">
                            <span className="text-amber-500 dark:text-amber-400 text-xs font-bold">
                                {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-400 text-[10px]">
                                {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                {esHoy ? ' (Hoy)' : ''}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                <Bandera equipo={p.equipo_local} className="w-7 h-7 flex-shrink-0" />
                                <span className="text-zinc-900 dark:text-white font-bold text-xs text-center truncate w-full">{p.equipo_local}</span>
                                <select
                                    value={m.local}
                                    onChange={(e) => actualizarPrediccion(p.id, 'local', e.target.value)}
                                    aria-label={`Goles de ${p.equipo_local}`}
                                    className="w-14 text-center text-xl font-black rounded-lg border-2 border-amber-400 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="">-</option>
                                    {OPCIONES_GOLES.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold flex-shrink-0 mt-5">vs</span>

                            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                <Bandera equipo={p.equipo_visitante} className="w-7 h-7 flex-shrink-0" />
                                <span className="text-zinc-900 dark:text-white font-bold text-xs text-center truncate w-full">{p.equipo_visitante}</span>
                                <select
                                    value={m.visitante}
                                    onChange={(e) => actualizarPrediccion(p.id, 'visitante', e.target.value)}
                                    aria-label={`Goles de ${p.equipo_visitante}`}
                                    className="w-14 text-center text-xl font-black rounded-lg border-2 border-amber-400 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="">-</option>
                                    {OPCIONES_GOLES.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            {cantidadPredicciones > 0 && (
                <button
                    type="button"
                    onClick={() => navigate('/comprar')}
                    className="sticky bottom-4 mt-5 w-full py-4 rounded-2xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_25px_rgba(234,179,8,0.45)] active:scale-95 transition-transform"
                >
                    🏆 Comprar Bono — {cantidadPredicciones} {cantidadPredicciones === 1 ? 'partido' : 'partidos'} ({cupos} {cupos === 1 ? 'cupo' : 'cupos'}) · {formatoPesos(monto)}
                </button>
            )}
        </div>
    );
}
