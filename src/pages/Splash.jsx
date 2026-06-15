import { useEffect, useState } from 'react';
import { PLANES, formatoPesos } from '../config/planes';

const DURACION_MS = 3000;

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
        }, 50);

        return () => clearInterval(intervalo);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-white via-zinc-100 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-center px-6 py-10 overflow-y-auto">
            {/* Franja tricolor superior */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl font-black text-zinc-950 shadow-lg shadow-orange-500/30">
                    LM
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                    Compra tu <span className="text-amber-500 dark:text-amber-400">Bono Digital</span> y participa GRATIS en la Polla Mundialista
                </h1>

                <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base">
                    <span className="font-semibold text-zinc-900 dark:text-white">La Retoucherie de Manuela</span> te regala intentos para predecir el marcador de la Selección Colombia 🇨🇴
                    {' '}por cada Bono Digital que compres para tus servicios de belleza. Si aciertas, ganas premios.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-2">
                    {PLANES.map((plan) => (
                        <div
                            key={plan.valor}
                            className={`relative rounded-xl border p-4 flex flex-col items-center gap-1 backdrop-blur-sm ${
                                plan.destacado === 'premium'
                                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400 scale-105'
                                    : 'border-amber-400/30 bg-zinc-100 dark:bg-white/5'
                            }`}
                        >
                            {plan.destacado === 'popular' && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                    ⭐ Más popular
                                </span>
                            )}
                            {plan.destacado === 'premium' && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                    🏆 Mejor valor
                                </span>
                            )}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Pagas {formatoPesos(plan.valor)}</span>
                            <span className="text-xl font-bold text-amber-500 dark:text-amber-400">{formatoPesos(plan.saldoBono)}</span>
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">en bono + {plan.etiqueta}</span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    Premios para quienes adivinen el marcador exacto del partido 🏆
                </p>
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-3">
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-75"
                        style={{ width: `${progreso}%` }}
                    />
                </div>
                <button
                    onClick={onFinish}
                    className="w-full py-3 rounded-xl font-bold text-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
                >
                    Entrar ahora →
                </button>
            </div>
        </div>
    );
}
