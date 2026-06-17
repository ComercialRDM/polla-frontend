import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { localLogin, localBuscarBono, localEstadisticas, localRedimirBono } from '../api';
import EscanerQR from '../components/EscanerQR';

const STORAGE_KEY = 'polla_adminqr_token';

function formatPesos(v) {
    return '$' + Number(v).toLocaleString('es-CO');
}

function formatFecha(iso) {
    return new Date(iso).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function extraerToken(texto) {
    try {
        const url = new URL(texto);
        const t = url.searchParams.get('token');
        if (t) return t;
    } catch {}
    return texto.trim();
}

// ── Login ──────────────────────────────────────────────────────────────────
function PantallaLogin({ onLogin }) {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!usuario.trim() || !password.trim()) return;
        setCargando(true);
        setError('');
        try {
            const data = await localLogin(usuario.trim(), password);
            if (data?.success) {
                localStorage.setItem(STORAGE_KEY, data.token);
                onLogin({ token: data.token, usuario: data.usuario, nombreLocal: data.nombreLocal });
            } else {
                setError(data?.error || 'Usuario o contraseña incorrectos.');
            }
        } catch {
            setError('Error de conexión.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <p className="text-[#FCD116] font-black text-2xl tracking-widest uppercase">Admin QR</p>
                    <p className="text-zinc-500 text-xs mt-1">La Retoucherie de Manuela</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={usuario}
                        onChange={e => setUsuario(e.target.value)}
                        placeholder="Usuario del local"
                        autoComplete="username"
                        className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                    />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-3.5 rounded-xl font-black text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform disabled:opacity-60 mt-1"
                    >
                        {cargando ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Tarjeta del bono ────────────────────────────────────────────────────────
function TarjetaBono({ bono, tokenBono, sesionLocal, onRedimir, onNuevo }) {
    const [monto, setMonto] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [exito, setExito] = useState(null);

    const porcentaje = bono.saldo_bono > 0
        ? Math.round((bono.saldo_disponible / bono.saldo_bono) * 100)
        : 0;

    async function handleRedimir(montoFinal) {
        setError('');
        setCargando(true);
        try {
            const data = await localRedimirBono(sesionLocal.token, tokenBono, montoFinal);
            if (data?.success) {
                setExito(data);
                setMonto('');
                onRedimir(data);
            } else {
                setError(data?.error || 'No se pudo redimir.');
            }
        } catch {
            setError('Error de conexión.');
        } finally {
            setCargando(false);
        }
    }

    if (exito) {
        return (
            <div className="rounded-2xl bg-green-900/30 border border-green-500/40 p-6 text-center">
                <p className="text-5xl mb-3">✅</p>
                <p className="text-green-400 font-black text-xl mb-1">¡Redención exitosa!</p>
                <p className="text-white font-bold text-lg">{exito.nombre}</p>
                <p className="text-green-400 font-black text-3xl mt-2">{formatPesos(exito.monto)} redimidos</p>
                <p className="text-zinc-400 text-sm mt-1">
                    Saldo restante: <span className="text-white font-bold">{formatPesos(exito.saldo_despues)}</span>
                </p>
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={() => setExito(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-sm text-white border border-white/20 bg-white/5"
                    >
                        Ver bono
                    </button>
                    <button
                        onClick={onNuevo}
                        className="flex-1 py-3 rounded-xl font-black text-sm text-zinc-950 bg-[#FCD116]"
                    >
                        Nuevo escaneo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Info del cliente */}
            <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <p className="text-[#FCD116] font-black text-base leading-tight">{bono.nombre}</p>
                        <p className="text-zinc-400 text-sm">{bono.celular}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                        bono.consumido ? 'bg-zinc-700 text-zinc-400' : 'bg-green-900/40 text-green-400 border border-green-500/30'
                    }`}>
                        {bono.consumido ? 'AGOTADO' : 'VÁLIDO'}
                    </span>
                </div>

                {/* Saldo */}
                <div className="bg-zinc-800/60 rounded-xl p-3 mb-3">
                    <p className="text-zinc-400 text-xs mb-1">Saldo disponible</p>
                    <p className={`font-black text-3xl leading-none ${bono.saldo_disponible > 0 ? 'text-white' : 'text-zinc-600'}`}>
                        {formatPesos(bono.saldo_disponible)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-zinc-500 text-xs">Bono original: {formatPesos(bono.saldo_bono)}</p>
                        <span className="text-zinc-500 text-xs">{porcentaje}% restante</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5 mt-1.5">
                        <div
                            className="h-1.5 rounded-full bg-[#FCD116] transition-all"
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                </div>

                {/* Redimir */}
                {bono.saldo_disponible > 0 ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Redimir</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={monto}
                                onChange={e => setMonto(e.target.value)}
                                placeholder="Monto a descargar"
                                min="1"
                                max={bono.saldo_disponible}
                                className="flex-1 rounded-xl bg-zinc-800 border border-white/10 px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                            />
                            <button
                                onClick={() => {
                                    const m = parseInt(monto);
                                    if (!m || m <= 0) { setError('Ingresa un monto válido.'); return; }
                                    if (m > bono.saldo_disponible) { setError(`Máximo ${formatPesos(bono.saldo_disponible)}.`); return; }
                                    handleRedimir(m);
                                }}
                                disabled={cargando}
                                className="px-4 py-2.5 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform disabled:opacity-60"
                            >
                                {cargando ? '...' : 'Redimir'}
                            </button>
                        </div>
                        <button
                            onClick={() => handleRedimir(bono.saldo_disponible)}
                            disabled={cargando}
                            className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-green-700 hover:bg-green-600 active:scale-95 transition-transform disabled:opacity-60"
                        >
                            {cargando ? 'Procesando...' : `Redimir total — ${formatPesos(bono.saldo_disponible)}`}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-sm text-center py-2">Este bono ya fue redimido completamente.</p>
                )}
            </div>

            {/* Historial */}
            {bono.redenciones?.length > 0 && (
                <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Historial de redenciones</p>
                    <div className="flex flex-col gap-2">
                        {bono.redenciones.map((r, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-white text-sm font-bold">{formatPesos(r.monto)}</p>
                                    <p className="text-zinc-500 text-xs">{r.nombre_local || r.local_usuario} · {formatFecha(r.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-400 text-xs">{formatPesos(r.saldo_antes)} → {formatPesos(r.saldo_despues)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onNuevo}
                className="w-full py-3 rounded-xl font-bold text-sm text-zinc-400 border border-white/10 bg-zinc-900"
            >
                📷 Escanear otro bono
            </button>
        </div>
    );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function AdminQR() {
    const [searchParams] = useSearchParams();
    const [sesionLocal, setSesionLocal] = useState(null);
    const [tokenBono, setTokenBono] = useState(null);
    const [bono, setBono] = useState(null);
    const [mostrarScanner, setMostrarScanner] = useState(false);
    const [errorBono, setErrorBono] = useState('');
    const [cargandoBono, setCargandoBono] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

    // Restaurar sesión guardada
    useEffect(() => {
        const tok = localStorage.getItem(STORAGE_KEY);
        if (!tok) return;
        localEstadisticas(tok)
            .then(d => {
                if (d?.success) {
                    setSesionLocal({ token: tok, usuario: '', nombreLocal: '' });
                    setEstadisticas(d);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            })
            .catch(() => localStorage.removeItem(STORAGE_KEY));
    }, []);

    // Si la URL trae ?token=xxx (escaneo con cámara del móvil)
    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) setTokenBono(tokenParam);
    }, [searchParams]);

    // Cuando tenemos sesión + tokenBono → cargar el bono automáticamente
    useEffect(() => {
        if (!sesionLocal || !tokenBono) return;
        cargarBono(tokenBono);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sesionLocal, tokenBono]);

    const cargarBono = useCallback(async (tok) => {
        setCargandoBono(true);
        setErrorBono('');
        setBono(null);
        try {
            const data = await localBuscarBono(sesionLocal.token, tok);
            if (data?.success) {
                setBono(data.bono);
                setTokenBono(tok);
            } else {
                setErrorBono(data?.error || 'Bono no encontrado.');
            }
        } catch {
            setErrorBono('Error de conexión.');
        } finally {
            setCargandoBono(false);
        }
    }, [sesionLocal]);

    function handleEscaneoQR(texto) {
        const tok = extraerToken(texto);
        setMostrarScanner(false);
        cargarBono(tok);
    }

    function handleRedimir(resultado) {
        // Actualizar el saldo en la tarjeta localmente
        setBono(prev => prev ? {
            ...prev,
            saldo_disponible: resultado.saldo_despues,
            consumido: resultado.saldo_despues === 0,
            redenciones: [
                {
                    monto: resultado.monto,
                    saldo_antes: resultado.saldo_antes,
                    saldo_despues: resultado.saldo_despues,
                    created_at: new Date().toISOString(),
                    nombre_local: sesionLocal.nombreLocal,
                    local_usuario: sesionLocal.usuario,
                },
                ...(prev.redenciones || []),
            ],
        } : prev);
    }

    function handleNuevo() {
        setBono(null);
        setTokenBono(null);
        setErrorBono('');
    }

    function handleSalir() {
        localStorage.removeItem(STORAGE_KEY);
        setSesionLocal(null);
        setBono(null);
        setTokenBono(null);
    }

    if (!sesionLocal) {
        return <PantallaLogin onLogin={setSesionLocal} />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-6 flex flex-col items-center">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-[#FCD116] font-black text-lg leading-none">Admin QR</p>
                        {sesionLocal.nombreLocal && (
                            <p className="text-zinc-500 text-xs mt-0.5">{sesionLocal.nombreLocal}</p>
                        )}
                    </div>
                    <button
                        onClick={handleSalir}
                        className="text-xs text-zinc-500 border border-zinc-700 rounded-lg px-3 py-1.5 hover:text-zinc-300"
                    >
                        Salir
                    </button>
                </div>

                {/* Estadísticas rápidas */}
                {estadisticas && (
                    <div className="grid grid-cols-2 gap-2 mb-5">
                        <div className="rounded-xl bg-zinc-900 border border-white/5 p-3">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Bonos redimidos</p>
                            <p className="text-white font-black text-xl">{estadisticas.totalBonosRedimidos}</p>
                        </div>
                        <div className="rounded-xl bg-zinc-900 border border-white/5 p-3">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Valor redimido</p>
                            <p className="text-white font-black text-xl">${(estadisticas.valorBonosRedimidos/1000).toFixed(0)}K</p>
                        </div>
                    </div>
                )}

                {/* Scanner / Bono */}
                {cargandoBono ? (
                    <div className="rounded-2xl bg-zinc-900 border border-white/10 p-8 text-center">
                        <p className="text-zinc-400 text-sm">Verificando bono...</p>
                    </div>
                ) : bono ? (
                    <TarjetaBono
                        bono={bono}
                        tokenBono={tokenBono}
                        sesionLocal={sesionLocal}
                        onRedimir={handleRedimir}
                        onNuevo={handleNuevo}
                    />
                ) : (
                    <div className="flex flex-col gap-3">
                        {!mostrarScanner ? (
                            <button
                                onClick={() => { setMostrarScanner(true); setErrorBono(''); }}
                                className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-[#FCD116]/50 transition-colors active:scale-95"
                            >
                                <span className="text-5xl">📷</span>
                                <p className="text-white font-bold">Escanear código QR del bono</p>
                                <p className="text-zinc-500 text-xs">Apunta la cámara al QR del bono del cliente</p>
                            </button>
                        ) : (
                            <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 flex flex-col gap-3">
                                <EscanerQR onResultado={handleEscaneoQR} onError={setErrorBono} />
                                <button
                                    onClick={() => setMostrarScanner(false)}
                                    className="self-center text-xs text-zinc-500 underline"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                        {errorBono && (
                            <div className="rounded-xl bg-red-900/20 border border-red-500/30 px-4 py-3">
                                <p className="text-red-400 text-sm text-center">{errorBono}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
