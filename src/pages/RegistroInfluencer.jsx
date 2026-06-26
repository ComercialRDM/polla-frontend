import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registrarInfluencer } from '../api';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const INPUT_CLASS = 'w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400';
const BOTON_PRIMARIO_CLASS = 'w-full py-4 rounded-full font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60';

const REDES = [
    { valor: 'instagram', etiqueta: '📸 Instagram' },
    { valor: 'tiktok', etiqueta: '🎵 TikTok' },
    { valor: 'ambas', etiqueta: '📸🎵 Ambas' },
];

export default function RegistroInfluencer() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [celular, setCelular] = useState('');
    const [redContenido, setRedContenido] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [enviado, setEnviado] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!nombre.trim()) return setError('Ingresa tu nombre completo.');
        if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return setError('Ingresa un correo válido.');
        if (!celular.trim() || celular.trim().length < 7) return setError('Ingresa un número de celular válido.');
        if (!redContenido) return setError('Selecciona en qué red creas contenido.');

        setEnviando(true);
        try {
            const data = await registrarInfluencer({ nombre: nombre.trim(), correo: correo.trim(), celular: celular.trim(), red_contenido: redContenido });
            if (data?.success) {
                setEnviado(true);
            } else {
                setError(data?.error || 'No se pudo completar el registro. Intenta de nuevo.');
            }
        } catch (err) {
            setError(err.message || 'No se pudo completar el registro. Intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
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

                <div className="flex items-center gap-3 mt-4 mb-2">
                    <img src={logoRetoucherie} alt="La Retoucherie de Manuela" className="h-10 w-auto rounded-md" />
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Creadores de contenido</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    Regístrate como influencer de la Polla Mundialista. Participas en un ranking aparte,
                    solo entre creadores de contenido, y los <strong className="text-zinc-700 dark:text-zinc-200">3 mejores</strong> ganan premio.
                    Después de registrarte te enviaremos tu Bono Especial.
                </p>

                {enviado ? (
                    <div className="rounded-xl border border-green-400/40 bg-green-50 dark:bg-green-900/20 px-4 py-5 text-center">
                        <p className="text-2xl mb-2">✅</p>
                        <p className="text-green-800 dark:text-green-300 font-bold mb-1">¡Listo, {nombre.trim()}!</p>
                        <p className="text-green-700 dark:text-green-400 text-sm">
                            Recibimos tu registro. Muy pronto te enviaremos tu Bono Especial por correo y WhatsApp para que empieces a participar.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Juliana Pérez"
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Correo electrónico</label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="tucorreo@ejemplo.com"
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Celular (WhatsApp)</label>
                            <div className="flex">
                                <span className="flex items-center gap-1 rounded-l-lg border border-r-0 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 text-zinc-600 dark:text-zinc-300 text-sm font-semibold select-none">
                                    🇨🇴 +57
                                </span>
                                <input
                                    type="tel"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value)}
                                    placeholder="Ej: 3001234567"
                                    className={INPUT_CLASS + ' rounded-l-none'}
                                />
                            </div>
                        </div>

                        <fieldset>
                            <legend className="block text-sm text-zinc-600 dark:text-zinc-300 mb-2">¿Dónde creas contenido?</legend>
                            <div className="flex flex-col gap-2">
                                {REDES.map((red) => (
                                    <label
                                        key={red.valor}
                                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                                            redContenido === red.valor
                                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                                                : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-slate-900/60'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="red_contenido"
                                            value={red.valor}
                                            checked={redContenido === red.valor}
                                            onChange={(e) => setRedContenido(e.target.value)}
                                            className="w-4 h-4 accent-amber-500"
                                        />
                                        <span className="text-zinc-800 dark:text-white text-sm font-semibold">{red.etiqueta}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {error && (
                            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
                        )}

                        <button type="submit" disabled={enviando} className={BOTON_PRIMARIO_CLASS}>
                            {enviando ? 'Enviando...' : 'Registrarme como creador de contenido'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
