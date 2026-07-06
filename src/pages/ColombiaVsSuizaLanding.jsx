import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import Bandera from '../components/Bandera';
import CompartirPronostico from '../components/CompartirPronostico';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const CIERRE_MS = 5 * 60 * 1000;

function incluye(str, sub) {
    return (str || '').toLowerCase().includes(sub.toLowerCase());
}

function esColombiaSuiza(p) {
    const loc = p.equipo_local || '';
    const vis = p.equipo_visitante || '';
    const esColombia = (s) => incluye(s, 'colombia');
    const esSuiza = (s) => incluye(s, 'suiza') || incluye(s, 'suisse') || incluye(s, 'switzerland') || (s || '').toLowerCase() === 'sui';
    return (esColombia(loc) && esSuiza(vis)) || (esSuiza(loc) && esColombia(vis));
}

function formatHora(iso) {
    return new Date(iso).toLocaleString('es-CO', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
    });
}

// Bandera circular con efecto 3D brillante
function BanderaGloss({ equipo, size = 'lg' }) {
    return (
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
            style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
        >
            <Bandera equipo={equipo} className="w-full h-full" size={size} />
            {/* Destello superior */}
            <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 35%, transparent 60%)',
                }}
            />
            {/* Sombra inferior para profundidad */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 rounded-b-full pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.28), transparent)' }}
            />
        </div>
    );
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

export default function ColombiaVsSuizaLanding() {
    const [partido, setPartido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [sinPartido, setSinPartido] = useState(false);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [celular, setCelular] = useState('');
    // localGol y visitanteGol siempre en orden DB (equipo_local/visitante)
    const [localGol, setLocalGol] = useState('');
    const [visitanteGol, setVisitanteGol] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        obtenerPartidos()
            .then(d => {
                if (!d?.success) { setSinPartido(true); return; }
                const p = d.partidos.find(esColombiaSuiza);
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

    // ── Cargando ─────────────────────────────────────────────────────────────
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
                <span className="text-5xl">🇨🇴</span>
                <p className="text-white font-extrabold text-xl">Partido no disponible aún</p>
                <p className="text-zinc-400 text-sm">Vuelve más cerca del partido Colombia vs Suiza.</p>
                <a href="/" className="text-[#FCD116] text-sm underline">Ir al inicio</a>
            </div>
        );
    }

    // Colombia siempre a la izquierda en pantalla
    const colombiaEsLocal = incluye(partido.equipo_local, 'colombia');
    const equipoIzq = colombiaEsLocal ? partido.equipo_local : partido.equipo_visitante;
    const equipoDer = colombiaEsLocal ? partido.equipo_visitante : partido.equipo_local;
    const golIzq = colombiaEsLocal ? localGol : visitanteGol;
    const golDer = colombiaEsLocal ? visitanteGol : localGol;
    const setGolIzq = colombiaEsLocal ? setLocalGol : setVisitanteGol;
    const setGolDer = colombiaEsLocal ? setVisitanteGol : setLocalGol;

    const ahora = Date.now();
    const cerrado = new Date(partido.fecha_hora_inicio).getTime() - ahora < CIERRE_MS;

    // ── Pantalla de éxito ─────────────────────────────────────────────────────
    if (resultado) {
        const primerNombre = resultado.nombre.trim().split(' ')[0];
        const tokenAcceso = resultado.token_acceso;
        const colEsLocalRes = incluye(resultado.partido.equipo_local, 'colombia');
        const equipoIzqRes = colEsLocalRes ? resultado.partido.equipo_local : resultado.partido.equipo_visitante;
        const equipoDerRes = colEsLocalRes ? resultado.partido.equipo_visitante : resultado.partido.equipo_local;
        const predIzqRes = colEsLocalRes ? resultado.pred_local : resultado.pred_visitante;
        const predDerRes = colEsLocalRes ? resultado.pred_visitante : resultado.pred_local;

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
                                <BanderaGloss equipo={equipoIzqRes} />
                                <p className="text-white font-bold text-xs text-center">{equipoIzqRes}</p>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-white font-black text-4xl tabular-nums">{predIzqRes}</span>
                                <span className="text-zinc-500 font-black text-2xl">–</span>
                                <span className="text-white font-black text-4xl tabular-nums">{predDerRes}</span>
                            </div>
                            <div className="flex flex-col items-center flex-1 gap-2">
                                <BanderaGloss equipo={equipoDerRes} />
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

                    <div className="w-full rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/5 border border-[#FCD116]/30 p-5 text-center">
                        <p className="text-[#FCD116] font-black text-sm mb-1">¿Quieres ganar parte del Premio?</p>
                        <p className="text-zinc-400 text-xs mb-4">
                            Con tu pronóstico ya estás en juego simbólicamente, pero para participar
                            por los <strong className="text-white">$5.000.000 en premios</strong> necesitas comprar tu bono de arreglos de la Retoucherie.
                        </p>
                        <a
                            href={tokenAcceso ? `/polla?token=${tokenAcceso}` : '/iniciar-sesion'}
                            className="inline-block w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] shadow-[0_0_20px_rgba(252,209,22,0.3)] hover:bg-yellow-300 active:scale-95 transition-all text-center"
                        >
                            {tokenAcceso ? 'Ver mi perfil y participar' : 'Crear mi cuenta y participar'}
                        </a>
                        <p className="text-zinc-600 text-[10px] mt-2">Desde $10.000 · Pago seguro con Wompi</p>
                    </div>
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
                            {partido.fase?.replace(/_/g, ' ') || 'Octavos de final'} · Mundial 2026
                        </p>

                        {/* Banderas con efecto 3D */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <BanderaGloss equipo={equipoIzq} />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoIzq}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-4 flex-shrink-0">
                                <span className="text-[#FCD116] font-black text-2xl">VS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <BanderaGloss equipo={equipoDer} />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoDer}
                                </p>
                            </div>
                        </div>

                        {cerrado ? (
                            <div className="border-t border-white/5 pt-4 text-center">
                                <p className="text-red-300 font-bold text-sm">⏰ La votación ya cerró</p>
                                <p className="text-zinc-500 text-xs mt-1">Las predicciones cierran 5 minutos antes del pitazo.</p>
                            </div>
                        ) : (
                            <div className="border-t border-white/5 pt-4">
                                <p className="text-zinc-400 text-xs text-center mb-1 uppercase tracking-widest">
                                    ¿Cuál crees que será el marcador?
                                </p>
                                {/* Etiquetas de equipo sobre los inputs */}
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
                            {enviando ? 'Registrando...' : 'Registrar mi pronóstico 🇨🇴'}
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
