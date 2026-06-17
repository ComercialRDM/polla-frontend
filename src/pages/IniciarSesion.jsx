import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../api';
import { guardarSesion } from '../utils/sesion';
import BiometriaLogin from '../components/BiometriaLogin';
import logoCopaFifa from '../assets/Logo_Copa_Fifa.webp';

export default function IniciarSesion() {
    const navigate = useNavigate();
    const [celular, setCelular] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [sinCuenta, setSinCuenta] = useState(false);
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSinCuenta(false);

        if (!celular.trim() || !password) {
            setError('Ingresa tu celular y contraseña.');
            return;
        }

        setCargando(true);
        try {
            const data = await iniciarSesion({ celular: celular.trim(), password });
            if (data?.success) {
                guardarSesion(data.usuario);
                navigate('/');
            } else if (data?.error?.includes('No encontramos')) {
                setSinCuenta(true);
            } else {
                setError(data?.error || 'No se pudo iniciar sesión.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center overflow-hidden">
            <img src={logoCopaFifa} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain opacity-[0.13] pointer-events-none select-none scale-110" />
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="relative z-10 w-full max-w-md mt-6">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Inicia sesión</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    Ingresa con tu número de celular y tu contraseña.
                </p>

                <BiometriaLogin onExito={() => navigate('/')} />

                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                    <span className="text-zinc-400 dark:text-zinc-500 text-xs uppercase">o</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                        <input
                            type="tel"
                            value={celular}
                            onChange={(e) => setCelular(e.target.value)}
                            placeholder="Ej: 3001234567"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tu contraseña"
                            className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" className="text-amber-500 dark:text-amber-400 font-semibold underline">
                            Regístrate
                        </Link>
                    </p>

                    <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                        <Link to="/recuperar-password" className="text-amber-500 dark:text-amber-400 font-semibold underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </p>
                </form>

                {sinCuenta && (
                    <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.12)] backdrop-blur-lg p-5 text-center">
                        <p className="text-zinc-900 dark:text-white font-semibold mb-2">No encontramos una cuenta con este celular 😕</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                            Si ya compraste tu bono antes, crea tu contraseña para activar tu cuenta.
                        </p>
                        <Link
                            to="/registro"
                            className="inline-block w-full py-3 rounded-xl font-bold text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500"
                        >
                            Crear contraseña / Registrarme
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
