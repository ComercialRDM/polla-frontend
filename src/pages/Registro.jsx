import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    registrarCuenta, obtenerDatosRegistroPorToken, loginConGoogle, completarRegistroGoogle,
    solicitarCodigoTelefono, verificarCodigoTelefono, completarRegistroTelefono,
} from '../api';
import { guardarSesion } from '../utils/sesion';
import { obtenerDatosComprador, guardarDatosComprador } from '../utils/datosComprador';
import { MAX_EQUIPOS_FAVORITOS } from '../utils/equipos';
import SelectorEquipos from '../components/SelectorEquipos';
import AgendarCalendario from '../components/AgendarCalendario';
import GoogleButton from '../components/GoogleButton';
import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';

const PREMIOS_VISTAZO = [camisetaImg, gorraImg, balonImg, gafasImg];

const INPUT_CLASS = 'w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400';
const BOTON_PRIMARIO_CLASS = 'w-full py-4 rounded-full font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60';
const BOTON_PILL_CLASS = 'w-full py-3.5 rounded-full border border-zinc-300 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60';
const TEXTO_BLOQUEADO = 'Este dato ya quedó confirmado y no se puede editar.';

function validarPassword(pw) {
    if (pw.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(pw)) return 'Debe incluir al menos una letra mayúscula.';
    if (!/[a-z]/.test(pw)) return 'Debe incluir al menos una letra minúscula.';
    if (!/[0-9]/.test(pw)) return 'Debe incluir al menos un número.';
    return null;
}

function OjoIcon({ visible }) {
    return visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function CampoPassword({ label, value, onChange, placeholder }) {
    const [mostrar, setMostrar] = useState(false);
    return (
        <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={mostrar ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={INPUT_CLASS + ' pr-11'}
                />
                <button
                    type="button"
                    onClick={() => setMostrar((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    tabIndex={-1}
                >
                    <OjoIcon visible={mostrar} />
                </button>
            </div>
        </div>
    );
}

function CampoCelular({ value, onChange, disabled }) {
    return (
        <div className="flex">
            <span className="flex items-center gap-1 rounded-l-lg border border-r-0 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 text-zinc-600 dark:text-zinc-300 text-sm font-semibold select-none">
                🇨🇴 +57
            </span>
            <input
                type="tel"
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder="Ej: 3001234567"
                className={INPUT_CLASS + ' rounded-l-none' + (disabled ? ' opacity-60 cursor-not-allowed' : '')}
            />
        </div>
    );
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
    const [searchParams] = useSearchParams();
    const tokenCompra = searchParams.get('token');
    const [paso, setPaso] = useState(1);
    const [metodo, setMetodo] = useState(null);
    const [correoConfirmado, setCorreoConfirmado] = useState(false);
    const [googleCredential, setGoogleCredential] = useState(null);

    const [mostrarFormTelefono, setMostrarFormTelefono] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoTelefono, setCodigoTelefono] = useState('');
    const [telefonoNuevo, setTelefonoNuevo] = useState(false);
    const [registroTokenTelefono, setRegistroTokenTelefono] = useState(null);
    const [celularTelefono, setCelularTelefono] = useState(() => obtenerDatosComprador().celular || '');

    const [nombre, setNombre] = useState(() => obtenerDatosComprador().nombre || '');
    const [celular, setCelular] = useState(() => obtenerDatosComprador().celular || '');
    const [correo, setCorreo] = useState('');
    const [datosBloqueados, setDatosBloqueados] = useState(false);
    const [yaRegistrado, setYaRegistrado] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [equipos, setEquipos] = useState([]);
    const [calendarioToken, setCalendarioToken] = useState(null);
    const [mayorDeEdad, setMayorDeEdad] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [recordarDispositivo, setRecordarDispositivo] = useState(true);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!tokenCompra) return;
        obtenerDatosRegistroPorToken(tokenCompra)
            .then((data) => {
                if (!data?.encontrado) return;
                setNombre((prev) => prev || data.nombre || '');
                setCelular(data.celular || '');
                setCelularTelefono(data.celular || '');
                setCorreo(data.correo || '');
                setCorreoConfirmado(!!data.correo);
                setDatosBloqueados(true);
                setYaRegistrado(!!data.ya_registrado);
            })
            .catch(() => {});
    }, [tokenCompra]);

    function toggleEquipo(equipo) {
        setEquipos((prev) => {
            if (prev.includes(equipo)) return prev.filter((e) => e !== equipo);
            if (prev.length >= MAX_EQUIPOS_FAVORITOS) return prev;
            return [...prev, equipo];
        });
    }

    async function handleGoogleCredential(credential) {
        setError('');
        setEnviando(true);
        try {
            const data = await loginConGoogle(credential);
            if (data?.success && !data.nuevo) {
                guardarSesion(data.usuario, recordarDispositivo);
                navigate('/');
                return;
            }
            if (data?.success && data.nuevo) {
                setGoogleCredential(credential);
                setNombre((prev) => prev || data.datos?.nombre || '');
                setCorreo((prev) => prev || data.datos?.correo || '');
                setMetodo('google');
                setPaso(2);
                return;
            }
            setError(data?.error || 'No se pudo continuar con Google.');
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
        }
    }

    async function handleEnviarCodigoTelefono(e) {
        e.preventDefault();
        setError('');
        if (!celularTelefono.trim() || celularTelefono.trim().length < 7) {
            setError('Ingresa un número de celular válido.');
            return;
        }
        setEnviando(true);
        try {
            const data = await solicitarCodigoTelefono(celularTelefono.trim());
            if (data?.success) {
                setCodigoEnviado(true);
            } else {
                setError(data?.error || 'No se pudo enviar el código.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
        }
    }

    async function handleVerificarCodigoTelefono(e) {
        e.preventDefault();
        setError('');
        if (!codigoTelefono.trim()) { setError('Ingresa el código que te llegó por WhatsApp.'); return; }

        setEnviando(true);
        try {
            const data = await verificarCodigoTelefono({ celular: celularTelefono.trim(), codigo: codigoTelefono.trim() });
            if (data?.success && !data.nuevo) {
                guardarSesion(data.usuario, recordarDispositivo);
                navigate('/');
                return;
            }
            if (data?.success && data.nuevo) {
                setRegistroTokenTelefono(data.registro_token);
                setTelefonoNuevo(true);
                return;
            }
            setError(data?.error || 'Código incorrecto.');
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
        }
    }

    function handleContinuarTelefono(e) {
        e.preventDefault();
        setError('');
        if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return; }

        setCelular(celularTelefono.trim());
        setMetodo('telefono');
        setDatosBloqueados(true);
        setPaso(2);
    }

    function handleContinuarCorreo(e) {
        e.preventDefault();
        setError('');
        if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
            setError('Ingresa un correo electrónico válido.');
            return;
        }
        setCorreoConfirmado(true);
    }

    function handleContinuarPassword(e) {
        e.preventDefault();
        setError('');

        if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return; }
        const errPw = validarPassword(password);
        if (errPw) { setError(errPw); return; }
        if (password !== confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }

        setMetodo('password');
        setPaso(2);
    }

    function handleContinuarCelular(e) {
        e.preventDefault();
        setError('');

        if (!celular.trim() || celular.trim().length < 7) { setError('Ingresa un número de celular válido.'); return; }
        if (!mayorDeEdad) { setError('Debes confirmar que eres mayor de 18 años de edad.'); return; }
        if (!aceptaTerminos) { setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.'); return; }

        setPaso(3);
    }

    async function handleFinalizar() {
        setError('');
        setEnviando(true);
        try {
            const data = metodo === 'google'
                ? await completarRegistroGoogle({ credential: googleCredential, celular: celular.trim(), equipos_favoritos: equipos })
                : metodo === 'telefono'
                ? await completarRegistroTelefono({
                    celular: celular.trim(),
                    registro_token: registroTokenTelefono,
                    nombre: nombre.trim(),
                    equipos_favoritos: equipos,
                })
                : await registrarCuenta({
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
                    setPaso(4);
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

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1 text-center">
                    {paso === 1 ? 'Inicia sesión o regístrate' : paso === 2 ? 'Un dato más' : paso === 3 ? 'Elige tus equipos favoritos' : '¡Listo! Un último paso'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 text-center">
                    {paso === 1
                        ? 'Participa en la Polla Mundialista de La Retoucherie y gana premios increíbles.'
                        : paso === 2
                        ? 'Ingresa tu número de celular para terminar tu registro.'
                        : paso === 3
                        ? `Selecciona hasta ${MAX_EQUIPOS_FAVORITOS} equipos para personalizar tu experiencia (opcional).`
                        : '¿Quieres agendar en tu calendario los partidos de tus equipos favoritos?'}
                </p>

                {paso === 1 ? (
                    yaRegistrado ? (
                        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2">
                            Ya tienes una cuenta con estos datos.{' '}
                            <Link to="/iniciar-sesion" className="underline font-semibold">Inicia sesión</Link>
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <GoogleButton onCredential={handleGoogleCredential} />

                            {!mostrarFormTelefono ? (
                                <button type="button" onClick={() => setMostrarFormTelefono(true)} className={BOTON_PILL_CLASS}>
                                    📱 Continuar con teléfono
                                </button>
                            ) : !telefonoNuevo ? (
                                <form onSubmit={codigoEnviado ? handleVerificarCodigoTelefono : handleEnviarCodigoTelefono} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 p-4">
                                    <div>
                                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                                        <CampoCelular value={celularTelefono} onChange={(e) => setCelularTelefono(e.target.value)} disabled={codigoEnviado} />
                                    </div>

                                    {codigoEnviado && (
                                        <div>
                                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Código que te llegó por WhatsApp</label>
                                            <input type="text" inputMode="numeric" value={codigoTelefono} onChange={(e) => setCodigoTelefono(e.target.value)}
                                                placeholder="Ej: 123456" className={INPUT_CLASS} />
                                        </div>
                                    )}

                                    {error && <p className="text-red-400 text-sm">{error}</p>}

                                    <button type="submit" disabled={enviando} className={BOTON_PRIMARIO_CLASS + ' py-3'}>
                                        {enviando ? 'Enviando...' : codigoEnviado ? 'Verificar código' : 'Enviar código por WhatsApp'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleContinuarTelefono} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 p-4">
                                    <p className="text-sm text-green-500 font-semibold">✓ Celular verificado</p>
                                    <div>
                                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Tu nombre completo" className={INPUT_CLASS} />
                                    </div>
                                    {error && <p className="text-red-400 text-sm">{error}</p>}
                                    <button type="submit" className={BOTON_PRIMARIO_CLASS + ' py-3'}>
                                        Continuar
                                    </button>
                                </form>
                            )}

                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                                <span className="text-zinc-400 dark:text-zinc-500 text-xs uppercase">o</span>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                            </div>

                            <form onSubmit={correoConfirmado ? handleContinuarPassword : handleContinuarCorreo} className="flex flex-col gap-4">
                                <div>
                                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                                        disabled={correoConfirmado}
                                        placeholder="Dirección de correo electrónico" className={INPUT_CLASS + ' rounded-full' + (correoConfirmado ? ' opacity-60 cursor-not-allowed' : '')} />
                                    {correoConfirmado && datosBloqueados && (
                                        <p className="text-xs text-zinc-400 mt-1">{TEXTO_BLOQUEADO}</p>
                                    )}
                                </div>

                                {correoConfirmado && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Nombre completo</label>
                                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Tu nombre completo" className={INPUT_CLASS} />
                                        </div>

                                        <div>
                                            <CampoPassword
                                                label="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Mínimo 8 caracteres"
                                            />
                                            <IndicadorPassword password={password} />
                                        </div>

                                        <CampoPassword
                                            label="Confirmar contraseña"
                                            value={confirmarPassword}
                                            onChange={(e) => setConfirmarPassword(e.target.value)}
                                            placeholder="Repite tu contraseña"
                                        />
                                    </>
                                )}

                                {error && <p className="text-red-400 text-sm">{error}</p>}

                                <button type="submit" className={BOTON_PRIMARIO_CLASS}>
                                    Continuar
                                </button>
                            </form>

                            <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/iniciar-sesion" className="text-amber-500 dark:text-amber-400 font-semibold underline">Inicia sesión</Link>
                            </p>
                        </div>
                    )
                ) : paso === 2 ? (
                    <form onSubmit={handleContinuarCelular} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                            <CampoCelular value={celular} onChange={(e) => setCelular(e.target.value)} disabled={datosBloqueados} />
                            {datosBloqueados && (
                                <p className="text-xs text-zinc-400 mt-1">{TEXTO_BLOQUEADO}</p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm cursor-pointer">
                            <input type="checkbox" checked={recordarDispositivo} onChange={(e) => setRecordarDispositivo(e.target.checked)}
                                className="accent-amber-400 w-4 h-4" />
                            Recordar este dispositivo
                        </label>

                        <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm cursor-pointer">
                            <input type="checkbox" checked={mayorDeEdad} onChange={(e) => setMayorDeEdad(e.target.checked)}
                                className="accent-amber-400 w-4 h-4" />
                            Confirmo que soy mayor de 18 años de edad
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

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setPaso(1)}
                                className="flex-1 py-3 rounded-xl font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                                Atrás
                            </button>
                            <button type="submit"
                                className="flex-1 py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform">
                                Continuar
                            </button>
                        </div>
                    </form>
                ) : paso === 3 ? (
                    <div className="flex flex-col gap-4">
                        <SelectorEquipos seleccionados={equipos} onToggle={toggleEquipo} max={MAX_EQUIPOS_FAVORITOS} />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setPaso(2)}
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
