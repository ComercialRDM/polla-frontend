import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminLogin, rifaResumen, rifaLote, rifaImagen, rifaRevisarLote, rifaCambiarCanal } from '../api';

// Revisión y aprobación de las boletas de la rifa del iPhone 18 Pro antes del
// envío por WhatsApp. Usa la misma sesión de administrador que /dashboardpollardm.
const TOKEN_STORAGE_KEY = 'polla_admin_token';

function leerToken() {
    try { return localStorage.getItem(TOKEN_STORAGE_KEY) || ''; } catch { return ''; }
}

function Login({ onLogin }) {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [pide2fa, setPide2fa] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const r = await adminLogin(usuario, password, pide2fa ? totp : undefined);
            if (r?.requires_2fa) { setPide2fa(true); return; }
            if (!r?.success) { setError(r?.error || 'No se pudo iniciar sesión'); return; }
            try { localStorage.setItem(TOKEN_STORAGE_KEY, r.token); } catch { /* sin almacenamiento */ }
            onLogin(r.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const campo = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-amber-400';
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
            <form onSubmit={enviar} className="w-full max-w-sm flex flex-col gap-4">
                <h1 className="font-display text-white text-4xl text-center">Revisión de boletas</h1>
                <p className="text-zinc-400 text-sm text-center">Rifa iPhone 18 Pro · ingresa con tu usuario de administrador</p>
                {!pide2fa ? (
                    <>
                        <input className={campo} placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
                        <input className={campo} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                    </>
                ) : (
                    <input className={campo} inputMode="numeric" placeholder="Código de verificación (2FA)" value={totp} onChange={(e) => setTotp(e.target.value)} autoFocus required />
                )}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button disabled={cargando} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-full">
                    {cargando ? 'Verificando…' : pide2fa ? 'Verificar' : 'Ingresar'}
                </button>
            </form>
        </main>
    );
}

function colorLote(l) {
    if (l.rechazadas) return 'bg-red-500 text-white';
    if (l.aprobadas === l.total) return 'bg-emerald-500 text-zinc-950';
    if (l.aprobadas) return 'bg-amber-400 text-zinc-950';
    return 'bg-zinc-800 text-zinc-300';
}

function TarjetaBoleta({ b, imagen, decision, onDecision, onCanal, onAmpliar }) {
    const [editCanal, setEditCanal] = useState(false);
    const [motivoCanal, setMotivoCanal] = useState('');
    const integra = imagen && imagen.sha256 === b.imagen_sha256;
    const rechazar = decision.estado === 'rechazada';

    return (
        <article className={`rounded-2xl border-2 bg-zinc-900 overflow-hidden ${rechazar ? 'border-red-500' : 'border-zinc-800'}`}>
            <button type="button" onClick={() => imagen && onAmpliar(imagen.url)} className="block w-full bg-black aspect-[3/2]">
                {imagen ? <img src={imagen.url} alt={`Boleta ${b.numero}`} className="w-full h-full object-contain" />
                    : <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Cargando imagen…</div>}
            </button>
            <div className="p-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-display text-3xl text-white">Nº {String(b.numero).padStart(3, '0')}</span>
                    {imagen && (integra
                        ? <span className="text-emerald-400 text-xs font-semibold">✓ Imagen idéntica a la auditada</span>
                        : <span className="text-red-400 text-xs font-bold">✗ La imagen NO coincide con la auditada</span>)}
                </div>
                <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-zinc-300">
                    <dt className="text-zinc-500">Factura</dt><dd>{b.factura} · {b.fecha_factura}</dd>
                    <dt className="text-zinc-500">Cliente</dt><dd className="font-semibold text-white">{b.nombre}</dd>
                    <dt className="text-zinc-500">Cédula</dt><dd>{b.cedula}</dd>
                    <dt className="text-zinc-500">Sede</dt><dd>{b.sede}</dd>
                    <dt className="text-zinc-500">Celular</dt><dd>{b.celular || <span className="text-red-400">sin celular</span>}</dd>
                    {b.correo && <><dt className="text-zinc-500">Correo</dt><dd className="break-all">{b.correo}</dd></>}
                </dl>

                {b.canal_envio === 'otro_medio' ? (
                    <div className="rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2 text-red-200">
                        📵 <b>Enviar por otro medio:</b> {b.canal_motivo}
                        {b.celular && <button type="button" onClick={() => onCanal(b.numero, 'whatsapp', '')} className="block mt-1 text-xs underline text-red-300">Volver a WhatsApp</button>}
                    </div>
                ) : (
                    <div className="text-xs text-emerald-300">📲 Se enviará por WhatsApp
                        {!editCanal && <button type="button" onClick={() => setEditCanal(true)} className="ml-2 underline text-zinc-400">Marcar para otro medio</button>}
                    </div>
                )}
                {editCanal && (
                    <div className="flex gap-2">
                        <input value={motivoCanal} onChange={(e) => setMotivoCanal(e.target.value)} placeholder="Motivo (ej. canceló suscripción)" className="flex-1 rounded bg-zinc-800 px-2 py-1 text-white" />
                        <button type="button" disabled={!motivoCanal.trim()} onClick={() => { onCanal(b.numero, 'otro_medio', motivoCanal); setEditCanal(false); }} className="bg-red-500 disabled:opacity-40 text-white px-3 rounded">Guardar</button>
                    </div>
                )}

                {b.observacion_auditoria && (
                    <p className="rounded-lg bg-amber-400/10 border border-amber-400/40 px-3 py-2 text-amber-200 text-xs">⚠ Auditoría: {b.observacion_auditoria}</p>
                )}
                {b.revisado_en && (
                    <p className="text-xs text-zinc-500">
                        Última revisión: {b.revision_estado} por {b.revisado_por} · {new Date(b.revisado_en).toLocaleString('es-CO')}
                        {b.revision_nota ? ` · "${b.revision_nota}"` : ''}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onDecision(b.numero, { estado: 'aprobada', nota: '' })}
                        className={`py-2 rounded-lg font-bold ${!rechazar ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>✓ Correcta</button>
                    <button type="button" onClick={() => onDecision(b.numero, { estado: 'rechazada', nota: decision.nota })}
                        className={`py-2 rounded-lg font-bold ${rechazar ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>✗ Tiene un error</button>
                </div>
                {rechazar && (
                    <textarea value={decision.nota} onChange={(e) => onDecision(b.numero, { estado: 'rechazada', nota: e.target.value })}
                        placeholder="¿Qué está mal? (obligatorio)" className="rounded-lg bg-zinc-800 px-3 py-2 text-white" rows={2} />
                )}
            </div>
        </article>
    );
}

export default function RevisionBoletas() {
    const [token, setToken] = useState(leerToken);
    const [resumen, setResumen] = useState(null);
    const [loteActual, setLoteActual] = useState(null);
    const [boletas, setBoletas] = useState([]);
    const [imagenes, setImagenes] = useState({});
    const [decisiones, setDecisiones] = useState({});
    const [ampliada, setAmpliada] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const salir = useCallback(() => {
        try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch { /* nada */ }
        setToken('');
    }, []);

    const manejar = useCallback((r) => {
        if (r && r.success === false && /autorizado|Sesión inválida|prohibido/i.test(r.error || '')) salir();
        return r;
    }, [salir]);

    const cargarResumen = useCallback(async () => {
        const r = manejar(await rifaResumen(token));
        if (r?.success) setResumen(r);
        return r;
    }, [token, manejar]);

    // Cambia de lote limpiando lo mostrado del lote anterior.
    const irALote = useCallback((n) => {
        setBoletas([]);
        setImagenes({});
        setLoteActual(n);
    }, []);

    useEffect(() => {
        if (!token) return;
        rifaResumen(token).then((r) => {
            if (!manejar(r)?.success) return;
            setResumen(r);
            const siguiente = r.lotes.find((l) => l.aprobadas + l.rechazadas < l.total) || r.lotes[0];
            if (siguiente) setLoteActual(Number(siguiente.lote));
        });
    }, [token, manejar]);

    useEffect(() => {
        if (!token || !loteActual) return;
        let vivo = true;
        rifaLote(token, loteActual).then((r) => {
            if (!vivo || !manejar(r)?.success) return;
            setBoletas(r.boletas);
            setDecisiones(Object.fromEntries(r.boletas.map((b) => [b.numero, {
                estado: b.revision_estado === 'rechazada' ? 'rechazada' : 'aprobada',
                nota: b.revision_nota || '',
            }])));
            r.boletas.forEach((b) => rifaImagen(token, b.numero)
                .then((img) => vivo && setImagenes((prev) => ({ ...prev, [b.numero]: img })))
                .catch(() => vivo && setImagenes((prev) => ({ ...prev, [b.numero]: { url: '', sha256: 'error' } }))));
        });
        window.scrollTo({ top: 0 });
        return () => { vivo = false; };
    }, [token, loteActual, manejar]);

    const todasCargadas = boletas.length > 0 && boletas.every((b) => imagenes[b.numero]);
    const todasIntegras = boletas.every((b) => imagenes[b.numero]?.sha256 === b.imagen_sha256);
    const faltaNota = Object.values(decisiones).some((d) => d.estado === 'rechazada' && !d.nota.trim());
    const verificado = !!resumen?.verificacion_cancelados;
    const conteo = useMemo(() => Object.values(decisiones).reduce((a, d) => ({ ...a, [d.estado]: (a[d.estado] || 0) + 1 }), {}), [decisiones]);

    async function guardarLote() {
        setGuardando(true);
        setMensaje(null);
        try {
            const lista = boletas.map((b) => ({ numero: b.numero, ...decisiones[b.numero] }));
            const r = manejar(await rifaRevisarLote(token, loteActual, lista));
            if (!r?.success) { setMensaje({ tipo: 'error', texto: r?.error || 'No se pudo guardar' }); return; }
            const res = await cargarResumen();
            setMensaje({ tipo: 'ok', texto: `Lote ${loteActual} guardado: ${conteo.aprobada || 0} aprobadas, ${conteo.rechazada || 0} con error.` });
            const sig = res?.lotes?.find((l) => Number(l.lote) > loteActual && l.aprobadas + l.rechazadas < l.total);
            if (sig) irALote(Number(sig.lote));
        } finally {
            setGuardando(false);
        }
    }

    async function cambiarCanal(numero, canal, motivo) {
        const r = manejar(await rifaCambiarCanal(token, numero, canal, motivo));
        if (!r?.success) { setMensaje({ tipo: 'error', texto: r?.error || 'No se pudo cambiar el canal' }); return; }
        const l = manejar(await rifaLote(token, loteActual));
        if (l?.success) setBoletas(l.boletas);
        cargarResumen();
        setMensaje({ tipo: 'ok', texto: `Canal actualizado para las boletas ${r.boletas.join(', ')} (mismo cliente).` });
    }

    if (!token) return <Login onLogin={setToken} />;

    const t = resumen?.totales;
    return (
        <main className="min-h-screen bg-zinc-950 text-white pb-32">
            <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
                <div className="max-w-6xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h1 className="font-display text-3xl">Revisión de boletas · iPhone 18 Pro</h1>
                        <button type="button" onClick={salir} className="text-xs text-zinc-400 underline">Cerrar sesión</button>
                    </div>
                    {t && (
                        <>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(t.aprobadas / t.total) * 100}%` }} />
                            </div>
                            <p className="text-xs text-zinc-400">
                                <b className="text-emerald-400">{t.aprobadas}</b> aprobadas · <b className="text-red-400">{t.rechazadas}</b> con error ·{' '}
                                {t.total - t.aprobadas - t.rechazadas} pendientes · de {t.total} · <b className="text-red-300">{t.otro_medio}</b> por otro medio
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                                {resumen.lotes.map((l) => (
                                    <button key={l.lote} type="button" onClick={() => irALote(Number(l.lote))}
                                        className={`min-w-9 h-9 px-2 rounded-lg text-sm font-bold ${colorLote(l)} ${Number(l.lote) === loteActual ? 'ring-2 ring-white' : ''}`}
                                        title={`Boletas ${l.desde}–${l.hasta}`}>{l.lote}</button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 pt-5 flex flex-col gap-5">
                {resumen && (verificado ? (
                    <p className="rounded-xl bg-emerald-500/10 border border-emerald-500/40 px-4 py-3 text-sm text-emerald-200">
                        ✅ Lista de cancelados de WhatsApp verificada el {new Date(resumen.verificacion_cancelados.creado_en).toLocaleString('es-CO')}. {resumen.verificacion_cancelados.detalle}
                    </p>
                ) : (
                    <p className="rounded-xl bg-red-500/15 border border-red-500/50 px-4 py-3 text-sm text-red-200">
                        ⛔ <b>Paso crítico pendiente:</b> aún no se ha cruzado la base con los clientes que cancelaron la suscripción de WhatsApp en ManyChat.
                        Puedes revisar las boletas, pero no se pueden aprobar hasta completar esta verificación.
                    </p>
                ))}
                {mensaje && (
                    <p className={`rounded-xl px-4 py-3 text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>{mensaje.texto}</p>
                )}
                {loteActual && boletas.length > 0 && (
                    <h2 className="text-lg font-bold">Lote {loteActual} · boletas {boletas[0].numero}–{boletas[boletas.length - 1].numero}</h2>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                    {boletas.map((b) => (
                        <TarjetaBoleta key={b.numero} b={b} imagen={imagenes[b.numero]} decision={decisiones[b.numero] || { estado: 'aprobada', nota: '' }}
                            onDecision={(n, d) => setDecisiones((prev) => ({ ...prev, [n]: d }))} onCanal={cambiarCanal} onAmpliar={setAmpliada} />
                    ))}
                </div>
            </div>

            {boletas.length > 0 && (
                <footer className="fixed bottom-0 inset-x-0 z-20 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm text-zinc-300">
                            {!todasCargadas ? 'Cargando imágenes…'
                                : !todasIntegras ? '✗ Hay imágenes que no coinciden con las auditadas: no se puede aprobar.'
                                : faltaNota ? 'Escribe el motivo de cada boleta con error.'
                                : !verificado && conteo.aprobada ? 'Falta verificar la lista de cancelados de WhatsApp.'
                                : `${conteo.aprobada || 0} correctas · ${conteo.rechazada || 0} con error`}
                        </p>
                        <button type="button" onClick={guardarLote}
                            disabled={guardando || !todasCargadas || !todasIntegras || faltaNota || (!verificado && !!conteo.aprobada)}
                            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold px-6 py-3 rounded-full">
                            {guardando ? 'Guardando…' : `Guardar revisión del lote ${loteActual}`}
                        </button>
                    </div>
                </footer>
            )}

            {ampliada && (
                <button type="button" onClick={() => setAmpliada(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <img src={ampliada} alt="Boleta ampliada" className="max-w-full max-h-full object-contain" />
                </button>
            )}
        </main>
    );
}
