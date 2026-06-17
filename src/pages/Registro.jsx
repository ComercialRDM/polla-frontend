import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCuenta } from '../api';
import { guardarSesion } from '../utils/sesion';
import { obtenerDatosComprador, guardarDatosComprador } from '../utils/datosComprador';
import { MAX_EQUIPOS_FAVORITOS } from '../utils/equipos';
import SelectorEquipos from '../components/SelectorEquipos';
import AgendarCalendario from '../components/AgendarCalendario';
import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';

const PREMIOS_VISTAZO = [camisetaImg, gorraImg, balonImg, gafasImg];

const INPUT_CLASS = 'w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

function validarPassword(pw) {
    if (pw.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(pw)) return 'Debe incluir al menos una letra mayúscula.';
    if (!/[a-z]/.test(pw)) return 'Debe incluir al menos una letra minúscula.';
    if (!/[0-9]/.test(pw)) return 'Debe incluir al menos un número.';
    return null;
}

function IndicadorPassword({ password }) {
    const requisitos = [
        { ok: password.length >= 8, texto: 'Mínimo 8 caracteres' },
        { ok: /[A-Z]/.test(password), texto: 'Una mayúscula (A-Z)' },
        { ok: /[a-z]/.test(password), texto: 'Una minúscula (a-z)' },
        { ok: /[0-9]/.test(password), texto: 'Un número (0-9)' },
    ];
    if (!password) return null;
    return (
        <ul className="mt-1 flex flex-col gap-0.5">
            {requisitos.map(({ ok, texto }) => (
                <li key={texto} className={`text-xs flex items-center gap-1 ${ok ? 'text-green-500' : 'text-zinc-400'}`}>
                    <span>{ok ? '✓' : '○'}</span> {texto}
                </li>
            ))}
        </ul>
    );
}

export default function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [nombre, setNombre] = useState(() => obtenerDatosComprador().nombre || '');
    const [celular, setCelular] = useState(() => obtenerDatosComprador().celular || '');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [equipos, setEquipos] = useState([]);
    const [calendarioToken, setCalendarioToken] = useState(null);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [recordarDispositivo, setRecordarDispositivo] = useState(true);
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

        if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return; }
        if (!celular.trim() || celular.trim().length < 7) { setError('Ingresa un número de celular válido.'); return; }
        if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) { setError('Ingresa un correo electrónico válido.'); return; }
        const errPw = validarPassword(password);
        if (errPw) { setError(errPw); return; }
        if (password !== confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }
        if (!aceptaTerminos) { setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.'); return; }

        setPaso(2);
    }

    async function handleFinalizar() {
        setError('');
        setEnviando(true);
        try {
            const data = await registrarCuenta({
                nombre: nombre.trim(),
                celular: celular.trim(),
                correo: correo.trim(),
                password,
                equipos_favoritos: equipos,
            });

            if (data?.success) {
                guardarSesion(data.usuario, recordarDispositivo);
                guardarDatosComprador({ nombre: nombre.trim(), celular: celular.trim() });
                if (equipos.length > 0 && data.usuario?.calendario_token) {
                    setCalendarioToken(data.usuario.calendario_token);
                    setPaso(3);
                } else {
                    navigate('/');
                }
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
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                {paso === 1 && (
                    <div className="mb-6 text-center">
                        <h2 className="text-zinc-900 dark:text-white font-black text-lg mb-3">
                            🏆 ¡Regístrate y participa por estos premios!
                        </h2>
                        <div className="grid grid-cols-4 gap-2">
                            {PREMIOS_VISTAZO.map((img, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-950/60">
                                    <img src={img} alt="Premio" className="w-full h-16 object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">
                    {paso === 1 ? '¡Bienvenido! 🇨🇴' : paso === 2 ? 'Elige tus equipos favoritos' : '¡Listo! Un último paso'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    {paso === 1
                        ? 'Crea tu cuenta para participar en la Polla Mundialista de La Retoucherie.'
                        : paso === 2
                        ? `Selecciona hasta ${MAX_EQUIPOS_FAVORITOS} equipos para personalizar tu experiencia (opcional).`
                        : '¿Quieres agendar en tu calendario los partidos de tus equipos favoritos?'}
                </p>

                {paso === 1 ? (
                    <form onSubmit={handleContinuarPaso1} className="flex flex-col gap-4">

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre completo" className={INPUT_CLASS} />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                            <input type="tel" value={celular} onChange={(e) => setCelular(e.target.value)}
                                placeholder="Ej: 3001234567" className={INPUT_CLASS} />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Correo electrónico</label>
                            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                                placeholder="tucorreo@email.com" className={INPUT_CLASS} />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 8 caracteres" className={INPUT_CLASS} />
                            <IndicadorPassword password={password} />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Confirmar contraseña</label>
                            <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)}
                                placeholder="Repite tu contraseña" className={INPUT_CLASS} />
                        </div>

                        <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm cursor-pointer">
                            <input type="checkbox" checked={recordarDispositivo} onChange={(e) => setRecordarDispositivo(e.target.checked)}
                                className="accent-amber-400 w-4 h-4" />
                            Recordar este dispositivo
                        </label>

                        <label className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
                            <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)}
                                className="mt-0.5 accent-amber-400" />
                            <span>
                                Acepto los{' '}
                                <Link to="/terminos" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link>{' '}
                                y la{' '}
                                <Link to="/privacidad" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Política de Privacidad y Tratamiento de Datos Personales</Link>.
                            </span>
                        </label>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit"
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform">
                            Continuar
                        </button>

                        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/iniciar-sesion" className="text-amber-500 dark:text-amber-400 font-semibold underline">Inicia sesión</Link>
                        </p>
                    </form>
                ) : paso === 2 ? (
                    <div className="flex flex-col gap-4">
                        <SelectorEquipos seleccionados={equipos} onToggle={toggleEquipo} max={MAX_EQUIPOS_FAVORITOS} />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setPaso(1)}
                                className="flex-1 py-3 rounded-xl font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                                Atrás
                            </button>
                            <button type="button" onClick={handleFinalizar} disabled={enviando}
                                className="flex-1 py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60">
                                {enviando ? 'Guardando...' : 'Continuar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <AgendarCalendario calendarioToken={calendarioToken} />
                        <button type="button" onClick={() => navigate('/')}
                            className="w-full py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform">
                            Continuar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
