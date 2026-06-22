import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../api';
import Bandera from './Bandera';
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

        // Sin partido por prop: busca el próximo en general. `cancelado` evita
        // que esta búsqueda (asíncrona) sobrescriba un partido que haya llegado
        // por prop mientras tanto (ej. el padre todavía no terminó de cargar el
        // suyo en el primer render).
        let cancelado = false;
        obtenerPartidos()
            .then((data) => {
                if (cancelado) return;
                if (data?.success && data.partidos.length > 0) {
                    setPartido(partidosFuturos(data.partidos, 1)[0] ?? null);
                }
            })
            .catch(() => {});
        return () => { cancelado = true; };
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
            enUltimaHora ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-400/30 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none'
        }`}>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-1 flex items-center justify-center gap-2 flex-wrap">
                {enUltimaHora ? '⏰ ¡Últimos minutos para comprar y participar!' : 'Faltan para'}{' '}
                <span className="font-semibold text-zinc-900 dark:text-white inline-flex items-center gap-1.5">
                    <Bandera equipo={partido.equipo_local} className="w-5 h-5" /> {partido.equipo_local} vs <Bandera equipo={partido.equipo_visitante} className="w-5 h-5" /> {partido.equipo_visitante}
                </span>
            </p>
            <div className={`font-scoreboard text-2xl sm:text-3xl font-black tracking-widest bg-black rounded-xl py-2 ${
                enUltimaHora ? 'text-emerald-400 parpadeo-verde' : 'text-amber-400 neon-gold'
            }`}>
                {formatearTiempo(msRestantes)}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                Compra tu bono antes de que inicie el partido para poder pronosticar.
            </p>
        </div>
    );
}
