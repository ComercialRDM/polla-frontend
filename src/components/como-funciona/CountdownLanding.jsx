import { useEffect, useState } from 'react';
import { obtenerPartidos } from '../../api';
import { partidosFuturos } from '../../utils/partidos';

function pad(n) {
    return String(n).padStart(2, '0');
}

function calcularUnidades(ms) {
    if (ms <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    const totalSeg = Math.floor(ms / 1000);
    return {
        dias: Math.floor(totalSeg / 86400),
        horas: Math.floor((totalSeg % 86400) / 3600),
        minutos: Math.floor((totalSeg % 3600) / 60),
        segundos: totalSeg % 60,
    };
}

function Unidad({ valor, etiqueta }) {
    return (
        <div className="flex flex-col items-center">
            <span className="font-display text-3xl sm:text-4xl text-zinc-950 dark:text-white tabular-nums leading-none">
                {pad(valor)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-1">
                {etiqueta}
            </span>
        </div>
    );
}

function Separador() {
    return (
        <span className="font-display text-2xl text-zinc-300 dark:text-zinc-600 self-start mt-1 select-none">:</span>
    );
}

export default function CountdownLanding() {
    const [partido, setPartido] = useState(null);
    const [unidades, setUnidades] = useState(null);

    useEffect(() => {
        let cancelado = false;
        obtenerPartidos()
            .then((data) => {
                if (cancelado) return;
                if (data?.success && data.partidos?.length > 0) {
                    setPartido(partidosFuturos(data.partidos, 1)[0] ?? null);
                }
            })
            .catch(() => {});
        return () => { cancelado = true; };
    }, []);

    useEffect(() => {
        if (!partido) return;
        const actualizar = () => {
            const ms = new Date(partido.fecha_hora_inicio).getTime() - Date.now();
            if (ms <= 0) {
                setUnidades(null);
                return;
            }
            setUnidades(calcularUnidades(ms));
        };
        actualizar();
        const intervalo = setInterval(actualizar, 1000);
        return () => clearInterval(intervalo);
    }, [partido]);

    if (!partido || !unidades) return null;

    return (
        <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Próximo partido
            </p>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {partido.equipo_local} vs {partido.equipo_visitante}
            </p>
            <div className="flex items-center gap-3">
                <Unidad valor={unidades.dias} etiqueta="días" />
                <Separador />
                <Unidad valor={unidades.horas} etiqueta="horas" />
                <Separador />
                <Unidad valor={unidades.minutos} etiqueta="min" />
                <Separador />
                <Unidad valor={unidades.segundos} etiqueta="seg" />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Compra antes de que inicie para poder pronosticar
            </p>
        </div>
    );
}
