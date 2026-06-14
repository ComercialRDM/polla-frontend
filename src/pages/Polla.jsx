import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { obtenerInfoPolla, votar } from '../api';
import Bandera from '../components/Bandera';
import RankingEnVivo from '../components/RankingEnVivo';

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
    const [msRestantes, setMsRestantes] = useState(null);
    const [marcadores, setMarcadores] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [hayCambios, setHayCambios] = useState(false);
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
                    setMsRestantes(calcularRestante(data.fecha_hora_inicio));
                    setMarcadores(
                        Array.from({ length: data.intentos_disponibles }, () => ({ local: '', visitante: '' }))
                    );
                }
            })
            .catch(() => setError('Error de conexión con el servidor.'))
            .finally(() => setCargando(false));
    }, [token]);

    useEffect(() => {
        if (!info) return;
        const intervalo = setInterval(() => {
            setMsRestantes(calcularRestante(info.fecha_hora_inicio));
        }, 1000);
        return () => clearInterval(intervalo);
    }, [info]);

    const cerrado = useMemo(() => {
        if (msRestantes === null) return false;
        return msRestantes < 1000 || info?.estado_partido !== 'activo';
    }, [msRestantes, info]);

    const enUltimaHora = msRestantes !== null && msRestantes > 0 && msRestantes <= UNA_HORA_MS;

    function actualizarMarcador(index, campo, valor) {
        const valorLimpio = valor.replace(/[^0-9]/g, '').slice(0, 2);
        setMarcadores((prev) => prev.map((m, i) => (i === index ? { ...m, [campo]: valorLimpio } : m)));
        setHayCambios(true);
    }

    async function handleSubmit() {
        setError('');
        setMensajeExito('');

        const marcadoresCompletos = marcadores.filter((m) => m.local !== '' && m.visitante !== '');
        if (marcadoresCompletos.length === 0) {
            setError('Completa al menos un pronóstico.');
            return;
        }

        setEnviando(true);
        try {
            const data = await votar({
                token_acceso: token,
                partido_id: info.partido_id,
                marcadores: marcadoresCompletos.map((m) => ({ local: Number(m.local), visitante: Number(m.visitante) })),
            });

            if (data?.success) {
                setMensajeExito('¡Pronósticos guardados con éxito! Mucha suerte 🇨🇴');
                setInfo((prev) => ({ ...prev, intentos_disponibles: data.intentos_disponibles }));
                setMarcadores(Array.from({ length: data.intentos_disponibles }, () => ({ local: '', visitante: '' })));
                setHayCambios(false);
            } else {
                setError(data?.error || 'No se pudieron guardar los pronósticos.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
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

    const mostrarFormulario = !cerrado && info.intentos_disponibles > 0;

    return (
        <div className="min-h-screen relative bg-zinc-950 stadium-glow px-4 sm:px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className={`w-full max-w-md mt-6 relative ${mostrarFormulario ? 'pb-28 sm:pb-0' : ''}`}>
                <h1 className="text-2xl font-extrabold text-white mb-1">¡Hola, {info.nombre}!</h1>
                <p className="text-zinc-400 text-sm mb-6">Predice el marcador y gana premios increíbles.</p>

                {/* Marcador tipo estadio */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] p-6 mb-6 text-center">
                    <p className="text-amber-400 font-bold text-lg mb-3 flex items-center justify-center gap-2">
                        <Bandera equipo={info.equipo_local} className="w-7 h-7" />
                        {info.equipo_local} vs {info.equipo_visitante}
                        <Bandera equipo={info.equipo_visitante} className="w-7 h-7" />
                    </p>
                    <p className="text-xs text-zinc-400 mb-1">
                        {cerrado ? 'Votación cerrada' : enUltimaHora ? '¡Última hora para votar!' : 'Tiempo restante para predecir'}
                    </p>
                    <div
                        className={`font-scoreboard text-4xl sm:text-5xl font-black tracking-widest bg-black rounded-xl py-2 ${
                            cerrado ? 'text-zinc-500' : enUltimaHora ? 'text-red-500 parpadeo-rojo' : 'text-amber-400 neon-gold'
                        }`}
                    >
                        {cerrado ? '00:00:00' : formatearTiempo(msRestantes)}
                    </div>
                </div>

                {/* Reta a un amigo */}
                <div className="rounded-2xl border border-amber-400/20 bg-slate-900/60 backdrop-blur-lg p-4 mb-6 text-center">
                    <p className="text-white font-bold text-sm mb-1">🏆 Reta a un amigo</p>
                    <p className="text-zinc-400 text-xs mb-3">
                        Comparte tu link, y si tu amigo compra su bono, ¡ambos ganan un intento extra!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                `¡Te reto a participar en la Polla Mundialista de La Retoucherie de Manuela! Predice el marcador de ${info.equipo_local} vs ${info.equipo_visitante} y gana premios 🇨🇴⚽\n\nCompra tu Bono Digital aquí, y con este link ambos ganamos un intento extra: ${window.location.origin}/?ref=${token}`
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

                {/* Ranking en vivo */}
                <RankingEnVivo partidoId={info.partido_id} />

                {cerrado ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-5 text-center text-zinc-300">
                        El partido ya comenzó o la votación está cerrada. ¡Gracias por participar!
                    </div>
                ) : info.intentos_disponibles === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-5 text-center text-zinc-300">
                        Ya usaste todos tus intentos para este partido. ¡Mucha suerte! 🍀
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-zinc-300 mb-3">
                            Tienes <span className="text-amber-400 font-bold">{info.intentos_disponibles}</span> intento(s) disponibles.
                        </p>

                        <div className="flex flex-col gap-5 mb-4">
                            {marcadores.map((m, i) => (
                                <div
                                    key={i}
                                    className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.12)] p-5 pt-6"
                                >
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                        Intento #{i + 1}
                                    </span>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                            <Bandera equipo={info.equipo_local} className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
                                            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wide truncate max-w-full">
                                                {info.equipo_local}
                                            </span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={m.local}
                                                onChange={(e) => actualizarMarcador(i, 'local', e.target.value)}
                                                className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/30 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                            />
                                        </div>

                                        <span className="text-amber-400 font-black text-xl sm:text-2xl font-scoreboard">VS</span>

                                        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                            <Bandera equipo={info.equipo_visitante} className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
                                            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wide truncate max-w-full">
                                                {info.equipo_visitante}
                                            </span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={m.visitante}
                                                onChange={(e) => actualizarMarcador(i, 'visitante', e.target.value)}
                                                className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/30 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                        {mensajeExito && (
                            <div className="mb-3">
                                <p className="text-green-400 text-sm mb-2">{mensajeExito}</p>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(
                                        `¡Ya registré mi pronóstico para ${info.equipo_local} vs ${info.equipo_visitante} en la Polla Mundialista de La Retoucherie de Manuela! 🇨🇴⚽\n\nCompra tu Bono Digital y participa tú también, con este link ambos ganamos un intento extra: ${window.location.origin}/?ref=${token}`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block w-full py-3 rounded-xl font-bold text-white text-center bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                    📲 Compartir en WhatsApp
                                </a>
                            </div>
                        )}

                        {/* Botón flotante en móvil, normal en desktop */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-20 sm:static sm:bg-none sm:p-0">
                            <button
                                onClick={handleSubmit}
                                disabled={enviando}
                                className={`w-full max-w-md mx-auto block py-4 rounded-xl font-black text-slate-950 text-center text-base sm:text-lg bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60 ${
                                    hayCambios && !enviando ? 'animate-pulse' : ''
                                }`}
                            >
                                {enviando ? 'Guardando...' : 'Guardar pronósticos'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
