import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrarMarcaPublica } from '../api';

export default function MarcasRegistro() {
    const { token } = useParams();
    const [form, setForm] = useState({ nombre: '', contacto: '' });
    const [logo, setLogo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.nombre.trim() || !form.contacto.trim()) {
            setError('Nombre y contacto son obligatorios.');
            return;
        }
        setEnviando(true);
        try {
            const fd = new FormData();
            fd.append('nombre', form.nombre.trim());
            fd.append('contacto', form.contacto.trim());
            if (logo) fd.append('logo', logo);
            const data = await registrarMarcaPublica(fd, token);
            if (data?.success) {
                setExito(true);
            } else {
                setError(data?.error || 'No se pudo completar el registro. Intenta nuevamente.');
            }
        } catch {
            setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
    }

    if (exito) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-black text-white mb-2">¡Registro recibido!</h1>
                    <p className="text-zinc-400 text-sm mb-6">
                        Recibimos los datos de tu marca. El equipo de La Retoucherie se pondrá en contacto contigo pronto para confirmar la alianza.
                    </p>
                    <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-[#FCD116] text-zinc-950 font-black text-sm hover:bg-yellow-300 transition-colors">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FCD116]/10 border border-[#FCD116]/30 text-3xl mb-4">
                        🏪
                    </div>
                    <h1 className="text-2xl font-black text-white leading-tight">Registra tu marca</h1>
                    <p className="text-zinc-400 text-sm mt-2">
                        Alianza <span className="text-[#FCD116] font-bold">La Retoucherie × Mundial 2026</span><br />
                        Tus clientes podrán redimir sus bonos en tu negocio.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-900 p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1.5">Nombre de la marca *</label>
                        <input
                            required
                            value={form.nombre}
                            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                            placeholder="Ej: Nike, Rappi, Restaurante El Portal…"
                            className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCD116]/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1.5">Contacto — email o celular *</label>
                        <input
                            required
                            value={form.contacto}
                            onChange={(e) => setForm((p) => ({ ...p, contacto: e.target.value }))}
                            placeholder="contacto@tumarca.com o 300 000 0000"
                            className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCD116]/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1.5">Logo de la marca (opcional)</label>
                        <div className="rounded-xl border border-dashed border-white/20 bg-zinc-800/50 p-4 text-center cursor-pointer hover:border-[#FCD116]/40 transition-colors relative">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {logo ? (
                                <p className="text-green-400 text-sm font-bold">✓ {logo.name}</p>
                            ) : (
                                <>
                                    <p className="text-zinc-400 text-sm">Toca para subir PNG o JPG</p>
                                    <p className="text-zinc-600 text-xs mt-0.5">Máximo 2 MB · fondo transparente ideal</p>
                                </>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full py-3.5 rounded-xl bg-[#FCD116] text-zinc-950 font-black text-sm hover:bg-yellow-300 disabled:opacity-60 active:scale-95 transition-all"
                    >
                        {enviando ? 'Enviando…' : 'Enviar solicitud de alianza'}
                    </button>

                    <p className="text-zinc-600 text-[11px] text-center">
                        Al enviar aceptas que La Retoucherie contacte a tu marca para coordinar los detalles de la alianza.
                    </p>
                </form>
            </div>
        </div>
    );
}
