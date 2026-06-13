import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANES, formatoPesos } from '../config/planes';
import { obtenerPartidos, crearLinkPago } from '../api';

export default function Comprar() {
    const [partidos, setPartidos] = useState([]);
    const [partidoId, setPartidoId] = useState(null);
    const [planSeleccionado, setPlanSeleccionado] = useState(PLANES[0].valor);
    const [form, setForm] = useState({ nombre: '', correo: '', celular: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const activos = data.partidos.filter((p) => p.estado === 'activo');
                    const lista = activos.length > 0 ? activos : data.partidos;
                    setPartidos(lista);
                    setPartidoId(lista[0]?.id ?? null);
                }
            })
            .catch(() => setError('No se pudo cargar la información del partido.'));
    }, []);

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

        setCargando(true);
        try {
            const data = await crearLinkPago({
                nombre: form.nombre.trim(),
                correo: form.correo.trim(),
                celular: form.celular.trim(),
                partido_id: partidoId,
                valor: planSeleccionado,
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
                            className={`rounded-xl border p-4 text-left transition-all backdrop-blur-lg ${
                                planSeleccionado === plan.valor
                                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                                    : 'border-white/10 bg-slate-900/60'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold">{formatoPesos(plan.valor)}</p>
                                    <p className="text-xs text-zinc-400">Bono de {formatoPesos(plan.saldoBono)}</p>
                                </div>
                                <span className="text-amber-400 font-bold text-sm">{plan.etiqueta}</span>
                            </div>
                        </button>
                    ))}
                </div>

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

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {cargando ? 'Generando link de pago...' : 'Pagar con Wompi'}
                    </button>
                </form>
            </div>
        </div>
    );
}
