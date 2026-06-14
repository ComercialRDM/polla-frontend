import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import { bandera } from '../utils/banderas';
import { partidosFuturos } from '../utils/partidos';

const UNA_HORA_MS = 60 * 60 * 1000;

function formatearTiempo(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
}

export default function CountdownPartido({ partido: partidoProp } = {}) {
    const [partido, setPartido] = useState(partidoProp ?? null);
    const [msRestantes, setMsRestantes] = useState(null);

    useEffect(() => {
        if (partidoProp) {
            setPartido(partidoProp);
            return;
        }

        obtenerPartidos()
            .then((data) => {
                if (data?.success && data.partidos.length > 0) {
                    setPartido(partidosFuturos(data.partidos, 1)[0] ?? null);
                }
            })
            .catch(() => {});
    }, [partidoProp]);

    useEffect(() => {
        if (!partido) return;
        const actualizar = () => {
            setMsRestantes(new Date(partido.fecha_hora_inicio).getTime() - Date.now());
        };
        actualizar();
        const intervalo = setInterval(actualizar, 1000);
        return () => clearInterval(intervalo);
    }, [partido]);

    if (!partido || msRestantes === null || msRestantes <= 0) return null;

    const enUltimaHora = msRestantes <= UNA_HORA_MS;

    return (
        <div className={`rounded-2xl border p-4 mb-6 text-center backdrop-blur-lg ${
            enUltimaHora ? 'border-red-500/40 bg-red-500/10' : 'border-amber-400/30 bg-slate-900/60'
        }`}>
            <p className="text-xs text-zinc-300 mb-1 flex items-center justify-center gap-2 flex-wrap">
                {enUltimaHora ? '⏰ ¡Últimos minutos para comprar y participar!' : 'Faltan para'}{' '}
                <span className="font-semibold text-white">
                    {bandera(partido.equipo_local)} {partido.equipo_local} vs {partido.equipo_visitante} {bandera(partido.equipo_visitante)}
                </span>
            </p>
            <div className={`font-scoreboard text-2xl sm:text-3xl font-black tracking-widest bg-black rounded-xl py-2 ${
                enUltimaHora ? 'text-red-500 parpadeo-rojo' : 'text-amber-400 neon-gold'
            }`}>
                {formatearTiempo(msRestantes)}
            </div>
            <p className="text-zinc-400 text-xs mt-1">
                Compra tu bono antes de que inicie el partido para poder pronosticar.
            </p>
        </div>
    );
}
