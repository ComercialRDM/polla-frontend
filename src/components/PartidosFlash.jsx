import { useState, useEffect } from 'react';
import { obtenerPartidosFlash, votarFlash } from '../api';
import { obtenerSesion } from '../utils/sesion';
import Bandera from './Bandera';

function useAhora() {
    const [ahora, setAhora] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setAhora(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    return ahora;
}

function TiempoRestante({ cierreFlash }) {
    const ahora = useAhora();
    const ms = new Date(cierreFlash) - ahora;
    if (ms <= 0) return <span className="text-red-500 font-bold text-xs">CERRADO</span>;
    const mins = Math.floor(ms / 60000);
    const segs = Math.floor((ms % 60000) / 1000);
    return (
        <span className="text-[#FCD116] font-bold text-xs">
            ⏱ Cierra en {mins}:{String(segs).padStart(2, '0')}
        </span>
    );
}

function TarjetaFlash({ partido, celular }) {
    const ahora = useAhora();
    const [localVal, setLocalVal] = useState('');
    const [visitanteVal, setVisitanteVal] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const cierre = new Date(partido.cierre_flash);
    const cerrado = ahora >= cierre;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const l = parseInt(localVal, 10);
        const v = parseInt(visitanteVal, 10);
        if (isNaN(l) || isNaN(v) || l < 0 || v < 0) {
            setError('Ingresa un marcador válido (números enteros ≥ 0).');
            return;
        }
        setCargando(true);
        try {
            const data = await votarFlash({ celular, partido_id: partido.id, local: l, visitante: v });
            if (data?.success) {
                setEnviado(true);
            } else {
                setError(data?.error || 'No se pudo registrar el pronóstico.');
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    }

    const inicio = new Date(partido.fecha_hora_inicio);

    return (
        <div className="relative rounded-2xl border-2 border-[#FCD116] bg-zinc-950 shadow-[0_0_20px_rgba(252,209,22,0.25)] p-4 flex flex-col gap-3">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FCD116] text-zinc-950 text-[10px] font-black px-3 py-0.5 rounded-full whitespace-nowrap tracking-wide">
                ⚡ GRATIS · SIN BONO
            </div>

            {/* Partido */}
            <div className="flex items-center justify-center gap-2 mt-2">
                <Bandera equipo={partido.equipo_local} className="w-6 h-6" />
                <span className="text-white font-bold text-sm">{partido.equipo_local}</span>
                <span className="text-zinc-400 text-xs font-semibold">vs</span>
                <Bandera equipo={partido.equipo_visitante} className="w-6 h-6" />
                <span className="text-white font-bold text-sm">{partido.equipo_visitante}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                    {inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <TiempoRestante cierreFlash={partido.cierre_flash} />
            </div>

            {enviado ? (
                <div className="text-center bg-green-600/20 border border-green-500/40 rounded-xl p-3">
                    <p className="text-green-400 font-bold text-sm">✅ ¡Pronóstico registrado!</p>
                    <p className="text-green-300 text-xs mt-0.5">
                        {partido.equipo_local} {localVal} – {visitanteVal} {partido.equipo_visitante}
                    </p>
                </div>
            ) : cerrado ? (
                <p className="text-center text-zinc-500 text-sm">La ventana de esta promoción ya cerró.</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <p className="text-zinc-400 text-xs text-center">¿Cuál será el marcador final?</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white text-xs font-semibold truncate max-w-[80px] text-center">{partido.equipo_local}</span>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={localVal}
                                onChange={e => setLocalVal(e.target.value)}
                                placeholder="0"
                                className="w-16 h-14 rounded-xl text-center text-2xl font-black bg-zinc-800 border-2 border-zinc-600 text-white focus:border-[#FCD116] focus:outline-none"
                            />
                        </div>
                        <span className="text-zinc-500 text-2xl font-black mt-5">–</span>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white text-xs font-semibold truncate max-w-[80px] text-center">{partido.equipo_visitante}</span>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={visitanteVal}
                                onChange={e => setVisitanteVal(e.target.value)}
                                placeholder="0"
                                className="w-16 h-14 rounded-xl text-center text-2xl font-black bg-zinc-800 border-2 border-zinc-600 text-white focus:border-[#FCD116] focus:outline-none"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-3 rounded-xl font-black text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform disabled:opacity-60 text-sm"
                    >
                        {cargando ? 'Guardando...' : '⚽ Registrar pronóstico gratis'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function PartidosFlash() {
    const [partidos, setPartidos] = useState([]);
    const sesion = obtenerSesion();

    useEffect(() => {
        obtenerPartidosFlash()
            .then(data => { if (data?.success) setPartidos(data.partidos); })
            .catch(() => {});
    }, []);

    if (!sesion || partidos.length === 0) return null;

    return (
        <div className="w-full max-w-md px-4 mt-4">
            <div className="rounded-2xl bg-zinc-950 border border-[#FCD116]/30 p-4 flex flex-col gap-4">
                <div className="text-center">
                    <p className="text-[#FCD116] font-black text-lg tracking-wide uppercase">⚡ Promoción Relámpago</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                        Solo hoy · Sin comprar bono · Pronostica durante el primer tiempo
                    </p>
                </div>
                {partidos.map(p => (
                    <TarjetaFlash key={p.id} partido={p} celular={sesion.celular} />
                ))}
            </div>
        </div>
    );
}
