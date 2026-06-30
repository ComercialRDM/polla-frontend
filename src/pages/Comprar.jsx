import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PLANES, MONTO_PERSONALIZADO_MIN, MONTO_PERSONALIZADO_MAX, MULTIPLO_PERSONALIZADO, CUPO_VALOR_PERSONALIZADO, calcularCupos, calcularSaldoBono, calcularMontoPorPredicciones, formatoPesos } from '../config/planes';
import { obtenerPartidos, crearLinkPago, crearTransferencia, obtenerBancosPse, crearPSE, crearBancolombia } from '../api';
import CountdownPartido from '../components/CountdownPartido';
import Footer from '../components/Footer';
import Bandera from '../components/Bandera';
import { partidosFuturos } from '../utils/partidos';
import { obtenerMarcadoresPendientes } from '../utils/marcadorPendiente';
import { obtenerSesion, guardarSesion } from '../utils/sesion';
import { guardarDatosComprador, obtenerDatosComprador } from '../utils/datosComprador';
import { getStoredAttribution } from '../lib/attribution';
import { trackViewItem, trackBeginCheckout, trackAddPaymentInfo } from '../lib/analytics';
import TrustBadges from '../components/TrustBadges';
import CuposRestantes from '../components/CuposRestantes';
import wompiLogo from '../assets/Wompi_Logo.jpg';
import pseLogo from '../assets/boton-pse.png';
import bancolombiaLogo from '../assets/bancolombia-logo.png';

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

// Bre-B no tiene integración automática todavía (no existe API/webhook
// público para comercio electrónico, solo la "llave" para transferencias

export default function Comprar() {
    const [searchParams] = useSearchParams();

    const planDesdeUrl = Number(searchParams.get('plan'));
    const planUrlValido = PLANES.some((p) => p.valor === planDesdeUrl) ? planDesdeUrl : null;
    const partidoDesdeUrl = Number(searchParams.get('partido')) || null;

    // Si viene de una invitación a un grupo, guardar el token para auto-unirse tras el pago
    useEffect(() => {
        const grupoToken = searchParams.get('grupo');
        if (grupoToken) localStorage.setItem('polla_grupo_pendiente', grupoToken);
    }, [searchParams]);

    // Predicciones hechas antes de pagar (Hero o la lista de "Próximos
    // partidos" en Home) — si hay varias, se usan para preseleccionar el
    // monto personalizado más abajo en vez del plan por defecto.
    const [pendientes] = useState(() => obtenerMarcadoresPendientes());

    const [selectValor, setSelectValor] = useState(() =>
        String(planUrlValido ?? PLAN_DEFAULT)
    );
    const [montoCustom, setMontoCustom] = useState('');
    const [mostrarTransferencia, setMostrarTransferencia] = useState(false);
    const [comprobante, setComprobante] = useState(null);

    // Método de pago: 'wompi' abre el Widget (tarjeta/Nequi/Daviplata/etc, lo
    // que esté activo en la cuenta de Wompi). 'pse' y 'bancolombia' van por la
    // API directa de Wompi (botón propio, sin pasar por el widget). 'breb'
    // queda deshabilitado hasta que Wompi lo habilite (ver loadtest/04 y la
    // conversación: Bre-B todavía no aparece en el dashboard de Wompi).
    const [metodoPago, setMetodoPago] = useState('wompi');
    const [bancosPse, setBancosPse] = useState([]);
    const [bancoSeleccionado, setBancoSeleccionado] = useState('');

    const [partidos, setPartidos] = useState([]);
    const [partidoId, setPartidoId] = useState(null);

    const [form, setForm] = useState(() => {
        const guardados = obtenerDatosComprador();
        const sesion = obtenerSesion();
        return {
            nombre: sesion?.nombre || guardados.nombre || '',
            correo: sesion?.correo || guardados.correo || '',
            celular: sesion?.celular || guardados.celular || '',
            tipo_documento: sesion?.tipo_documento || 'CC',
            documento: sesion?.documento || '',
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
        if (metodoPago === 'pse' && bancosPse.length === 0) {
            obtenerBancosPse()
                .then((data) => {
                    if (data?.success) setBancosPse(data.bancos);
                })
                .catch(() => setError('No se pudo cargar la lista de bancos PSE.'));
        }
    }, [metodoPago, bancosPse.length]);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const lista = partidosFuturos(data.partidos, 10);
                    setPartidos(lista);
                    const coincide = partidoDesdeUrl && lista.some((p) => p.id === partidoDesdeUrl);
                    setPartidoId(coincide ? partidoDesdeUrl : (lista[0]?.id ?? null));

                    // Si predijo varios partidos antes de pagar, el monto se calcula
                    // según esas predicciones en vez de usar el plan por defecto
                    // (a menos que llegó con un ?plan= explícito en la URL).
                    if (pendientes.length > 0 && !planUrlValido) {
                        const { monto } = calcularMontoPorPredicciones(pendientes, lista);
                        setSelectValor(VALOR_OTRO);
                        setMontoCustom(String(monto));
                    }
                }
            })
            .catch(() => setError('No se pudo cargar la información del partido.'));
    }, []);

    const partidoSeleccionado = partidos.find((p) => p.id === partidoId) ?? null;

    // view_item: se dispara cada vez que el plan/monto visible cambia a uno
    // valido (no en cada tecla de un monto personalizado incompleto).
    useEffect(() => {
        if (!esOtroMonto && planInfo) {
            trackViewItem(planInfo);
        } else if (esOtroMonto && montoCustomNumero >= MONTO_PERSONALIZADO_MIN) {
            trackViewItem({ valor: montoCustomNumero, saldoBono: saldoBonoCustom, etiqueta: 'personalizado' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [esOtroMonto, planInfo, montoCustomNumero]);

    // La cuenta ya queda creada en el backend desde que se genera la
    // transacción (antes incluso de que el pago se confirme), así que se
    // guarda la sesión de una vez — el comprador no tiene que "registrarse"
    // por separado para ver su dashboard.
    function guardarSesionDePago(data) {
        if (data?.usuario && data?.token) {
            guardarSesion({ ...data.usuario, token: data.token });
        }
    }

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
        if (!mostrarTransferencia && metodoPago === 'pse') {
            if (!form.documento.trim()) {
                setError('Ingresa tu número de documento (lo exige PSE).');
                return;
            }
            if (!bancoSeleccionado) {
                setError('Selecciona tu banco para pagar con PSE.');
                return;
            }
        }

        const ref = localStorage.getItem(REF_STORAGE_KEY) || '';
        const affToken = localStorage.getItem(AFF_STORAGE_KEY) || '';
        const atribucion = getStoredAttribution();
        const planParaEvento = planInfo || { valor: valorAPagar, saldoBono: saldoBonoCustom, etiqueta: 'personalizado' };

        // begin_checkout: el usuario ya lleno el formulario y confirmo que quiere
        // pagar (este componente combina seleccion de plan + pago en una sola
        // pantalla, asi que este es el punto real de "inicio de checkout").
        trackBeginCheckout(planParaEvento, { partidoId });

        enviandoRef.current = true;
        setCargando(true);
        try {
            if (!mostrarTransferencia && metodoPago === 'pse') {
                trackAddPaymentInfo(planParaEvento, { metodoPago: 'pse' });
                const data = await crearPSE({
                    nombre: form.nombre.trim(),
                    correo: form.correo.trim(),
                    celular: form.celular.trim(),
                    partido_id: partidoId,
                    valor: valorAPagar,
                    tipo_documento: form.tipo_documento,
                    documento: form.documento.trim(),
                    financial_institution_code: bancoSeleccionado,
                    ref,
                    aff_token: affToken,
                    atribucion,
                });
                if (data?.success && data.redirect_url) {
                    guardarSesionDePago(data);
                    window.location.href = data.redirect_url;
                } else {
                    setError(data?.error || 'No se pudo iniciar el pago por PSE.');
                }
                return;
            }

            if (!mostrarTransferencia && metodoPago === 'bancolombia') {
                trackAddPaymentInfo(planParaEvento, { metodoPago: 'bancolombia' });
                const data = await crearBancolombia({
                    nombre: form.nombre.trim(),
                    correo: form.correo.trim(),
                    celular: form.celular.trim(),
                    partido_id: partidoId,
                    valor: valorAPagar,
                    ref,
                    aff_token: affToken,
                    atribucion,
                });
                if (data?.success && data.redirect_url) {
                    guardarSesionDePago(data);
                    window.location.href = data.redirect_url;
                } else {
                    setError(data?.error || 'No se pudo iniciar el pago con Botón Bancolombia.');
                }
                return;
            }

            if (mostrarTransferencia) {
                if (!comprobante) {
                    setError('Adjunta la foto o captura del comprobante de pago.');
                    setCargando(false);
                    return;
                }
                trackAddPaymentInfo(planParaEvento, { metodoPago: 'transferencia' });
                const data = await crearTransferencia({
                    nombre: form.nombre.trim(),
                    correo: form.correo.trim(),
                    celular: form.celular.trim(),
                    partido_id: partidoId,
                    valor: valorAPagar,
                    comprobante,
                    ref,
                    aff_token: affToken,
                    atribucion,
                });
                if (data?.success) {
                    guardarSesionDePago(data);
                    setMensajeExito(data.mensaje || 'Tu comprobante fue recibido. Te avisaremos cuando se confirme el pago.');
                    setEnviado(true);
                } else {
                    setError(data?.error || 'No se pudo registrar el pago.');
                }
                return;
            }

            trackAddPaymentInfo(planParaEvento, { metodoPago: 'wompi' });
            const data = await crearLinkPago({
                nombre: form.nombre.trim(),
                correo: form.correo.trim(),
                celular: form.celular.trim(),
                partido_id: partidoId,
                valor: valorAPagar,
                ref,
                aff_token: affToken,
                atribucion,
            });

            if (data?.success && data.widget) {
                guardarSesionDePago(data);
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

                    {/* Ya quedó con sesión iniciada (guardarSesionDePago) — no necesita
                        registrarse aparte, solo lo mandamos a su dashboard. */}
                    <div className="w-full rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 p-6 mb-4 text-left">
                        <p className="text-2xl mb-2">🏆</p>
                        <p className="text-zinc-900 dark:text-white font-extrabold text-lg mb-2">¡Ya quedaste registrado!</p>
                        <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">Desde tu cuenta puedes:</p>
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
                            to="/"
                            className="block w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform"
                        >
                            Ir a mi cuenta
                        </Link>
                    </div>

                    <Link to="/" className="text-xs text-zinc-400 underline">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
            {/* Franja Colombia */}
            <div className="fixed top-0 left-0 right-0 h-1.5 flex z-50">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            {/* Header sticky */}
            <div className="sticky top-1.5 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-200 dark:border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                <Link to="/" className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0">
                    ← Inicio
                </Link>
                <p className="font-black text-zinc-900 dark:text-white text-sm truncate">Compra tu Bono Digital</p>
                <div className="shrink-0"><CuposRestantes /></div>
            </div>

            <form id="comprar-form" onSubmit={handleSubmit}>
            <div className="max-w-lg mx-auto px-4 pt-5 pb-40 flex flex-col gap-4">

                {/* Predicciones pendientes */}
                {pendientes.length > 0 && (
                    <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
                        <p className="text-zinc-900 dark:text-white font-bold text-sm mb-1">
                            🔥 Ya predijiste {pendientes.length} {pendientes.length === 1 ? 'partido' : 'partidos'}
                        </p>
                        <ul className="text-zinc-600 dark:text-zinc-300 text-xs flex flex-col gap-0.5 mb-1">
                            {pendientes.map((pred) => {
                                const partido = partidos.find((p) => p.id === pred.partido_id);
                                if (!partido) return null;
                                return <li key={pred.partido_id}>{partido.equipo_local} {pred.local} – {pred.visitante} {partido.equipo_visitante}</li>;
                            })}
                        </ul>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Preseleccionamos el monto para esos cupos — puedes cambiarlo.</p>
                    </div>
                )}

                {/* Aviso geográfico */}
                <div className="rounded-2xl border border-blue-200 dark:border-blue-400/20 bg-blue-50 dark:bg-blue-900/10 px-4 py-3">
                    <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                        <span className="font-bold">📍 Redención en Barranquilla:</span>{' '}
                        El crédito en servicios aplica en nuestros locales. Los premios (bonos y gift cards) son para participantes de cualquier ciudad.
                    </p>
                </div>

                {/* ── PASO 1: Plan ── */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                    <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FCD116] flex items-center justify-center shrink-0">
                            <span className="text-zinc-950 font-black text-[11px]">1</span>
                        </div>
                        <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Elige tu plan</h2>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        {/* Tarjetas de planes */}
                        <div className="grid grid-cols-3 gap-2">
                            {PLANES.map((plan) => {
                                const sel = selectValor === String(plan.valor);
                                return (
                                    <button
                                        key={plan.valor}
                                        type="button"
                                        onClick={() => { setSelectValor(String(plan.valor)); setMontoCustom(''); }}
                                        className={`relative flex flex-col items-center rounded-xl border-2 px-2 py-3 transition-all text-center ${sel ? 'border-[#FCD116] bg-amber-400/10' : 'border-zinc-200 dark:border-white/10 hover:border-amber-300'}`}
                                    >
                                        {plan.destacado === 'popular' && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-[#FCD116] text-zinc-950 px-1.5 py-0.5 rounded-full whitespace-nowrap">⭐ Popular</span>
                                        )}
                                        <p className="font-black text-zinc-900 dark:text-white text-sm leading-tight">{formatoPesos(plan.valor)}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">¡Saldo extra gratis!</p>
                                        <p className="font-bold text-amber-500 text-sm leading-tight">{formatoPesos(plan.saldoBono)}</p>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{plan.etiqueta} en la polla</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Otro monto */}
                        <button
                            type="button"
                            onClick={() => setSelectValor(VALOR_OTRO)}
                            className={`w-full py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${esOtroMonto ? 'border-[#FCD116] bg-amber-400/10 text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-amber-300'}`}
                        >
                            + Otro monto personalizado
                        </button>

                        {/* Input monto personalizado */}
                        {esOtroMonto && (
                            <div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={MONTO_PERSONALIZADO_MIN}
                                        max={MONTO_PERSONALIZADO_MAX}
                                        step={MULTIPLO_PERSONALIZADO}
                                        value={montoCustom}
                                        onChange={(e) => setMontoCustom(e.target.value)}
                                        placeholder={`${formatoPesos(MONTO_PERSONALIZADO_MIN)} – ${formatoPesos(MONTO_PERSONALIZADO_MAX)}`}
                                        className="w-full rounded-xl border-2 border-amber-400 bg-zinc-50 dark:bg-zinc-800 pl-8 pr-4 py-3 text-zinc-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                {montoCustomNumero >= MONTO_PERSONALIZADO_MIN && (
                                    <div className="mt-2 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-zinc-900 dark:text-white font-black">{formatoPesos(montoCustomNumero)}</p>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                Bono <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatoPesos(saldoBonoCustom)}</span> en servicios
                                                {residuoCustom > 0 && <span> · Sin cupo: {formatoPesos(residuoCustom)}</span>}
                                            </p>
                                        </div>
                                        <div className="text-center shrink-0">
                                            <p className="text-amber-500 font-black text-2xl leading-none">{cuposCustom}</p>
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold">{cuposCustom === 1 ? 'cupo' : 'cupos'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resumen plan fijo */}
                        {!esOtroMonto && planInfo && (
                            <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-900 dark:text-white font-black text-lg leading-tight">{formatoPesos(planInfo.valor)}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                        Recibes gratis <span className="font-bold text-amber-500">{formatoPesos(planInfo.saldoBono)}</span> en servicios
                                    </p>
                                </div>
                                <div className="text-center shrink-0">
                                    <p className="text-amber-500 font-black text-2xl leading-none">{planInfo.intentos}</p>
                                    <p className="text-zinc-500 text-[10px] uppercase font-bold">{planInfo.intentos === 1 ? 'cupo' : 'cupos'} polla</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── PASO 2: Datos ── */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                    <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FCD116] flex items-center justify-center shrink-0">
                            <span className="text-zinc-950 font-black text-[11px]">2</span>
                        </div>
                        <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Tus datos</h2>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        <div className="px-4 py-3.5">
                            <label htmlFor="comprar-nombre" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Nombre completo</label>
                            <input
                                id="comprar-nombre"
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Manuela Pérez"
                                autoComplete="name"
                                className="w-full bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 font-medium text-sm focus:outline-none"
                            />
                        </div>
                        <div className="px-4 py-3.5">
                            <label htmlFor="comprar-correo" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Correo electrónico</label>
                            <input
                                id="comprar-correo"
                                type="email"
                                name="correo"
                                value={form.correo}
                                onChange={handleChange}
                                placeholder="tucorreo@email.com"
                                autoComplete="email"
                                className="w-full bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 font-medium text-sm focus:outline-none"
                            />
                        </div>
                        <div className="px-4 py-3.5">
                            <label htmlFor="comprar-celular" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Celular (WhatsApp)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 text-sm">🇨🇴 +57</span>
                                <input
                                    id="comprar-celular"
                                    type="tel"
                                    name="celular"
                                    value={form.celular}
                                    onChange={handleChange}
                                    placeholder="3001234567"
                                    autoComplete="tel-national"
                                    inputMode="numeric"
                                    className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 font-medium text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PASO 3: Método de pago ── */}
                {!mostrarTransferencia && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                    <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FCD116] flex items-center justify-center shrink-0">
                            <span className="text-zinc-950 font-black text-[11px]">3</span>
                        </div>
                        <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Método de pago</h2>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {[
                            { id: 'wompi',       label: 'Tarjeta / Nequi / Daviplata', sub: 'Pago inmediato',        logo: wompiLogo,       logoClass: 'h-5' },
                            { id: 'pse',         label: 'PSE',                          sub: 'Débito bancario',       logo: pseLogo,         logoClass: 'h-6' },
                            { id: 'bancolombia', label: 'Botón Bancolombia',             sub: 'Transferencia directa', logo: bancolombiaLogo, logoClass: 'h-5 w-5' },
                        ].map(({ id, label, sub, logo, logoClass }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setMetodoPago(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${metodoPago === id ? 'bg-amber-400/10' : 'hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${metodoPago === id ? 'border-[#FCD116]' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                    {metodoPago === id && <div className="w-2.5 h-2.5 rounded-full bg-[#FCD116]" />}
                                </div>
                                <img src={logo} alt={label} className={`${logoClass} w-auto object-contain shrink-0`} />
                                <div className="min-w-0">
                                    <p className={`text-sm font-bold leading-tight ${metodoPago === id ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>{label}</p>
                                    <p className="text-[11px] text-zinc-400 leading-tight">{sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* PSE: documento + banco */}
                    {metodoPago === 'pse' && (
                        <div className="border-t border-zinc-100 dark:border-white/5 p-4 flex flex-col gap-3">
                            <div className="flex gap-2">
                                <select
                                    id="comprar-tipo-documento"
                                    name="tipo_documento"
                                    value={form.tipo_documento}
                                    onChange={handleChange}
                                    className="w-20 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-2 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="CC">CC</option>
                                    <option value="CE">CE</option>
                                    <option value="NIT">NIT</option>
                                </select>
                                <input
                                    id="comprar-documento"
                                    type="text"
                                    name="documento"
                                    inputMode="numeric"
                                    value={form.documento}
                                    onChange={handleChange}
                                    placeholder="Número de documento"
                                    className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <select
                                id="comprar-banco"
                                value={bancoSeleccionado}
                                onChange={(e) => setBancoSeleccionado(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="">Selecciona tu banco...</option>
                                {bancosPse.map((b) => (
                                    <option key={b.codigo} value={b.codigo}>{b.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                </div>
                )}

                {/* Transferencia bancaria */}
                {mostrarTransferencia && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                        <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-2">
                            <span className="text-lg">🏦</span>
                            <h2 className="font-bold text-zinc-900 dark:text-white text-sm">Datos de transferencia</h2>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            {[
                                { label: 'Banco', value: CUENTA_TRANSFERENCIA.banco },
                                { label: `Cuenta ${CUENTA_TRANSFERENCIA.tipo}`, value: CUENTA_TRANSFERENCIA.numero },
                                { label: 'Titular', value: CUENTA_TRANSFERENCIA.titular },
                                { label: 'NIT', value: CUENTA_TRANSFERENCIA.nit },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-white/5 last:border-0">
                                    <span className="text-zinc-400 text-sm">{label}</span>
                                    <span className="font-semibold text-zinc-900 dark:text-white text-sm text-right">{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-zinc-200 dark:border-white/10">
                                <span className="text-zinc-500 font-bold text-sm">Total a transferir</span>
                                <span className="font-black text-amber-500 text-xl">{valorAPagar > 0 ? formatoPesos(valorAPagar) : '—'}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">Activamos tu bono en minutos tras verificar el comprobante.</p>
                        </div>
                        <div className="px-4 pb-4">
                            <label className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Comprobante de pago</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-zinc-600 dark:text-zinc-300 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#FCD116] file:text-zinc-950 file:font-bold file:text-xs file:cursor-pointer focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Partido */}
                {partidos.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                    {partidoDesdeUrl && partidoSeleccionado ? (
                        <div className="px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                            <Bandera equipo={partidoSeleccionado.equipo_local} className="w-5 h-5" />
                            {partidoSeleccionado.equipo_local}
                            <span className="text-zinc-400 font-normal">vs</span>
                            <Bandera equipo={partidoSeleccionado.equipo_visitante} className="w-5 h-5" />
                            {partidoSeleccionado.equipo_visitante}
                        </div>
                    ) : (
                        <div className="px-4 py-3.5">
                            <label className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Partido para participar</label>
                            <select
                                value={partidoId ?? ''}
                                onChange={(e) => setPartidoId(Number(e.target.value))}
                                className="w-full bg-transparent text-zinc-900 dark:text-white text-sm focus:outline-none"
                            >
                                {partidos.map((p) => {
                                    const fecha = new Date(p.fecha_hora_inicio).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
                                    return <option key={p.id} value={p.id}>{p.equipo_local} vs {p.equipo_visitante} — {fecha}</option>;
                                })}
                            </select>
                            <p className="text-zinc-400 text-xs mt-1.5">Tus cupos se pueden usar en cualquier partido activo.</p>
                        </div>
                    )}
                </div>
                )}

                <CountdownPartido partido={partidoSeleccionado} />

                {/* Trust badges */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 p-3">
                    <TrustBadges />
                </div>

                {/* Términos */}
                <label className="flex items-start gap-3 cursor-pointer px-1">
                    <input
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-amber-400 shrink-0"
                    />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Acepto los{' '}
                        <Link to="/terminos" target="_blank" className="text-amber-500 underline font-medium">Términos y Condiciones</Link>{' '}
                        y la{' '}
                        <Link to="/privacidad" target="_blank" className="text-amber-500 underline font-medium">Política de Privacidad</Link>.
                    </span>
                </label>

                {error && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-4 py-3">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                )}

            </div>
            </form>

            {/* Barra fija de pago */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/97 dark:bg-zinc-900/97 backdrop-blur-lg border-t border-zinc-200 dark:border-white/10 px-4 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <div className="max-w-lg mx-auto flex flex-col gap-2">
                    {valorAPagar > 0 && (
                        <div className="flex items-center justify-between px-1">
                            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Total a pagar</span>
                            <span className="font-black text-zinc-900 dark:text-white text-lg">{formatoPesos(valorAPagar)}</span>
                        </div>
                    )}
                    <button
                        type="submit"
                        form="comprar-form"
                        disabled={cargando || (!mostrarTransferencia && esOtroMonto && montoCustomNumero < MONTO_PERSONALIZADO_MIN)}
                        className="w-full py-4 rounded-2xl font-black text-zinc-950 text-base bg-[#FCD116] hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-amber-400/20"
                    >
                        {cargando
                            ? (mostrarTransferencia ? 'Enviando comprobante...' : 'Procesando pago...')
                            : mostrarTransferencia
                                ? 'Enviar comprobante'
                                : `Pagar ${valorAPagar > 0 ? formatoPesos(valorAPagar) : ''}` + (
                                    metodoPago === 'pse' ? ' · PSE'
                                        : metodoPago === 'bancolombia' ? ' · Bancolombia'
                                            : ''
                                )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMostrarTransferencia((v) => !v)}
                        className="w-full py-2.5 rounded-xl font-semibold text-xs text-zinc-500 dark:text-zinc-400 text-center border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-colors"
                    >
                        {mostrarTransferencia ? '← Pagar con Wompi / PSE / Bancolombia' : 'Pagar con Transferencia Bancolombia'}
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4">
                <Footer />
            </div>
        </div>
    );
}
