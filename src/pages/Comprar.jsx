import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PLANES, MONTO_PERSONALIZADO_MIN, MONTO_PERSONALIZADO_MAX, MULTIPLO_PERSONALIZADO, CUPO_VALOR_PERSONALIZADO, calcularCupos, calcularSaldoBono, formatoPesos } from '../config/planes';
import { obtenerPartidos, crearLinkPago, crearTransferencia } from '../api';
import CountdownPartido from '../components/CountdownPartido';
import Footer from '../components/Footer';
import Bandera from '../components/Bandera';
import { partidosFuturos } from '../utils/partidos';
import { obtenerSesion } from '../utils/sesion';
import { guardarDatosComprador, obtenerDatosComprador } from '../utils/datosComprador';
import TrustBadges from '../components/TrustBadges';
import CuposRestantes from '../components/CuposRestantes';

const REF_STORAGE_KEY = 'polla_ref_token';
const AFF_STORAGE_KEY = 'polla_aff_token';
const PLAN_DEFAULT = 10000;
const VALOR_OTRO = 'otro';

// Carga el script del Widget Checkout de Wompi una sola vez (a diferencia de
// los Payment Links, este sí pre-llena nombre/correo/celular del comprador).
function cargarWidgetWompi() {
    return new Promise((resolve, reject) => {
        if (window.WidgetCheckout) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar el widget de pago'));
        document.body.appendChild(script);
    });
}

const CUENTA_TRANSFERENCIA = {
    banco: 'Bancolombia',
    tipo: 'Ahorros',
    numero: '44200008248',
    titular: 'La Retoucherie de Manuela',
    nit: '901765354',
};

export default function Comprar() {
    const [searchParams] = useSearchParams();

    const planDesdeUrl = Number(searchParams.get('plan'));
    const planUrlValido = PLANES.some((p) => p.valor === planDesdeUrl) ? planDesdeUrl : null;
    const partidoDesdeUrl = Number(searchParams.get('partido')) || null;

    const [selectValor, setSelectValor] = useState(() =>
        String(planUrlValido ?? PLAN_DEFAULT)
    );
    const [montoCustom, setMontoCustom] = useState('');
    const [mostrarTransferencia, setMostrarTransferencia] = useState(false);
    const [comprobante, setComprobante] = useState(null);

    const [partidos, setPartidos] = useState([]);
    const [partidoId, setPartidoId] = useState(null);

    const [form, setForm] = useState(() => {
        const guardados = obtenerDatosComprador();
        const sesion = obtenerSesion();
        return {
            nombre: sesion?.nombre || guardados.nombre || '',
            correo: guardados.correo || '',
            celular: sesion?.celular || guardados.celular || '',
        };
    });

    const [enviado, setEnviado] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const enviandoRef = useRef(false);

    const esOtroMonto = selectValor === VALOR_OTRO;
    const montoCustomNumero = Number(montoCustom) || 0;
    const valorAPagar = esOtroMonto ? montoCustomNumero : Number(selectValor);
    const planInfo = PLANES.find((p) => p.valor === valorAPagar) ?? null;
    const cuposCustom = calcularCupos(montoCustomNumero);
    const saldoBonoCustom = calcularSaldoBono(montoCustomNumero);
    const residuoCustom = montoCustomNumero % CUPO_VALOR_PERSONALIZADO;

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const lista = partidosFuturos(data.partidos, 10);
                    setPartidos(lista);
                    const coincide = partidoDesdeUrl && lista.some((p) => p.id === partidoDesdeUrl);
                    setPartidoId(coincide ? partidoDesdeUrl : (lista[0]?.id ?? null));
                }
            })
            .catch(() => setError('No se pudo cargar la información del partido.'));
    }, []);

    const partidoSeleccionado = partidos.find((p) => p.id === partidoId) ?? null;

    function handleChange(e) {
        const nuevoForm = { ...form, [e.target.name]: e.target.value };
        setForm(nuevoForm);
        guardarDatosComprador(nuevoForm);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        let widgetAbierto = false;

        // Guarda sincrónico (no depende del re-render de `disabled`) para que un
        // doble clic/doble tap no dispare dos veces la creación del link de pago.
        if (enviandoRef.current) return;

        if (!form.nombre.trim()) {
            setError('Ingresa tu nombre completo.');
            return;
        }
        if (!form.correo.trim()) {
            setError('Ingresa tu correo electrónico.');
            return;
        }
        if (!form.celular.trim()) {
            setError('Ingresa tu número de celular.');
            return;
        }
        if (!aceptaTerminos) {
            setError('Debes aceptar los Términos y Condiciones para continuar.');
            return;
        }
        if (!partidoId) {
            setError('No hay partidos disponibles en este momento.');
            return;
        }
        if (esOtroMonto) {
            if (
                !Number.isInteger(montoCustomNumero) ||
                montoCustomNumero < MONTO_PERSONALIZADO_MIN ||
                montoCustomNumero > MONTO_PERSONALIZADO_MAX
            ) {
                setError(`Ingresa un monto entre ${formatoPesos(MONTO_PERSONALIZADO_MIN)} y ${formatoPesos(MONTO_PERSONALIZADO_MAX)}.`);
                return;
            }
            if (montoCustomNumero % MULTIPLO_PERSONALIZADO !== 0) {
                setError(`El monto debe ser un múltiplo exacto de ${formatoPesos(MULTIPLO_PERSONALIZADO)}.`);
                return;
            }
        }

        const ref = localStorage.getItem(REF_STORAGE_KEY) || '';
        const affToken = localStorage.getItem(AFF_STORAGE_KEY) || '';

        enviandoRef.current = true;
        setCargando(true);
        try {
            if (mostrarTransferencia) {
                if (!comprobante) {
                    setError('Adjunta la foto o captura del comprobante de la transferencia.');
                    setCargando(false);
                    return;
                }
                const data = await crearTransferencia({
                    nombre: form.nombre.trim(),
                    correo: form.correo.trim(),
                    celular: form.celular.trim(),
                    partido_id: partidoId,
                    valor: valorAPagar,
                    comprobante,
                    ref,
                    aff_token: affToken,
                });
                if (data?.success) {
                    setMensajeExito(data.mensaje || 'Tu comprobante fue recibido. Te avisaremos cuando se confirme el pago.');
                    setEnviado(true);
                } else {
                    setError(data?.error || 'No se pudo registrar la transferencia.');
                }
                return;
            }

            const data = await crearLinkPago({
                nombre: form.nombre.trim(),
                correo: form.correo.trim(),
                celular: form.celular.trim(),
                partido_id: partidoId,
                valor: valorAPagar,
                ref,
                aff_token: affToken,
            });

            if (data?.success && data.widget) {
                await cargarWidgetWompi();
                const checkout = new window.WidgetCheckout(data.widget);
                widgetAbierto = true;
                checkout.open((result) => {
                    enviandoRef.current = false;
                    setCargando(false);
                    if (result?.transaction?.id) {
                        window.location.href = data.widget.redirectUrl;
                    } else {
                        setError('No completaste el pago. Puedes intentarlo de nuevo cuando quieras.');
                    }
                });
            } else {
                setError(data?.error || 'No se pudo iniciar el pago.');
            }
        } catch {
            setError('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            if (!widgetAbierto) {
                enviandoRef.current = false;
                setCargando(false);
            }
        }
    }

    if (enviado) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                    <div className="flex-1 bg-colombia-yellow" />
                    <div className="flex-1 bg-colombia-blue" />
                    <div className="flex-1 bg-colombia-red" />
                </div>
                <div className="w-full max-w-md mt-12 flex flex-col items-center text-center">
                    <span className="text-6xl block mb-4">🎉</span>
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">¡Comprobante recibido!</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{mensajeExito}</p>

                    {/* CTA registro */}
                    <div className="w-full rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 p-6 mb-4 text-left">
                        <p className="text-2xl mb-2">🏆</p>
                        <p className="text-zinc-900 dark:text-white font-extrabold text-lg mb-2">¡Un paso más para ganar!</p>
                        <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">Regístrate para poder:</p>
                        <ul className="flex flex-col gap-2 mb-5">
                            <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-amber-500 font-bold mt-0.5">✓</span>
                                Ver resultados de partidos de Colombia en tiempo real
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-amber-500 font-bold mt-0.5">✓</span>
                                Ingresar tu pronóstico antes de cada partido
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-amber-500 font-bold mt-0.5">✓</span>
                                Saber si ganaste un premio y cómo reclamarlo
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-amber-500 font-bold mt-0.5">✓</span>
                                Recibir notificaciones por WhatsApp de tus partidos
                            </li>
                        </ul>
                        <Link
                            to="/registro"
                            className="block w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform"
                        >
                            Registrarme ahora — ¡es gratis!
                        </Link>
                    </div>

                    <Link
                        to="/iniciar-sesion"
                        className="block w-full py-3 rounded-xl font-bold text-sm text-zinc-900 dark:text-white text-center border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 mb-3"
                    >
                        Ya tengo cuenta — Iniciar sesión
                    </Link>
                    <Link to="/" className="text-xs text-zinc-400 underline">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6 pb-6">
                <Link to="/" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">Compra tu Bono Digital</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Tu bono tiene <span className="font-bold text-zinc-700 dark:text-zinc-300">doble beneficio</span>: crédito real en servicios de La Retoucherie <span className="font-bold text-amber-500">+</span> cupos para participar en la Polla Mundialista y ganar premios.
                </p>

                <div className="mb-4">
                    <CuposRestantes />
                </div>

                {/* ── Selector de plan ── */}
                <div className="mb-3">
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Selecciona tu plan
                    </label>
                    <div className="relative">
                        <select
                            value={selectValor}
                            onChange={(e) => {
                                setSelectValor(e.target.value);
                                setMontoCustom('');
                            }}
                            className="w-full appearance-none rounded-xl border-2 border-amber-400 bg-white dark:bg-slate-900 px-4 py-3.5 pr-10 text-zinc-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                        >
                            {PLANES.map((plan) => (
                                <option key={plan.valor} value={String(plan.valor)}>
                                    {formatoPesos(plan.valor)} — Bono {formatoPesos(plan.saldoBono)} en servicios · {plan.etiqueta}
                                    {plan.destacado === 'popular' ? ' ⭐' : plan.destacado === 'premium' ? ' 🏆' : ''}
                                </option>
                            ))}
                            <option value={VALOR_OTRO}>Otro monto personalizado...</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 text-lg">▾</span>
                    </div>
                </div>

                {/* Info del plan seleccionado */}
                {!esOtroMonto && planInfo && (
                    <div className="mb-6 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-zinc-900 dark:text-white font-black text-lg">{formatoPesos(planInfo.valor)}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                Bono de <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatoPesos(planInfo.saldoBono)}</span> en servicios
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-amber-500 font-black text-2xl leading-none">{planInfo.intentos}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">
                                {planInfo.intentos === 1 ? 'cupo' : 'cupos'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Input monto personalizado */}
                {esOtroMonto && (
                    <div className="mb-6">
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">
                            Ingresa el monto (múltiplos de {formatoPesos(MULTIPLO_PERSONALIZADO)})
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={MONTO_PERSONALIZADO_MIN}
                            max={MONTO_PERSONALIZADO_MAX}
                            step={MULTIPLO_PERSONALIZADO}
                            value={montoCustom}
                            onChange={(e) => setMontoCustom(e.target.value)}
                            placeholder={`Entre ${formatoPesos(MONTO_PERSONALIZADO_MIN)} y ${formatoPesos(MONTO_PERSONALIZADO_MAX)}`}
                            className="w-full rounded-xl border-2 border-amber-400 bg-white dark:bg-slate-900 px-4 py-3.5 text-zinc-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        {montoCustomNumero >= MONTO_PERSONALIZADO_MIN && (
                            <div className="mt-2 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-zinc-900 dark:text-white font-black text-lg">{formatoPesos(montoCustomNumero)}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                        Bono de <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatoPesos(saldoBonoCustom)}</span> en servicios
                                        {residuoCustom > 0 && <span> · Saldo sin cupo: {formatoPesos(residuoCustom)}</span>}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-amber-500 font-black text-2xl leading-none">{cuposCustom}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">
                                        {cuposCustom === 1 ? 'cupo' : 'cupos'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Formulario */}
                <form id="comprar-form" onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Trust badges */}
                    {!mostrarTransferencia && (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                            <TrustBadges />
                        </div>
                    )}

                    {/* 2. Datos del cliente */}
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-2">Ingresa tus datos</p>

                    <div>
                        <label htmlFor="comprar-nombre" className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                        <input
                            id="comprar-nombre"
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Manuela Pérez"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="comprar-correo" className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Correo electrónico</label>
                        <input
                            id="comprar-correo"
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="tucorreo@email.com"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="comprar-celular" className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Celular (WhatsApp)</label>
                        <input
                            id="comprar-celular"
                            type="tel"
                            name="celular"
                            value={form.celular}
                            onChange={handleChange}
                            placeholder="3001234567"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <label className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <input
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                            className="mt-0.5 accent-amber-400"
                        />
                        <span>
                            Acepto los{' '}
                            <Link to="/terminos" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link>{' '}
                            y la{' '}
                            <Link to="/privacidad" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Política de Privacidad</Link>.
                        </span>
                    </label>

                    {/* 3. Partido: si se llegó con un partido ya elegido (desde el Hero), se
                        muestra fijo sin selector — esta compra es para participar en ese
                        partido puntual. Sin partido_id en la URL, se mantiene el selector
                        general (entradas genéricas como "Comprar mi bono" desde Home). */}
                    {partidoDesdeUrl && partidoSeleccionado ? (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-slate-900/60 px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                            <Bandera equipo={partidoSeleccionado.equipo_local} className="w-5 h-5" /> {partidoSeleccionado.equipo_local}
                            <span className="text-zinc-400 font-normal">vs</span>
                            <Bandera equipo={partidoSeleccionado.equipo_visitante} className="w-5 h-5" /> {partidoSeleccionado.equipo_visitante}
                        </div>
                    ) : partidos.length > 0 && (
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Partido en el que quieres participar</label>
                            <select
                                value={partidoId ?? ''}
                                onChange={(e) => setPartidoId(Number(e.target.value))}
                                className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-slate-900/60 px-4 py-3 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                {partidos.map((p) => {
                                    const fecha = new Date(p.fecha_hora_inicio).toLocaleString('es-CO', {
                                        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                                    });
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.equipo_local} vs {p.equipo_visitante} — {fecha}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
                                Tus cupos se pueden usar en cualquier partido activo, no solo en este.
                            </p>
                        </div>
                    )}

                    {/* 4. Countdown del partido */}
                    <CountdownPartido partido={partidoSeleccionado} />

                    {/* Información de transferencia */}
                    {mostrarTransferencia && (
                        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm backdrop-blur-lg p-4">
                            <p className="text-zinc-900 dark:text-white font-bold text-sm mb-2">🏦 Datos para tu transferencia</p>
                            <ul className="text-zinc-600 dark:text-zinc-300 text-sm space-y-1">
                                <li><span className="text-zinc-400">Banco:</span> {CUENTA_TRANSFERENCIA.banco}</li>
                                <li><span className="text-zinc-400">Cuenta {CUENTA_TRANSFERENCIA.tipo}:</span> {CUENTA_TRANSFERENCIA.numero}</li>
                                <li><span className="text-zinc-400">Titular:</span> {CUENTA_TRANSFERENCIA.titular}</li>
                                <li><span className="text-zinc-400">NIT:</span> {CUENTA_TRANSFERENCIA.nit}</li>
                                <li className="pt-1 text-amber-500 dark:text-amber-400 font-bold">
                                    Valor a transferir: {valorAPagar > 0 ? formatoPesos(valorAPagar) : '—'}
                                </li>
                            </ul>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-3">
                                Sube la foto o captura del comprobante. Lo revisamos y activamos tu bono en minutos.
                            </p>
                        </div>
                    )}

                    {mostrarTransferencia && (
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Comprobante de pago (foto o captura)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                                className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-600 dark:text-zinc-300 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-400 file:text-slate-950 file:font-bold file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {mostrarTransferencia && (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                            <TrustBadges />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando || (!mostrarTransferencia && esOtroMonto && montoCustomNumero < MONTO_PERSONALIZADO_MIN)}
                        className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform disabled:opacity-60 text-base"
                    >
                        {cargando
                            ? (mostrarTransferencia ? 'Enviando comprobante...' : 'Generando link de pago...')
                            : mostrarTransferencia
                                ? 'Enviar comprobante de transferencia'
                                : `Pagar ${valorAPagar > 0 ? formatoPesos(valorAPagar) : ''} con Wompi`}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMostrarTransferencia((v) => !v)}
                        className="w-full py-3 rounded-xl font-bold text-sm text-zinc-900 dark:text-white text-center border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60"
                    >
                        {mostrarTransferencia ? '← Volver a pagar con Wompi' : 'Paga con Transferencia Bancolombia'}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}
