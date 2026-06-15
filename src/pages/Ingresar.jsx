import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { verificarAcceso } from '../api';

const WHATSAPP_NUMERO = '573000000000'; // TODO: reemplazar con el número real de La Retoucherie de Manuela

export default function Ingresar() {
    const navigate = useNavigate();
    const [contacto, setContacto] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [sinAcceso, setSinAcceso] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSinAcceso(false);

        if (!contacto.trim()) {
            setError('Ingresa tu correo o número de celular.');
            return;
        }

        setCargando(true);
        try {
            const data = await verificarAcceso({ contacto: contacto.trim() });
            if (data?.acceso) {
                navigate(`/polla?token=${data.token_acceso}`);
            } else {
                setSinAcceso(true);
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            setCargando(false);
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

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">Ingresar a la Polla</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    Escribe el correo o celular con el que compraste tu bono.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        placeholder="Correo o número de celular"
                        className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {cargando ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>

                {sinAcceso && (
                    <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.12)] backdrop-blur-lg p-5 text-center">
                        <p className="text-zinc-900 dark:text-white font-semibold mb-2">No encontramos un bono activo 😕</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                            Si ya pagaste, espera unos minutos a que se confirme tu pago, o escríbenos por WhatsApp y te ayudamos.
                        </p>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Hola, compré mi bono para la Polla Mundialista y no me deja ingresar 🙋')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            Escribir por WhatsApp
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
