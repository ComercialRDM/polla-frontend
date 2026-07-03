import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import Bandera from '../components/Bandera';
import CompartirPronostico from '../components/CompartirPronostico';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function esColombia(p) {
    const loc = (p.equipo_local || '').toLowerCase();
    const vis = (p.equipo_visitante || '').toLowerCase();
    return loc === 'colombia' || vis === 'colombia';
}

function formatFechaHora(iso) {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
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
            placeholder="0"
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

export default function ColombiaLanding() {
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
                const ahora = Date.now();
                const col = d.partidos
                    .filter(p => p.estado === 'activo' && esColombia(p))
                    .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio))
                    .find(p => new Date(p.fecha_hora_inicio).getTime() > ahora - 2 * 60 * 60 * 1000);
                if (col) setPartido(col);
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
        if (cel.length < 7) return setErrorMsg('Ingresa tu número de WhatsApp válido.');
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
                <p className="text-white font-extrabold text-xl">No hay partido de Colombia disponible</p>
                <p className="text-zinc-400 text-sm">Vuelve más cerca del próximo partido.</p>
                <a href="/" className="text-[#FCD116] text-sm underline">Ir al inicio</a>
            </div>
        );
    }

    const ahoraMs = Date.now();
    const inicioMs = new Date(partido.fecha_hora_inicio).getTime();
    const cierraEn5min = inicioMs - ahoraMs < 5 * 60 * 1000;

    // ── Pantalla de éxito ─────────────────────────────────────────────────────
    if (resultado) {
        const equipoLocal = resultado.partido.equipo_local;
        const equipoVisitante = resultado.partido.equipo_visitante;
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
                            {resultado.nombre.split(' ')[0]}, tu predicción<br />
                            <span className="text-[#FCD116]">está guardada 🔥</span>
                        </h1>
                    </div>

                    <div className="w-full rounded-2xl bg-zinc-900 border border-[#FCD116]/30 p-5">
                        <p className="text-zinc-500 text-xs text-center mb-3 uppercase tracking-widest">Tu marcador</p>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col items-center flex-1 gap-1.5">
                                <Bandera equipo={equipoLocal} className="w-12 h-12" size="lg" />
                                <p className="text-white font-bold text-xs text-center">{equipoLocal}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-black text-4xl tabular-nums">{resultado.pred_local}</span>
                                <span className="text-zinc-500 font-black text-2xl">–</span>
                                <span className="text-white font-black text-4xl tabular-nums">{resultado.pred_visitante}</span>
                            </div>
                            <div className="flex flex-col items-center flex-1 gap-1.5">
                                <Bandera equipo={equipoVisitante} className="w-12 h-12" size="lg" />
                                <p className="text-white font-bold text-xs text-center">{equipoVisitante}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <p className="text-white font-bold text-sm mb-2 text-center">Comparte tu pronóstico</p>
                        <CompartirPronostico
                            equipoLocal={equipoLocal}
                            equipoVisitante={equipoVisitante}
                            localPred={resultado.pred_local}
                            visitantePred={resultado.pred_visitante}
                            tokenAcceso={resultado.token_acceso}
                            partidoId={resultado.partido.id}
                            nombreUsuario={resultado.nombre}
                        />
                    </div>

                    <div className="w-full rounded-2xl bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/5 border border-[#FCD116]/30 p-5 text-center">
                        <p className="text-[#FCD116] font-black text-sm mb-1">¿Quieres ganar parte del pozo?</p>
                        <p className="text-zinc-400 text-xs mb-4">
                            Con tu pronóstico ya estás en juego simbólicamente, pero para participar
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
            {/* Franja tricolor */}
            <div className="w-full h-1.5 flex">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#003087]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="w-full max-w-md px-4 mt-7 flex flex-col items-center gap-6">

                {/* Logo + marca */}
                <div className="flex flex-col items-center text-center gap-2">
                    <img
                        src={logoRetoucherie}
                        alt="La Retoucherie"
                        className="h-24 w-24 object-cover rounded-2xl ring-2 ring-[#FCD116]/50 shadow-[0_0_24px_rgba(252,209,22,0.2)]"
                    />
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Polla Mundialista · La Retoucherie
                    </p>
                </div>

                {/* Card partido + marcador integrados */}
                <div className="w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                    {/* Fecha */}
                    <div className="bg-[#FCD116]/10 border-b border-[#FCD116]/20 px-4 py-2.5 text-center">
                        <p className="text-[#FCD116] text-xs font-bold uppercase tracking-wide">
                            {formatFechaHora(partido.fecha_hora_inicio)} · Colombia hora
                        </p>
                    </div>

                    <div className="px-4 pt-6 pb-5">
                        <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest mb-5">
                            {partido.fase?.replace(/_/g, ' ') || 'Fase de grupos'} · Mundial 2026
                        </p>

                        {/* Banderas grandes */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={partido.equipo_local} className="w-20 h-20" size="lg" />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {partido.equipo_local}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 pt-5">
                                <span className="text-[#FCD116] font-black text-2xl">VS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <Bandera equipo={partido.equipo_visitante} className="w-20 h-20" size="lg" />
                                <p className="text-white font-extrabold text-sm text-center leading-tight">
                                    {partido.equipo_visitante}
                                </p>
                            </div>
                        </div>

                        {/* Divider + inputs de marcador */}
                        {cierraEn5min ? (
                            <div className="border-t border-white/5 pt-4 text-center">
                                <p className="text-red-300 font-bold text-sm">⏰ La votación ya cerró</p>
                                <p className="text-zinc-500 text-xs mt-1">Las predicciones cierran 5 minutos antes del pitazo.</p>
                            </div>
                        ) : (
                            <div className="border-t border-white/5 pt-4">
                                <p className="text-zinc-400 text-xs text-center mb-3 uppercase tracking-widest">
                                    ¿Cuál crees que será el marcador?
                                </p>
                                <div className="flex items-center gap-3">
                                    <GolInput value={localGol} onChange={setLocalGol} />
                                    <span className="text-zinc-500 font-black text-3xl flex-shrink-0">:</span>
                                    <GolInput value={visitanteGol} onChange={setVisitanteGol} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulario datos + botón */}
                {!cierraEn5min && (
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

                        {/* Datos personales */}
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
                            {enviando ? 'Registrando...' : 'Registrar mi pronóstico'}
                        </button>

                        <p className="text-zinc-600 text-[10px] text-center leading-relaxed px-2">
                            Al registrarte, aceptas los{' '}
                            <a href="/terminos" target="_blank" className="underline">Términos y Condiciones</a>{' '}
                            de la Polla Mundialista. Tu pronóstico es gratuito — comprar el bono te da opciones a los premios en efectivo.
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
