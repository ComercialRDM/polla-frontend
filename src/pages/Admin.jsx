import { useEffect, useState } from 'react';
import { adminLogin, adminPendientes, adminAprobar, adminRechazar, adminCrearPartido, adminActualizarPartido, adminEliminarPartido, adminAbrirComprobante, adminNotificarRecompra, adminSimuladorMetricas, obtenerPartidos, adminApuestas, adminApuestasExport, adminBonosColombia, adminMarcarReclamado, adminTestWhatsapp, adminLocalUsuarios, adminCrearLocalUsuario, adminResetLocalPassword, adminToggleLocalUsuario, admin2faEstado, admin2faSetup, admin2faConfirmar, admin2faDesactivar, adminReportes, adminUsuarios } from '../api';
import { formatoPesos } from '../config/planes';
import { META_INGRESOS, FECHA_META, PRECIO_SIMULADOR_MIN, PRECIO_SIMULADOR_MAX, PRECIO_SIMULADOR_PASO, PRECIO_REFERENCIA, calcularProyeccion } from '../config/elasticidad';

const SECCIONES = [
    { id: 'transacciones',   label: 'Transacciones' },
    { id: 'usuarios',        label: '👥 Usuarios' },
    { id: 'apuestas',        label: 'Apuestas' },
    { id: 'simulador',       label: 'Simulador' },
    { id: 'partidos',        label: 'Partidos' },
    { id: 'bonoscolombia',   label: '🇨🇴 Bono Col' },
    { id: 'localesqr',       label: 'Locales QR' },
    { id: 'seguridad',       label: '🔐 Seguridad' },
];

const TOKEN_STORAGE_KEY = 'polla_admin_token';

// Convierte un ISO date a formato "YYYY-MM-DDTHH:mm" en hora local para inputs datetime-local
function aDatetimeLocal(iso) {
    const fecha = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

export default function Admin() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    const [usuarioInput, setUsuarioInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [autenticado, setAutenticado] = useState(false);
    const [transacciones, setTransacciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');

    const [partidos, setPartidos] = useState([]);
    const [nuevoPartido, setNuevoPartido] = useState({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '', fase: 'grupos' });
    const [creandoPartido, setCreandoPartido] = useState(false);
    const [errorPartido, setErrorPartido] = useState('');

    const [editandoPartido, setEditandoPartido] = useState(null);
    const [edicionPartido, setEdicionPartido] = useState(null);
    const [guardandoPartido, setGuardandoPartido] = useState(false);
    const [bonoColResult, setBonoColResult] = useState(null);

    const [bonosCol, setBonosCol]             = useState([]);
    const [cargandoBonosCol, setCargandoBonosCol] = useState(false);
    const [reclamandoId, setReclamandoId]     = useState(null);

    const [testWaCelular, setTestWaCelular]   = useState('');
    const [testWaResult, setTestWaResult]     = useState(null);
    const [testWaEnviando, setTestWaEnviando] = useState(false);

    const [recompra, setRecompra] = useState({ origen: '', destino: '' });
    const [enviandoRecompra, setEnviandoRecompra] = useState(false);
    const [resultadoRecompra, setResultadoRecompra] = useState('');

    const [localesQR, setLocalesQR] = useState([]);
    const [cargandoLocales, setCargandoLocales] = useState(false);
    const [nuevoLocal, setNuevoLocal] = useState({ usuario: '', password: '', nombre_local: '', correo: '' });
    const [creandoLocal, setCreandoLocal] = useState(false);
    const [errorLocal, setErrorLocal] = useState('');
    const [tempPassVisible, setTempPassVisible] = useState({});

    // ── 2FA ───────────────────────────────────────────────────────────────────
    const [loginPaso2fa, setLoginPaso2fa] = useState(false);
    const [loginTotpCode, setLoginTotpCode] = useState('');
    const [totp2faEnabled, setTotp2faEnabled] = useState(false);
    const [totp2faQr, setTotp2faQr] = useState(null);
    const [totp2faCode, setTotp2faCode] = useState('');
    const [totp2faMsg, setTotp2faMsg] = useState('');

    // ── Usuarios ──────────────────────────────────────────────────────────────
    const [usuarios, setUsuarios]               = useState([]);
    const [usuariosCargando, setUsuariosCargando] = useState(false);
    const [usuariosBusqueda, setUsuariosBusqueda] = useState('');

    // ── Reportes ──────────────────────────────────────────────────────────────
    const [reporteFechaInicio, setReporteFechaInicio] = useState('');
    const [reporteFechaFin,    setReporteFechaFin]    = useState('');
    const [reporteData,        setReporteData]        = useState(null);
    const [reporteCargando,    setReporteCargando]    = useState(false);
    const [reporteError,       setReporteError]       = useState('');

    const [seccionActiva, setSeccionActiva] = useState('transacciones');

    const [metricasSimulador, setMetricasSimulador] = useState(null);
    const [errorSimulador, setErrorSimulador] = useState('');
    const [precioSimulado, setPrecioSimulado] = useState(PRECIO_REFERENCIA);

    // ── Apuestas ──────────────────────────────────────────────────────────────
    const [apPartidoId, setApPartidoId]   = useState('');
    const [apBusqueda, setApBusqueda]     = useState('');
    const [apData, setApData]             = useState(null);
    const [apPage, setApPage]             = useState(1);
    const [apCargando, setApCargando]     = useState(false);
    const [apError, setApError]           = useState('');
    const [exportando, setExportando]     = useState('');

    async function cargarDatos(tok) {
        setCargando(true);
        setError('');
        try {
            const data = await adminPendientes(tok);
            if (data?.success) {
                setTransacciones(data.transacciones);
                setAutenticado(true);
                localStorage.setItem(TOKEN_STORAGE_KEY, tok);
            } else {
                setError('Token inválido.');
                setAutenticado(false);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
            }
        } catch (err) {
            setError('Token inválido o error de conexión.');
            setAutenticado(false);
        } finally {
            setCargando(false);
        }
    }

    async function cargarPartidos() {
        try {
            const data = await obtenerPartidos();
            if (data?.success) {
                setPartidos(data.partidos);
            }
        } catch (err) {
            // silencioso
        }
    }

    async function cargarUsuarios() {
        setUsuariosCargando(true);
        try {
            const data = await adminUsuarios(token);
            if (data?.success) setUsuarios(data.usuarios);
        } catch (err) {
            // silencioso
        } finally {
            setUsuariosCargando(false);
        }
    }

    async function cargarBonosColombia() {
        setCargandoBonosCol(true);
        try {
            const data = await adminBonosColombia(token);
            if (data?.success) setBonosCol(data.bonos);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoBonosCol(false);
        }
    }

    async function handleReclamarBono(id) {
        setReclamandoId(id);
        try {
            const data = await adminMarcarReclamado(token, id);
            if (data?.success) setBonosCol((prev) => prev.map((b) => b.id === id ? { ...b, reclamado: true } : b));
        } catch (err) {
            // silencioso
        } finally {
            setReclamandoId(null);
        }
    }

    async function handleTestWhatsapp(e) {
        e.preventDefault();
        if (!testWaCelular.trim()) return;
        setTestWaEnviando(true);
        setTestWaResult(null);
        try {
            const data = await adminTestWhatsapp(token, testWaCelular.trim());
            setTestWaResult(data);
        } catch (err) {
            setTestWaResult({ success: false, error: err.message });
        } finally {
            setTestWaEnviando(false);
        }
    }

    async function cargarLocalesQR() {
        setCargandoLocales(true);
        try {
            const data = await adminLocalUsuarios(token);
            if (data?.success) setLocalesQR(data.usuarios);
        } catch {
            // silencioso
        } finally {
            setCargandoLocales(false);
        }
    }

    async function handleCrearLocal(e) {
        e.preventDefault();
        if (!nuevoLocal.usuario.trim() || !nuevoLocal.password.trim()) return;
        setCreandoLocal(true);
        setErrorLocal('');
        try {
            const data = await adminCrearLocalUsuario(token, nuevoLocal);
            if (data?.success) {
                setLocalesQR(prev => [data.usuario, ...prev]);
                setNuevoLocal({ usuario: '', password: '', nombre_local: '', correo: '' });
            } else {
                setErrorLocal(data?.error || 'Error al crear usuario');
            }
        } catch {
            setErrorLocal('Error de conexión');
        } finally {
            setCreandoLocal(false);
        }
    }

    async function handleResetLocalPass(id) {
        try {
            const data = await adminResetLocalPassword(token, id);
            if (data?.success) {
                setTempPassVisible(prev => ({ ...prev, [id]: data.tempPass }));
            }
        } catch {
            // silencioso
        }
    }

    async function handleToggleLocal(id) {
        try {
            const data = await adminToggleLocalUsuario(token, id);
            if (data?.success) {
                setLocalesQR(prev => prev.map(u => u.id === id ? { ...u, activo: data.activo } : u));
            }
        } catch {
            // silencioso
        }
    }

    async function handle2faSetup() {
        setTotp2faMsg('');
        try {
            const data = await admin2faSetup(token);
            if (data?.success) { setTotp2faQr(data.qrDataUrl); setTotp2faMsg(''); }
            else setTotp2faMsg(data?.error || 'Error al generar QR');
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function handle2faConfirmar(e) {
        e.preventDefault();
        setTotp2faMsg('');
        try {
            const data = await admin2faConfirmar(token, totp2faCode);
            if (data?.success) {
                setTotp2faEnabled(true); setTotp2faQr(null); setTotp2faCode('');
                setTotp2faMsg('✅ 2FA activado correctamente.');
            } else { setTotp2faMsg(data?.error || 'Código incorrecto'); }
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function handle2faDesactivar(e) {
        e.preventDefault();
        setTotp2faMsg('');
        try {
            const data = await admin2faDesactivar(token, totp2faCode);
            if (data?.success) {
                setTotp2faEnabled(false); setTotp2faCode('');
                setTotp2faMsg('2FA desactivado.');
            } else { setTotp2faMsg(data?.error || 'Código incorrecto'); }
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function cargarSimulador(tok) {
        setErrorSimulador('');
        try {
            const data = await adminSimuladorMetricas(tok);
            if (data?.success) {
                setMetricasSimulador(data);
            } else {
                setErrorSimulador(data?.error || 'No se pudo cargar el simulador.');
            }
        } catch {
            setErrorSimulador('Error de conexión al cargar el simulador.');
        }
    }

    useEffect(() => {
        if (token) {
            cargarDatos(token);
            cargarPartidos();
            cargarSimulador(token);
        }
    }, []);

    useEffect(() => {
        if (seccionActiva === 'usuarios' && token) cargarUsuarios();
        if (seccionActiva === 'bonoscolombia' && token) cargarBonosColombia();
        if (seccionActiva === 'localesqr' && token) cargarLocalesQR();
        if (seccionActiva === 'seguridad' && token) {
            admin2faEstado(token).then(d => { if (d?.success) setTotp2faEnabled(d.totp_enabled); }).catch(() => {});
        }
    }, [seccionActiva]);

    async function handleLogin(e) {
        e.preventDefault();
        if (!usuarioInput.trim() || !passwordInput.trim()) return;

        setCargando(true);
        setError('');
        try {
            const data = await adminLogin(usuarioInput.trim(), passwordInput, loginPaso2fa ? loginTotpCode : undefined);
            if (data?.success) {
                setToken(data.token);
                setPasswordInput('');
                setLoginPaso2fa(false);
                setLoginTotpCode('');
                cargarDatos(data.token);
                cargarPartidos();
                cargarSimulador(data.token);
            } else if (data?.requires_2fa) {
                setLoginPaso2fa(true);
            } else {
                setError(data?.error || 'Usuario o contraseña incorrectos.');
            }
        } catch (err) {
            setError('Error de conexión al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    async function handleCrearPartido(e) {
        e.preventDefault();
        setErrorPartido('');

        const { equipo_local, equipo_visitante, fecha_hora_inicio } = nuevoPartido;
        if (!equipo_local.trim() || !equipo_visitante.trim() || !fecha_hora_inicio) {
            setErrorPartido('Completa todos los campos.');
            return;
        }

        setCreandoPartido(true);
        try {
            const data = await adminCrearPartido(token, {
                equipo_local: equipo_local.trim(),
                equipo_visitante: equipo_visitante.trim(),
                fecha_hora_inicio: new Date(fecha_hora_inicio).toISOString(),
                fase: nuevoPartido.fase,
            });
            if (data?.success) {
                setNuevoPartido({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '', fase: 'grupos' });
                cargarPartidos();
            } else {
                setErrorPartido(data?.error || 'No se pudo crear el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al crear el partido.');
        } finally {
            setCreandoPartido(false);
        }
    }

    async function handleEliminarPartido(id) {
        if (!window.confirm('¿Eliminar este partido?')) return;

        setErrorPartido('');
        try {
            const data = await adminEliminarPartido(token, id);
            if (data?.success) {
                cargarPartidos();
            } else {
                setErrorPartido(data?.error || 'No se pudo eliminar el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al eliminar el partido.');
        }
    }

    function handleEditarPartido(p) {
        setEditandoPartido(p.id);
        setEdicionPartido({
            fecha_hora_inicio: aDatetimeLocal(p.fecha_hora_inicio),
            goles_local: p.goles_local ?? 0,
            goles_visitante: p.goles_visitante ?? 0,
            estado: p.estado,
            fase: p.fase || 'grupos',
        });
    }

    function handleCancelarEdicionPartido() {
        setEditandoPartido(null);
        setEdicionPartido(null);
    }

    async function handleGuardarPartido(id) {
        setErrorPartido('');
        setGuardandoPartido(true);
        try {
            const data = await adminActualizarPartido(token, id, {
                fecha_hora_inicio: new Date(edicionPartido.fecha_hora_inicio).toISOString(),
                goles_local: Number(edicionPartido.goles_local),
                goles_visitante: Number(edicionPartido.goles_visitante),
                estado: edicionPartido.estado,
                fase: edicionPartido.fase,
            });
            if (data?.success) {
                setEditandoPartido(null);
                setEdicionPartido(null);
                cargarPartidos();
                if (data.bonoColombia) setBonoColResult(data.bonoColombia);
            } else {
                setErrorPartido(data?.error || 'No se pudo actualizar el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al actualizar el partido.');
        } finally {
            setGuardandoPartido(false);
        }
    }

    async function handleNotificarRecompra(e) {
        e.preventDefault();
        setResultadoRecompra('');

        if (!recompra.origen || !recompra.destino) {
            setResultadoRecompra('Selecciona el partido de origen y el de destino.');
            return;
        }

        setEnviandoRecompra(true);
        try {
            const data = await adminNotificarRecompra(token, {
                partido_id_origen: recompra.origen,
                partido_id_destino: recompra.destino,
            });
            if (data?.success) {
                setResultadoRecompra(`Correo enviado a ${data.enviados} de ${data.total} participantes.`);
            } else {
                setResultadoRecompra(data?.error || 'No se pudo enviar la notificación.');
            }
        } catch (err) {
            setResultadoRecompra('Error de conexión al enviar la notificación.');
        } finally {
            setEnviandoRecompra(false);
        }
    }

    async function handleAprobar(id) {
        try {
            const data = await adminAprobar(token, id);
            if (!data?.success) {
                setError(data?.error || 'No se pudo aprobar la transacción.');
                return;
            }
            setError('');
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo aprobar la transacción.');
        }
    }

    async function handleRechazar(id) {
        try {
            const data = await adminRechazar(token, id);
            if (!data?.success) {
                setError(data?.error || 'No se pudo rechazar la transacción.');
                return;
            }
            setError('');
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo rechazar la transacción.');
        }
    }

    async function handleVerComprobante(id) {
        try {
            await adminAbrirComprobante(token, id);
        } catch (err) {
            setError('No se pudo abrir el comprobante.');
        }
    }

    // ── Apuestas ──────────────────────────────────────────────────────────────
    async function cargarApuestas(partidoId, page, search) {
        if (!partidoId) return;
        setApCargando(true);
        setApError('');
        try {
            const data = await adminApuestas(token, { partido_id: partidoId, page, limit: 100, search });
            if (data?.success) {
                setApData(data);
                setApPage(page);
            } else {
                setApError(data?.error || 'Error cargando apuestas');
            }
        } catch {
            setApError('Error de conexión');
        } finally {
            setApCargando(false);
        }
    }

    async function exportarTransacciones(formato) {
        setExportando(formato);
        try {
            const filas = listaFiltrada.map(t => ({
                Nombre: t.nombre,
                Correo: t.correo,
                Celular: t.celular,
                Valor: t.valorPagado,
                Estado: t.estado,
                Método: t.metodo,
                Fecha: new Date(t.fecha).toLocaleString('es-CO'),
            }));
            const nombre = 'Transacciones_Polla';
            if (formato === 'csv') exportarCSV(filas, nombre, Object.keys(filas[0]));
            if (formato === 'excel') await exportarExcel(filas, nombre, 'Transacciones');
            if (formato === 'pdf') await exportarPDF(
                Object.keys(filas[0]),
                filas.map(Object.values),
                nombre,
                'Transacciones — Polla Mundialista'
            );
        } finally {
            setExportando('');
        }
    }

    async function exportarApuestas(formato) {
        if (!apPartidoId) return;
        setExportando(formato);
        try {
            const data = await adminApuestasExport(token, apPartidoId);
            if (!data?.success) { setApError(data?.error || 'Error exportando'); return; }
            const p = data.partido;
            const nombre = `Apuestas_${p.equipo_local}_vs_${p.equipo_visitante}`.replace(/\s+/g, '_');
            const filas = data.apuestas.map(a => ({
                Nombre:       a.nombre,
                Celular:      a.celular,
                Pronóstico:   `${a.predLocal} - ${a.predVisitante}`,
                'Fecha UTC':  a.createdAt ? new Date(a.createdAt).toISOString().replace('T', ' ').slice(0, 19) : '-',
                'Hora CO':    a.createdAt ? new Date(a.createdAt).toLocaleString('es-CO') : '-',
                Puntos:       a.puntos ?? '-',
            }));
            if (formato === 'csv') exportarCSV(filas, nombre, Object.keys(filas[0]));
            if (formato === 'excel') await exportarExcel(filas, nombre, 'Apuestas');
            if (formato === 'pdf') await exportarPDF(
                Object.keys(filas[0]),
                filas.map(Object.values),
                nombre,
                `Apuestas: ${p.equipo_local} vs ${p.equipo_visitante}`
            );
        } finally {
            setExportando('');
        }
    }

    async function generarReporte() {
        if (!reporteFechaInicio || !reporteFechaFin) {
            setReporteError('Selecciona fecha de inicio y fin.');
            return;
        }
        setReporteCargando(true);
        setReporteError('');
        setReporteData(null);
        try {
            const data = await adminReportes(token, reporteFechaInicio, reporteFechaFin);
            if (data?.success) setReporteData(data);
            else setReporteError(data?.error || 'Error generando reporte');
        } catch {
            setReporteError('Error de conexión');
        } finally {
            setReporteCargando(false);
        }
    }

    if (!autenticado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white text-center mb-2">Panel Admin</h1>
                    {!loginPaso2fa ? (
                        <>
                            <input
                                type="text"
                                value={usuarioInput}
                                onChange={(e) => setUsuarioInput(e.target.value)}
                                placeholder="Usuario"
                                autoComplete="username"
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Contraseña"
                                autoComplete="current-password"
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-4 py-3 text-center">
                                <p className="text-2xl mb-1">🔐</p>
                                <p className="font-bold text-zinc-900 dark:text-white text-sm">Verificación en dos pasos</p>
                                <p className="text-zinc-500 text-xs mt-1">Abre Google Authenticator e ingresa el código de 6 dígitos</p>
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={loginTotpCode}
                                onChange={(e) => setLoginTotpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                autoFocus
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button type="button" onClick={() => { setLoginPaso2fa(false); setLoginTotpCode(''); setError(''); }}
                                className="text-xs text-zinc-400 underline text-center">
                                ← Volver
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-3 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                    >
                        {cargando ? 'Verificando...' : loginPaso2fa ? 'Verificar código' : 'Entrar'}
                    </button>
                </form>
            </div>
        );
    }

    const pendientes = transacciones.filter((t) => t.estado === 'PENDIENTE');
    const aprobadas = transacciones.filter((t) => t.estado === 'APROBADO');
    const ingresos = aprobadas.reduce((acc, t) => acc + t.valorPagado, 0);

    const listaFiltrada = transacciones
        .filter((t) => (filtro === 'TODAS' ? true : t.estado === filtro))
        .filter((t) => {
            if (!busqueda.trim()) return true;
            const q = busqueda.toLowerCase();
            return (
                t.nombre.toLowerCase().includes(q) ||
                t.correo.toLowerCase().includes(q) ||
                t.celular.toLowerCase().includes(q)
            );
        });

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Panel Admin - Polla Mundialista</h1>
                    <button
                        onClick={() => { localStorage.removeItem(TOKEN_STORAGE_KEY); setToken(''); setAutenticado(false); }}
                        className="text-sm text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/30 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* Menú de secciones */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {SECCIONES.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSeccionActiva(s.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                seccionActiva === s.id ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* ── Apuestas ── */}
                {seccionActiva === 'apuestas' && (
                <div>
                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <select
                            value={apPartidoId}
                            onChange={e => { setApPartidoId(e.target.value); setApData(null); }}
                            className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">— Selecciona un partido —</option>
                            {partidos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.equipo_local} vs {p.equipo_visitante} ({p.estado})
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={apBusqueda}
                            onChange={e => setApBusqueda(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && cargarApuestas(apPartidoId, 1, apBusqueda)}
                            placeholder="Buscar por nombre o celular..."
                            className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                            onClick={() => cargarApuestas(apPartidoId, 1, apBusqueda)}
                            disabled={!apPartidoId || apCargando}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {apCargando ? 'Cargando...' : 'Cargar'}
                        </button>
                    </div>

                    {apError && <p className="text-red-400 text-sm mb-3">{apError}</p>}

                    {apData && (
                    <>
                        {/* Métricas del partido */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <Metrica titulo="Total apuestas" valor={apData.total} />
                            <Metrica titulo="Partido" valor={`${apData.partido.equipo_local} vs ${apData.partido.equipo_visitante}`} />
                            <Metrica titulo="Estado" valor={apData.partido.estado} />
                            <Metrica titulo="Resultado real" valor={
                                apData.partido.estado === 'cerrado'
                                    ? `${apData.partido.goles_local} - ${apData.partido.goles_visitante}`
                                    : 'En juego'
                            } />
                        </div>

                        {/* Resumen de marcadores apostados */}
                        {apData.resumen.length > 0 && (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-4">
                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Marcadores más apostados</p>
                            <div className="flex flex-wrap gap-2">
                                {apData.resumen.map((r, i) => (
                                    <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        apData.partido.estado === 'cerrado' &&
                                        r.predLocal === apData.partido.goles_local &&
                                        r.predVisitante === apData.partido.goles_visitante
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10'
                                    }`}>
                                        {r.predLocal}-{r.predVisitante}
                                        <span className="opacity-60">×{r.cantidad}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Export buttons */}
                        <div className="flex gap-2 mb-3 flex-wrap items-center">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Exportar {apData.total} apuestas:</span>
                            <BtnExport label="CSV" activo={exportando === 'csv'} onClick={() => exportarApuestas('csv')} color="green" />
                            <BtnExport label="Excel" activo={exportando === 'excel'} onClick={() => exportarApuestas('excel')} color="blue" />
                            <BtnExport label="PDF" activo={exportando === 'pdf'} onClick={() => exportarApuestas('pdf')} color="red" />
                        </div>

                        {/* Tabla paginada */}
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10 mb-3">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Celular</th>
                                        <th className="px-4 py-3">Pronóstico</th>
                                        <th className="px-4 py-3">Fecha/Hora (UTC)</th>
                                        <th className="px-4 py-3">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apData.apuestas.map((a, idx) => {
                                        const rowNum = (apPage - 1) * 100 + idx + 1;
                                        return (
                                            <tr key={a.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                                <td className="px-4 py-2 text-zinc-400 text-xs">{rowNum}</td>
                                                <td className="px-4 py-2 font-medium">{a.nombre}</td>
                                                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{a.celular}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`font-bold ${
                                                        a.puntos === 3 ? 'text-green-500' :
                                                        a.puntos === 1 ? 'text-amber-400' :
                                                        a.puntos === 0 ? 'text-red-400' :
                                                        'text-zinc-700 dark:text-zinc-200'
                                                    }`}>
                                                        {a.predLocal} - {a.predVisitante}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                                    {a.createdAt
                                                        ? new Date(a.createdAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {a.puntos === null ? (
                                                        <span className="text-zinc-400">—</span>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            a.puntos === 3 ? 'bg-green-500/20 text-green-400' :
                                                            a.puntos === 1 ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>{a.puntos} pts</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {apData.apuestas.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-400">Sin resultados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {apData.total > 100 && (() => {
                            const totalPags = Math.ceil(apData.total / 100);
                            return (
                                <div className="flex items-center gap-2 justify-center flex-wrap">
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, 1, apBusqueda)}
                                        disabled={apPage === 1 || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >«</button>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, apPage - 1, apBusqueda)}
                                        disabled={apPage === 1 || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >‹</button>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Página {apPage} de {totalPags} · {apData.total} apuestas
                                    </span>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, apPage + 1, apBusqueda)}
                                        disabled={apPage === totalPags || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >›</button>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, totalPags, apBusqueda)}
                                        disabled={apPage === totalPags || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >»</button>
                                </div>
                            );
                        })()}
                    </>
                    )}

                    {!apData && !apCargando && apPartidoId && (
                        <p className="text-zinc-400 text-sm text-center py-8">Haz clic en "Cargar" para ver las apuestas.</p>
                    )}
                    {!apPartidoId && (
                        <p className="text-zinc-400 text-sm text-center py-8">Selecciona un partido para ver las apuestas.</p>
                    )}
                </div>
                )}

                {/* Simulador de ingresos (solo admin) */}
                {seccionActiva === 'simulador' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Simulador de ingresos</h2>

                    {errorSimulador && <p className="text-red-400 text-sm">{errorSimulador}</p>}

                    {!metricasSimulador && !errorSimulador && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Cargando datos del simulador...</p>
                    )}

                    {metricasSimulador && (() => {
                        const proyeccion = calcularProyeccion({
                            precio: precioSimulado,
                            clicsDiariosPromedio: metricasSimulador.clicsDiariosPromedio,
                            ingresosActuales: metricasSimulador.ingresosActuales,
                            diasRestantes: metricasSimulador.diasRestantes,
                        });
                        const fechaMetaTexto = new Date(`${FECHA_META}T00:00:00`).toLocaleDateString('es-CO', {
                            day: 'numeric', month: 'long', year: 'numeric',
                        });

                        return (
                            <>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                                    Meta: {formatoPesos(META_INGRESOS)} antes del {fechaMetaTexto} · Faltan {metricasSimulador.diasRestantes} días ·
                                    {' '}Ingresos actuales: {formatoPesos(metricasSimulador.ingresosActuales)} ·
                                    {' '}Clics ManyChat/día (prom.): {metricasSimulador.clicsDiariosPromedio.toFixed(1)} ·
                                    {' '}Tasa de rebote checkout (30 días): {(metricasSimulador.checkout.tasaRebote * 100).toFixed(1)}%
                                </p>

                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                                    Precio del bono a simular: <span className="font-bold text-amber-500 dark:text-amber-400">{formatoPesos(precioSimulado)}</span>
                                </label>
                                <input
                                    type="range"
                                    min={PRECIO_SIMULADOR_MIN}
                                    max={PRECIO_SIMULADOR_MAX}
                                    step={PRECIO_SIMULADOR_PASO}
                                    value={precioSimulado}
                                    onChange={(e) => setPrecioSimulado(Number(e.target.value))}
                                    className="w-full accent-amber-400 mb-4"
                                />

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <Metrica titulo="Conversión estimada" valor={`${(proyeccion.tasaConversion * 100).toFixed(1)}%`} />
                                    <Metrica titulo="Compras/día estimadas" valor={proyeccion.conversionesDiarias.toFixed(1)} />
                                    <Metrica titulo="Ingreso diario estimado" valor={formatoPesos(Math.round(proyeccion.ingresoDiarioEstimado))} />
                                    <Metrica titulo="Proyección a la meta" valor={formatoPesos(Math.round(proyeccion.ingresoProyectadoTotal))} />
                                </div>

                                {proyeccion.cumpleMeta ? (
                                    <p className="text-green-400 text-sm font-bold">
                                        ✅ A {formatoPesos(precioSimulado)} y al ritmo actual de clics, se alcanzaría la meta de {formatoPesos(META_INGRESOS)} para el {fechaMetaTexto}.
                                    </p>
                                ) : (
                                    <p className="text-amber-500 dark:text-amber-400 text-sm font-bold">
                                        ⚠️ A {formatoPesos(precioSimulado)} faltarían {formatoPesos(Math.round(proyeccion.faltante))} para la meta. Ajusta el precio (más bajo = más conversión, más alto = más margen) y revisa el resultado.
                                    </p>
                                )}
                            </>
                        );
                    })()}
                </div>
                )}

                {/* Partidos: crear, editar y notificar recompra */}
                {seccionActiva === 'partidos' && (
                <>
                {/* Banner Bono Colombia */}
                {bonoColResult && (
                    <div className={`rounded-xl border p-4 mb-4 ${bonoColResult.desierto ? 'border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-white/5' : 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'}`}>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-zinc-900 dark:text-white mb-1">
                                    🇨🇴 Bono Colombia {bonoColResult.desierto ? '— Desierto' : '— ¡Ganadores!'}
                                </p>
                                {bonoColResult.desierto ? (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nadie acertó el marcador exacto. El Bono Colombia queda desierto para este partido.</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-1">
                                            ${bonoColResult.montoPorGanador.toLocaleString('es-CO')} COP c/u · Total distribuido: ${bonoColResult.totalDistribuido.toLocaleString('es-CO')} COP
                                        </p>
                                        <ul className="text-sm text-zinc-700 dark:text-zinc-200 space-y-0.5">
                                            {bonoColResult.ganadores.map((g) => (
                                                <li key={g.celular}>✅ {g.nombre} — {g.celular}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setBonoColResult(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg leading-none">×</button>
                        </div>
                    </div>
                )}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Crear partido</h2>
                    <form onSubmit={handleCrearPartido} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <input
                            type="text"
                            value={nuevoPartido.equipo_local}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_local: e.target.value }))}
                            placeholder="Equipo local"
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="text"
                            value={nuevoPartido.equipo_visitante}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_visitante: e.target.value }))}
                            placeholder="Equipo visitante"
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="datetime-local"
                            value={nuevoPartido.fecha_hora_inicio}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, fecha_hora_inicio: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <select
                            value={nuevoPartido.fase}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, fase: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="grupos">Grupos (1 cupo)</option>
                            <option value="dieciseisavos">Dieciseisavos (1 cupo)</option>
                            <option value="octavos">Octavos (1 cupo)</option>
                            <option value="cuartos">Cuartos de Final (2 cupos)</option>
                            <option value="semifinal">Semifinal (2 cupos)</option>
                            <option value="final">Gran Final (4 cupos)</option>
                        </select>
                        <button
                            type="submit"
                            disabled={creandoPartido}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {creandoPartido ? 'Creando...' : 'Crear partido'}
                        </button>
                    </form>
                    {errorPartido && <p className="text-red-400 text-sm mt-2">{errorPartido}</p>}

                    {partidos.length > 0 && (
                        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Partido</th>
                                        <th className="px-3 py-2">Fase</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Marcador</th>
                                        <th className="px-3 py-2">Estado</th>
                                        <th className="px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partidos.map((p) => {
                                        const editando = editandoPartido === p.id;
                                        return (
                                            <tr key={p.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                                <td className="px-3 py-2">{p.equipo_local} vs {p.equipo_visitante}</td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <select
                                                            value={edicionPartido.fase}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, fase: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        >
                                                            <option value="grupos">Grupos</option>
                                                            <option value="dieciseisavos">Dieciseisavos</option>
                                                            <option value="octavos">Octavos</option>
                                                            <option value="cuartos">Cuartos</option>
                                                            <option value="semifinal">Semifinal</option>
                                                            <option value="final">Gran Final</option>
                                                        </select>
                                                    ) : (
                                                        p.fase || 'grupos'
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                                                    {editando ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={edicionPartido.fecha_hora_inicio}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, fecha_hora_inicio: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        />
                                                    ) : (
                                                        new Date(p.fecha_hora_inicio).toLocaleString('es-CO')
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={edicionPartido.goles_local}
                                                                onChange={(e) => setEdicionPartido((ed) => ({ ...ed, goles_local: e.target.value }))}
                                                                className="w-14 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                            />
                                                            <span>-</span>
                                                            <input
                                                                type="number"
                                                                value={edicionPartido.goles_visitante}
                                                                onChange={(e) => setEdicionPartido((ed) => ({ ...ed, goles_visitante: e.target.value }))}
                                                                className="w-14 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${p.goles_local ?? 0} - ${p.goles_visitante ?? 0}`
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <select
                                                            value={edicionPartido.estado}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, estado: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        >
                                                            <option value="activo">activo</option>
                                                            <option value="cerrado">cerrado</option>
                                                        </select>
                                                    ) : (
                                                        p.estado
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {editando ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleGuardarPartido(p.id)}
                                                                    disabled={guardandoPartido}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                                                >
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelarEdicionPartido}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-white/20"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditarPartido(p)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEliminarPartido(p.id)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Notificar recompra */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Notificar recompra para el siguiente partido</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">
                        Envía un correo a quienes compraron bono para el partido de origen, invitándolos a comprar
                        su bono para el partido de destino.
                    </p>
                    <form onSubmit={handleNotificarRecompra} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            value={recompra.origen}
                            onChange={(e) => setRecompra((r) => ({ ...r, origen: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">Partido de origen</option>
                            {partidos.map((p) => (
                                <option key={p.id} value={p.id}>{p.equipo_local} vs {p.equipo_visitante}</option>
                            ))}
                        </select>
                        <select
                            value={recompra.destino}
                            onChange={(e) => setRecompra((r) => ({ ...r, destino: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">Partido de destino</option>
                            {partidos.map((p) => (
                                <option key={p.id} value={p.id}>{p.equipo_local} vs {p.equipo_visitante}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={enviandoRecompra}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {enviandoRecompra ? 'Enviando...' : 'Notificar'}
                        </button>
                    </form>
                    {resultadoRecompra && <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-2">{resultadoRecompra}</p>}
                </div>
                </>
                )}

                {/* Usuarios registrados */}
                {seccionActiva === 'usuarios' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">👥 Usuarios Registrados</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{usuarios.length} en total</span>
                            <button onClick={cargarUsuarios} disabled={usuariosCargando} className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold disabled:opacity-50">
                                {usuariosCargando ? 'Cargando...' : '↻ Actualizar'}
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o celular..."
                        value={usuariosBusqueda}
                        onChange={(e) => setUsuariosBusqueda(e.target.value)}
                        className="w-full mb-3 rounded-lg bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {usuariosCargando ? (
                        <p className="text-zinc-400 text-sm text-center py-4">Cargando usuarios...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-white/10">
                                        <th className="pb-2 pr-3 font-semibold">Nombre</th>
                                        <th className="pb-2 pr-3 font-semibold">Celular</th>
                                        <th className="pb-2 pr-3 font-semibold">Correo</th>
                                        <th className="pb-2 pr-3 font-semibold text-center">Compras</th>
                                        <th className="pb-2 pr-3 font-semibold text-right">Total pagado</th>
                                        <th className="pb-2 font-semibold">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios
                                        .filter((u) => {
                                            const q = usuariosBusqueda.toLowerCase();
                                            return !q || u.nombre?.toLowerCase().includes(q) || u.correo?.toLowerCase().includes(q) || u.celular?.includes(q);
                                        })
                                        .map((u) => (
                                        <tr key={u.id} className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/5">
                                            <td className="py-2 pr-3 font-medium text-zinc-900 dark:text-white">{u.nombre}</td>
                                            <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">{u.celular}</td>
                                            <td className="py-2 pr-3 text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate">{u.correo}</td>
                                            <td className="py-2 pr-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full font-bold ${Number(u.compras_aprobadas) > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}>
                                                    {u.compras_aprobadas}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-3 text-right text-zinc-900 dark:text-white font-medium">
                                                {Number(u.total_pagado) > 0 ? `$${Number(u.total_pagado).toLocaleString('es-CO')}` : '—'}
                                            </td>
                                            <td className="py-2 text-zinc-400 whitespace-nowrap">
                                                {new Date(u.fecha_registro).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {usuarios.filter((u) => {
                                const q = usuariosBusqueda.toLowerCase();
                                return !q || u.nombre?.toLowerCase().includes(q) || u.correo?.toLowerCase().includes(q) || u.celular?.includes(q);
                            }).length === 0 && (
                                <p className="text-zinc-400 text-sm text-center py-4">No hay usuarios que coincidan.</p>
                            )}
                        </div>
                    )}
                </div>
                )}

                {/* Bono Colombia */}
                {seccionActiva === 'bonoscolombia' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">🇨🇴 Ganadores Bono Colombia</h2>
                        <button onClick={cargarBonosColombia} disabled={cargandoBonosCol}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoBonosCol ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>

                    {bonosCol.length === 0 && !cargandoBonosCol && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay ganadores del Bono Colombia registrados aún.</p>
                    )}

                    {bonosCol.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Partido</th>
                                        <th className="px-3 py-2">Ganador</th>
                                        <th className="px-3 py-2">Celular</th>
                                        <th className="px-3 py-2">Correo</th>
                                        <th className="px-3 py-2">Monto</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {bonosCol.map((b) => (
                                        <tr key={b.id} className={b.reclamado ? 'opacity-50' : ''}>
                                            <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                                                {b.equipo_local} {b.goles_local}-{b.goles_visitante} {b.equipo_visitante}
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{b.nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{b.celular}</td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{b.correo}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">
                                                ${Number(b.monto_cop).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                                {new Date(b.created_at).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-3 py-2">
                                                {b.reclamado ? (
                                                    <span className="text-green-600 dark:text-green-400 font-semibold">✓ Reclamado</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReclamarBono(b.id)}
                                                        disabled={reclamandoId === b.id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                                    >
                                                        {reclamandoId === b.id ? '...' : 'Marcar reclamado'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Diagnóstico WhatsApp */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">📲 Prueba de conexión WhatsApp</h3>
                        <form onSubmit={handleTestWhatsapp} className="flex gap-2">
                            <input
                                type="tel"
                                value={testWaCelular}
                                onChange={(e) => setTestWaCelular(e.target.value)}
                                placeholder="Ej: 3001234567"
                                className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                            <button type="submit" disabled={testWaEnviando}
                                className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 whitespace-nowrap">
                                {testWaEnviando ? 'Enviando...' : 'Enviar prueba'}
                            </button>
                        </form>
                        {testWaResult && (
                            <div className={`mt-2 rounded-lg p-3 text-xs ${testWaResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                                <p className="font-bold mb-1">{testWaResult.success ? '✅ Enviado correctamente' : '❌ Error'}</p>
                                {testWaResult.celularFormateado && <p>Número formateado: <strong>{testWaResult.celularFormateado}</strong></p>}
                                {testWaResult.subscriberId && <p>Subscriber ID ManyChat: <strong>{testWaResult.subscriberId}</strong></p>}
                                {testWaResult.error && <p>Error: {testWaResult.error}</p>}
                                {testWaResult.detalles && <pre className="mt-1 overflow-x-auto text-xs opacity-70">{JSON.stringify(testWaResult.detalles, null, 2)}</pre>}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Locales QR */}
                {seccionActiva === 'localesqr' && (
                <div className="flex flex-col gap-5">
                    {/* Crear nueva cuenta */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">Nueva cuenta Admin QR</h2>
                        <form onSubmit={handleCrearLocal} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                required
                                placeholder="Usuario (sin espacios)"
                                value={nuevoLocal.usuario}
                                onChange={e => setNuevoLocal(p => ({ ...p, usuario: e.target.value.replace(/\s/g, '') }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                required
                                type="password"
                                placeholder="Contraseña inicial"
                                value={nuevoLocal.password}
                                onChange={e => setNuevoLocal(p => ({ ...p, password: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                placeholder="Nombre del local (ej. Sede Norte)"
                                value={nuevoLocal.nombre_local}
                                onChange={e => setNuevoLocal(p => ({ ...p, nombre_local: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                type="email"
                                placeholder="Correo (para recuperar contraseña)"
                                value={nuevoLocal.correo}
                                onChange={e => setNuevoLocal(p => ({ ...p, correo: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            {errorLocal && <p className="sm:col-span-2 text-red-500 text-sm">{errorLocal}</p>}
                            <button
                                type="submit"
                                disabled={creandoLocal}
                                className="sm:col-span-2 py-2.5 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60"
                            >
                                {creandoLocal ? 'Creando...' : '+ Crear cuenta'}
                            </button>
                        </form>
                    </div>

                    {/* Tabla de usuarios existentes */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cuentas registradas</h2>
                            <button onClick={cargarLocalesQR} disabled={cargandoLocales}
                                className="text-xs text-zinc-500 border border-zinc-300 dark:border-white/10 rounded px-2 py-1 hover:text-zinc-900 dark:hover:text-white">
                                {cargandoLocales ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                        {localesQR.length === 0 ? (
                            <p className="text-zinc-400 text-sm">{cargandoLocales ? 'Cargando...' : 'No hay cuentas creadas aún.'}</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {localesQR.map(u => (
                                    <div key={u.id} className={`rounded-lg border p-3 ${u.activo ? 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5' : 'border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/2 opacity-60'}`}>
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-white text-sm">{u.usuario}
                                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${u.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500'}`}>
                                                        {u.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </p>
                                                {u.nombre_local && <p className="text-zinc-500 text-xs mt-0.5">{u.nombre_local}</p>}
                                                {u.correo && <p className="text-zinc-400 text-xs">{u.correo}</p>}
                                                <p className="text-zinc-400 text-xs mt-0.5">Creado: {new Date(u.fecha_creacion).toLocaleDateString('es-CO')}</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleResetLocalPass(u.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-400/20"
                                                >
                                                    Resetear contraseña
                                                </button>
                                                <button
                                                    onClick={() => handleToggleLocal(u.id)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${u.activo ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'}`}
                                                >
                                                    {u.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </div>
                                        </div>
                                        {tempPassVisible[u.id] && (
                                            <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-3 py-2 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Contraseña temporal (cópiala ya, no se mostrará de nuevo):</p>
                                                    <p className="font-mono font-black text-amber-900 dark:text-amber-300 text-lg tracking-widest">{tempPassVisible[u.id]}</p>
                                                </div>
                                                <button onClick={() => setTempPassVisible(p => ({ ...p, [u.id]: undefined }))}
                                                    className="text-zinc-400 text-xs underline">Cerrar</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Seguridad — 2FA */}
                {seccionActiva === 'seguridad' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-5 max-w-md">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">🔐 Verificación en dos pasos (2FA)</h2>
                    <p className="text-zinc-500 text-sm mb-4">Protege tu cuenta con Google Authenticator. Cada inicio de sesión requerirá un código de 6 dígitos generado por la app.</p>

                    <div className={`rounded-lg px-3 py-2 mb-4 text-sm font-semibold ${totp2faEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}>
                        {totp2faEnabled ? '✅ 2FA activo en tu cuenta' : '⚪ 2FA desactivado'}
                    </div>

                    {!totp2faEnabled ? (
                        <div className="flex flex-col gap-3">
                            {!totp2faQr ? (
                                <button onClick={handle2faSetup}
                                    className="py-2.5 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300">
                                    Generar QR para activar 2FA
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">1. Escanea el QR con <strong>Google Authenticator</strong></p>
                                    <img src={totp2faQr} alt="QR 2FA" className="w-48 h-48 self-center rounded-xl border border-zinc-200 dark:border-white/10" />
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">2. Ingresa el código que muestra la app para confirmar:</p>
                                    <form onSubmit={handle2faConfirmar} className="flex gap-2">
                                        <input
                                            type="text" inputMode="numeric" maxLength={6}
                                            value={totp2faCode}
                                            onChange={e => setTotp2faCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="flex-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                        <button type="submit"
                                            className="px-4 py-2 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300">
                                            Activar
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handle2faDesactivar} className="flex flex-col gap-3">
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Para desactivar 2FA, ingresa un código válido de Google Authenticator:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    value={totp2faCode}
                                    onChange={e => setTotp2faCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="flex-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <button type="submit"
                                    className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-500">
                                    Desactivar
                                </button>
                            </div>
                        </form>
                    )}

                    {totp2faMsg && (
                        <p className={`mt-3 text-sm font-medium ${totp2faMsg.startsWith('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            {totp2faMsg}
                        </p>
                    )}
                </div>
                )}

                {/* Transacciones */}
                {seccionActiva === 'transacciones' && (
                <>
                {/* Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <Metrica titulo="Pendientes" valor={pendientes.length} />
                    <Metrica titulo="Aprobadas" valor={aprobadas.length} />
                    <Metrica titulo="Ingresos" valor={formatoPesos(ingresos)} />
                    <Metrica titulo="Total transacciones" valor={transacciones.length} />
                </div>

                {/* Reporte por rango de fechas */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-3">📅 Reporte por período</h2>
                    <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400">Desde</label>
                            <input
                                type="date"
                                value={reporteFechaInicio}
                                onChange={e => { setReporteFechaInicio(e.target.value); setReporteData(null); }}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400">Hasta</label>
                            <input
                                type="date"
                                value={reporteFechaFin}
                                onChange={e => { setReporteFechaFin(e.target.value); setReporteData(null); }}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <button
                            onClick={generarReporte}
                            disabled={reporteCargando || !reporteFechaInicio || !reporteFechaFin}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {reporteCargando ? 'Generando...' : 'Generar reporte'}
                        </button>
                    </div>
                    {reporteError && <p className="text-red-400 text-sm mt-2">{reporteError}</p>}

                    {reporteData && (
                        <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <Metrica titulo="Total" valor={reporteData.resumen.total} />
                                <Metrica titulo="Aprobadas" valor={reporteData.resumen.aprobadas} />
                                <Metrica titulo="Pendientes" valor={reporteData.resumen.pendientes} />
                                <Metrica titulo="Ingresos período" valor={formatoPesos(reporteData.resumen.ingresos)} />
                            </div>
                            {reporteData.transacciones.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                            <tr>
                                                <th className="px-3 py-2">Cliente</th>
                                                <th className="px-3 py-2">Contacto</th>
                                                <th className="px-3 py-2">Valor</th>
                                                <th className="px-3 py-2">Método</th>
                                                <th className="px-3 py-2">Estado</th>
                                                <th className="px-3 py-2">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                            {reporteData.transacciones.map(t => (
                                                <tr key={t.id} className="text-zinc-700 dark:text-zinc-200">
                                                    <td className="px-3 py-2 font-medium">{t.nombre}</td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                                                        {t.correo && <div>{t.correo}</div>}
                                                        <div>{t.celular}</div>
                                                    </td>
                                                    <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">
                                                        {formatoPesos(t.valorPagado)}
                                                    </td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 capitalize">{t.metodo}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            t.estado === 'APROBADO'  ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                                            t.estado === 'PENDIENTE' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                            'bg-red-500/20 text-red-500'
                                                        }`}>{t.estado}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-zinc-400 whitespace-nowrap">
                                                        {new Date(t.fecha).toLocaleString('es-CO')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-zinc-400 text-sm text-center py-3">No hay transacciones en este período.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pestañas y buscador */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex gap-2">
                        {['TODAS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    filtro === f ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, correo o celular..."
                        className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                        onClick={() => cargarDatos(token)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10"
                    >
                        Refrescar
                    </button>
                </div>

                {/* Botones export transacciones */}
                {listaFiltrada.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Exportar {listaFiltrada.length} registros:</span>
                        <BtnExport label="CSV" activo={exportando === 'csv'} onClick={() => exportarTransacciones('csv')} color="green" />
                        <BtnExport label="Excel" activo={exportando === 'excel'} onClick={() => exportarTransacciones('excel')} color="blue" />
                        <BtnExport label="PDF" activo={exportando === 'pdf'} onClick={() => exportarTransacciones('pdf')} color="red" />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Contacto</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Método</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaFiltrada.map((t) => (
                                <tr key={t.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                    <td className="px-4 py-3">{t.nombre}</td>
                                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                                        {t.correo}<br />{t.celular}
                                    </td>
                                    <td className="px-4 py-3">{formatoPesos(t.valorPagado)}</td>
                                    <td className="px-4 py-3">{t.metodo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            t.estado === 'APROBADO' ? 'bg-green-500/20 text-green-400' :
                                            t.estado === 'RECHAZADO' ? 'bg-red-500/20 text-red-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {t.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{new Date(t.fecha).toLocaleString('es-CO')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            {t.tieneComprobante && (
                                                <button
                                                    onClick={() => handleVerComprobante(t.id)}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    Ver comprobante
                                                </button>
                                            )}
                                            {t.estado === 'PENDIENTE' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAprobar(t.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleRechazar(t.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {listaFiltrada.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-zinc-400 dark:text-zinc-500">
                                        No hay transacciones para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

function Metrica({ titulo, valor }) {
    return (
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{titulo}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{valor}</p>
        </div>
    );
}

const BTN_COLORS = {
    green: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    blue:  'bg-blue-600 hover:bg-blue-500 text-white',
    red:   'bg-rose-600 hover:bg-rose-500 text-white',
};

function BtnExport({ label, activo, onClick, color }) {
    return (
        <button
            onClick={onClick}
            disabled={activo}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${BTN_COLORS[color]}`}
        >
            {activo ? '...' : `↓ ${label}`}
        </button>
    );
}

// ── Export helpers ────────────────────────────────────────────────────────────

function exportarCSV(filas, nombreArchivo, columnas) {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
        columnas.map(escape).join(','),
        ...filas.map(f => columnas.map(c => escape(f[c])).join(',')),
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    descargar(blob, `${nombreArchivo}.csv`);
}

async function exportarExcel(filas, nombreArchivo, nombreHoja) {
    const { utils, writeFile } = await import('xlsx');
    const ws = utils.json_to_sheet(filas);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, nombreHoja);
    writeFile(wb, `${nombreArchivo}.xlsx`);
}

async function exportarPDF(columnas, filas, nombreArchivo, titulo) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(13);
    doc.text(titulo, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 21);
    autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 26,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`${nombreArchivo}.pdf`);
}

function descargar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
}
