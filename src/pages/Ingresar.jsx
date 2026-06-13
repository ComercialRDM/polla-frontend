import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerPartidos, verificarAcceso } from '../api';

const WHATSAPP_NUMERO = '573000000000'; // TODO: reemplazar con el número real de La Retoucherie de Manuela

export default function Ingresar() {
    const navigate = useNavigate();
    const [partidoId, setPartidoId] = useState(null);
    const [contacto, setContacto] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [sinAcceso, setSinAcceso] = useState(false);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    const activos = data.partidos.filter((p) => p.estado === 'activo');
                    const lista = activos.length > 0 ? activos : data.partidos;
                    setPartidoId(lista[0]?.id ?? null);
                }
            })
            .catch(() => {});
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSinAcceso(false);

        if (!contacto.trim()) {
            setError('Ingresa tu correo o número de celular.');
            return;
        }
        if (!partidoId) {
            setError('No hay partidos disponibles en este momento.');
            return;
        }

        setCargando(true);
        try {
            const data = await verificarAcceso({ contacto: contacto.trim(), partido_id: partidoId });
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
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-400 text-sm hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-white mt-4 mb-1">Ingresar a la Polla</h1>
                <p className="text-zinc-400 text-sm mb-6">
                    Escribe el correo o celular con el que compraste tu bono.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        placeholder="Correo o número de celular"
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-xl font-bold text-zinc-950 text-center bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {cargando ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>

                {sinAcceso && (
                    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-center">
                        <p className="text-white font-semibold mb-2">No encontramos un bono activo 😕</p>
                        <p className="text-zinc-400 text-sm mb-4">
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
