import { useEffect, useState } from 'react';
import { localLogin, localBuscarBono, localConsumirBono, localEstadisticas } from '../api';
import { formatoPesos } from '../config/planes';
import EscanerQR from '../components/EscanerQR';

const TOKEN_STORAGE_KEY = 'polla_local_token';

export default function RedimirCodigo() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    const [usuarioInput, setUsuarioInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [autenticado, setAutenticado] = useState(false);
    const [nombreLocal, setNombreLocal] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [estadisticas, setEstadisticas] = useState(null);

    const [mostrarScanner, setMostrarScanner] = useState(false);
    const [bonoEscaneado, setBonoEscaneado] = useState(null);
    const [errorEscaneo, setErrorEscaneo] = useState('');
    const [consumiendoBono, setConsumiendoBono] = useState(false);

    async function cargarEstadisticas(tok) {
        try {
            const data = await localEstadisticas(tok);
            if (data?.success) {
                setEstadisticas(data);
            }
        } catch {
            // silencioso: las estadísticas no son críticas para escanear bonos
        }
    }

    async function validarSesion(tok) {
        setCargando(true);
        setError('');
        try {
            const data = await localEstadisticas(tok);
            if (data?.success) {
                setEstadisticas(data);
                setAutenticado(true);
                localStorage.setItem(TOKEN_STORAGE_KEY, tok);
            } else {
                setAutenticado(false);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
            }
        } catch {
            setAutenticado(false);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        if (token) {
            validarSesion(token);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        if (!usuarioInput.trim() || !passwordInput.trim()) return;

        setCargando(true);
        setError('');
        try {
            const data = await localLogin(usuarioInput.trim(), passwordInput);
            if (data?.success) {
                setToken(data.token);
                setNombreLocal(data.nombreLocal || data.usuario);
                setPasswordInput('');
                setAutenticado(true);
                localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
                cargarEstadisticas(data.token);
            } else {
                setError(data?.error || 'Usuario o contraseña incorrectos.');
            }
        } catch {
            setError('Error de conexión al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    function handleSalir() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        setAutenticado(false);
        setEstadisticas(null);
        setBonoEscaneado(null);
    }

    async function handleEscaneoQR(tokenAcceso) {
        setMostrarScanner(false);
        setErrorEscaneo('');
        setBonoEscaneado(null);

        try {
            const data = await localBuscarBono(token, tokenAcceso);
            if (data?.success) {
                setBonoEscaneado({ token: tokenAcceso, ...data.bono });
            } else {
                setErrorEscaneo(data?.error || 'No se pudo verificar el bono.');
            }
        } catch {
            setErrorEscaneo('Error de conexión al verificar el bono.');
        }
    }

    async function handleConsumirBono() {
        if (!bonoEscaneado) return;

        setConsumiendoBono(true);
        setErrorEscaneo('');
        try {
            const data = await localConsumirBono(token, bonoEscaneado.token);
            if (data?.success) {
                setBonoEscaneado((b) => ({ ...b, consumido: true, consumido_en: new Date().toISOString() }));
                cargarEstadisticas(token);
            } else {
                setErrorEscaneo(data?.error || 'No se pudo marcar el bono como consumido.');
            }
        } catch {
            setErrorEscaneo('Error de conexión al marcar el bono.');
        } finally {
            setConsumiendoBono(false);
        }
    }

    if (!autenticado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                    <h1 className="text-2xl font-extrabold text-white text-center mb-2">Redimir bono</h1>
                    <input
                        type="text"
                        value={usuarioInput}
                        onChange={(e) => setUsuarioInput(e.target.value)}
                        placeholder="Usuario del local"
                        autoComplete="username"
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Contraseña"
                        autoComplete="current-password"
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

    return (
        <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 py-8">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-white">Redimir bono{nombreLocal ? ` · ${nombreLocal}` : ''}</h1>
                    <button
                        onClick={handleSalir}
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-zinc-300 border border-white/10"
                    >
                        Salir
                    </button>
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <Metrica titulo="Ingresos totales" valor={formatoPesos(estadisticas.ingresosTotales)} />
                        <Metrica titulo="Bonos redimidos" valor={estadisticas.totalBonosRedimidos} />
                        <Metrica titulo="Valor bonos redimidos" valor={formatoPesos(estadisticas.valorBonosRedimidos)} />
                    </div>
                )}

                {/* Escanear bono */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h2 className="text-lg font-bold text-white mb-3">Escanear bono</h2>
                    <p className="text-zinc-400 text-sm mb-3">
                        Escanea el código QR del bono del cliente para verificarlo y marcarlo como usado en el local.
                    </p>

                    {!mostrarScanner && !bonoEscaneado && (
                        <button
                            onClick={() => { setMostrarScanner(true); setErrorEscaneo(''); }}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500"
                        >
                            Abrir escáner
                        </button>
                    )}

                    {mostrarScanner && (
                        <div className="flex flex-col gap-3">
                            <EscanerQR onResultado={handleEscaneoQR} onError={setErrorEscaneo} />
                            <button
                                onClick={() => setMostrarScanner(false)}
                                className="self-center px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-zinc-300 border border-white/10"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {errorEscaneo && <p className="text-red-400 text-sm mt-2">{errorEscaneo}</p>}

                    {bonoEscaneado && (
                        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-white font-bold mb-1">{bonoEscaneado.nombre}</p>
                            <p className="text-zinc-400 text-sm mb-1">{bonoEscaneado.celular}</p>
                            <p className="text-zinc-200 text-lg font-bold mb-3">{formatoPesos(bonoEscaneado.saldo_bono)}</p>

                            {bonoEscaneado.consumido ? (
                                <p className="text-amber-400 font-semibold text-sm">
                                    Este bono ya fue usado{bonoEscaneado.consumido_en ? ` el ${new Date(bonoEscaneado.consumido_en).toLocaleString('es-CO')}` : ''}.
                                </p>
                            ) : (
                                <button
                                    onClick={handleConsumirBono}
                                    disabled={consumiendoBono}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {consumiendoBono ? 'Guardando...' : 'Marcar como consumido'}
                                </button>
                            )}

                            <div className="mt-3">
                                <button
                                    onClick={() => { setBonoEscaneado(null); setErrorEscaneo(''); }}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-zinc-300 border border-white/10"
                                >
                                    Escanear otro
                                </button>
                            </div>
                        </div>
                    )}
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
