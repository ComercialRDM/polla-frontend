import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { obtenerGrupo, unirseGrupo } from '../api';
import Bandera from '../components/Bandera';
import Footer from '../components/Footer';

const BONO_KEY = 'polla_token_acceso';
const GRUPO_PENDIENTE_KEY = 'polla_grupo_pendiente';

function formatFecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-CO', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
    });
}

function ResultadoPrediccion({ predLocal, predVisitante, resLocal, resVisitante, estado }) {
    if (predLocal == null || predVisitante == null) {
        return <span className="text-zinc-400 text-xs">Pendiente</span>;
    }
    const pred = `${predLocal} - ${predVisitante}`;
    if (estado !== 'cerrado') {
        return <span className="text-white text-sm font-bold">{pred}</span>;
    }
    const exacto = predLocal === resLocal && predVisitante === resVisitante;
    const tendencia =
        !exacto && (
            (predLocal > predVisitante && resLocal > resVisitante) ||
            (predLocal < predVisitante && resLocal < resVisitante) ||
            (predLocal === predVisitante && resLocal === resVisitante)
        );

    return (
        <span className={`text-sm font-bold ${exacto ? 'text-green-400' : tendencia ? 'text-amber-400' : 'text-red-400'}`}>
            {pred} {exacto ? '✅' : tendencia ? '〰️' : '❌'}
        </span>
    );
}

export default function Grupo() {
    const { token } = useParams();
    const navigate = useNavigate();
    const tokenAcceso = localStorage.getItem(BONO_KEY);

    const [data, setData] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [uniendose, setUniendose] = useState(false);
    const [errorUnirse, setErrorUnirse] = useState('');
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        setCargando(true);
        obtenerGrupo(token, tokenAcceso)
            .then((d) => {
                if (!d?.success) setError(d?.error || 'Grupo no encontrado');
                else setData(d);
            })
            .catch(() => setError('No se pudo cargar el grupo'))
            .finally(() => setCargando(false));
    }, [token, tokenAcceso]);

    async function handleUnirse() {
        if (!tokenAcceso) {
            localStorage.setItem(GRUPO_PENDIENTE_KEY, token);
            navigate('/comprar?grupo=' + token);
            return;
        }
        setUniendose(true);
        setErrorUnirse('');
        try {
            const res = await unirseGrupo(token, tokenAcceso);
            if (res?.success) {
                const refreshed = await obtenerGrupo(token, tokenAcceso);
                if (refreshed?.success) setData(refreshed);
            } else {
                setErrorUnirse(res?.error || 'No se pudo unirse al grupo');
            }
        } catch {
            setErrorUnirse('Error de conexión');
        } finally {
            setUniendose(false);
        }
    }

    function copiarLink() {
        navigator.clipboard.writeText(`${window.location.origin}/grupo/${token}`);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

    if (cargando) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Cargando grupo...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-6">
                <p className="text-red-400 text-sm mb-4">{error || 'Grupo no encontrado'}</p>
                <Link to="/" className="text-amber-400 underline text-sm">Volver al inicio</Link>
            </div>
        );
    }

    const { grupo, partido, miembros, mi_usuario_id, soy_miembro } = data;
    const linkGrupo = `${window.location.origin}/grupo/${token}`;
    const linkWA = `https://wa.me/?text=${encodeURIComponent(`¡Únete a mi grupo "${grupo.nombre}" en la Polla Mundialista de La Retoucherie! 🇨🇴⚽\n\n${linkGrupo}`)}`;
    const partidoCerrado = partido.estado === 'cerrado';

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-8">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="max-w-lg mx-auto mt-8 flex flex-col gap-5">

                {/* Header */}
                <div className="text-center">
                    <p className="text-2xl mb-1">🏆</p>
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{grupo.nombre}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        {grupo.total_miembros} / {grupo.max_miembros} participantes
                    </p>
                </div>

                {/* Partido destacado */}
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-3 text-center">
                        Partido del grupo
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="flex flex-col items-center gap-1">
                            <Bandera equipo={partido.equipo_local} className="w-10 h-10" />
                            <span className="text-white font-bold text-xs text-center">{partido.equipo_local}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            {partidoCerrado ? (
                                <span className="text-amber-400 font-black text-2xl">
                                    {partido.resultado_local} - {partido.resultado_visitante}
                                </span>
                            ) : (
                                <span className="text-amber-400 font-black text-lg">VS</span>
                            )}
                            {partidoCerrado && (
                                <span className="text-xs text-zinc-400 mt-1">Resultado final</span>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Bandera equipo={partido.equipo_visitante} className="w-10 h-10" />
                            <span className="text-white font-bold text-xs text-center">{partido.equipo_visitante}</span>
                        </div>
                    </div>
                    {!partidoCerrado && (
                        <p className="text-zinc-400 text-xs text-center">{formatFecha(partido.fecha_hora_inicio)}</p>
                    )}
                </div>

                {/* CTA unirse / compartir */}
                {soy_miembro ? (
                    <div className="flex flex-col gap-2">
                        <a
                            href={linkWA}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors"
                        >
                            💬 Invitar por WhatsApp
                        </a>
                        <button
                            onClick={copiarLink}
                            className="w-full py-3 rounded-xl font-bold text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                        >
                            {copiado ? '✅ Link copiado' : '🔗 Copiar link del grupo'}
                        </button>
                        {tokenAcceso && (
                            <Link
                                to={`/polla?token=${tokenAcceso}`}
                                className="text-center text-amber-400 underline text-sm"
                            >
                                ← Ir a mi cuenta
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {grupo.total_miembros < grupo.max_miembros ? (
                            <>
                                <button
                                    onClick={handleUnirse}
                                    disabled={uniendose}
                                    className="w-full py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                                >
                                    {uniendose ? 'Uniéndose...' : tokenAcceso ? '⚽ Unirme al grupo' : '🎫 Comprar bono para unirme'}
                                </button>
                                {errorUnirse && <p className="text-red-400 text-xs text-center">{errorUnirse}</p>}
                                {!tokenAcceso && (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs text-center">
                                        Necesitas un bono activo para participar en el grupo.
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-4 text-center">
                                <p className="text-red-400 text-sm font-bold">Grupo lleno</p>
                                <p className="text-zinc-400 text-xs mt-1">Este grupo ya tiene {grupo.max_miembros} participantes.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ranking del grupo */}
                <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-white font-bold text-sm">📊 Ranking del grupo</p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                            {partidoCerrado
                                ? `Predicción para ${partido.equipo_local} vs ${partido.equipo_visitante} + puntos totales`
                                : `Predicción para ${partido.equipo_local} vs ${partido.equipo_visitante} · Puntos acumulados`}
                        </p>
                    </div>

                    {miembros.length === 0 ? (
                        <p className="text-zinc-400 text-sm text-center py-6">Aún no hay participantes.</p>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {miembros.map((m, i) => {
                                const esMio = m.usuario_id === mi_usuario_id;
                                return (
                                    <div
                                        key={m.usuario_id}
                                        className={`flex items-center gap-3 px-4 py-3 ${esMio ? 'bg-amber-400/10' : ''}`}
                                    >
                                        <span className={`text-sm font-black w-5 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-700' : 'text-zinc-500'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs flex-shrink-0">
                                            {m.tiene_foto ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/polla/foto-influencer/${m.usuario_id}`}
                                                    alt={m.nombre}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                m.nombre.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${esMio ? 'text-amber-400' : 'text-white'}`}>
                                                {m.nombre} {m.es_admin && <span className="text-xs font-normal text-zinc-400">(admin)</span>}
                                                {esMio && <span className="text-xs font-normal ml-1">· tú</span>}
                                            </p>
                                            <ResultadoPrediccion
                                                predLocal={m.pred_local}
                                                predVisitante={m.pred_visitante}
                                                resLocal={partido.resultado_local}
                                                resVisitante={partido.resultado_visitante}
                                                estado={partido.estado}
                                            />
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-white font-black text-sm">{m.puntos_total.toLocaleString()}</p>
                                            <p className="text-zinc-500 text-xs">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Link to="/" className="text-center text-zinc-500 text-sm underline hover:text-zinc-300">
                    Volver al inicio
                </Link>

                <Footer />
            </div>
        </div>
    );
}
