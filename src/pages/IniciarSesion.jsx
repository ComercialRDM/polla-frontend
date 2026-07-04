import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarCodigoTelefono, verificarCodigoTelefono } from '../api';
import { guardarSesion } from '../utils/sesion';
import BiometriaLogin from '../components/BiometriaLogin';
import logoCopaFifa from '../assets/Logo_Copa_Fifa.webp';

const REENVIO_SEGUNDOS = 60;

export default function IniciarSesion() {
    const navigate = useNavigate();
    const [celular, setCelular] = useState('');
    const [codigo, setCodigo] = useState('');
    const [paso, setPaso] = useState(1);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [segundos, setSegundos] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (segundos <= 0) return;
        timerRef.current = setTimeout(() => setSegundos((s) => s - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [segundos]);

    async function handleEnviarCodigo(e) {
        e.preventDefault();
        setError('');
        const cel = celular.replace(/[^0-9]/g, '');
        if (cel.length !== 10) {
            setError('Ingresa los 10 dígitos de tu celular colombiano.');
            return;
        }
        setEnviando(true);
        try {
            const data = await solicitarCodigoTelefono(cel);
            if (data?.success) {
                setPaso(2);
                setSegundos(REENVIO_SEGUNDOS);
            } else {
                setError(data?.error || 'No se pudo enviar el código.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
        }
    }

    async function handleVerificarCodigo(e) {
        e.preventDefault();
        setError('');
        if (codigo.length !== 6) {
            setError('El código tiene 6 dígitos.');
            return;
        }
        setEnviando(true);
        try {
            const cel = celular.replace(/[^0-9]/g, '');
            const data = await verificarCodigoTelefono({ celular: cel, codigo });
            if (data?.success && !data.nuevo) {
                guardarSesion({ ...data.usuario, token: data.token });
                const tokenAcceso = data.token_acceso || localStorage.getItem('polla_token_acceso');
                navigate(tokenAcceso ? `/polla?token=${tokenAcceso}` : '/landing');
            } else if (data?.success && data.nuevo) {
                navigate('/registro');
            } else {
                setError(data?.error || 'Código incorrecto o vencido.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
        }
    }

    async function handleReenviar() {
        setError('');
        const cel = celular.replace(/[^0-9]/g, '');
        setEnviando(true);
        try {
            const data = await solicitarCodigoTelefono(cel);
            if (data?.success) setSegundos(REENVIO_SEGUNDOS);
            else setError(data?.error || 'No se pudo reenviar el código.');
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setEnviando(false);
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
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">
                    {paso === 1 ? 'Inicia sesión' : 'Ingresa el código'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    {paso === 1
                        ? 'Te enviaremos un código por SMS para verificar tu identidad.'
                        : `Enviamos un SMS al +57 ${celular}. Ingresa el código de 6 dígitos.`}
                </p>

                <BiometriaLogin onExito={() => {
                    const tokenAcceso = localStorage.getItem('polla_token_acceso');
                    navigate(tokenAcceso ? '/polla' : '/landing');
                }} />

                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                    <span className="text-zinc-400 dark:text-zinc-500 text-xs uppercase">o continúa con SMS</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                </div>

                {paso === 1 ? (
                    <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Número de celular</label>
                            <div className="flex">
                                <span className="flex items-center gap-1 rounded-l-lg border border-r-0 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 text-zinc-600 dark:text-zinc-300 text-sm font-semibold select-none whitespace-nowrap">
                                    🇨🇴 +57
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                    placeholder="3001234567"
                                    className="flex-1 rounded-r-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={enviando || celular.replace(/[^0-9]/g, '').length !== 10}
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                        >
                            {enviando ? 'Enviando código...' : 'Enviar código por SMS'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerificarCodigo} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Código de 6 dígitos</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="123456"
                                className="w-full rounded-lg bg-zinc-50 dark:bg-slate-900/60 backdrop-blur-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-2xl tracking-[0.4em] font-mono"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={enviando || codigo.length !== 6}
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                        >
                            {enviando ? 'Verificando...' : 'Verificar e ingresar'}
                        </button>

                        <div className="text-center">
                            {segundos > 0 ? (
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                                    Reenviar código en <span className="font-bold text-zinc-900 dark:text-white">{segundos}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleReenviar}
                                    disabled={enviando}
                                    className="text-amber-500 dark:text-amber-400 text-sm font-semibold underline disabled:opacity-60"
                                >
                                    Reenviar código por SMS
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => { setPaso(1); setCodigo(''); setError(''); }}
                            className="text-center text-zinc-500 dark:text-zinc-400 text-sm underline"
                        >
                            Cambiar número
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
