import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PLANES, CUPO_VALOR, MONTO_PERSONALIZADO_MIN, MONTO_PERSONALIZADO_MAX, calcularCupos, calcularSaldoBono, formatoPesos } from '../config/planes';
import { obtenerPartidos, crearLinkPago, crearTransferencia } from '../api';
import CountdownPartido from '../components/CountdownPartido';
import Footer from '../components/Footer';
import Bandera from '../components/Bandera';
import { partidosFuturos } from '../utils/partidos';
import { obtenerSesion } from '../utils/sesion';
import { guardarDatosComprador, obtenerDatosComprador } from '../utils/datosComprador';
import TrustBadges from '../components/TrustBadges';

const REF_STORAGE_KEY = 'polla_ref_token';
const PLAN_DEFAULT = 100000;
const VALOR_OTRO = 'otro';

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

    const esOtroMonto = selectValor === VALOR_OTRO;
    const montoCustomNumero = Number(montoCustom) || 0;
    const valorAPagar = esOtroMonto ? montoCustomNumero : Number(selectValor);
    const planInfo = PLANES.find((p) => p.valor === valorAPagar) ?? null;
    const cuposCustom = calcularCupos(montoCustomNumero);
    const saldoBonoCustom = calcularSaldoBono(montoCustomNumero);
    const residuoCustom = montoCustomNumero % CUPO_VALOR;

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const lista = partidosFuturos(data.partidos, 5);
                    setPartidos(lista);
                    setPartidoId(lista[0]?.id ?? null);
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

        if (!form.nombre.trim() || !form.correo.trim() || !form.celular.trim()) {
            setError('Por favor completa todos los campos.');
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
        }

        const ref = localStorage.getItem(REF_STORAGE_KEY) || '';

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
            });

            if (data?.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                setError(data?.error || 'No se pudo generar el link de pago.');
            }
        } catch {
            setError('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            setCargando(false);
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

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">Compra tu Bono Digital</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Tu bono tiene <span className="font-bold text-zinc-700 dark:text-zinc-300">doble beneficio</span>: crédito real en servicios de La Retoucherie <span className="font-bold text-amber-500">+</span> cupos para participar en la Polla Mundialista y ganar premios.
                </p>

                {/* Mecánica explicada */}
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-slate-900/60 p-4 mb-6 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center">1</span>
                        <div>
                            <p className="text-zinc-900 dark:text-white font-bold text-base">Compra tu Bono Digital</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Elige el plan que más te convenga. Cada $25.000 equivale a 1 cupo para pronosticar.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center">2</span>
                        <div>
                            <p className="text-zinc-900 dark:text-white font-bold text-base">Predice el marcador</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Antes de cada partido de Colombia, ingresa tu pronóstico del resultado final.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center">3</span>
                        <div>
                            <p className="text-zinc-900 dark:text-white font-bold text-base">Gana premios si aciertas</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Los mejores pronósticos ganan premios exclusivos. Además, tu bono tiene hasta <span className="font-bold text-amber-500">$5.000.000 en beneficios</span> acumulados para usar en La Retoucherie.</p>
                        </div>
                    </div>
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
                            Ingresa el monto (múltiplos de {formatoPesos(CUPO_VALOR)})
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={MONTO_PERSONALIZADO_MIN}
                            max={MONTO_PERSONALIZADO_MAX}
                            step={CUPO_VALOR}
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
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* 1. Botón Wompi — primero y prominente */}
                    {!mostrarTransferencia && (
                        <>
                            <button
                                type="submit"
                                disabled={cargando || (esOtroMonto && montoCustomNumero < MONTO_PERSONALIZADO_MIN)}
                                className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60 text-lg"
                            >
                                {cargando
                                    ? 'Generando link de pago...'
                                    : `Pagar ${valorAPagar > 0 ? formatoPesos(valorAPagar) : ''} con Wompi`}
                            </button>
                            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                                <TrustBadges />
                            </div>
                        </>
                    )}

                    {/* 2. Datos del cliente */}
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-2">Ingresa tus datos</p>

                    <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Manuela Pérez"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="tucorreo@email.com"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Celular (WhatsApp)</label>
                        <input
                            type="tel"
                            name="celular"
                            value={form.celular}
                            onChange={handleChange}
                            placeholder="3001234567"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* 3. Partido */}
                    {partidos.length > 0 && (
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
                        <>
                            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                                <TrustBadges />
                            </div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                            >
                                {cargando ? 'Enviando comprobante...' : 'Enviar comprobante de transferencia'}
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setMostrarTransferencia((v) => !v)}
                        className="text-center text-sm font-bold text-zinc-500 dark:text-zinc-400 underline"
                    >
                        {mostrarTransferencia ? '← Volver a pagar con Wompi' : '¿Prefieres pagar por transferencia bancaria?'}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}
