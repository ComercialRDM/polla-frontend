import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { obtenerInfoPolla, votar, subirFotoPerfil, crearGrupo, obtenerMisGrupos, actualizarPerfilDemografico, solicitarRegalo, misSolicitudesRegalo } from '../api';
import { formatoPesos, calcularMontoPorPredicciones } from '../config/planes';
import { agregarMarcadorPendiente, obtenerMarcadoresPendientes } from '../utils/marcadorPendiente';
import Bandera from '../components/Bandera';
import RankingEnVivo from '../components/RankingEnVivo';
import RankingInfluencers from '../components/RankingInfluencers';
import EquiposFavoritos from '../components/EquiposFavoritos';
import PartidosFavoritos from '../components/PartidosFavoritos';
import CompartirPronostico from '../components/CompartirPronostico';
import { cerrarSesion } from '../utils/sesion';
import PozoPremios from '../components/PozoPremios';

const UNA_HORA_MS = 60 * 60 * 1000;
const FOTO_REMINDER_KEY = 'polla_foto_recordatorio_at';
const FOTO_REMINDER_DIAS = 7;
function fotoReminderDismissed() {
    const ts = localStorage.getItem(FOTO_REMINDER_KEY);
    return ts && Date.now() - Number(ts) < FOTO_REMINDER_DIAS * 24 * 60 * 60 * 1000;
}
const DEMO_REMINDER_KEY = 'polla_demografico_recordatorio_at';
const DEMO_REMINDER_DIAS = 30;
function demoReminderDismissed() {
    const ts = localStorage.getItem(DEMO_REMINDER_KEY);
    return ts && Date.now() - Number(ts) < DEMO_REMINDER_DIAS * 24 * 60 * 60 * 1000;
}

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
    const navigate = useNavigate();
    const token = searchParams.get('token');

    function handleCerrarSesion() {
        cerrarSesion();
        navigate('/');
    }

    const [info, setInfo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [ahora, setAhora] = useState(() => Date.now());
    const [marcadores, setMarcadores] = useState({});
    const [enviandoId, setEnviandoId] = useState(null);
    const [mensajeExitoId, setMensajeExitoId] = useState(null);
    const [errorPorPartido, setErrorPorPartido] = useState({});
    const [mensajeCopiado, setMensajeCopiado] = useState(false);
    const [partidosVisibles, setPartidosVisibles] = useState(3);
    const [encolados, setEncolados] = useState({});
    const [mostrarFotoReminder, setMostrarFotoReminder] = useState(false);
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [fotoSubidaOk, setFotoSubidaOk] = useState(false);
    const [errorFoto, setErrorFoto] = useState('');
    const [misGrupos, setMisGrupos] = useState(null);
    const [creandoGrupo, setCreandoGrupo] = useState(false);
    const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState('');
    const [nuevoGrupoPartido, setNuevoGrupoPartido] = useState('');
    const [errorGrupo, setErrorGrupo] = useState('');
    const [mostrarFormGrupo, setMostrarFormGrupo] = useState(false);
    // Regalo de bono
    const [mostrarModalRegalo, setMostrarModalRegalo] = useState(false);
    const [regaloForm, setRegaloForm] = useState({ receptor_nombre: '', receptor_cedula: '', receptor_celular: '', receptor_correo: '' });
    const [regaloAcepta, setRegaloAcepta] = useState(false);
    const [regaloEnviando, setRegaloEnviando] = useState(false);
    const [regaloMensaje, setRegaloMensaje] = useState('');
    const [regaloError, setRegaloError] = useState('');
    const [misSolicitudes, setMisSolicitudes] = useState([]);

    const [mostrarDemoBanner, setMostrarDemoBanner] = useState(false);
    const [demoFecha, setDemoFecha] = useState('');
    const [demoSexo, setDemoSexo] = useState('');
    const [guardandoDemo, setGuardandoDemo] = useState(false);
    const [demoGuardado, setDemoGuardado] = useState(false);
    const [errorDemo, setErrorDemo] = useState('');

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
                    // Si ya había predicciones encoladas por falta de cupos (de una
                    // visita anterior), se reflejan en la UI sin que el usuario tenga
                    // que volver a marcarlas.
                    const idsPartidos = new Set(data.partidos.map((p) => p.partido_id));
                    const pendientes = obtenerMarcadoresPendientes().filter((m) => idsPartidos.has(m.partido_id));
                    if (pendientes.length > 0) {
                        const inicial = {};
                        pendientes.forEach((m) => { inicial[m.partido_id] = true; });
                        setEncolados(inicial);
                    }
                }
            })
            .catch(() => setError('Error de conexión con el servidor.'))
            .finally(() => setCargando(false));

        misSolicitudesRegalo(token).then((d) => { if (d?.success) setMisSolicitudes(d.solicitudes); }).catch(() => {});
    }, [token]);

    useEffect(() => {
        const intervalo = setInterval(() => setAhora(Date.now()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        if (!info?.es_especial || info?.tiene_foto || fotoReminderDismissed()) return;
        const timer = setTimeout(() => setMostrarFotoReminder(true), 5000);
        return () => clearTimeout(timer);
    }, [info]);

    useEffect(() => {
        if (!info || info.fecha_nacimiento || demoReminderDismissed()) return;
        const timer = setTimeout(() => setMostrarDemoBanner(true), 8000);
        return () => clearTimeout(timer);
    }, [info]);

    async function handleSubirFoto(e) {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        setSubiendoFoto(true);
        setErrorFoto('');
        try {
            await subirFotoPerfil(token, archivo);
            setFotoSubidaOk(true);
            setInfo((prev) => prev ? { ...prev, tiene_foto: true } : prev);
            setTimeout(() => { setMostrarFotoReminder(false); setFotoSubidaOk(false); }, 3000);
        } catch (err) {
            setErrorFoto(err.message);
        } finally {
            setSubiendoFoto(false);
        }
    }

    function dismissFotoReminder() {
        localStorage.setItem(FOTO_REMINDER_KEY, String(Date.now()));
        setMostrarFotoReminder(false);
    }

    async function handleEnviarRegalo(e) {
        e.preventDefault();
        setRegaloError('');
        if (!regaloForm.receptor_nombre.trim() || !regaloForm.receptor_cedula.trim() || !regaloForm.receptor_celular.trim()) {
            setRegaloError('Nombre, cédula y celular del receptor son obligatorios');
            return;
        }
        if (!regaloAcepta) { setRegaloError('Debes aceptar los términos'); return; }
        setRegaloEnviando(true);
        try {
            const res = await solicitarRegalo(token, {
                ...regaloForm,
                receptor_celular: `+57${regaloForm.receptor_celular.replace(/[^0-9]/g, '')}`,
                acepta_terminos: true,
            });
            if (res?.success) {
                setRegaloMensaje('✅ Solicitud enviada. Nuestro equipo la revisará y te confirmaremos.');
                setRegaloForm({ receptor_nombre: '', receptor_cedula: '', receptor_celular: '', receptor_correo: '' });
                setRegaloAcepta(false);
                misSolicitudesRegalo(token).then((d) => { if (d?.success) setMisSolicitudes(d.solicitudes); }).catch(() => {});
            } else {
                setRegaloError(res?.error || 'Error al enviar la solicitud');
            }
        } catch { setRegaloError('Error de conexión'); }
        finally { setRegaloEnviando(false); }
    }

    function dismissDemoBanner() {
        localStorage.setItem(DEMO_REMINDER_KEY, String(Date.now()));
        setMostrarDemoBanner(false);
    }

    async function handleGuardarDemo(e) {
        e.preventDefault();
        if (!demoFecha && !demoSexo) {
            setErrorDemo('Completa al menos un campo');
            return;
        }
        setGuardandoDemo(true);
        setErrorDemo('');
        try {
            const payload = { token_acceso: token };
            if (demoFecha) payload.fecha_nacimiento = demoFecha;
            if (demoSexo)  payload.sexo = demoSexo;
            await actualizarPerfilDemografico(payload);
            setDemoGuardado(true);
            setInfo((prev) => prev ? { ...prev, fecha_nacimiento: demoFecha || prev.fecha_nacimiento, sexo: demoSexo || prev.sexo } : prev);
            setTimeout(() => { setMostrarDemoBanner(false); setDemoGuardado(false); }, 2500);
        } catch (err) {
            setErrorDemo(err.message || 'Error al guardar');
        } finally {
            setGuardandoDemo(false);
        }
    }

    // Guarda el token en localStorage para que /grupo/:token pueda identificar al usuario
    useEffect(() => {
        if (token) localStorage.setItem('polla_token_acceso', token);
    }, [token]);

    // Carga los grupos del usuario una vez que info está disponible
    useEffect(() => {
        if (!token || !info) return;
        obtenerMisGrupos(token)
            .then((d) => { if (d?.success) setMisGrupos(d.grupos); })
            .catch(() => {});
    }, [token, info]);

    async function handleCrearGrupo(e) {
        e.preventDefault();
        if (!nuevoGrupoNombre.trim() || !nuevoGrupoPartido) {
            setErrorGrupo('Completa el nombre y el partido');
            return;
        }
        setCreandoGrupo(true);
        setErrorGrupo('');
        try {
            const res = await crearGrupo({ token_acceso: token, nombre: nuevoGrupoNombre.trim(), partido_id: Number(nuevoGrupoPartido) });
            if (res?.success) {
                setMostrarFormGrupo(false);
                setNuevoGrupoNombre('');
                setNuevoGrupoPartido('');
                // Refrescar lista de grupos
                const d = await obtenerMisGrupos(token);
                if (d?.success) setMisGrupos(d.grupos);
            } else {
                setErrorGrupo(res?.error || 'No se pudo crear el grupo');
            }
        } catch {
            setErrorGrupo('Error de conexión');
        } finally {
            setCreandoGrupo(false);
        }
    }

    const partidoDestacado = useMemo(() => {
        if (!info?.partidos?.length) return null;
        return info.partidos.find((p) => calcularRestante(p.fecha_hora_inicio) > 0) || info.partidos[0];
    }, [info]);

    const idsEncolados = Object.keys(encolados).filter((id) => encolados[id]).map(Number);
    const cantidadEncolados = idsEncolados.length;
    const { cupos: cuposEncolados, monto: montoEncolados } = useMemo(() => {
        if (!info?.partidos?.length || idsEncolados.length === 0) return { cupos: 0, monto: 0 };
        const predicciones = idsEncolados.map((id) => ({ partido_id: id }));
        const partidosComoFase = info.partidos.map((p) => ({ id: p.partido_id, fase: p.fase }));
        return calcularMontoPorPredicciones(predicciones, partidosComoFase);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [info, cantidadEncolados]);

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

        // Sin cupos suficientes: se encola la predicción (igual que en la lista
        // pública de "Próximos partidos") en vez de intentar votar de una y
        // fallar — el usuario puede comprar más cupos cuando quiera y se
        // confirma sola en /gracias.
        if (info.cupos_disponibles < (partido.cupos_costo || 1)) {
            agregarMarcadorPendiente({ partido_id: partido.partido_id, local: Number(m.local), visitante: Number(m.visitante) });
            setEncolados((prev) => ({ ...prev, [partido.partido_id]: true }));
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
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                Cargando...
            </div>
        );
    }

    if (error && !info) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-6 text-center gap-4">
                <p className="text-red-400">{error}</p>
                <Link to="/" className="text-amber-500 dark:text-amber-400 underline">Volver al inicio</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-white dark:bg-zinc-950 stadium-glow px-4 sm:px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6 relative">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                        {/* Avatar de perfil — clicable para todos los usuarios */}
                        <label className="relative cursor-pointer flex-shrink-0 group">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl border-2 border-amber-400/40">
                                {info.tiene_foto ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/polla/foto-influencer/${info.usuario_id}`}
                                        alt={info.nombre}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    info.nombre.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-lg">📷</span>
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleSubirFoto}
                                className="hidden"
                                disabled={subiendoFoto}
                            />
                            {subiendoFoto && (
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">...</span>
                                </div>
                            )}
                            {fotoSubidaOk && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                            )}
                        </label>
                        <div>
                            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">¡Hola, {info.nombre}!</h1>
                            {info.es_especial && (
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-[#FCD116] text-zinc-950">
                                    🎖️ Bono Especial
                                </span>
                            )}
                            {!info.tiene_foto && !subiendoFoto && (
                                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">Toca la foto para agregar una 📷</p>
                            )}
                            {errorFoto && <p className="text-red-400 text-xs mt-0.5">{errorFoto}</p>}
                        </div>
                    </div>
                    <button
                        onClick={handleCerrarSesion}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 hover:text-red-500 hover:border-red-500 transition-colors flex-shrink-0"
                    >
                        Cerrar sesión
                    </button>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 mt-2">Predice el marcador y gana premios increíbles.</p>

                {/* Monedero de cupos */}
                <div className="rounded-2xl border border-amber-400/30 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur-lg p-5 mb-6 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Tu monedero de pronósticos</p>
                    <p className="text-amber-500 dark:text-amber-400 font-black text-3xl mb-1">
                        {info.cupos_disponibles} {info.cupos_disponibles === 1 ? 'cupo' : 'cupos'}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                        Bono Retoucherie disponible: <span className="font-bold text-zinc-900 dark:text-white">{formatoPesos(info.dinero_disponible)}</span>
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
                        Bono de Servicios vigente hasta el <strong>1 mar 2027</strong>
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

                {/* Predicciones guardadas sin cupos suficientes todavía */}
                {cantidadEncolados > 0 && (
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 mb-6 text-center">
                        <p className="text-zinc-900 dark:text-white font-bold text-sm mb-1">
                            🔥 Tienes {cantidadEncolados} {cantidadEncolados === 1 ? 'predicción guardada' : 'predicciones guardadas'} sin cupos
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                            Compra {cuposEncolados} {cuposEncolados === 1 ? 'cupo' : 'cupos'} más para confirmarlas todas.
                        </p>
                        <Link
                            to="/comprar"
                            className="inline-block px-4 py-2 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.35)]"
                        >
                            Comprar {formatoPesos(montoEncolados)}
                        </Link>
                    </div>
                )}

                {/* Ranking solo entre creadores de contenido (Bono Especial) */}
                {info.es_especial && <RankingInfluencers token={token} />}

                {/* Pozo de premios en tiempo real */}
                <PozoPremios compact />

                {/* Mi Grupo */}
                {misGrupos !== null && (
                    <div className="rounded-2xl border border-amber-400/20 bg-white dark:bg-slate-900/60 p-4 mb-2">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-zinc-900 dark:text-white font-bold text-sm">🏆 Mi grupo</p>
                            <button
                                onClick={() => { setMostrarFormGrupo((v) => !v); setErrorGrupo(''); }}
                                className="text-xs text-amber-500 hover:text-amber-400 font-semibold"
                            >
                                {mostrarFormGrupo ? 'Cancelar' : '+ Crear grupo'}
                            </button>
                        </div>

                        {mostrarFormGrupo && (
                            <form onSubmit={handleCrearGrupo} className="flex flex-col gap-2 mb-3">
                                <input
                                    type="text"
                                    value={nuevoGrupoNombre}
                                    onChange={(e) => setNuevoGrupoNombre(e.target.value)}
                                    placeholder="Nombre del grupo (ej: Familia García)"
                                    maxLength={100}
                                    className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                />
                                <select
                                    value={nuevoGrupoPartido}
                                    onChange={(e) => setNuevoGrupoPartido(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                >
                                    <option value="">Selecciona el partido del grupo</option>
                                    {info.partidos.filter((p) => p.estado_partido === 'activo').map((p) => (
                                        <option key={p.partido_id} value={p.partido_id}>
                                            {p.equipo_local} vs {p.equipo_visitante}
                                        </option>
                                    ))}
                                </select>
                                {errorGrupo && <p className="text-red-400 text-xs">{errorGrupo}</p>}
                                <button
                                    type="submit"
                                    disabled={creandoGrupo}
                                    className="w-full py-2.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 disabled:opacity-60"
                                >
                                    {creandoGrupo ? 'Creando...' : 'Crear grupo'}
                                </button>
                            </form>
                        )}

                        {misGrupos.length === 0 && !mostrarFormGrupo && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs text-center py-2">
                                No estás en ningún grupo aún. ¡Crea uno y compártelo con tus amigos!
                            </p>
                        )}

                        {misGrupos.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {misGrupos.map((g) => (
                                    <Link
                                        key={g.token_grupo}
                                        to={`/grupo/${g.token_grupo}`}
                                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 dark:bg-zinc-800/50 px-3 py-2.5 hover:bg-amber-400/5 transition-colors"
                                    >
                                        <div>
                                            <p className="text-zinc-900 dark:text-white font-bold text-sm">
                                                {g.nombre}
                                                {g.es_admin && <span className="ml-1 text-xs text-amber-400 font-normal">(admin)</span>}
                                            </p>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                {g.equipo_local} vs {g.equipo_visitante} · {g.total_miembros}/{g.max_miembros}
                                            </p>
                                        </div>
                                        <span className="text-amber-400 text-sm">→</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tarjetas de pronóstico por partido */}
                <p className="text-zinc-900 dark:text-white font-bold text-base mb-3 mt-6">Partidos disponibles para predecir</p>

                {info.partidos.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-center text-zinc-300 mb-4">
                        No hay partidos activos por el momento.
                    </div>
                )}

                <div className="flex flex-col gap-5 mb-4">
                    {info.partidos.slice(0, partidosVisibles).map((p) => {
                        const msRestantes = new Date(p.fecha_hora_inicio).getTime() - ahora;
                        const cerrado = msRestantes < 5 * 60 * 1000 || p.estado_partido !== 'activo';
                        const enUltimaHora = msRestantes > 0 && msRestantes <= UNA_HORA_MS;
                        const m = marcadores[p.partido_id] || { local: '', visitante: '' };

                        return (
                            <div
                                key={p.partido_id}
                                className="relative rounded-2xl border border-white/10 bg-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.1)] p-5 pt-6"
                            >
                                {/* Costo en cupos */}
                                <div className="absolute top-2 right-2">
                                    <span className="text-xs bg-amber-400/15 text-amber-500 dark:text-amber-400 rounded-full px-2 py-0.5 font-semibold">
                                        {p.cupos_costo} {p.cupos_costo === 1 ? 'cupo' : 'cupos'}
                                    </span>
                                </div>

                                {/* Equipos */}
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        <Bandera equipo={p.equipo_local} className="w-10 h-10" />
                                        <span className="text-white font-bold text-xs text-center leading-tight">{p.equipo_local}</span>
                                    </div>
                                    <span className="text-amber-400 font-black text-lg">VS</span>
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        <Bandera equipo={p.equipo_visitante} className="w-10 h-10" />
                                        <span className="text-white font-bold text-xs text-center leading-tight">{p.equipo_visitante}</span>
                                    </div>
                                </div>

                                {!cerrado && (
                                    <div
                                        className={`text-center font-scoreboard text-xl font-black tracking-widest bg-black/60 rounded-lg py-1 mb-3 ${
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
                                        <CompartirPronostico
                                            equipoLocal={p.equipo_local}
                                            equipoVisitante={p.equipo_visitante}
                                            localPred={p.pronostico.local}
                                            visitantePred={p.pronostico.visitante}
                                            tokenAcceso={token}
                                            partidoId={p.partido_id}
                                        />
                                    </div>
                                ) : cerrado ? (
                                    <p className="text-center text-zinc-400 text-sm">La votación para este partido está cerrada.</p>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={m.local}
                                                    onChange={(e) => actualizarMarcador(p.partido_id, 'local', e.target.value)}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/40 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                                />
                                            </div>

                                            <span className="text-amber-400 font-black text-xl sm:text-2xl font-scoreboard">VS</span>

                                            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={m.visitante}
                                                    onChange={(e) => actualizarMarcador(p.partido_id, 'visitante', e.target.value)}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-lg bg-black border-2 border-amber-400/40 text-lime-400 neon-green font-scoreboard focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                                                />
                                            </div>
                                        </div>

                                        {info.cupos_disponibles < (p.cupos_costo || 1) && !encolados[p.partido_id] && (
                                            <p className="text-amber-400 text-xs text-center mt-2">
                                                Te faltan cupos para este partido ({p.cupos_costo} {p.cupos_costo === 1 ? 'cupo' : 'cupos'} — tienes {info.cupos_disponibles}). Puedes guardar tu predicción igual y comprar más cupos después.
                                            </p>
                                        )}

                                        {errorPorPartido[p.partido_id] && (
                                            <p className="text-red-400 text-sm text-center mt-3">{errorPorPartido[p.partido_id]}</p>
                                        )}

                                        {encolados[p.partido_id] ? (
                                            <div className="w-full mt-4 py-3 rounded-xl font-bold text-center bg-amber-400/15 text-amber-600 dark:text-amber-400 text-sm">
                                                ✓ Predicción guardada — <Link to="/comprar" className="underline">compra cupos para confirmarla</Link>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSubmit(p)}
                                                disabled={enviandoId === p.partido_id}
                                                className="w-full mt-4 py-3 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                                            >
                                                {enviandoId === p.partido_id
                                                    ? 'Guardando...'
                                                    : info.cupos_disponibles < (p.cupos_costo || 1)
                                                        ? `Guardar predicción (${p.cupos_costo} ${p.cupos_costo === 1 ? 'cupo' : 'cupos'})`
                                                        : `Guardar pronóstico (${p.cupos_costo} ${p.cupos_costo === 1 ? 'cupo' : 'cupos'})`}
                                            </button>
                                        )}

                                        {mensajeExitoId === p.partido_id && (
                                            <CompartirPronostico
                                                equipoLocal={p.equipo_local}
                                                equipoVisitante={p.equipo_visitante}
                                                localPred={m.local}
                                                visitantePred={m.visitante}
                                                tokenAcceso={token}
                                                partidoId={p.partido_id}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Ver más / ver menos */}
                {info.partidos.length > 3 && (
                    <div className="flex flex-col items-center gap-3 mb-6">
                        {partidosVisibles < info.partidos.length && (
                            <button
                                onClick={() => setPartidosVisibles((v) => v + 10)}
                                className="w-full py-4 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform"
                            >
                                ⚽ Ver más partidos — {info.partidos.length - partidosVisibles} restantes
                            </button>
                        )}
                        {partidosVisibles > 3 && (
                            <button
                                onClick={() => setPartidosVisibles(3)}
                                className="text-zinc-500 text-sm underline hover:text-zinc-300 transition-colors"
                            >
                                Mostrar menos
                            </button>
                        )}
                    </div>
                )}

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
                <div className="rounded-2xl border border-amber-400/20 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4 mb-6 text-center">
                    <p className="text-zinc-900 dark:text-white font-bold text-sm mb-1">🏆 Reta a un amigo</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
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
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-zinc-900 dark:text-white text-center border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                        >
                            {mensajeCopiado ? '¡Copiado! ✅' : '🔗 Copiar link'}
                        </button>
                    </div>
                </div>

                {/* Ranking en vivo del próximo partido */}
                {partidoDestacado && <RankingEnVivo partidoId={partidoDestacado.partido_id} />}

                {/* ── Regalo de Bono (discreto) ── */}
                <div className="mt-8 mb-2 text-center">
                    {misSolicitudes.length > 0 && (
                        <div className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                            {misSolicitudes.map((s) => (
                                <p key={s.id}>
                                    🎁 Regalo a {s.receptor_nombre}:{' '}
                                    <span className={s.estado === 'APROBADO' ? 'text-green-500' : s.estado === 'RECHAZADO' ? 'text-red-400' : 'text-amber-400'}>
                                        {s.estado === 'APROBADO' ? 'Aprobado' : s.estado === 'RECHAZADO' ? `Rechazado${s.motivo_rechazo ? ` — ${s.motivo_rechazo}` : ''}` : 'Pendiente de revisión'}
                                    </span>
                                </p>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => { setMostrarModalRegalo(true); setRegaloMensaje(''); setRegaloError(''); }}
                        className="text-xs text-zinc-400 dark:text-zinc-500 underline hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        ¿Quieres regalar tu bono? Solicítalo aquí
                    </button>
                </div>
            </div>

            {/* ── Modal Regalo ── */}
            {mostrarModalRegalo && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5 relative">
                        <button
                            onClick={() => setMostrarModalRegalo(false)}
                            className="absolute top-3 right-4 text-zinc-400 hover:text-zinc-700 text-xl leading-none"
                        >×</button>
                        <h2 className="font-bold text-zinc-900 dark:text-white text-base mb-1">🎁 Regalar mi Bono</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                            Si no puedes reclamar tu bono en Barranquilla, puedes regalarlo a alguien que sí pueda.
                            El equipo lo revisará y te confirmará en 24 h.
                        </p>
                        {regaloMensaje ? (
                            <p className="text-green-600 dark:text-green-400 text-sm font-bold text-center py-4">{regaloMensaje}</p>
                        ) : (
                            <form onSubmit={handleEnviarRegalo} className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Nombre completo del receptor *</label>
                                    <input value={regaloForm.receptor_nombre} onChange={e => setRegaloForm(f => ({...f, receptor_nombre: e.target.value}))} placeholder="Nombre completo" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Cédula del receptor *</label>
                                    <input value={regaloForm.receptor_cedula} onChange={e => setRegaloForm(f => ({...f, receptor_cedula: e.target.value}))} placeholder="Número de cédula" inputMode="numeric" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Celular del receptor *</label>
                                    <div className="flex gap-1">
                                        <span className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">+57</span>
                                        <input value={regaloForm.receptor_celular} onChange={e => setRegaloForm(f => ({...f, receptor_celular: e.target.value}))} placeholder="3001234567" inputMode="tel" className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Correo del receptor (opcional)</label>
                                    <input value={regaloForm.receptor_correo} onChange={e => setRegaloForm(f => ({...f, receptor_correo: e.target.value}))} placeholder="correo@ejemplo.com" type="email" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white" />
                                </div>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input type="checkbox" checked={regaloAcepta} onChange={e => setRegaloAcepta(e.target.checked)} className="mt-0.5 accent-amber-400 shrink-0" />
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        Autorizo el regalo de este bono, entiendo que no es canjeable por dinero y renuncio a cualquier reclamo posterior a La Retoucherie de Manuela por este bono.
                                    </span>
                                </label>
                                {regaloError && <p className="text-red-500 text-xs">{regaloError}</p>}
                                <button type="submit" disabled={regaloEnviando} className="w-full py-2.5 rounded-xl font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-colors">
                                    {regaloEnviando ? 'Enviando...' : 'Enviar solicitud'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Banner datos demográficos — todos los usuarios sin fecha de nacimiento */}
            {mostrarDemoBanner && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white dark:bg-zinc-800 border border-violet-400/50 rounded-xl shadow-xl p-4">
                    <button
                        onClick={dismissDemoBanner}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 text-lg leading-none"
                    >
                        ×
                    </button>
                    {demoGuardado ? (
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold py-2">✅ ¡Datos guardados!</p>
                    ) : (
                        <>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">⚡ Completa tu perfil</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                                Necesitamos estos datos para los <strong>premios flash</strong>. Solo toma 10 segundos.
                            </p>
                            <form onSubmit={handleGuardarDemo} className="space-y-3">
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Fecha de nacimiento</label>
                                    <input
                                        type="date"
                                        value={demoFecha}
                                        onChange={(e) => setDemoFecha(e.target.value)}
                                        max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                                        className="w-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Género</label>
                                    <div className="flex flex-col gap-1">
                                        {[
                                            { value: 'masculino', label: 'Masculino' },
                                            { value: 'femenino', label: 'Femenino' },
                                            { value: 'prefiero_no_decirlo', label: 'Prefiero no decirlo' },
                                        ].map((op) => (
                                            <label key={op.value} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                                                <input
                                                    type="radio"
                                                    name="sexo_demo"
                                                    value={op.value}
                                                    checked={demoSexo === op.value}
                                                    onChange={() => setDemoSexo(op.value)}
                                                    className="accent-violet-500"
                                                />
                                                {op.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {errorDemo && <p className="text-xs text-red-500">{errorDemo}</p>}
                                <button
                                    type="submit"
                                    disabled={guardandoDemo}
                                    className="w-full py-2 rounded-lg text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white"
                                >
                                    {guardandoDemo ? 'Guardando...' : 'Guardar'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Banner foto de perfil — solo influencers sin foto */}
            {mostrarFotoReminder && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white dark:bg-zinc-800 border border-amber-400/50 rounded-xl shadow-xl p-4">
                    <button
                        onClick={dismissFotoReminder}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 text-lg leading-none"
                    >
                        ×
                    </button>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">📸 Agrega tu foto de perfil</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        Aparece en el ranking de creadores de contenido con tu foto.
                    </p>
                    {fotoSubidaOk ? (
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold">✅ ¡Foto guardada!</p>
                    ) : (
                        <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold cursor-pointer ${subiendoFoto ? 'bg-zinc-200 text-zinc-400' : 'bg-amber-400 text-zinc-950 hover:bg-amber-300'}`}>
                            {subiendoFoto ? 'Subiendo...' : '📸 Seleccionar foto'}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleSubirFoto}
                                className="hidden"
                                disabled={subiendoFoto}
                            />
                        </label>
                    )}
                    {errorFoto && <p className="text-xs text-red-500 mt-2">{errorFoto}</p>}
                </div>
            )}
        </div>
    );
}
