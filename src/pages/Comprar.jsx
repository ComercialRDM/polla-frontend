import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PLANES, formatoPesos } from '../config/planes';
import { obtenerPartidos, crearLinkPago, crearTransferencia } from '../api';
import CountdownPartido from '../components/CountdownPartido';
import Footer from '../components/Footer';
import Bandera from '../components/Bandera';
import { partidosFuturos } from '../utils/partidos';

const REF_STORAGE_KEY = 'polla_ref_token';

const CUENTA_TRANSFERENCIA = {
    banco: 'Bancolombia',
    tipo: 'Ahorros',
    numero: '44200008248',
    titular: 'La Retoucherie de Manuela',
    nit: '901765354',
};

export default function Comprar() {
    const [searchParams] = useSearchParams();
    const [partidos, setPartidos] = useState([]);
    const [partidoId, setPartidoId] = useState(null);
    const [planSeleccionado, setPlanSeleccionado] = useState(() => {
        const planUrl = Number(searchParams.get('plan'));
        return PLANES.some((p) => p.valor === planUrl) ? planUrl : PLANES[0].valor;
    });
    const [metodoPago, setMetodoPago] = useState('wompi'); // 'wompi' | 'transferencia'
    const [form, setForm] = useState({ nombre: '', correo: '', celular: '' });
    const [comprobante, setComprobante] = useState(null);
    const [enviado, setEnviado] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const partidoUrl = Number(searchParams.get('partido'));
                    const limite = partidoUrl ? 20 : 5;
                    const lista = partidosFuturos(data.partidos, limite);
                    setPartidos(lista);
                    const preseleccionado = lista.some((p) => p.id === partidoUrl) ? partidoUrl : lista[0]?.id ?? null;
                    setPartidoId(preseleccionado);
                }
            })
            .catch(() => setError('No se pudo cargar la información del partido.'));
    }, []);

    const partidoSeleccionado = partidos.find((p) => p.id === partidoId) ?? null;

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!form.nombre.trim() || !form.correo.trim() || !form.celular.trim()) {
            setError('Por favor completa todos los campos.');
            return;
        }
        if (!partidoId) {
            setError('No hay partidos disponibles para la polla en este momento.');
            return;
        }

        if (metodoPago === 'transferencia' && !comprobante) {
            setError('Adjunta la foto o captura del comprobante de la transferencia.');
            return;
        }

        const ref = localStorage.getItem(REF_STORAGE_KEY) || '';

        setCargando(true);
        try {
            if (metodoPago === 'transferencia') {
                const data = await crearTransferencia({
                    nombre: form.nombre.trim(),
                    correo: form.correo.trim(),
                    celular: form.celular.trim(),
                    partido_id: partidoId,
                    valor: planSeleccionado,
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
                valor: planSeleccionado,
                ref,
            });

            if (data?.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                setError(data?.error || 'No se pudo generar el link de pago.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    }

    if (enviado) {
        return (
            <div className="min-h-screen bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                    <div className="flex-1 bg-colombia-yellow" />
                    <div className="flex-1 bg-colombia-blue" />
                    <div className="flex-1 bg-colombia-red" />
                </div>

                <div className="w-full max-w-md mt-20 text-center">
                    <span className="text-5xl block mb-4">✅</span>
                    <h1 className="text-2xl font-extrabold text-white mb-2">¡Comprobante recibido!</h1>
                    <p className="text-zinc-400 text-sm mb-8">{mensajeExito}</p>
                    <Link
                        to="/"
                        className="inline-block w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-400 text-sm hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-white mt-4 mb-1">Compra tu Bono Digital</h1>
                <p className="text-zinc-400 text-sm mb-6">
                    Elige tu bono y participa en la Polla Mundialista.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    {PLANES.map((plan) => (
                        <button
                            key={plan.valor}
                            type="button"
                            onClick={() => setPlanSeleccionado(plan.valor)}
                            className={`relative rounded-xl border p-4 text-left transition-all backdrop-blur-lg ${
                                plan.destacado === 'premium'
                                    ? planSeleccionado === plan.valor
                                        ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.35)] scale-[1.02]'
                                        : 'border-amber-400/60 bg-amber-400/5 scale-[1.02]'
                                    : planSeleccionado === plan.valor
                                        ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                                        : 'border-white/10 bg-slate-900/60'
                            }`}
                        >
                            {plan.destacado === 'popular' && (
                                <span className="absolute -top-2.5 left-4 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                    ⭐ Más popular
                                </span>
                            )}
                            {plan.destacado === 'premium' && (
                                <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                    🏆 Mejor valor — recomendado
                                </span>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    <p className="text-white font-bold">{formatoPesos(plan.valor)}</p>
                                    <p className="text-xs text-zinc-400">Bono de {formatoPesos(plan.saldoBono)}</p>
                                </div>
                                <span className="text-amber-400 font-bold text-sm">{plan.etiqueta}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Selección del partido */}
                <div className="mb-6">
                    <p className="block text-sm text-zinc-300 mb-2">Elige el partido en el que quieres participar</p>
                    <div className="flex flex-col gap-2">
                        {partidos.map((p) => {
                            const fecha = new Date(p.fecha_hora_inicio);
                            const fechaTexto = fecha.toLocaleString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: 'numeric',
                                minute: '2-digit',
                            });
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPartidoId(p.id)}
                                    className={`rounded-xl border p-3 text-left transition-all backdrop-blur-lg flex items-center justify-between gap-2 ${
                                        partidoId === p.id
                                            ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 text-white'
                                            : 'border-white/10 bg-slate-900/60 text-zinc-300'
                                    }`}
                                >
                                    <span className="font-bold text-sm inline-flex items-center gap-1.5">
                                        <Bandera equipo={p.equipo_local} className="w-5 h-5" /> {p.equipo_local} vs <Bandera equipo={p.equipo_visitante} className="w-5 h-5" /> {p.equipo_visitante}
                                    </span>
                                    <span className="text-xs text-zinc-400 whitespace-nowrap">{fechaTexto}</span>
                                </button>
                            );
                        })}
                        {partidos.length === 0 && (
                            <p className="text-sm text-zinc-400">No hay partidos disponibles por el momento.</p>
                        )}
                    </div>
                </div>

                <CountdownPartido partido={partidoSeleccionado} />

                {/* Selección del método de pago */}
                <div className="mb-6">
                    <p className="block text-sm text-zinc-300 mb-2">Método de pago</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setMetodoPago('wompi')}
                            className={`rounded-xl border p-3 text-center font-bold text-sm transition-all backdrop-blur-lg ${
                                metodoPago === 'wompi'
                                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 text-white'
                                    : 'border-white/10 bg-slate-900/60 text-zinc-300'
                            }`}
                        >
                            💳 Tarjeta / PSE (Wompi)
                        </button>
                        <button
                            type="button"
                            onClick={() => setMetodoPago('transferencia')}
                            className={`rounded-xl border p-3 text-center font-bold text-sm transition-all backdrop-blur-lg ${
                                metodoPago === 'transferencia'
                                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 text-white'
                                    : 'border-white/10 bg-slate-900/60 text-zinc-300'
                            }`}
                        >
                            🏦 Transferencia
                        </button>
                    </div>
                </div>

                {metodoPago === 'transferencia' && (
                    <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4">
                        <p className="text-white font-bold text-sm mb-2">Datos para tu transferencia</p>
                        <ul className="text-zinc-300 text-sm space-y-1">
                            <li><span className="text-zinc-400">Banco:</span> {CUENTA_TRANSFERENCIA.banco}</li>
                            <li><span className="text-zinc-400">Cuenta {CUENTA_TRANSFERENCIA.tipo}:</span> {CUENTA_TRANSFERENCIA.numero}</li>
                            <li><span className="text-zinc-400">Titular:</span> {CUENTA_TRANSFERENCIA.titular}</li>
                            <li><span className="text-zinc-400">NIT:</span> {CUENTA_TRANSFERENCIA.nit}</li>
                            <li className="pt-1 text-amber-400 font-bold">Valor a transferir: {formatoPesos(planSeleccionado)}</li>
                        </ul>
                        <p className="text-zinc-400 text-xs mt-3">
                            Realiza la transferencia y sube la foto o captura del comprobante. Nuestro equipo la revisará y aprobará tu bono.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-zinc-300 mb-1">Nombre completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Manuela Pérez"
                            className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-300 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="tucorreo@email.com"
                            className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-300 mb-1">Celular (WhatsApp)</label>
                        <input
                            type="tel"
                            name="celular"
                            value={form.celular}
                            onChange={handleChange}
                            placeholder="3001234567"
                            className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {metodoPago === 'transferencia' && (
                        <div>
                            <label className="block text-sm text-zinc-300 mb-1">Comprobante de pago (foto o captura)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                                className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-zinc-300 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-400 file:text-slate-950 file:font-bold file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-zinc-300 text-xs flex items-center justify-center gap-1.5 flex-wrap">
                            🔒 Pago seguro con Wompi · La Retoucherie de Manuela · NIT 901765354
                        </p>
                        {metodoPago === 'transferencia' && (
                            <p className="text-zinc-400 text-xs mt-1">
                                Tu bono se activa en minutos tras revisar el comprobante.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {cargando
                            ? (metodoPago === 'transferencia' ? 'Enviando comprobante...' : 'Generando link de pago...')
                            : (metodoPago === 'transferencia' ? 'Enviar comprobante' : 'Pagar con Wompi')}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}
