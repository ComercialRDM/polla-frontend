import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCuenta } from '../api';
import { guardarSesion } from '../utils/sesion';
import { MAX_EQUIPOS_FAVORITOS } from '../utils/equipos';
import SelectorEquipos from '../components/SelectorEquipos';

export default function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [celular, setCelular] = useState('');
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [equipos, setEquipos] = useState([]);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    function toggleEquipo(equipo) {
        setEquipos((prev) => {
            if (prev.includes(equipo)) return prev.filter((e) => e !== equipo);
            if (prev.length >= MAX_EQUIPOS_FAVORITOS) return prev;
            return [...prev, equipo];
        });
    }

    function handleContinuarPaso1(e) {
        e.preventDefault();
        setError('');

        if (!celular.trim() || celular.trim().length < 7) {
            setError('Ingresa un número de celular válido.');
            return;
        }
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

        setPaso(2);
    }

    async function handleFinalizar() {
        setError('');
        setEnviando(true);
        try {
            const data = await registrarCuenta({
                celular: celular.trim(),
                password,
                nombre: nombre.trim(),
                equipos_favoritos: equipos,
            });

            if (data?.success) {
                guardarSesion(data.usuario);
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
