import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCuenta, loginConGoogle, completarRegistroGoogle } from '../api';
import { guardarSesion } from '../utils/sesion';
import { obtenerDatosComprador, guardarDatosComprador } from '../utils/datosComprador';
import { MAX_EQUIPOS_FAVORITOS } from '../utils/equipos';
import SelectorEquipos from '../components/SelectorEquipos';
import GoogleButton from '../components/GoogleButton';

export default function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [celular, setCelular] = useState(() => obtenerDatosComprador().celular || '');
    const [nombre, setNombre] = useState(() => obtenerDatosComprador().nombre || '');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [equipos, setEquipos] = useState([]);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Flujo de registro con Google: si la cuenta no existe, se pide el
    // celular y se omiten los campos de contraseña.
    const [modoGoogle, setModoGoogle] = useState(false);
    const [googleCredential, setGoogleCredential] = useState(null);
    const [correoGoogle, setCorreoGoogle] = useState('');

    function toggleEquipo(equipo) {
        setEquipos((prev) => {
            if (prev.includes(equipo)) return prev.filter((e) => e !== equipo);
            if (prev.length >= MAX_EQUIPOS_FAVORITOS) return prev;
            return [...prev, equipo];
        });
    }

    async function handleCredencialGoogle(credential) {
        setError('');
        try {
            const data = await loginConGoogle(credential);
            if (data?.success && data?.usuario) {
                guardarSesion(data.usuario);
                navigate('/');
            } else if (data?.success && data?.nuevo) {
                setGoogleCredential(credential);
                setCorreoGoogle(data.datos?.correo || '');
                if (data.datos?.nombre) setNombre(data.datos.nombre);
                setModoGoogle(true);
            } else {
                setError(data?.error || 'No se pudo continuar con Google.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        }
    }

    function handleContinuarPaso1(e) {
        e.preventDefault();
        setError('');

        if (!celular.trim() || celular.trim().length < 7) {
            setError('Ingresa un número de celular válido.');
            return;
        }
        if (!modoGoogle) {
            if (!nombre.trim()) {
                setError('Ingresa tu nombre completo.');
                return;
            }
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (password !== confirmarPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }
        if (!aceptaTerminos) {
            setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
            return;
        }

        setPaso(2);
    }

    async function handleFinalizar() {
        setError('');
        setEnviando(true);
        try {
            const data = modoGoogle
                ? await completarRegistroGoogle({
                    credential: googleCredential,
                    celular: celular.trim(),
                    equipos_favoritos: equipos,
                })
                : await registrarCuenta({
                    celular: celular.trim(),
                    password,
                    nombre: nombre.trim(),
                    equipos_favoritos: equipos,
                });

            if (data?.success) {
                guardarSesion(data.usuario);
                guardarDatosComprador({ nombre: nombre.trim(), celular: celular.trim() });
                navigate('/');
            } else {
                setError(data?.error || 'No se pudo completar el registro.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
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
                <h1 className="text-2xl font-extrabold text-white mb-1">
                    {paso === 1 ? '¡Bienvenido! 🇨🇴' : 'Elige tus equipos favoritos'}
                </h1>
                <p className="text-zinc-400 text-sm mb-6">
                    {paso === 1
                        ? 'Crea tu cuenta para participar en la Polla Mundialista de La Retoucherie.'
                        : `Selecciona hasta ${MAX_EQUIPOS_FAVORITOS} equipos para personalizar tu experiencia (opcional).`}
                </p>

                {paso === 1 ? (
                    <form onSubmit={handleContinuarPaso1} className="flex flex-col gap-4">
                        {!modoGoogle && (
                            <>
                                <GoogleButton onCredential={handleCredencialGoogle} />

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-zinc-500 text-xs uppercase">o</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>
                            </>
                        )}

                        {modoGoogle && (
                            <p className="text-zinc-400 text-sm">
                                Continuando con tu cuenta de Google{correoGoogle ? ` (${correoGoogle})` : ''}. Solo falta tu celular.
                            </p>
                        )}

                        <div>
                            <label className="block text-sm text-zinc-300 mb-1">Número de celular</label>
                            <input
                                type="tel"
                                value={celular}
                                onChange={(e) => setCelular(e.target.value)}
                                placeholder="Ej: 3001234567"
                                className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        {!modoGoogle && (
                        <>
                        <div>
                            <label className="block text-sm text-zinc-300 mb-1">Nombre completo</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-1">Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                className="w-full rounded-lg bg-slate-900/60 backdrop-blur-lg border border-white/10 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        </>
                        )}

                        <label className="flex items-start gap-2 text-zinc-400 text-xs">
                            <input
                                type="checkbox"
                                checked={aceptaTerminos}
                                onChange={(e) => setAceptaTerminos(e.target.checked)}
                                className="mt-0.5 accent-amber-400"
                            />
                            <span>
                                Acepto los{' '}
                                <Link to="/terminos" target="_blank" className="text-amber-400 underline">
                                    Términos y Condiciones
                                </Link>{' '}
                                y la{' '}
                                <Link to="/privacidad" target="_blank" className="text-amber-400 underline">
                                    Política de Privacidad y Tratamiento de Datos Personales
                                </Link>
                                .
                            </span>
                        </label>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
                        >
                            Continuar
                        </button>

                        <p className="text-center text-zinc-400 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/iniciar-sesion" className="text-amber-400 font-semibold underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </form>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SelectorEquipos seleccionados={equipos} onToggle={toggleEquipo} max={MAX_EQUIPOS_FAVORITOS} />

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                className="flex-1 py-3 rounded-xl font-bold text-white text-center border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalizar}
                                disabled={enviando}
                                className="flex-1 py-3 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                            >
                                {enviando ? 'Guardando...' : 'Continuar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
