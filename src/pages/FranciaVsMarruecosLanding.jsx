import { useEffect, useRef, useState } from 'react';
import { obtenerPartidos, solicitarCodigoTelefono, verificarCodigoTelefono, solicitarCodigoCorreo, verificarCodigoCorreo } from '../api';
import Bandera from '../components/Bandera';
import CompartirPronostico from '../components/CompartirPronostico';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const CIERRE_MS = 10 * 60 * 1000;

function incluye(str, sub) {
    return (str || '').toLowerCase().includes(sub.toLowerCase());
}

function esFranciaMarruecos(p) {
    const loc = p.equipo_local || '';
    const vis = p.equipo_visitante || '';
    const esFrancia = (s) => incluye(s, 'france') || incluye(s, 'francia') || (s || '').toLowerCase() === 'fra';
    const esMarruecos = (s) => incluye(s, 'maroc') || incluye(s, 'marruecos') || incluye(s, 'morocco') || (s || '').toLowerCase() === 'mar';
    return (esFrancia(loc) && esMarruecos(vis)) || (esMarruecos(loc) && esFrancia(vis));
}

function formatHora(iso) {
    return new Date(iso).toLocaleString('es-CO', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
    });
}

function GolInput({ value, onChange }) {
    return (
        <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            max="20"
            placeholder=""
            value={value}
            onChange={e => {
                const v = e.target.value;
                if (v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 20)) {
                    onChange(v);
                }
            }}
            className="w-full mt-1 rounded-xl bg-zinc-800 border border-white/10 text-white font-black text-3xl text-center py-3 focus:outline-none focus:ring-2 focus:ring-[#FCD116] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
    );
}

function OtpAcceso({ celular, tokenAcceso }) {
    const [paso, setPaso] = useState('iniciando');
    const [codigo, setCodigo] = useState('');
    const [correo, setCorreo] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [segundos, setSegundos] = useState(0);
    const [finalToken, setFinalToken] = useState(tokenAcceso);
    const iniciado = useRef(false);

    useEffect(() => {
        if (iniciado.current) return;
        iniciado.current = true;
        const cel = celular.replace(/[^0-9]/g, '');
        if (!cel) { setPaso('correo_input'); return; }
        solicitarCodigoTelefono(cel)
            .then(data => { if (data?.success) { setPaso('codigo_sms'); setSegundos(60); } else setPaso('correo_input'); })
            .catch(() => setPaso('correo_input'));
    }, []);

    useEffect(() => {
        if (segundos <= 0) return;
        const t = setTimeout(() => setSegundos(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [segundos]);

    async function verificarSms(e) {
        e.preventDefault();
        if (codigo.length !== 6) return setError('El código tiene 6 dígitos.');
        setError(''); setEnviando(true);
        try {
            const data = await verificarCodigoTelefono({ celular: celular.replace(/[^0-9]/g, ''), codigo });
            if (data?.success) {
                const tok = data.token_acceso || tokenAcceso;
                if (tok) localStorage.setItem('polla_token_acceso', tok);
                setFinalToken(tok); setPaso('autenticado');
            } else setError(data?.error || 'Código incorrecto o vencido.');
        } catch { setError('Error de conexión.'); }
        finally { setEnviando(false); }
    }

    async function enviarCorreo(e) {
        e.preventDefault();
        const c = correo.trim().toLowerCase();
        if (!c.includes('@')) return setError('Correo inválido.');
        setError(''); setEnviando(true);
        try {
            const data = await solicitarCodigoCorreo(c);
            if (data?.success) { setPaso('codigo_correo'); setSegundos(60); }
            else setError(data?.error || 'No se pudo enviar el código.');
        } catch { setError('Error de conexión.'); }
        finally { setEnviando(false); }
    }

    async function verificarCorreo(e) {
        e.preventDefault();
        if (codigo.length !== 6) return setError('El código tiene 6 dígitos.');
        setError(''); setEnviando(true);
        try {
            const data = await verificarCodigoCorreo({ correo: correo.trim().toLowerCase(), codigo });
            if (data?.success) {
                const tok = data.token_acceso || tokenAcceso;
                if (tok) localStorage.setItem('polla_token_acceso', tok);
                setFinalToken(tok); setPaso('autenticado');
            } else setError(data?.error || 'Código incorrecto o vencido.');
        } catch { setError('Error de conexión.'); }
        finally { setEnviando(false); }
    }

    const celMask = '•••• ' + celular.replace(/[^0-9]/g, '').slice(-4);

    return (
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/5 border border-[#FCD116]/30 p-5">
            <p className="text-[#FCD116] font-black text-sm mb-1 text-center">¿Quieres ganar parte del Premio?</p>
            <p className="text-zinc-400 text-xs mb-4 text-center">
                Con tu pronóstico ya estás en juego simbólicamente, pero para participar
                por los <strong className="text-white">$5.000.000 en premios</strong> necesitas comprar tu bono.
            </p>

            {paso === 'iniciando' && (
                <div className="flex flex-col items-center gap-2 py-3">
                    <div className="w-6 h-6 border-2 border-[#FCD116] border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400 text-xs">Enviando código de acceso al {celMask}...</p>
                </div>
            )}

            {paso === 'codigo_sms' && (
                <form onSubmit={verificarSms} className="flex flex-col gap-3">
                    <p className="text-white text-xs text-center">Código enviado por SMS al <span className="font-bold text-[#FCD116]">{celMask}</span></p>
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
                        value={codigo} onChange={e => setCodigo(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        className="w-full rounded-xl bg-zinc-800 border border-white/10 text-white font-black text-2xl text-center py-3 tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#FCD116]" />
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button type="submit" disabled={enviando || codigo.length !== 6}
                        className="w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] disabled:opacity-50 active:scale-95 transition-all">
                        {enviando ? 'Verificando...' : 'Entrar a mi perfil →'}
                    </button>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <button type="button" onClick={() => { setError(''); setPaso('correo_input'); }} className="underline">No me llegó el SMS</button>
                        {segundos > 0 ? <span>Reenviar en {segundos}s</span>
                            : <button type="button" onClick={async () => { const d = await solicitarCodigoTelefono(celular.replace(/[^0-9]/g, '')); if (d?.success) setSegundos(60); }} className="underline">Reenviar</button>}
                    </div>
                </form>
            )}

            {paso === 'correo_input' && (
                <form onSubmit={enviarCorreo} className="flex flex-col gap-3">
                    <p className="text-white text-xs text-center">Ingresa tu correo para recibir el código de acceso</p>
                    <input type="email" inputMode="email" autoComplete="email" placeholder="tu@correo.com"
                        value={correo} onChange={e => setCorreo(e.target.value)}
                        className="w-full rounded-xl bg-zinc-800 border border-white/10 text-white text-sm text-center py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FCD116]" />
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button type="submit" disabled={enviando || !correo.includes('@')}
                        className="w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] disabled:opacity-50 active:scale-95 transition-all">
                        {enviando ? 'Enviando...' : 'Enviar código por correo'}
                    </button>
                    <button type="button" onClick={() => { setFinalToken(tokenAcceso); setPaso('saltado'); }} className="text-xs text-zinc-500 underline text-center">
                        Entrar con mi link directo
                    </button>
                </form>
            )}

            {paso === 'codigo_correo' && (
                <form onSubmit={verificarCorreo} className="flex flex-col gap-3">
                    <p className="text-white text-xs text-center">Código enviado a <span className="font-bold text-[#FCD116]">{correo}</span></p>
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
                        value={codigo} onChange={e => setCodigo(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        className="w-full rounded-xl bg-zinc-800 border border-white/10 text-white font-black text-2xl text-center py-3 tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#FCD116]" />
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button type="submit" disabled={enviando || codigo.length !== 6}
                        className="w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] disabled:opacity-50 active:scale-95 transition-all">
                        {enviando ? 'Verificando...' : 'Entrar a mi perfil →'}
                    </button>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <button type="button" onClick={() => { setError(''); setCodigo(''); setPaso('correo_input'); }} className="underline">Cambiar correo</button>
                        {segundos > 0 ? <span>Reenviar en {segundos}s</span>
                            : <button type="button" onClick={() => { setError(''); setCodigo(''); setPaso('correo_input'); }} className="underline">Reenviar</button>}
                    </div>
                    <button type="button" onClick={() => { setFinalToken(tokenAcceso); setPaso('saltado'); }} className="text-xs text-zinc-500 underline text-center">
                        Entrar con mi link directo
                    </button>
                </form>
            )}

            {(paso === 'autenticado' || paso === 'saltado') && (
                <div className="flex flex-col gap-2">
                    {paso === 'autenticado' && <p className="text-green-400 text-xs text-center">✅ ¡Identidad verificada!</p>}
                    <a href={finalToken ? `/polla?token=${finalToken}` : '/iniciar-sesion'}
                        className="inline-block w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] shadow-[0_0_20px_rgba(252,209,22,0.3)] active:scale-95 transition-all text-center">
                        Ver mi perfil y participar
                    </a>
                    <p className="text-zinc-600 text-[10px] text-center">Desde $10.000 · Pago seguro con Wompi</p>
                </div>
            )}
        </div>
    );
}

// ── Pantalla post-partido: captura tráfico que llega durante/después del partido ──
function PantallaPartidoEnCurso({ partido }) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center pb-16">
            <div className="w-full h-1.5 flex">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#003087]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="w-full max-w-md px-4 mt-8 flex flex-col items-center gap-6">
                <img
                    src={logoRetoucherie}
                    alt="La Retoucherie"
                    className="h-16 w-16 object-cover rounded-2xl ring-2 ring-[#FCD116]/50 shadow-[0_0_24px_rgba(252,209,22,0.2)]"
                />

                <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                    <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-2 text-green-400 text-xs font-black uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Partido en curso
                        </span>
                    </div>
                    <div className="px-4 pt-6 pb-5">
                        <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest mb-5">
                            {partido?.fase?.replace(/_/g, ' ') || 'Cuartos de final'} · Mundial 2026
                        </p>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={partido?.equipo_local || 'Francia'} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {partido?.equipo_local || 'Francia'}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-2 flex-shrink-0">
                                <span className="text-[#FCD116] font-black text-2xl">VS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={partido?.equipo_visitante || 'Marruecos'} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {partido?.equipo_visitante || 'Marruecos'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-white font-extrabold text-xl">El partido ya comenzó ⚽</p>
                    <p className="text-zinc-400 text-sm mt-1">
                        Las predicciones cerraron. Sigue la Polla Mundialista en nuestra plataforma.
                    </p>
                </div>

                <a
                    href="https://www.ganaconretoucherie.com"
                    className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_24px_rgba(252,209,22,0.35)] hover:bg-yellow-300 active:scale-95 transition-all text-center"
                >
                    Seguir la Polla Mundialista →
                </a>

                <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 p-5 text-center">
                    <p className="text-[#FCD116] font-black text-sm mb-2">¿Aún no tienes tu bono?</p>
                    <p className="text-zinc-400 text-xs mb-4">
                        Todavía puedes comprar tu bono y participar en los próximos partidos.
                        Hasta <strong className="text-white">$5.000.000</strong> en premios.
                    </p>
                    <a
                        href="/comprar"
                        className="inline-block w-full py-3 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] active:scale-95 transition-all"
                    >
                        Comprar mi bono
                    </a>
                </div>

                <div className="w-full border-t border-white/5 pt-4 text-center">
                    <p className="text-zinc-600 text-[10px]">www.ganaconretoucherie.com</p>
                </div>
            </div>
        </div>
    );
}

export default function FranciaVsMarruecosLanding() {
    const [partido, setPartido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [sinPartido, setSinPartido] = useState(false);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [celular, setCelular] = useState('');
    const [localGol, setLocalGol] = useState('');
    const [visitanteGol, setVisitanteGol] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        obtenerPartidos()
            .then(d => {
                if (!d?.success) { setSinPartido(true); return; }
                const p = d.partidos.find(esFranciaMarruecos);
                if (p) setPartido(p);
                else setSinPartido(true);
            })
            .catch(() => setSinPartido(true))
            .finally(() => setCargando(false));
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg('');

        if (!nombre.trim()) return setErrorMsg('Ingresa tu nombre.');
        if (!apellido.trim()) return setErrorMsg('Ingresa tu apellido.');
        const cel = celular.replace(/[^0-9]/g, '');
        if (cel.length !== 10 || !cel.startsWith('3')) {
            return setErrorMsg('Ingresa un celular colombiano válido (10 dígitos, empieza por 3).');
        }
        if (localGol === '' || visitanteGol === '') return setErrorMsg('Ingresa el marcador completo.');

        const predLocal = parseInt(localGol, 10);
        const predVisitante = parseInt(visitanteGol, 10);
        if (isNaN(predLocal) || isNaN(predVisitante) || predLocal < 0 || predVisitante < 0) {
            return setErrorMsg('El marcador debe ser un número válido.');
        }

        setEnviando(true);
        try {
            const res = await fetch(`${API_BASE}/api/polla/pronostico-landing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    celular: cel,
                    partido_id: partido.id,
                    pred_local: predLocal,
                    pred_visitante: predVisitante,
                }),
            });
            const data = await res.json();
            if (data?.success) {
                if (data.token_acceso) localStorage.setItem('polla_token_acceso', data.token_acceso);
                setResultado(data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setErrorMsg(data?.error || 'No se pudo registrar. Intenta de nuevo.');
            }
        } catch {
            setErrorMsg('Error de conexión. Intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
    }

    // ── Cargando ──────────────────────────────────────────────────────────────
    if (cargando) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#FCD116] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Sin partido ───────────────────────────────────────────────────────────
    if (sinPartido || !partido) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center gap-4">
                <span className="text-5xl">⚽</span>
                <p className="text-white font-extrabold text-xl">Partido no disponible aún</p>
                <p className="text-zinc-400 text-sm">Vuelve más cerca del partido Francia vs Marruecos.</p>
                <a href="/" className="text-[#FCD116] text-sm underline">Ir al inicio</a>
            </div>
        );
    }

    const ahora = Date.now();
    const inicioMs = new Date(partido.fecha_hora_inicio).getTime();
    const empezado = inicioMs < ahora;
    const cerrado = !empezado && (inicioMs - ahora < CIERRE_MS);

    // ── Partido en curso / terminado: captura el tráfico post-partido ─────────
    if (empezado) {
        return <PantallaPartidoEnCurso partido={partido} />;
    }

    // Francia siempre a la izquierda en pantalla
    const franciaEsLocal = incluye(partido.equipo_local, 'france') || incluye(partido.equipo_local, 'francia');
    const equipoIzq = franciaEsLocal ? partido.equipo_local : partido.equipo_visitante;
    const equipoDer = franciaEsLocal ? partido.equipo_visitante : partido.equipo_local;
    const golIzq = franciaEsLocal ? localGol : visitanteGol;
    const golDer = franciaEsLocal ? visitanteGol : localGol;
    const setGolIzq = franciaEsLocal ? setLocalGol : setVisitanteGol;
    const setGolDer = franciaEsLocal ? setVisitanteGol : setLocalGol;

    // ── Pantalla de éxito ─────────────────────────────────────────────────────
    if (resultado) {
        const primerNombre = resultado.nombre.trim().split(' ')[0];
        const tokenAcceso = resultado.token_acceso;
        const fEsLocalRes = incluye(resultado.partido.equipo_local, 'france') || incluye(resultado.partido.equipo_local, 'francia');
        const equipoIzqRes = fEsLocalRes ? resultado.partido.equipo_local : resultado.partido.equipo_visitante;
        const equipoDerRes = fEsLocalRes ? resultado.partido.equipo_visitante : resultado.partido.equipo_local;
        const predIzqRes = fEsLocalRes ? resultado.pred_local : resultado.pred_visitante;
        const predDerRes = fEsLocalRes ? resultado.pred_visitante : resultado.pred_local;

        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center pb-16">
                <div className="w-full h-1.5 flex">
                    <div className="flex-1 bg-[#FCD116]" />
                    <div className="flex-1 bg-[#003087]" />
                    <div className="flex-1 bg-[#CE1126]" />
                </div>
                <div className="w-full max-w-md px-4 mt-8 flex flex-col items-center gap-5">
                    <img src={logoRetoucherie} alt="La Retoucherie" className="h-20 w-20 object-cover rounded-2xl ring-2 ring-[#FCD116]/50 shadow-xl" />
                    <div className="text-center">
                        <p className="text-[#FCD116] font-black text-xs uppercase tracking-widest mb-1">
                            {resultado.ya_registrado ? '¡Ya tenías tu pronóstico!' : '¡Pronóstico registrado!'}
                        </p>
                        <h1 className="text-white font-extrabold text-2xl">
                            {primerNombre}, tu predicción<br />
                            <span className="text-[#FCD116]">está guardada 🔥</span>
                        </h1>
                    </div>

                    <div className="w-full rounded-2xl bg-zinc-900 border border-[#FCD116]/30 p-5">
                        <p className="text-zinc-500 text-xs text-center mb-4 uppercase tracking-widest">Tu marcador</p>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col items-center flex-1 gap-2">
                                <Bandera equipo={equipoIzqRes} className="w-12 h-12" size="lg" gloss />
                                <p className="text-white font-bold text-xs text-center">{equipoIzqRes}</p>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-white font-black text-4xl tabular-nums">{predIzqRes}</span>
                                <span className="text-zinc-500 font-black text-2xl">–</span>
                                <span className="text-white font-black text-4xl tabular-nums">{predDerRes}</span>
                            </div>
                            <div className="flex flex-col items-center flex-1 gap-2">
                                <Bandera equipo={equipoDerRes} className="w-12 h-12" size="lg" gloss />
                                <p className="text-white font-bold text-xs text-center">{equipoDerRes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <p className="text-white font-bold text-sm mb-2 text-center">Comparte tu pronóstico</p>
                        <CompartirPronostico
                            equipoLocal={resultado.partido.equipo_local}
                            equipoVisitante={resultado.partido.equipo_visitante}
                            localPred={resultado.pred_local}
                            visitantePred={resultado.pred_visitante}
                            tokenAcceso={resultado.token_acceso}
                            partidoId={resultado.partido.id}
                            nombreUsuario={resultado.nombre}
                        />
                    </div>

                    <OtpAcceso celular={celular} tokenAcceso={tokenAcceso} />
                </div>
            </div>
        );
    }

    // ── Formulario ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-zinc-950 pb-16 flex flex-col items-center">
            <div className="w-full h-1.5 flex">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#003087]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="w-full max-w-md px-4 mt-7 flex flex-col items-center gap-6">

                <div className="flex flex-col items-center text-center gap-2">
                    <img
                        src={logoRetoucherie}
                        alt="La Retoucherie"
                        className="h-16 w-16 object-cover rounded-2xl ring-2 ring-[#FCD116]/50 shadow-[0_0_24px_rgba(252,209,22,0.2)]"
                    />
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Polla Mundialista · La Retoucherie
                    </p>
                </div>

                <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                    <div className="bg-[#FCD116]/10 border-b border-[#FCD116]/20 px-4 py-2.5 text-center">
                        <p className="text-[#FCD116] text-xs font-bold uppercase tracking-wide">
                            {formatHora(partido.fecha_hora_inicio)} · Hora Colombia
                        </p>
                    </div>
                    <div className="px-4 pt-6 pb-5">
                        <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest mb-5">
                            {partido.fase?.replace(/_/g, ' ') || 'Cuartos de final'} · Mundial 2026
                        </p>

                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={equipoIzq} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoIzq}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-4 flex-shrink-0">
                                <span className="text-[#FCD116] font-black text-2xl">VS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={equipoDer} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoDer}
                                </p>
                            </div>
                        </div>

                        {cerrado ? (
                            <div className="border-t border-white/5 pt-4 text-center">
                                <p className="text-red-300 font-bold text-sm">⏰ La votación ya cerró</p>
                                <p className="text-zinc-500 text-xs mt-1">Las predicciones cierran 10 minutos antes del pitazo.</p>
                            </div>
                        ) : (
                            <div className="border-t border-white/5 pt-4">
                                <p className="text-zinc-400 text-xs text-center mb-1 uppercase tracking-widest">
                                    ¿Cuál crees que será el marcador?
                                </p>
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="flex-1 text-center text-[#FCD116] text-[10px] font-bold uppercase tracking-wide">{equipoIzq}</p>
                                    <div className="w-6 flex-shrink-0" />
                                    <p className="flex-1 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-wide">{equipoDer}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <GolInput value={golIzq} onChange={setGolIzq} />
                                    <span className="text-zinc-500 font-black text-3xl flex-shrink-0">:</span>
                                    <GolInput value={golDer} onChange={setGolDer} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!cerrado && (
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4 flex flex-col gap-3">
                            <p className="text-white font-bold text-sm">Tus datos</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        autoComplete="given-name"
                                        placeholder="Ej: Juliana"
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2.5 text-white text-base placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Apellido</label>
                                    <input
                                        type="text"
                                        autoComplete="family-name"
                                        placeholder="Ej: Pérez"
                                        value={apellido}
                                        onChange={e => setApellido(e.target.value)}
                                        className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2.5 text-white text-base placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Celular (WhatsApp)</label>
                                <div className="flex">
                                    <span className="flex items-center px-3 rounded-l-xl bg-zinc-700 border border-r-0 border-white/10 text-zinc-300 text-sm font-semibold select-none">
                                        🇨🇴 +57
                                    </span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        placeholder="3001234567"
                                        value={celular}
                                        onChange={e => setCelular(e.target.value)}
                                        className="flex-1 rounded-r-xl bg-zinc-800 border border-white/10 px-3 py-2.5 text-white text-base placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FCD116]"
                                    />
                                </div>
                            </div>
                        </div>

                        {errorMsg && (
                            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-2.5 text-center">
                                {errorMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_24px_rgba(252,209,22,0.35)] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {enviando ? 'Registrando...' : 'Registrar mi pronóstico ⚽'}
                        </button>

                        <p className="text-zinc-400 text-xs leading-relaxed text-center">
                            Al registrar aceptas los{' '}
                            <a href="/terminos" target="_blank" className="text-[#FCD116] underline">
                                Términos y Condiciones
                            </a>{' '}
                            de la Polla Mundialista. Tu pronóstico es gratuito — comprar el bono te da opciones a los premios.
                        </p>

                        <p className="text-zinc-600 text-[10px] text-center leading-relaxed px-1">
                            Se sorteará entre todos los registrados y que acierten el marcador $1MM · Aplican condiciones y restricciones en{' '}
                            <span className="text-zinc-500">www.GanaConRetoucherie.com</span>
                        </p>
                    </form>
                )}

                <div className="w-full border-t border-white/5 pt-4 text-center">
                    <p className="text-zinc-600 text-[10px]">www.ganaconretoucherie.com</p>
                </div>
            </div>
        </div>
    );
}
