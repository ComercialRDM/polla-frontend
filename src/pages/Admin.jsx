import { useEffect, useState } from 'react';
import { adminPendientes, adminAprobar, adminRechazar, adminCrearPartido, adminEliminarPartido, obtenerPartidos } from '../api';
import { formatoPesos } from '../config/planes';

const TOKEN_STORAGE_KEY = 'polla_admin_token';

export default function Admin() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    const [tokenInput, setTokenInput] = useState('');
    const [autenticado, setAutenticado] = useState(false);
    const [transacciones, setTransacciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');

    const [partidos, setPartidos] = useState([]);
    const [nuevoPartido, setNuevoPartido] = useState({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '' });
    const [creandoPartido, setCreandoPartido] = useState(false);
    const [errorPartido, setErrorPartido] = useState('');

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
            // silencioso: la lista de partidos no es crítica para el panel
        }
    }

    useEffect(() => {
        if (token) {
            cargarDatos(token);
            cargarPartidos();
        }
    }, []);

    function handleLogin(e) {
        e.preventDefault();
        if (!tokenInput.trim()) return;
        setToken(tokenInput.trim());
        cargarDatos(tokenInput.trim());
        cargarPartidos();
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
            });
            if (data?.success) {
                setNuevoPartido({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '' });
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

    async function handleAprobar(id) {
        try {
            await adminAprobar(token, id);
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo aprobar la transacción.');
        }
    }

    async function handleRechazar(id) {
        try {
            await adminRechazar(token, id);
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo rechazar la transacción.');
        }
    }

    if (!autenticado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                    <h1 className="text-2xl font-extrabold text-white text-center mb-2">Panel Admin</h1>
                    <input
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Token de administrador"
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-3 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                    >
                        {cargando ? 'Verificando...' : 'Entrar'}
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
        <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-extrabold text-white mb-6">Panel Admin - Polla Mundialista</h1>

                {/* Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <Metrica titulo="Pendientes" valor={pendientes.length} />
                    <Metrica titulo="Aprobadas" valor={aprobadas.length} />
                    <Metrica titulo="Ingresos" valor={formatoPesos(ingresos)} />
                    <Metrica titulo="Total transacciones" valor={transacciones.length} />
                </div>

                {/* Crear partido */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-white mb-3">Crear partido</h2>
                    <form onSubmit={handleCrearPartido} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                            type="text"
                            value={nuevoPartido.equipo_local}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_local: e.target.value }))}
                            placeholder="Equipo local"
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="text"
                            value={nuevoPartido.equipo_visitante}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_visitante: e.target.value }))}
                            placeholder="Equipo visitante"
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="datetime-local"
                            value={nuevoPartido.fecha_hora_inicio}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, fecha_hora_inicio: e.target.value }))}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
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
                        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Partido</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Estado</th>
                                        <th className="px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partidos.map((p) => (
                                        <tr key={p.id} className="border-t border-white/5 text-zinc-200">
                                            <td className="px-3 py-2">{p.equipo_local} vs {p.equipo_visitante}</td>
                                            <td className="px-3 py-2 text-zinc-400">{new Date(p.fecha_hora_inicio).toLocaleString('es-CO')}</td>
                                            <td className="px-3 py-2">{p.estado}</td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => handleEliminarPartido(p.id)}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                    filtro === f ? 'bg-amber-400 text-zinc-950' : 'bg-white/5 text-zinc-300 border border-white/10'
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
                        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                        onClick={() => cargarDatos(token)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-zinc-300 border border-white/10"
                    >
                        Refrescar
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-zinc-400">
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
                                <tr key={t.id} className="border-t border-white/5 text-zinc-200">
                                    <td className="px-4 py-3">{t.nombre}</td>
                                    <td className="px-4 py-3 text-zinc-400">
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
                                    <td className="px-4 py-3 text-zinc-400">{new Date(t.fecha).toLocaleString('es-CO')}</td>
                                    <td className="px-4 py-3">
                                        {t.estado === 'PENDIENTE' && (
                                            <div className="flex gap-2">
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
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {listaFiltrada.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                                        No hay transacciones para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Metrica({ titulo, valor }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-zinc-400 mb-1">{titulo}</p>
            <p className="text-xl font-bold text-white">{valor}</p>
        </div>
    );
}
