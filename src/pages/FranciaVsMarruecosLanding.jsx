import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import Bandera from '../components/Bandera';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

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

    // ── Vista principal: muro de pago ─────────────────────────────────────────
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

                {/* Tarjeta del partido */}
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

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={equipoIzq} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoIzq}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-2 flex-shrink-0">
                                <span className="text-[#FCD116] font-black text-2xl">VS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={equipoDer} className="w-16 h-16" size="lg" gloss />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {equipoDer}
                                </p>
                            </div>
                        </div>

                        {cerrado && (
                            <div className="border-t border-white/5 mt-5 pt-4 text-center">
                                <p className="text-red-300 font-bold text-sm">⏰ La votación ya cerró</p>
                                <p className="text-zinc-500 text-xs mt-1">Las predicciones cierran 10 minutos antes del pitazo.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Muro de pago */}
                {!cerrado && (
                    <div className="w-full rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/5 border border-[#FCD116]/30 p-5 flex flex-col gap-4">
                        <div className="text-center">
                            <p className="text-[#FCD116] font-black text-base">¿Quieres pronosticar este partido?</p>
                            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                                Para participar en la Polla Mundialista y optar por los{' '}
                                <strong className="text-white">$5.000.000 en premios</strong>,
                                primero compra tu bono.
                            </p>
                        </div>

                        <a
                            href="/comprar"
                            className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_24px_rgba(252,209,22,0.35)] hover:bg-yellow-300 active:scale-95 transition-all text-center"
                        >
                            Comprar mi bono →
                        </a>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-zinc-600 text-xs">¿ya tienes bono?</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <a
                            href="/iniciar-sesion"
                            className="w-full py-3 rounded-xl font-bold text-white text-sm bg-zinc-800 border border-white/10 hover:bg-zinc-700 active:scale-95 transition-all text-center"
                        >
                            Ingresar a mi perfil
                        </a>

                        <p className="text-zinc-600 text-[10px] text-center">Desde $10.000 · Pago seguro con Wompi</p>
                    </div>
                )}

                {cerrado && (
                    <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 p-5 flex flex-col gap-4 text-center">
                        <p className="text-[#FCD116] font-black text-sm">¿Aún no tienes tu bono?</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            Todavía puedes comprar y participar en los próximos partidos.
                            Hasta <strong className="text-white">$5.000.000</strong> en premios.
                        </p>
                        <a
                            href="/comprar"
                            className="w-full py-3.5 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] active:scale-95 transition-all"
                        >
                            Comprar mi bono
                        </a>
                        <a href="/iniciar-sesion" className="text-xs text-zinc-500 underline">
                            ¿Ya tienes bono? Ingresa aquí
                        </a>
                    </div>
                )}

                <div className="w-full border-t border-white/5 pt-4 text-center">
                    <p className="text-zinc-600 text-[10px]">www.ganaconretoucherie.com</p>
                </div>
            </div>
        </div>
    );
}
