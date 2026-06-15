import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { obtenerInfoPolla, votar } from '../api';
import { formatoPesos } from '../config/planes';
import Bandera from '../components/Bandera';
import RankingEnVivo from '../components/RankingEnVivo';
import EquiposFavoritos from '../components/EquiposFavoritos';
import PartidosFavoritos from '../components/PartidosFavoritos';

const UNA_HORA_MS = 60 * 60 * 1000;

function calcularRestante(fechaInicio) {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    return inicio.getTime() - ahora.getTime();
}

function formatearTiempo(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
}

export default function Polla() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [info, setInfo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [ahora, setAhora] = useState(() => Date.now());
    const [marcadores, setMarcadores] = useState({});
    const [enviandoId, setEnviandoId] = useState(null);
    const [mensajeExitoId, setMensajeExitoId] = useState(null);
    const [errorPorPartido, setErrorPorPartido] = useState({});
    const [mensajeCopiado, setMensajeCopiado] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Link de acceso inválido. Ingresa desde la página principal.');
            setCargando(false);
            return;
        }

        obtenerInfoPolla(token)
            .then((data) => {
                if (!data?.acceso) {
                    setError('No encontramos un bono activo asociado a este link.');
                } else {
                    setInfo(data);
                }
            })
            .catch(() => setError('Error de conexión con el servidor.'))
            .finally(() => setCargando(false));
    }, [token]);

    useEffect(() => {
        const intervalo = setInterval(() => setAhora(Date.now()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    const partidoDestacado = useMemo(() => {
        if (!info?.partidos?.length) return null;
        return info.partidos.find((p) => calcularRestante(p.fecha_hora_inicio) > 0) || info.partidos[0];
    }, [info]);

    function actualizarMarcador(partidoId, campo, valor) {
        const valorLimpio = valor.replace(/[^0-9]/g, '').slice(0, 2);
        setMarcadores((prev) => ({
            ...prev,
            [partidoId]: { ...(prev[partidoId] || { local: '', visitante: '' }), [campo]: valorLimpio },
        }));
    }

    async function handleSubmit(partido) {
        const m = marcadores[partido.partido_id] || {};
        setErrorPorPartido((prev) => ({ ...prev, [partido.partido_id]: '' }));
        setMensajeExitoId(null);

        if (m.local === '' || m.local === undefined || m.visitante === '' || m.visitante === undefined) {
            setErrorPorPartido((prev) => ({ ...prev, [partido.partido_id]: 'Completa el marcador.' }));
            return;
        }

        setEnviandoId(partido.partido_id);
        try {
            const data = await votar({
                token_acceso: token,
                partido_id: partido.partido_id,
                local: Number(m.local),
                visitante: Number(m.visitante),
            });

            if (data?.success) {
                setMensajeExitoId(partido.partido_id);
                setInfo((prev) => ({
                    ...prev,
                    cupos_disponibles: data.cupos_disponibles,
                    dinero_disponible: data.dinero_disponible,
                    partidos: prev.partidos.map((p) =>
                        p.partido_id === partido.partido_id
                            ? { ...p, ya_pronosticado: true, pronostico: { local: Number(m.local), visitante: Number(m.visitante) } }
                            : p
                    ),
                }));
            } else {
                setErrorPorPartido((prev) => ({ ...prev, [partido.partido_id]: data?.error || 'No se pudo guardar el pronóstico.' }));
            }
        } catch {
            setErrorPorPartido((prev) => ({ ...prev, [partido.partido_id]: 'Error de conexión con el servidor.' }));
        } finally {
            setEnviandoId(null);
        }
    }

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                Cargando...
            </div>
        );
    }

    if (error && !info) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-6 text-center gap-4">
                <p className="text-red-400">{error}</p>
                <Link to="/" className="text-amber-400 underline">Volver al inicio</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-zinc-950 stadium-glow px-4 sm:px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6 relative">
                <h1 className="text-2xl font-extrabold text-white mb-1">¡Hola, {info.nombre}!</h1>
                <p className="text-zinc-400 text-sm mb-6">Predice el marcador y gana premios increíbles.</p>

                {/* Monedero de cupos */}
                <div className="rounded-2xl border border-amber-400/30 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] p-5 mb-6 text-center">
                    <p className="text-zinc-400 text-xs mb-1">Tu monedero de pronósticos</p>
                    <p className="text-amber-400 font-black text-3xl mb-1">
                        {info.cupos_disponibles} {info.cupos_disponibles === 1 ? 'cupo' : 'cupos'}
                    </p>
                    <p className="text-zinc-300 text-sm">
                        Dinero disponible: <span className="font-bold text-white">{formatoPesos(info.dinero_disponible)}</span>
                    </p>
                    {info.cupos_disponibles === 0 && (
                        <Link
                            to="/comprar"
                            className="inline-block mt-3 px-4 py-2 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.35)]"
                        >
                            Recargar cupos
                        </Link>
                    )}
                </div>

                {/* Equipos favoritos */}
                <EquiposFavoritos
                    token={token}
                    equiposIniciales={info.equipos_favoritos || []}
                    calendarioToken={info.calendario_token}
                    onGuardado={(equipos) => setInfo((prev) => ({ ...prev, equipos_favoritos: equipos }))}
                />

                {/* Próximos partidos de los equipos favoritos */}
                <PartidosFavoritos equipos={info.equipos_favoritos} />

                {/* Reta a un amigo */}
                <div className="rounded-2xl border border-amber-400/20 bg-slate-900/60 backdrop-blur-lg p-4 mb-6 text-center">
                    <p className="text-white font-bold text-sm mb-1">🏆 Reta a un amigo</p>
                    <p className="text-zinc-400 text-xs mb-3">
                        Comparte tu link y reta a tus amigos a participar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                `¡Te reto a participar en la Polla Mundialista de La Retoucherie de Manuela! Predice el marcador de los partidos de Colombia y gana premios 🇨🇴⚽\n\nCompra tu Bono Digital aquí: ${window.location.origin}/?ref=${token}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-block py-2.5 rounded-xl font-bold text-sm text-white text-center bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            📲 Retar por WhatsApp
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/?ref=${token}`);
                                setMensajeCopiado(true);
                                setTimeout(() => setMensajeCopiado(false), 2000);
                            }}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white text-center border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            {mensajeCopiado ? '¡Copiado! ✅' : '🔗 Copiar link'}
                        </button>
                    </div>
                </div>

                {/* Ranking en vivo del próximo partido */}
                {partidoDestacado && <RankingEnVivo partidoId={partidoDestacado.partido_id} />}

                {/* Tarjetas de pronóstico por partido */}
                <p className="text-white font-bold text-base mb-3">Partidos disponibles para predecir</p>

                {info.partidos.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-5 text-center text-zinc-300 mb-4">
                        No hay partidos activos por el momento.
                    </div>
                )}

                <div className="flex flex-col gap-5 mb-4">
                    {info.partidos.map((p) => {
                        const msRestantes = new Date(p.fecha_hora_inicio).getTime() - ahora;
                        const cerrado = msRestantes < 1000 || p.estado_partido !== 'activo';
                        const enUltimaHora = msRestantes > 0 && msRestantes <= UNA_HORA_MS;
                        const m = marcadores[p.partido_id] || { local: '', visitante: '' };

                        return (
                            <div
                                key={p.partido_id}
                                className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.12)] p-5 pt-6"
                            >
                                <p className="text-amber-400 font-bold text-sm mb-2 flex items-center justify-center gap-1.5 text-center">
                                    <Bandera equipo={p.equipo_local} className="w-6 h-6" />
                                    {p.equipo_local} vs
                                    <Bandera equipo={p.equipo_visitante} className="w-6 h-6" />
                                    {p.equipo_visitante}
                                </p>

                                {!cerrado && (
                                    <div
                                        className={`text-center font-scoreboard text-xl font-black tracking-widest bg-black rounded-lg py-1 mb-3 ${
                                            enUltimaHora ? 'text-red-500 parpadeo-rojo' : 'text-amber-400 neon-gold'
                                        }`}
                                    >
                                        {formatearTiempo(msRestantes)}
                                    </div>
                                )}

                                {p.ya_pronosticado ? (
                                    <div className="text-center text-zinc-300 text-sm">
                                        <p className="mb-1">Tu pronóstico:</p>
                                        <p className="text-2xl font-black text-lime-400 font-scoreboard">
                                            {p.pronostico.local} - {p.pronostico.visitante}
                                        </p>
                                    </div>
                                ) : cerrado ? (
                                    <p className="text-center text-zinc-400 text-sm">La votación para este partido está cerrada.</p>
                                ) : info.cupos_disponibles === 0 ? (
                                    <div className="text-center">
                                        <p className="text-zinc-400 text-sm mb-2">No tienes cupos disponibles para predecir este partido.</p>
                                        <Link to="/comprar" className="text-amber-400 underline text-sm font-bold">
                                            Recarga para predecir este partido
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={m.local}
                                                    onChange={(e) => actualizarMarcador(p.partido_id, 'local', e.target.value)}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/30 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                                />
                                            </div>

                                            <span className="text-amber-400 font-black text-xl sm:text-2xl font-scoreboard">VS</span>

                                            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={m.visitante}
                                                    onChange={(e) => actualizarMarcador(p.partido_id, 'visitante', e.target.value)}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/30 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                                />
                                            </div>
                                        </div>

                                        {errorPorPartido[p.partido_id] && (
                                            <p className="text-red-400 text-sm text-center mt-3">{errorPorPartido[p.partido_id]}</p>
                                        )}
                                        {mensajeExitoId === p.partido_id && (
                                            <p className="text-green-400 text-sm text-center mt-3">¡Pronóstico guardado con éxito! 🇨🇴</p>
                                        )}

                                        <button
                                            onClick={() => handleSubmit(p)}
                                            disabled={enviandoId === p.partido_id}
                                            className="w-full mt-4 py-3 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                                        >
                                            {enviandoId === p.partido_id ? 'Guardando...' : 'Guardar pronóstico (1 cupo)'}
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
