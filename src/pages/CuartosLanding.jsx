import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import Bandera from '../components/Bandera';
import CompartirPronostico from '../components/CompartirPronostico';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const CIERRE_MS = 10 * 60 * 1000; // 10 min antes del pitazo

function incluye(str, sub) {
    return (str || '').toLowerCase().includes(sub.toLowerCase());
}

function esPortugalEspana(p) {
    const loc = p.equipo_local || '';
    const vis = p.equipo_visitante || '';
    return (
        (incluye(loc, 'portugal') && incluye(vis, 'espa')) ||
        (incluye(loc, 'espa') && incluye(vis, 'portugal'))
    );
}

function esUsaBelgica(p) {
    const loc = p.equipo_local || '';
    const vis = p.equipo_visitante || '';
    const esUsa = (s) => incluye(s, 'usa') || incluye(s, 'estados unidos');
    const esBelg = (s) => incluye(s, 'bélg') || incluye(s, 'belg');
    return (esUsa(loc) && esBelg(vis)) || (esBelg(loc) && esUsa(vis));
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

function PartidoCard({ partido, localGol, visitanteGol, onLocalGol, onVisitanteGol, cerrado }) {
    return (
        <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
            <div className="bg-[#FCD116]/10 border-b border-[#FCD116]/20 px-4 py-2.5 text-center">
                <p className="text-[#FCD116] text-xs font-bold uppercase tracking-wide">
                    {formatHora(partido.fecha_hora_inicio)} · Hora Colombia
                </p>
            </div>
            <div className="px-4 pt-5 pb-4">
                <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest mb-4">
                    {partido.fase?.replace(/_/g, ' ') || 'Cuartos de final'} · Mundial 2026
                </p>
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <Bandera equipo={partido.equipo_local} className="w-14 h-14" size="lg" />
                        <p className="text-white font-extrabold text-sm text-center leading-tight">
                            {partido.equipo_local}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-4">
                        <span className="text-[#FCD116] font-black text-2xl">VS</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <Bandera equipo={partido.equipo_visitante} className="w-14 h-14" size="lg" />
                        <p className="text-white font-extrabold text-sm text-center leading-tight">
                            {partido.equipo_visitante}
                        </p>
                    </div>
                </div>
                {cerrado ? (
                    <div className="border-t border-white/5 pt-4 text-center">
                        <p className="text-red-300 font-bold text-sm">⏰ La votación ya cerró</p>
                        <p className="text-zinc-500 text-xs mt-1">
                            Las predicciones cierran 10 minutos antes del pitazo.
                        </p>
                    </div>
                ) : (
                    <div className="border-t border-white/5 pt-4">
                        <p className="text-zinc-400 text-xs text-center mb-3 uppercase tracking-widest">
                            ¿Cuál crees que será el marcador?
                        </p>
                        <div className="flex items-center gap-3">
                            <GolInput value={localGol} onChange={onLocalGol} />
                            <span className="text-zinc-500 font-black text-3xl flex-shrink-0">:</span>
                            <GolInput value={visitanteGol} onChange={onVisitanteGol} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultadoCard({ r }) {
    return (
        <div className="w-full rounded-2xl bg-zinc-900 border border-[#FCD116]/30 p-5">
            <p className="text-zinc-500 text-xs text-center mb-3 uppercase tracking-widest">
                Tu marcador · {r.partido.equipo_local} vs {r.partido.equipo_visitante}
            </p>
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center flex-1 gap-1.5">
                    <Bandera equipo={r.partido.equipo_local} className="w-12 h-12" size="lg" />
                    <p className="text-white font-bold text-xs text-center">{r.partido.equipo_local}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white font-black text-4xl tabular-nums">{r.pred_local}</span>
                    <span className="text-zinc-500 font-black text-2xl">–</span>
                    <span className="text-white font-black text-4xl tabular-nums">{r.pred_visitante}</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-1.5">
                    <Bandera equipo={r.partido.equipo_visitante} className="w-12 h-12" size="lg" />
                    <p className="text-white font-bold text-xs text-center">{r.partido.equipo_visitante}</p>
                </div>
            </div>
        </div>
    );
}

export default function CuartosLanding() {
    const [p1, setP1] = useState(null); // Portugal vs España
    const [p2, setP2] = useState(null); // USA vs Bélgica
    const [cargando, setCargando] = useState(true);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [celular, setCelular] = useState('');

    const [local1, setLocal1] = useState('');
    const [visitante1, setVisitante1] = useState('');
    const [local2, setLocal2] = useState('');
    const [visitante2, setVisitante2] = useState('');

    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [resultados, setResultados] = useState(null);

    useEffect(() => {
        obtenerPartidos()
            .then(d => {
                if (!d?.success) return;
                const activos = d.partidos.filter(p => p.estado === 'activo');
                setP1(activos.find(esPortugalEspana) || null);
                setP2(activos.find(esUsaBelgica) || null);
            })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, []);

    const ahora = Date.now();
    const cerrado1 = p1 ? new Date(p1.fecha_hora_inicio).getTime() - ahora < CIERRE_MS : true;
    const cerrado2 = p2 ? new Date(p2.fecha_hora_inicio).getTime() - ahora < CIERRE_MS : true;
    const hayAlgoAbierto = (p1 && !cerrado1) || (p2 && !cerrado2);

    async function submitPartido(partido, predLocal, predVisitante, cel) {
        const res = await fetch(`${API_BASE}/api/polla/pronostico-landing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                celular: cel,
                partido_id: partido.id,
                pred_local: parseInt(predLocal, 10),
                pred_visitante: parseInt(predVisitante, 10),
            }),
        });
        return res.json();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg('');

        if (!nombre.trim()) return setErrorMsg('Ingresa tu nombre.');
        if (!apellido.trim()) return setErrorMsg('Ingresa tu apellido.');
        const cel = celular.replace(/[^0-9]/g, '');
        if (cel.length !== 10 || !cel.startsWith('3')) {
            return setErrorMsg('Ingresa un celular colombiano válido (10 dígitos, empieza por 3).');
        }

        const tiene1 = p1 && !cerrado1 && local1 !== '' && visitante1 !== '';
        const tiene2 = p2 && !cerrado2 && local2 !== '' && visitante2 !== '';

        if (!tiene1 && !tiene2) {
            return setErrorMsg('Ingresa el marcador de al menos uno de los partidos.');
        }

        setEnviando(true);
        try {
            const calls = [];
            if (tiene1) calls.push(submitPartido(p1, local1, visitante1, cel));
            if (tiene2) calls.push(submitPartido(p2, local2, visitante2, cel));

            const results = await Promise.all(calls);
            const fallo = results.find(r => !r.success);
            if (fallo) {
                setErrorMsg(fallo.error || 'No se pudo registrar. Intenta de nuevo.');
                return;
            }
            setResultados(results);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (!p1 && !p2) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center gap-4">
                <span className="text-5xl">⚽</span>
                <p className="text-white font-extrabold text-xl">Partidos no disponibles aún</p>
                <p className="text-zinc-400 text-sm">Vuelve el 6 de julio.</p>
                <a href="/" className="text-[#FCD116] text-sm underline">Ir al inicio</a>
            </div>
        );
    }

    // ── Pantalla de éxito ─────────────────────────────────────────────────────
    if (resultados) {
        const primerNombre = nombre.trim().split(' ')[0];
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center pb-16">
                <div className="w-full h-1.5 flex">
                    <div className="flex-1 bg-[#FCD116]" />
                    <div className="flex-1 bg-[#003087]" />
                    <div className="flex-1 bg-[#CE1126]" />
                </div>
                <div className="w-full max-w-md px-4 mt-8 flex flex-col items-center gap-5">
                    <img
                        src={logoRetoucherie}
                        alt="La Retoucherie"
                        className="h-20 w-20 object-cover rounded-2xl ring-2 ring-[#FCD116]/50 shadow-xl"
                    />
                    <div className="text-center">
                        <p className="text-[#FCD116] font-black text-xs uppercase tracking-widest mb-1">
                            {resultados.some(r => r.ya_registrado) ? '¡Ya tenías tu pronóstico!' : '¡Pronósticos registrados!'}
                        </p>
                        <h1 className="text-white font-extrabold text-2xl">
                            {primerNombre}, {resultados.length > 1 ? 'tus predicciones están' : 'tu predicción está'}<br />
                            <span className="text-[#FCD116]">guardadas 🔥</span>
                        </h1>
                    </div>

                    {resultados.map((r, i) => <ResultadoCard key={i} r={r} />)}

                    {resultados.length === 1 && (
                        <div className="w-full">
                            <p className="text-white font-bold text-sm mb-2 text-center">Comparte tu pronóstico</p>
                            <CompartirPronostico
                                equipoLocal={resultados[0].partido.equipo_local}
                                equipoVisitante={resultados[0].partido.equipo_visitante}
                                localPred={resultados[0].pred_local}
                                visitantePred={resultados[0].pred_visitante}
                                tokenAcceso={resultados[0].token_acceso}
                                partidoId={resultados[0].partido.id}
                                nombreUsuario={resultados[0].nombre}
                            />
                        </div>
                    )}

                    <div className="w-full rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/5 border border-[#FCD116]/30 p-5 text-center">
                        <p className="text-[#FCD116] font-black text-sm mb-1">¿Quieres ganar parte del pozo?</p>
                        <p className="text-zinc-400 text-xs mb-4">
                            Con tus pronósticos ya estás en juego simbólicamente, pero para participar
                            por los <strong className="text-white">$5.000.000 en premios</strong> necesitas comprar tu bono.
                        </p>
                        <a
                            href="/comprar"
                            className="inline-block w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] shadow-[0_0_20px_rgba(252,209,22,0.3)] hover:bg-yellow-300 active:scale-95 transition-all text-center"
                        >
                            Comprar mi bono y participar por los premios
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

                <div className="text-center">
                    <h1 className="text-white font-extrabold text-xl">Cuartos de final · 6 de julio</h1>
                    <p className="text-zinc-400 text-sm mt-1">Predice los marcadores y gana</p>
                </div>

                {p1 && (
                    <PartidoCard
                        partido={p1}
                        localGol={local1} visitanteGol={visitante1}
                        onLocalGol={setLocal1} onVisitanteGol={setVisitante1}
                        cerrado={cerrado1}
                    />
                )}

                {p2 && (
                    <PartidoCard
                        partido={p2}
                        localGol={local2} visitanteGol={visitante2}
                        onLocalGol={setLocal2} onVisitanteGol={setVisitante2}
                        cerrado={cerrado2}
                    />
                )}

                {hayAlgoAbierto && (
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
                            {enviando ? 'Registrando...' : 'Registrar mis pronósticos'}
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
