import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminLogin, rifaResumen, rifaLote, rifaImagen, rifaRevisarLote, rifaCambiarCanal, rifaPendientes, rifaEnvioResumen, rifaEnvioConfig, rifaEnvioPrueba, rifaEnvioLote, rifaEnvioReintentarFallidos, rifaEnvioContactoManychat, rifaCorreoResumen, rifaCorreoPrueba, rifaCorreoLote, rifaCorreoReintentar, rifaRecordatorioResumen, rifaRecordatorioConfig, rifaRecordatorioPrueba, rifaRecordatorioLote, rifaCortes, rifaCorte, rifaRevisarCorte, cuenta2faEstado, cuenta2faSetup, cuenta2faConfirmar, cuentaCambiarPassword } from '../api';

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
                <a href="/acceso/recuperar" className="text-xs text-zinc-400 underline text-center">¿Olvidaste tu contraseña?</a>
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

function descargarCsv(nombre, filas) {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + filas.map((f) => f.map(esc).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(a.href);
}

function TablaPendientes({ titulo, descripcion, lista, color, onVer }) {
    return (
        <section className="flex flex-col gap-3">
            <div>
                <h3 className={`text-lg font-bold ${color}`}>{titulo} · {lista.length} clientes · {lista.reduce((a, g) => a + g.total, 0)} boletas</h3>
                <p className="text-sm text-zinc-400">{descripcion}</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-900 text-zinc-400 text-left">
                        <tr>
                            <th className="px-3 py-2">Cliente</th><th className="px-3 py-2">Cédula</th><th className="px-3 py-2">Contacto</th>
                            <th className="px-3 py-2">Sede</th><th className="px-3 py-2">Factura → boletas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map((g) => (
                            <tr key={g.cedula} className="border-t border-zinc-800 align-top">
                                <td className="px-3 py-2 font-semibold text-white">{g.nombre}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{g.cedula}</td>
                                <td className="px-3 py-2">
                                    {g.celular && <div>{g.celular}</div>}
                                    {g.correo ? <div className="break-all">{g.correo}</div> : !g.celular && <span className="text-zinc-500">sin datos</span>}
                                </td>
                                <td className="px-3 py-2">{g.sede}</td>
                                <td className="px-3 py-2">
                                    {[...g.facturas.entries()].map(([fac, nums]) => (
                                        <div key={fac} className="whitespace-nowrap">{fac} → {nums.map((n) => (
                                            <button key={n} type="button" onClick={() => onVer(n)} className="underline text-amber-300 mr-1.5">#{String(n).padStart(3, '0')}</button>
                                        ))}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

// Boletas que no salen por WhatsApp: sin celular, o el cliente canceló la
// suscripción. Agrupadas por cliente para gestionar el contacto y la entrega.
function Pendientes({ token, onVer }) {
    const [boletas, setBoletas] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        rifaPendientes(token).then((r) => (r?.success ? setBoletas(r.boletas) : setError(r?.error || 'No se pudo cargar')));
    }, [token]);

    const grupos = useMemo(() => {
        const porCliente = new Map();
        for (const b of boletas || []) {
            const g = porCliente.get(`${b.cedula}|${b.anulada ? 'a' : ''}`) || { ...b, facturas: new Map(), total: 0 };
            g.facturas.set(b.factura, [...(g.facturas.get(b.factura) || []), b.numero]);
            g.total += 1;
            porCliente.set(`${b.cedula}|${b.anulada ? 'a' : ''}`, g);
        }
        const todos = [...porCliente.values()];
        return {
            sinTelefono: todos.filter((g) => !g.anulada && !g.celular),
            cancelados: todos.filter((g) => !g.anulada && g.celular),
            anuladas: todos.filter((g) => g.anulada),
        };
    }, [boletas]);

    if (error) return <p className="text-red-300">{error}</p>;
    if (!boletas) return <p className="text-zinc-400">Cargando pendientes…</p>;

    function exportar() {
        const filas = [['Grupo', 'Cliente', 'Cédula', 'Celular', 'Correo', 'Sede', 'Factura', 'Fecha factura', 'Boleta', 'Motivo']];
        for (const b of boletas) {
            filas.push([b.anulada ? 'Anulada' : b.celular ? 'Canceló suscripción' : 'Sin teléfono', b.nombre, b.cedula, b.celular, b.correo, b.sede,
                b.factura, b.fecha_factura, String(b.numero).padStart(3, '0'), b.anulada ? b.anulada_motivo : b.canal_motivo]);
        }
        descargarCsv(`rifa_pendientes_por_enviar_${new Date().toISOString().slice(0, 10)}.csv`, filas);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-zinc-300">Estas boletas <b>no se envían por WhatsApp</b>. Cuando se complete el celular en el Sheet y se actualice, pasan solas a los lotes de revisión.</p>
                <button type="button" onClick={exportar} className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold px-4 py-2 rounded-full">⬇ Descargar listado (Excel/CSV)</button>
            </div>
            <TablaPendientes titulo="📵 Sin número de teléfono" color="text-red-300" lista={grupos.sinTelefono} onVer={onVer}
                descripcion="Conseguir el celular (completar la pestaña CONTACTOS del Sheet) o entregar la boleta en la sede." />
            <TablaPendientes titulo="🚫 Cancelaron la suscripción de WhatsApp" color="text-amber-300" lista={grupos.cancelados} onVer={onVer}
                descripcion="No escribirles por WhatsApp. Enviar la boleta al correo o entregarla en la sede." />
            {grupos.anuladas.length > 0 && (
                <TablaPendientes titulo="🗑️ Anuladas (no participan)" color="text-zinc-400" lista={grupos.anuladas} onVer={onVer}
                    descripcion="La factura se anuló o tuvo nota crédito en Alegra. Estas boletas no participan en el sorteo." />
            )}
        </div>
    );
}

const ESTADOS_ENVIO = {
    enviando: ['⏳ Enviando', 'text-zinc-300'],
    enviado: ['📤 Enviado (esperando que lo abra)', 'text-sky-300'],
    entregado: ['📩 Boletas entregadas', 'text-emerald-300'],
    cancelado: ['🚫 Canceló WhatsApp → otro medio', 'text-amber-300'],
    fallido: ['✗ Falló', 'text-red-300'],
};

// Para clientes que ManyChat no encuentra por número: se pega su ID de ManyChat
// (Contacts → abrir el contacto → ícono de ID) y el cliente vuelve a la cola.
function IdManychat({ token, cedula, onListo }) {
    const [id, setId] = useState('');
    const [error, setError] = useState('');
    async function guardar() {
        const r = await rifaEnvioContactoManychat(token, cedula, id.trim());
        if (r?.success) { setId(''); setError(''); onListo(r); } else setError(r?.error || 'No se pudo guardar');
    }
    return (
        <div className="mt-2 flex flex-col gap-1">
            <div className="flex gap-1">
                <input value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ''))} placeholder="ID de ManyChat"
                    className="w-32 rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white" />
                <button type="button" disabled={id.length < 5} onClick={guardar}
                    className="text-xs bg-sky-500 disabled:opacity-40 text-zinc-950 font-bold px-2 rounded">Guardar</button>
            </div>
            {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
    );
}

function Copiable({ etiqueta, valor }) {
    const [copiado, setCopiado] = useState(false);
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">{etiqueta}</span>
            <div className="flex gap-2">
                <code className="flex-1 rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs break-all">{valor}</code>
                <button type="button" onClick={() => { navigator.clipboard?.writeText(valor); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 rounded">{copiado ? '✓' : 'Copiar'}</button>
            </div>
        </div>
    );
}

// Envío por WhatsApp (ManyChat): configuración, prueba obligatoria a tu número,
// envío por tandas con control y bitácora con fecha/hora de entrega y confirmación.
function Envio({ token }) {
    const [r, setR] = useState(null);
    const [flowNs, setFlowNs] = useState('');
    const [ocupado, setOcupado] = useState(false);
    const [auto, setAuto] = useState(false);
    const [aviso, setAviso] = useState(null);

    const cargar = useCallback(async () => {
        const x = await rifaEnvioResumen(token);
        if (x?.success) setR(x); else setAviso({ tipo: 'error', texto: x?.error || 'No se pudo cargar el envío' });
        return x;
    }, [token]);

    useEffect(() => {
        rifaEnvioResumen(token).then((x) => {
            if (x?.success) { setR(x); setFlowNs(x.configurado.flow_ns || ''); }
            else setAviso({ tipo: 'error', texto: x?.error || 'No se pudo cargar el envío' });
        });
    }, [token]);

    // Envío continuo por tandas de 10 mientras "auto" esté activo.
    useEffect(() => {
        if (!auto) return;
        let vivo = true;
        (async () => {
            while (vivo) {
                const x = await rifaEnvioLote(token, 10);
                if (!x?.success) { setAviso({ tipo: 'error', texto: x?.error || 'Error enviando' }); break; }
                const res = await cargar();
                if (!x.resultados.length || !res?.clientes_listos) { setAviso({ tipo: 'ok', texto: 'Envío terminado: no quedan clientes listos.' }); break; }
                // Freno de seguridad: si una tanda completa no logra enviar nada, se detiene.
                if (!x.resultados.some((y) => y.estado === 'enviado')) { setAviso({ tipo: 'error', texto: 'Envío detenido: ninguna entrega en la última tanda. Revisa la bitácora.' }); break; }
            }
            if (vivo) setAuto(false);
        })();
        return () => { vivo = false; };
    }, [auto, token, cargar]);

    if (!r) return <p className="text-zinc-400">{aviso?.texto || 'Cargando…'}</p>;

    const cfg = r.configurado;
    const pruebas = r.envios.filter((e) => e.es_prueba);
    const pruebaOk = pruebas.some((e) => e.entregado_en);
    const reales = r.envios.filter((e) => !e.es_prueba);
    const conteo = (estado) => r.por_estado.find((e) => e.envio_estado === estado) || { clientes: 0, boletas: 0 };

    async function guardarFlow() {
        const x = await rifaEnvioConfig(token, flowNs.trim());
        setAviso(x?.success ? { tipo: 'ok', texto: 'Flow guardado.' } : { tipo: 'error', texto: x?.error || 'No se pudo guardar' });
        cargar();
    }
    async function prueba() {
        setOcupado(true);
        const x = await rifaEnvioPrueba(token);
        setOcupado(false);
        setAviso(x?.success
            ? { tipo: 'ok', texto: `Prueba enviada a tu WhatsApp (${x.enviado_a}). Ábrela y toca "Ver mis boletas"; luego responde la pregunta.` }
            : { tipo: 'error', texto: x?.error || x?.resultado?.detalle || 'La prueba falló' });
        cargar();
    }
    async function tanda() {
        setOcupado(true);
        const x = await rifaEnvioLote(token, 10);
        setOcupado(false);
        setAviso(x?.success ? { tipo: 'ok', texto: `Tanda enviada: ${x.resultados.filter((y) => y.estado === 'enviado').length} de ${x.resultados.length}.` }
            : { tipo: 'error', texto: x?.error || 'Error enviando' });
        cargar();
    }
    function exportar() {
        const filas = [['Cliente', 'Cédula', 'Celular', 'Boletas', 'Estado', 'Detalle', 'Enviado', 'Boletas entregadas', 'Respuesta', 'Respondió']];
        const f = (d) => (d ? new Date(d).toLocaleString('es-CO') : '');
        for (const e of reales) {
            filas.push([e.nombre, e.cedula, e.celular, e.numeros.map((n) => String(n).padStart(3, '0')).join(' '), e.estado, e.detalle,
                f(e.enviado_en), f(e.entregado_en), e.respuesta === 'ok' ? 'Datos correctos' : e.respuesta === 'error' ? 'Reportó error' : '', f(e.respondido_en)]);
        }
        descargarCsv(`rifa_bitacora_envios_${new Date().toISOString().slice(0, 10)}.csv`, filas);
    }

    const paso = 'rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-3';
    return (
        <div className="flex flex-col gap-5">
            {aviso && <p className={`rounded-xl px-4 py-3 text-sm ${aviso.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>{aviso.texto}</p>}

            <section className={paso}>
                <h3 className="font-bold">1 · Conectar el flow de ManyChat</h3>
                <p className="text-sm text-zinc-400">Estos datos van en las dos “Solicitudes externas” (External Request) del flow. Ver la guía de configuración.</p>
                <Copiable etiqueta="URL al tocar “Ver mis boletas” (POST)" valor={`${cfg.backend_url}/api/rifa/webhook/ver`} />
                <Copiable etiqueta="URL al responder la pregunta (POST)" valor={`${cfg.backend_url}/api/rifa/webhook/confirmar`} />
                <Copiable etiqueta="Encabezado X-Rifa-Secret (no lo compartas)" valor={cfg.webhook_secret} />
                <details className="text-sm">
                    <summary className="cursor-pointer text-zinc-400">Datos para n8n (facturas de Alegra)</summary>
                    <div className="flex flex-col gap-3 mt-3">
                        <Copiable etiqueta="URL para enviar facturas (POST)" valor={`${cfg.backend_url}/api/rifa/integracion/facturas`} />
                        <Copiable etiqueta="Encabezado X-Integracion-Secret (no lo compartas)" valor={cfg.integracion_secret} />
                    </div>
                </details>
                <div className="flex gap-2 flex-wrap items-end">
                    <label className="flex-1 flex flex-col gap-1 text-xs text-zinc-400">flow_ns del flow (sale en la URL al editarlo: /cms/files/<b>content…</b>/edit)
                        <input value={flowNs} onChange={(e) => setFlowNs(e.target.value)} placeholder="content20261023120000_123456"
                            className="rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
                    </label>
                    <button type="button" onClick={guardarFlow} className="bg-zinc-700 hover:bg-zinc-600 text-sm font-bold px-4 py-2 rounded-full">Guardar</button>
                </div>
            </section>

            <section className={paso}>
                <h3 className="font-bold">2 · Prueba a tu número (obligatoria)</h3>
                <p className="text-sm text-zinc-400">Te llega el mensaje de un cliente real a tu WhatsApp de control. Tócalo hasta el final para comprobar que llegan las boletas y se registra la respuesta. No marca nada como enviado.</p>
                <div className="flex gap-3 items-center flex-wrap">
                    <button type="button" disabled={!cfg.flow_ns || ocupado} onClick={prueba}
                        className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar prueba a mi WhatsApp</button>
                    <span className={`text-sm ${pruebaOk ? 'text-emerald-300' : 'text-zinc-400'}`}>
                        {pruebaOk ? '✅ Prueba completada: las boletas llegaron.' : pruebas.length ? 'Prueba enviada; falta tocar “Ver mis boletas”.' : 'Aún sin prueba.'}
                    </span>
                    <button type="button" onClick={cargar} className="text-xs underline text-zinc-400">Actualizar</button>
                </div>
            </section>

            <section className={paso}>
                <h3 className="font-bold">3 · Enviar a los clientes</h3>
                <p className="text-sm text-zinc-300">
                    <b className="text-white">{r.clientes_listos}</b> clientes listos ({r.boletas_listas} boletas aprobadas).{' '}
                    {r.clientes_sin_aprobar > 0 && <span className="text-amber-300">{r.clientes_sin_aprobar} clientes con boletas sin aprobar no se enviarán. </span>}
                    Antes de cada envío se verifica de nuevo que no haya cancelado la suscripción.
                </p>
                <div className="flex gap-3 flex-wrap">
                    <button type="button" disabled={!pruebaOk || ocupado || auto || !r.clientes_listos} onClick={tanda}
                        className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar a los siguientes 10</button>
                    {!auto ? (
                        <button type="button" disabled={!pruebaOk || ocupado || !r.clientes_listos} onClick={() => setAuto(true)}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar a todos ({r.clientes_listos})</button>
                    ) : (
                        <button type="button" onClick={() => setAuto(false)} className="bg-red-500 text-white font-bold px-5 py-2 rounded-full">⏸ Detener envío</button>
                    )}
                </div>
                {conteo('fallido').clientes > 0 && (
                    <div className="flex items-center gap-3 flex-wrap text-sm text-red-300">
                        ✗ {conteo('fallido').clientes} clientes con envío fallido (ver bitácora).
                        <button type="button" disabled={ocupado || auto} onClick={async () => {
                            const x = await rifaEnvioReintentarFallidos(token);
                            setAviso(x?.success ? { tipo: 'ok', texto: `${x.clientes} clientes devueltos a la cola. Usa "Enviar a los siguientes 10".` } : { tipo: 'error', texto: x?.error || 'No se pudo' });
                            cargar();
                        }} className="underline">Reintentar fallidos</button>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                    {[['enviado', 'Enviados'], ['entregado', 'Boletas entregadas'], ['confirmado', 'Confirmaron datos'], ['error_datos', 'Reportaron error']].map(([k, et]) => (
                        <div key={k} className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">{conteo(k).clientes}</div><div className="text-zinc-400 text-xs">{et}</div></div>
                    ))}
                </div>
            </section>

            <Recordatorio token={token} />

            <section className={paso}>
                <div className="flex justify-between items-center gap-3 flex-wrap">
                    <h3 className="font-bold">Bitácora de envíos ({reales.length})</h3>
                    <button type="button" onClick={exportar} className="bg-zinc-800 hover:bg-zinc-700 text-sm font-bold px-4 py-2 rounded-full">⬇ Descargar bitácora</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-zinc-400 text-left"><tr>
                            <th className="py-2 pr-3">Cliente</th><th className="py-2 pr-3">Boletas</th><th className="py-2 pr-3">Estado</th>
                            <th className="py-2 pr-3">Enviado</th><th className="py-2 pr-3">Entregado</th><th className="py-2 pr-3">Respuesta</th></tr></thead>
                        <tbody>
                            {r.envios.map((e) => {
                                const [txt, color] = ESTADOS_ENVIO[e.estado] || [e.estado, 'text-zinc-300'];
                                const f = (d) => (d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—');
                                return (
                                    <tr key={e.id} className="border-t border-zinc-800 align-top">
                                        <td className="py-2 pr-3">{e.es_prueba && <span className="text-sky-300 text-xs">[PRUEBA] </span>}{e.tipo === 'recordatorio' && <span className="text-amber-300 text-xs">[RECORDATORIO] </span>}{e.nombre}<div className="text-xs text-zinc-500">{e.celular}</div></td>
                                        <td className="py-2 pr-3 whitespace-nowrap">{e.numeros.map((n) => `#${String(n).padStart(3, '0')}`).join(' ')}</td>
                                        <td className={`py-2 pr-3 ${color}`}>{txt}{e.detalle && <div className="text-xs text-zinc-500 max-w-xs break-words">{e.detalle}</div>}
                                            {e.estado === 'fallido' && !e.es_prueba && (
                                                <IdManychat token={token} cedula={e.cedula} onListo={(x) => {
                                                    setAviso({ tipo: 'ok', texto: `ID guardado: ${x.boletas_en_cola} boletas de ${e.nombre} volvieron a la cola. Usa "Enviar a los siguientes 10".` });
                                                    cargar();
                                                }} />
                                            )}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">{f(e.enviado_en)}</td>
                                        <td className="py-2 pr-3 whitespace-nowrap">{f(e.entregado_en)}</td>
                                        <td className="py-2 pr-3 whitespace-nowrap">{e.respuesta === 'ok' ? '✅ Correctos' : e.respuesta === 'error' ? '❌ Error' : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

const fmtCorte = (iso) => new Date(iso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

// Cortes horarios: las boletas que llegan solas desde Alegra se aprueban por
// corte (L-S cada hora 9:00-21:00; domingos y festivos 10:00-19:00).
function Cortes({ token, verificado, onAmpliar }) {
    const [cortes, setCortes] = useState(null);
    const [actual, setActual] = useState(null);
    const [boletas, setBoletas] = useState([]);
    const [imagenes, setImagenes] = useState({});
    const [decisiones, setDecisiones] = useState({});
    const [aviso, setAviso] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const cargarCortes = useCallback(async () => {
        const r = await rifaCortes(token);
        if (r?.success) setCortes(r.cortes);
        return r;
    }, [token]);

    useEffect(() => {
        rifaCortes(token).then((r) => {
            if (!r?.success) { setAviso({ tipo: 'error', texto: r?.error || 'No se pudieron cargar los cortes' }); return; }
            setCortes(r.cortes);
            const pendiente = [...r.cortes].reverse().find((c) => c.cerrado && c.aprobadas + c.rechazadas < c.total);
            if (pendiente) setActual(pendiente.corte);
        });
    }, [token]);

    useEffect(() => {
        if (!actual) return;
        let vivo = true;
        rifaCorte(token, actual).then((r) => {
            if (!vivo || !r?.success) return;
            setBoletas(r.boletas);
            setDecisiones(Object.fromEntries(r.boletas.map((b) => [b.numero, {
                estado: b.revision_estado === 'rechazada' ? 'rechazada' : 'aprobada', nota: b.revision_nota || '',
            }])));
            r.boletas.forEach((b) => rifaImagen(token, b.numero)
                .then((img) => vivo && setImagenes((p) => ({ ...p, [b.numero]: img })))
                .catch(() => vivo && setImagenes((p) => ({ ...p, [b.numero]: { url: '', sha256: 'error' } }))));
        });
        return () => { vivo = false; };
    }, [token, actual]);

    function abrir(iso) { setBoletas([]); setImagenes({}); setAviso(null); setActual(iso); }

    async function cambiarCanal(numero, canal, motivo) {
        const r = await rifaCambiarCanal(token, numero, canal, motivo);
        if (!r?.success) { setAviso({ tipo: 'error', texto: r?.error || 'No se pudo cambiar el canal' }); return; }
        const x = await rifaCorte(token, actual);
        if (x?.success) setBoletas(x.boletas);
    }

    async function guardar() {
        setGuardando(true);
        const lista = boletas.map((b) => ({ numero: b.numero, ...decisiones[b.numero] }));
        const r = await rifaRevisarCorte(token, actual, lista);
        setGuardando(false);
        if (!r?.success) { setAviso({ tipo: 'error', texto: r?.error || 'No se pudo guardar' }); return; }
        setAviso({ tipo: 'ok', texto: `Corte ${fmtCorte(actual)} guardado. Las aprobadas ya pueden enviarse desde la pestaña Envío.` });
        const c = await cargarCortes();
        const sig = c?.cortes && [...c.cortes].reverse().find((k) => k.cerrado && k.aprobadas + k.rechazadas < k.total && k.corte !== actual);
        if (sig) abrir(sig.corte);
    }

    if (!cortes) return <p className="text-zinc-400">{aviso?.texto || 'Cargando cortes…'}</p>;
    if (!cortes.length) return <p className="text-zinc-400">Aún no han llegado boletas automáticas desde Alegra. Cuando lleguen, aparecerán aquí agrupadas por corte horario.</p>;

    const cargadas = boletas.length > 0 && boletas.every((b) => imagenes[b.numero]);
    const integras = boletas.every((b) => imagenes[b.numero]?.sha256 === b.imagen_sha256);
    const faltaNota = Object.values(decisiones).some((d) => d.estado === 'rechazada' && !d.nota.trim());
    const hayAprob = Object.values(decisiones).some((d) => d.estado === 'aprobada');

    return (
        <div className="flex flex-col gap-5">
            <div className="flex gap-2 flex-wrap">
                {cortes.map((c) => {
                    const listo = c.aprobadas + c.rechazadas === c.total;
                    const color = !c.cerrado ? 'bg-zinc-900 text-zinc-500 border border-dashed border-zinc-700'
                        : c.rechazadas ? 'bg-red-500 text-white' : listo ? 'bg-emerald-500 text-zinc-950' : 'bg-amber-400 text-zinc-950';
                    return (
                        <button key={c.corte} type="button" onClick={() => abrir(c.corte)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold ${color} ${c.corte === actual ? 'ring-2 ring-white' : ''}`}>
                            {fmtCorte(c.corte)} · {c.total}{!c.cerrado && ' (abierto)'}
                        </button>
                    );
                })}
            </div>
            {aviso && <p className={`rounded-xl px-4 py-3 text-sm ${aviso.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>{aviso.texto}</p>}
            {actual && boletas.length > 0 && (
                <>
                    <h2 className="text-lg font-bold">Corte {fmtCorte(actual)} · {boletas.length} boletas</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {boletas.map((b) => (
                            <TarjetaBoleta key={b.numero} b={b} imagen={imagenes[b.numero]} decision={decisiones[b.numero] || { estado: 'aprobada', nota: '' }}
                                onDecision={(n, d) => setDecisiones((p) => ({ ...p, [n]: d }))} onCanal={cambiarCanal} onAmpliar={onAmpliar} />
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-zinc-800 p-4">
                        <p className={`text-sm ${aviso ? (aviso.tipo === 'ok' ? 'text-emerald-300' : 'text-red-300') : 'text-zinc-300'}`}>
                            {aviso ? `${aviso.tipo === 'ok' ? '✓ ' : ''}${aviso.texto}` : !cargadas ? 'Cargando imágenes…' : !integras ? '✗ Hay imágenes que no coinciden con las generadas: no se puede aprobar.'
                                : faltaNota ? 'Escribe el motivo de cada boleta con error.' : !verificado && hayAprob ? 'Falta verificar la lista de cancelados.' : 'Revisa cada boleta y guarda el corte.'}
                        </p>
                        <button type="button" onClick={guardar} disabled={guardando || !cargadas || !integras || faltaNota || (!verificado && hayAprob)}
                            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold px-6 py-3 rounded-full">
                            {guardando ? 'Guardando…' : 'Guardar revisión del corte'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// Verificación en dos pasos obligatoria: si la cuenta no la tiene, se configura
// antes de dejar entrar.
function Configurar2FA({ token, onListo, onSalir }) {
    const [qr, setQr] = useState(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        cuenta2faSetup(token).then((r) => (r?.success ? setQr(r) : setError(r?.error || 'No se pudo generar el código QR')));
    }, [token]);

    async function confirmar(e) {
        e.preventDefault();
        const r = await cuenta2faConfirmar(token, code);
        if (r?.success) onListo(); else setError(r?.error || 'Código incorrecto');
    }

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-10">
            <form onSubmit={confirmar} className="w-full max-w-sm flex flex-col gap-4 text-center">
                <h1 className="font-display text-white text-4xl">Activa la verificación en dos pasos</h1>
                <p className="text-zinc-400 text-sm">Es obligatoria para todas las cuentas. Escanea el código con Google Authenticator (o Microsoft Authenticator) y escribe el código de 6 dígitos que aparece.</p>
                {qr && <img src={qr.qrDataUrl} alt="Código QR de verificación" className="mx-auto w-56 h-56 rounded-xl bg-white p-2" />}
                {qr && <p className="text-xs text-zinc-500 break-all">Si no puedes escanear, escribe esta clave en la app: <code className="text-zinc-300">{qr.clave}</code></p>}
                <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white text-center text-2xl tracking-widest" required />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button disabled={code.length !== 6} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-full">Activar y continuar</button>
                <button type="button" onClick={onSalir} className="text-xs text-zinc-400 underline">Cerrar sesión</button>
            </form>
        </main>
    );
}

function CambiarPassword({ token, onCerrar, onCambiada }) {
    const [actual, setActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [repetir, setRepetir] = useState('');
    const [error, setError] = useState('');

    async function guardar(e) {
        e.preventDefault();
        if (nueva !== repetir) { setError('Las contraseñas nuevas no coinciden.'); return; }
        const r = await cuentaCambiarPassword(token, actual, nueva);
        if (r?.success) onCambiada(); else setError(r?.error || 'No se pudo cambiar');
    }

    const campo = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white';
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <form onSubmit={guardar} className="w-full max-w-sm flex flex-col gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-6">
                <h2 className="text-xl font-bold">Cambiar contraseña</h2>
                <p className="text-xs text-zinc-400">Mínimo 12 caracteres, con letras y números. Se cerrarán todas tus sesiones abiertas.</p>
                <input className={campo} type="password" placeholder="Contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" required />
                <input className={campo} type="password" placeholder="Contraseña nueva" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" required />
                <input className={campo} type="password" placeholder="Repite la contraseña nueva" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" required />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 text-sm text-zinc-400">Cancelar</button>
                    <button className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-5 py-2 rounded-full">Guardar</button>
                </div>
            </form>
        </div>
    );
}

// Envío de boletas por CORREO a quienes no reciben por WhatsApp y tienen correo.
function Correo({ token }) {
    const [r, setR] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const [auto, setAuto] = useState(false);
    const [aviso, setAviso] = useState(null);

    const cargar = useCallback(async () => {
        const x = await rifaCorreoResumen(token);
        if (x?.success) setR(x); else setAviso({ tipo: 'error', texto: x?.error || 'No se pudo cargar' });
        return x;
    }, [token]);

    useEffect(() => {
        rifaCorreoResumen(token).then((x) => (x?.success ? setR(x) : setAviso({ tipo: 'error', texto: x?.error || 'No se pudo cargar' })));
    }, [token]);

    useEffect(() => {
        if (!auto) return;
        let vivo = true;
        (async () => {
            while (vivo) {
                const x = await rifaCorreoLote(token, 10);
                if (!x?.success) { setAviso({ tipo: 'error', texto: x?.error || 'Error enviando' }); break; }
                const res = await cargar();
                if (!x.resultados.length || !res?.clientes_listos) { setAviso({ tipo: 'ok', texto: 'Envío por correo terminado.' }); break; }
                if (!x.resultados.some((y) => y.estado === 'enviado')) { setAviso({ tipo: 'error', texto: 'Envío detenido: ningún correo salió en la última tanda. Revisa la bitácora.' }); break; }
            }
            if (vivo) setAuto(false);
        })();
        return () => { vivo = false; };
    }, [auto, token, cargar]);

    if (!r) return <p className="text-zinc-400">{aviso?.texto || 'Cargando…'}</p>;
    const est = (k) => r.por_estado.find((e) => e.correo_estado === k) || { clientes: 0, boletas: 0 };
    const pruebas = r.envios.filter((e) => e.es_prueba);
    const reales = r.envios.filter((e) => !e.es_prueba);
    const f = (d) => (d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—');

    async function prueba() {
        setOcupado(true);
        const x = await rifaCorreoPrueba(token);
        setOcupado(false);
        setAviso(x?.success ? { tipo: 'ok', texto: `Prueba enviada a ${r.correo_prueba} con las boletas de ${x.resultado.nombre}. Revisa que lleguen los adjuntos y prueba un botón.` }
            : { tipo: 'error', texto: `La prueba falló: ${x?.error || x?.resultado?.detalle || 'error'}` });
        cargar();
    }
    function exportar() {
        const filas = [['Cliente', 'Cédula', 'Correo', 'Boletas', 'Estado', 'Detalle', 'Enviado', 'Respuesta', 'Respondió']];
        for (const e of reales) {
            filas.push([e.nombre, e.cedula, e.correo, e.numeros.map((n) => String(n).padStart(3, '0')).join(' '), e.estado, e.detalle, f(e.enviado_en),
                e.respuesta === 'ok' ? 'Confirmó datos' : e.respuesta === 'error' ? 'Reportó error' : '', f(e.respondido_en)]);
        }
        descargarCsv(`rifa_envios_correo_${new Date().toISOString().slice(0, 10)}.csv`, filas);
    }

    const paso = 'rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-3';
    return (
        <div className="flex flex-col gap-5">
            {aviso && <p className={`rounded-xl px-4 py-3 text-sm ${aviso.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>{aviso.texto}</p>}

            <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-sm">
                {[[r.clientes_con_correo, 'Clientes con correo'], [est('enviado').clientes + est('confirmado').clientes + est('error_datos').clientes, 'Correos enviados'],
                  [est('confirmado').clientes, 'Confirmaron datos'], [est('error_datos').clientes, 'Reportaron error'], [est('fallido').clientes, 'Fallidos']].map(([v, t]) => (
                    <div key={t} className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">{v}</div><div className="text-zinc-400 text-xs">{t}</div></div>
                ))}
            </section>
            <p className="text-xs text-zinc-500">{r.sin_correo.clientes} clientes ({r.sin_correo.boletas} boletas) no tienen ni celular ni correo: hay que entregarles la boleta en la sede.</p>

            <section className={paso}>
                <h3 className="font-bold">1 · Prueba a {r.correo_prueba} (obligatoria)</h3>
                <div className="flex gap-3 items-center flex-wrap">
                    <button type="button" disabled={ocupado} onClick={prueba} className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar prueba</button>
                    <span className={`text-sm ${r.prueba_ok ? 'text-emerald-300' : 'text-zinc-400'}`}>
                        {r.prueba_ok ? '✅ Prueba confirmada: el correo llegó y se tocó un botón.'
                            : r.prueba_pendiente ? `📨 Prueba enviada. Ábrela en ${r.correo_prueba} y toca uno de sus botones para confirmar que llegó; luego toca "Actualizar".`
                            : pruebas.length ? `✗ Última prueba falló: ${pruebas[0].detalle}` : 'Aún sin prueba.'}
                    </span>
                    <button type="button" onClick={cargar} className="text-xs underline text-zinc-400">Actualizar</button>
                    <span className="hidden">
                    </span>
                </div>
            </section>

            <section className={paso}>
                <h3 className="font-bold">2 · Enviar a los clientes</h3>
                <p className="text-sm text-zinc-300"><b className="text-white">{r.clientes_listos}</b> clientes listos ({r.boletas_listas} boletas). Cada uno recibe un correo con sus boletas adjuntas y copia oculta a comercial@.</p>
                <div className="flex gap-3 flex-wrap">
                    {!auto ? (
                        <button type="button" disabled={!r.prueba_ok || ocupado || !r.clientes_listos} onClick={() => setAuto(true)}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar a todos ({r.clientes_listos})</button>
                    ) : (
                        <button type="button" onClick={() => setAuto(false)} className="bg-red-500 text-white font-bold px-5 py-2 rounded-full">⏸ Detener</button>
                    )}
                    {est('fallido').clientes > 0 && (
                        <button type="button" disabled={auto} onClick={async () => { await rifaCorreoReintentar(token); cargar(); }} className="text-sm underline text-red-300">Reintentar fallidos ({est('fallido').clientes})</button>
                    )}
                </div>
            </section>

            <section className={paso}>
                <div className="flex justify-between items-center gap-3 flex-wrap">
                    <h3 className="font-bold">Bitácora de correos ({reales.length})</h3>
                    <button type="button" onClick={exportar} className="bg-zinc-800 hover:bg-zinc-700 text-sm font-bold px-4 py-2 rounded-full">⬇ Descargar</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-zinc-400 text-left"><tr>
                            <th className="py-2 pr-3">Cliente</th><th className="py-2 pr-3">Boletas</th><th className="py-2 pr-3">Estado</th>
                            <th className="py-2 pr-3">Enviado</th><th className="py-2 pr-3">Respuesta</th></tr></thead>
                        <tbody>
                            {r.envios.map((e) => (
                                <tr key={e.id} className="border-t border-zinc-800 align-top">
                                    <td className="py-2 pr-3">{e.es_prueba && <span className="text-sky-300 text-xs">[PRUEBA] </span>}{e.nombre}<div className="text-xs text-zinc-500 break-all">{e.correo}</div></td>
                                    <td className="py-2 pr-3 whitespace-nowrap">{e.numeros.map((n) => `#${String(n).padStart(3, '0')}`).join(' ')}</td>
                                    <td className={`py-2 pr-3 ${e.estado === 'enviado' ? 'text-emerald-300' : e.estado === 'fallido' ? 'text-red-300' : 'text-zinc-300'}`}>
                                        {e.estado === 'enviado' ? '📧 Enviado' : e.estado === 'fallido' ? '✗ Falló' : e.estado}
                                        {e.estado === 'fallido' && e.detalle && <div className="text-xs text-zinc-500 max-w-xs break-words">{e.detalle}</div>}
                                    </td>
                                    <td className="py-2 pr-3 whitespace-nowrap">{f(e.enviado_en)}</td>
                                    <td className="py-2 pr-3 whitespace-nowrap">{e.respuesta === 'ok' ? '✅ Correctos' : e.respuesta === 'error' ? '❌ Error' : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

// Recordatorio (una vez, 48 h después) a quienes recibieron el WhatsApp pero
// no tocaron "Ver mis boletas". Prueba obligatoria en el número de control.
function Recordatorio({ token }) {
    const [r, setR] = useState(null);
    const [flow, setFlow] = useState('');
    const [ocupado, setOcupado] = useState(false);
    const [auto, setAuto] = useState(false);
    const [aviso, setAviso] = useState(null);

    const cargar = useCallback(async () => {
        const x = await rifaRecordatorioResumen(token);
        if (x?.success) setR(x);
        return x;
    }, [token]);

    useEffect(() => {
        rifaRecordatorioResumen(token).then((x) => { if (x?.success) { setR(x); setFlow(x.flow_ns_recordatorio || ''); } });
    }, [token]);

    useEffect(() => {
        if (!auto) return;
        let vivo = true;
        (async () => {
            while (vivo) {
                const x = await rifaRecordatorioLote(token, 10);
                if (!x?.success) { setAviso({ tipo: 'error', texto: x?.error || 'Error enviando' }); break; }
                const res = await cargar();
                if (!x.resultados.length || !res?.listos) { setAviso({ tipo: 'ok', texto: 'Recordatorios enviados.' }); break; }
                if (!x.resultados.some((y) => y.estado === 'enviado')) { setAviso({ tipo: 'error', texto: 'Detenido: ningún recordatorio salió en la última tanda.' }); break; }
            }
            if (vivo) setAuto(false);
        })();
        return () => { vivo = false; };
    }, [auto, token, cargar]);

    if (!r) return null;
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-3">
            <h3 className="font-bold">🔔 Recordatorio a quienes no han abierto sus boletas</h3>
            <p className="text-sm text-zinc-300">
                <b className="text-white">{r.listos}</b> clientes listos para recordatorio (recibieron el mensaje hace {r.horas} h o más y no tocaron “Ver mis boletas”).
                {r.aun_no_cumplen_48h > 0 && <> {r.aun_no_cumplen_48h} más aún no cumplen {r.horas} h.</>}
                {' '}Ya enviados: {r.enviados}{r.abrieron_despues ? ` · ${r.abrieron_despues} los abrieron después del recordatorio` : ''}{r.fallidos ? ` · ${r.fallidos} fallidos` : ''}. Máximo un recordatorio por cliente.
            </p>
            {aviso && <p className={`rounded-xl px-4 py-3 text-sm ${aviso.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/15 text-red-200'}`}>{aviso.texto}</p>}
            <div className="flex gap-2 flex-wrap items-end">
                <label className="flex-1 flex flex-col gap-1 text-xs text-zinc-400">flow_ns del flow de recordatorio (vacío = usa el mismo flow de entrega)
                    <input value={flow} onChange={(e) => setFlow(e.target.value)} placeholder={r.flow_ns_principal || 'content…'}
                        className="rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
                </label>
                <button type="button" onClick={async () => { const x = await rifaRecordatorioConfig(token, flow.trim()); setAviso(x?.success ? { tipo: 'ok', texto: 'Guardado.' } : { tipo: 'error', texto: x?.error || 'No se pudo' }); cargar(); }}
                    className="bg-zinc-700 hover:bg-zinc-600 text-sm font-bold px-4 py-2 rounded-full">Guardar</button>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
                <button type="button" disabled={ocupado || auto} onClick={async () => {
                    setOcupado(true);
                    const x = await rifaRecordatorioPrueba(token);
                    setOcupado(false);
                    setAviso(x?.success ? { tipo: 'ok', texto: `Prueba enviada a tu WhatsApp (${x.enviado_a}). Toca “Ver mis boletas” y luego “Actualizar”.` } : { tipo: 'error', texto: x?.error || 'La prueba falló' });
                    cargar();
                }} className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Prueba a mi WhatsApp</button>
                <span className={`text-sm ${r.prueba_ok ? 'text-emerald-300' : 'text-zinc-400'}`}>{r.prueba_ok ? '✅ Prueba completada' : 'Prueba pendiente'}</span>
                <button type="button" onClick={cargar} className="text-xs underline text-zinc-400">Actualizar</button>
                {!auto ? (
                    <button type="button" disabled={!r.prueba_ok || ocupado || !r.listos} onClick={() => setAuto(true)}
                        className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 rounded-full">Enviar recordatorio ({r.listos})</button>
                ) : (
                    <button type="button" onClick={() => setAuto(false)} className="bg-red-500 text-white font-bold px-5 py-2 rounded-full">⏸ Detener</button>
                )}
            </div>
        </section>
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
    const [vista, setVista] = useState('lotes');
    const [cuenta, setCuenta] = useState(null); // { totp_enabled, usuario, rol }
    const [cambiarPw, setCambiarPw] = useState(false);

    const salir = useCallback(() => {
        try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch { /* nada */ }
        setToken('');
    }, []);

    const manejar = useCallback((r) => {
        if (r?.requiere_2fa) setCuenta((c) => ({ ...(c || {}), totp_enabled: false }));
        else if (r && r.success === false && /autorizado|Sesión inválida|prohibido/i.test(r.error || '')) salir();
        return r;
    }, [salir]);

    useEffect(() => {
        if (!token) return;
        cuenta2faEstado(token).then((r) => {
            if (r?.success) setCuenta(r);
            else if (/autorizado|Sesión inválida/i.test(r?.error || '')) salir();
        });
    }, [token, salir]);

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
    if (cuenta && !cuenta.totp_enabled) {
        return <Configurar2FA token={token} onSalir={salir} onListo={() => { setCuenta({ ...cuenta, totp_enabled: true }); window.location.reload(); }} />;
    }

    const t = resumen?.totales;
    return (
        <main className="min-h-screen bg-zinc-950 text-white pb-32">
            <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
                <div className="max-w-6xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h1 className="font-display text-3xl">Revisión de boletas · iPhone 18 Pro</h1>
                        <div className="flex gap-4 items-center text-xs text-zinc-400">
                            {cuenta?.usuario && <span>👤 {cuenta.usuario}</span>}
                            <button type="button" onClick={() => setCambiarPw(true)} className="underline">Cambiar contraseña</button>
                            <button type="button" onClick={salir} className="underline">Cerrar sesión</button>
                        </div>
                    </div>
                    {t && (
                        <>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(t.aprobadas / t.total) * 100}%` }} />
                            </div>
                            <p className="text-xs text-zinc-400">
                                <b className="text-emerald-400">{t.aprobadas}</b> aprobadas · <b className="text-red-400">{t.rechazadas}</b> con error ·{' '}
                                {t.total - t.aprobadas - t.rechazadas} por revisar · de {t.total} boletas con WhatsApp
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <button type="button" onClick={() => setVista('lotes')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${vista === 'lotes' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                                    📲 Lotes WhatsApp ({t.total})</button>
                                <button type="button" onClick={() => setVista('pendientes')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${vista === 'pendientes' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                                    📵 Pendientes por enviar ({resumen.pendientes?.boletas ?? 0})</button>
                                <button type="button" onClick={() => setVista('correo')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${vista === 'correo' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                                    📧 Correo</button>
                                <button type="button" onClick={() => setVista('cortes')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${vista === 'cortes' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                                    🕐 Cortes (Alegra)</button>
                                <button type="button" onClick={() => setVista('envio')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold ${vista === 'envio' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                                    📤 Envío WhatsApp</button>
                            </div>
                            {vista === 'lotes' && <div className="flex gap-1.5 flex-wrap">
                                {resumen.lotes.map((l) => (
                                    <button key={l.lote} type="button" onClick={() => irALote(Number(l.lote))}
                                        className={`min-w-9 h-9 px-2 rounded-lg text-sm font-bold ${colorLote(l)} ${Number(l.lote) === loteActual ? 'ring-2 ring-white' : ''}`}
                                        title={`Boletas ${l.desde}–${l.hasta}`}>{l.lote}</button>
                                ))}
                            </div>}
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
                {vista === 'envio' && <Envio token={token} />}
                {vista === 'correo' && <Correo token={token} />}
                {vista === 'cortes' && <Cortes token={token} verificado={verificado} onAmpliar={setAmpliada} />}
                {vista === 'pendientes' && (
                    <Pendientes token={token} onVer={(n) => rifaImagen(token, n).then((img) => setAmpliada(img.url)).catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo abrir la imagen' }))} />
                )}
                {vista === 'lotes' && loteActual && boletas.length > 0 && (
                    <h2 className="text-lg font-bold">Lote {loteActual} · boletas {boletas[0].numero}–{boletas[boletas.length - 1].numero}</h2>
                )}
                {vista === 'lotes' && <div className="grid gap-5 sm:grid-cols-2">
                    {boletas.map((b) => (
                        <TarjetaBoleta key={b.numero} b={b} imagen={imagenes[b.numero]} decision={decisiones[b.numero] || { estado: 'aprobada', nota: '' }}
                            onDecision={(n, d) => setDecisiones((prev) => ({ ...prev, [n]: d }))} onCanal={cambiarCanal} onAmpliar={setAmpliada} />
                    ))}
                </div>}
            </div>

            {vista === 'lotes' && boletas.length > 0 && (
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

            {cambiarPw && (
                <CambiarPassword token={token} onCerrar={() => setCambiarPw(false)}
                    onCambiada={() => { setCambiarPw(false); salir(); }} />
            )}
            {ampliada && (
                <button type="button" onClick={() => setAmpliada(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <img src={ampliada} alt="Boleta ampliada" className="max-w-full max-h-full object-contain" />
                </button>
            )}
        </main>
    );
}
