import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { solicitarResetPassword, restablecerPassword } from '../api';

const INPUT_CLASS = 'w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

export default function RecuperarPassword() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [celular, setCelular] = useState('');
    const [metodo, setMetodo] = useState(null); // 'whatsapp' | 'correo'
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    async function handleSolicitarCodigo(metodoElegido) {
        setError('');
        if (!celular.trim() || celular.trim().length < 7) {
            setError('Ingresa un número de celular válido.');
            return;
        }

        setMetodo(metodoElegido);
        setCargando(metodoElegido);
        try {
            const data = await solicitarResetPassword({ celular: celular.trim(), metodo: metodoElegido });
            if (data?.success) {
                const destino = metodoElegido === 'correo'
                    ? 'tu correo electrónico'
                    : 'tu WhatsApp';
                setMensaje(`Te enviamos un código a ${destino}. Revísalo e ingrésalo abajo.`);
                setPaso(2);
            } else {
                setError(data?.error || 'No se pudo enviar el código.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    }

    async function handleRestablecer(e) {
        e.preventDefault();
        setError('');

        if (!codigo.trim()) {
            setError('Ingresa el código que te enviamos.');
            return;
        }
        if (nuevaPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (nuevaPassword !== confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);
        try {
            const data = await restablecerPassword({
                celular: celular.trim(),
                codigo: codigo.trim(),
                nueva_password: nuevaPassword,
            });
            if (data?.success) {
                navigate('/iniciar-sesion');
            } else {
                setError(data?.error || 'No se pudo reestablecer la contraseña.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
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
                <Link to="/iniciar-sesion" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">Recuperar contraseña</h1>

                {paso === 1 ? (
                    <>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            Ingresa tu celular y elige cómo recibir el código de verificación.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                                <input
                                    type="tel"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value)}
                                    placeholder="Ej: 3001234567"
                                    className={INPUT_CLASS}
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 -mb-1">
                                ¿Cómo quieres recibir el código?
                            </p>

                            <button
                                type="button"
                                disabled={!!cargando}
                                onClick={() => handleSolicitarCodigo('whatsapp')}
                                className="w-full py-4 rounded-xl font-black text-white text-center bg-green-600 hover:bg-green-700 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {cargando === 'whatsapp' ? 'Enviando...' : '💬 Enviar por WhatsApp'}
                            </button>

                            <button
                                type="button"
                                disabled={!!cargando}
                                onClick={() => handleSolicitarCodigo('correo')}
                                className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {cargando === 'correo' ? 'Enviando...' : '📧 Enviar por correo electrónico'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            Ingresa el código que recibiste y tu nueva contraseña.
                        </p>

                        <form onSubmit={handleRestablecer} className="flex flex-col gap-4">
                            {mensaje && <p className="text-green-500 dark:text-green-400 text-sm">{mensaje}</p>}

                            <div>
                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Código de verificación</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    className={INPUT_CLASS + ' text-center text-2xl font-scoreboard tracking-widest'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nueva contraseña</label>
                                <input
                                    type="password"
                                    value={nuevaPassword}
                                    onChange={(e) => setNuevaPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    value={confirmarPassword}
                                    onChange={(e) => setConfirmarPassword(e.target.value)}
                                    placeholder="Repite tu contraseña"
                                    className={INPUT_CLASS}
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button
                                type="submit"
                                disabled={!!cargando}
                                className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                            >
                                {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setPaso(1); setMensaje(''); setError(''); setCodigo(''); }}
                                className="text-center text-zinc-500 dark:text-zinc-400 text-sm underline"
                            >
                                ¿No te llegó? Volver a enviar
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
