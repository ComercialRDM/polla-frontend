import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    obtenerDatosRegistroPorToken,
    solicitarCodigoTelefono, verificarCodigoTelefono, completarRegistroTelefono,
} from '../api';
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
const BOTON_PRIMARIO_CLASS = 'w-full py-4 rounded-full font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60';
const BOTON_PILL_CLASS = 'w-full py-3.5 rounded-full border border-zinc-300 dark:border-white/15 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60';
const TEXTO_BLOQUEADO = 'Este dato ya quedó confirmado y no se puede editar.';

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

export default function Registro() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenCompra = searchParams.get('token');
    const [paso, setPaso] = useState(1);
    const [metodo, setMetodo] = useState(null);

    const [mostrarFormTelefono] = useState(true);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoTelefono, setCodigoTelefono] = useState('');
    const [telefonoNuevo, setTelefonoNuevo] = useState(false);
    const [registroTokenTelefono, setRegistroTokenTelefono] = useState(null);
    const [celularTelefono, setCelularTelefono] = useState(() => obtenerDatosComprador().celular || '');

    const [nombre, setNombre] = useState(() => obtenerDatosComprador().nombre || '');
    const [celular, setCelular] = useState(() => obtenerDatosComprador().celular || '');
    const [datosBloqueados, setDatosBloqueados] = useState(false);
    const [yaRegistrado, setYaRegistrado] = useState(false);
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

    async function handleEnviarCodigoTelefono(e) {
        e.preventDefault();
        setError('');
        if (!aceptaTerminos) { setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.'); return; }
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
        if (!codigoTelefono.trim()) { setError('Ingresa el código que te llegó por SMS.'); return; }

        setEnviando(true);
        try {
            const data = await verificarCodigoTelefono({ celular: celularTelefono.trim(), codigo: codigoTelefono.trim() });
            if (data?.success && !data.nuevo) {
                guardarSesion({ ...data.usuario, token: data.token }, recordarDispositivo);
                navigate(localStorage.getItem('polla_token_acceso') ? '/polla' : '/landing');
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
        if (!aceptaTerminos) { setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.'); return; }
        if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return; }

        setCelular(celularTelefono.trim());
        setMetodo('telefono');
        setDatosBloqueados(true);
        setPaso(2);
    }

    function handleContinuarCelular(e) {
        e.preventDefault();
        setError('');

        if (!celular.trim() || celular.trim().length < 7) { setError('Ingresa un número de celular válido.'); return; }
        if (!mayorDeEdad) { setError('Debes confirmar que eres mayor de 18 años de edad.'); return; }

        setPaso(3);
    }

    async function handleFinalizar() {
        setError('');
        setEnviando(true);
        try {
            const data = await completarRegistroTelefono({
                    celular: celular.trim(),
                    registro_token: registroTokenTelefono,
                    nombre: nombre.trim(),
                    equipos_favoritos: equipos,
                });

            if (data?.success) {
                guardarSesion({ ...data.usuario, token: data.token }, recordarDispositivo);
                guardarDatosComprador({ nombre: nombre.trim(), celular: celular.trim() });

                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'sign_up', { method: 'telefono' });
                }
                if (typeof window.fbq === 'function') {
                    window.fbq('track', 'CompleteRegistration');
                }

                if (equipos.length > 0 && data.usuario?.calendario_token) {
                    setCalendarioToken(data.usuario.calendario_token);
                    setPaso(4);
                } else {
                    navigate('/landing');
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
                            <label className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400 text-xs px-1">
                                <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)}
                                    className="mt-0.5 accent-amber-400" />
                                <span>
                                    Acepto los{' '}
                                    <Link to="/terminos" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link>{' '}
                                    y la{' '}
                                    <Link to="/privacidad" target="_blank" className="text-amber-500 dark:text-amber-400 underline">Política de Privacidad y Tratamiento de Datos Personales</Link>.
                                </span>
                            </label>

                            {!telefonoNuevo ? (
                                <form onSubmit={codigoEnviado ? handleVerificarCodigoTelefono : handleEnviarCodigoTelefono} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 p-4">
                                    <div>
                                        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                                        <CampoCelular value={celularTelefono} onChange={(e) => setCelularTelefono(e.target.value)} disabled={codigoEnviado} />
                                    </div>

                                    {codigoEnviado && (
                                        <div>
                                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Código que te llegó por SMS</label>
                                            <input type="text" inputMode="numeric" autoComplete="one-time-code" value={codigoTelefono} onChange={(e) => setCodigoTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                placeholder="123456" className={INPUT_CLASS + ' text-center text-xl tracking-[0.3em] font-mono'} />
                                        </div>
                                    )}

                                    {error && <p className="text-red-400 text-sm">{error}</p>}

                                    <button type="submit" disabled={enviando} className={BOTON_PRIMARIO_CLASS + ' py-3'}>
                                        {enviando ? 'Enviando...' : codigoEnviado ? 'Verificar código' : 'Enviar código por SMS'}
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
                        <button type="button" onClick={() => navigate('/landing')}
                            className="w-full py-3 rounded-xl font-black text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform">
                            Continuar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
