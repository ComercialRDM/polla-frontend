import { useEffect, useState } from 'react';

const DURACION_MS = 700;

export default function Splash({ onFinish }) {
    const [progreso, setProgreso] = useState(0);

    useEffect(() => {
        const inicio = Date.now();
        const intervalo = setInterval(() => {
            const transcurrido = Date.now() - inicio;
            const pct = Math.min(100, (transcurrido / DURACION_MS) * 100);
            setProgreso(pct);
            if (transcurrido >= DURACION_MS) {
                clearInterval(intervalo);
                onFinish();
            }
        }, 30);
        return () => clearInterval(intervalo);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 gap-6 px-8">
            {/* Logo marca */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-6xl">⚽</div>
                <p className="font-display text-[#FCD116] text-4xl tracking-widest uppercase leading-none">
                    La Retoucherie
                </p>
                <p className="text-zinc-400 text-xs uppercase tracking-[0.3em] font-bold">
                    Polla Mundialista 2026
                </p>
            </div>

            {/* Barra de carga */}
            <div className="w-48 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                    className="h-full bg-[#FCD116] rounded-full transition-all duration-75"
                    style={{ width: `${progreso}%` }}
                />
            </div>
        </div>
    );
}
