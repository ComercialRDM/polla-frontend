import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { FASES_PUNTOS, PUNTOS_EXTRA } from '../../data/comoFuncionaData';
import { obtenerPartidos } from '../../api';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

function LogoInstagram({ className }) {
    return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
            <defs>
                <radialGradient id="ig-grad" cx="28%" cy="106%" r="148%">
                    <stop offset="0%" stopColor="#ffd879" />
                    <stop offset="12%" stopColor="#fcd051" />
                    <stop offset="40%" stopColor="#f26738" />
                    <stop offset="65%" stopColor="#cd2d91" />
                    <stop offset="100%" stopColor="#4b51d6" />
                </radialGradient>
            </defs>
            <rect width="48" height="48" rx="11" fill="url(#ig-grad)" />
            <rect x="9.5" y="9.5" width="29" height="29" rx="7" fill="none" stroke="white" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="7" fill="none" stroke="white" strokeWidth="2.5" />
            <circle cx="34.2" cy="13.8" r="2.4" fill="white" />
        </svg>
    );
}

function LogoWhatsApp({ className }) {
    return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
            <rect width="48" height="48" rx="11" fill="#25D366" />
            <path
                d="M24 11.5c-6.9 0-12.5 5.6-12.5 12.5 0 2.19.57 4.24 1.57 6.02l-1.71 6.18 6.32-1.66A12.44 12.44 0 0 0 24 36.5c6.9 0 12.5-5.6 12.5-12.5S30.9 11.5 24 11.5zm6.17 17.03c-.26.72-1.54 1.38-2.12 1.44-.55.06-1.06.27-3.56-.74-3-1.23-4.89-4.28-5.04-4.47-.15-.2-1.2-1.6-1.2-3.05s.76-2.17 1.03-2.46c.26-.3.57-.37.76-.37s.37.01.54.01c.17 0 .4-.07.63.48.24.57.81 1.97.88 2.12.07.15.12.32.02.51-.1.2-.15.32-.29.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.75 1.23 1.61 1.99 1.1.99 2.03 1.3 2.33 1.44.3.15.47.12.64-.07.17-.2.74-.86.93-1.16.2-.3.39-.25.66-.15.27.1 1.72.81 2.02.96.3.15.49.22.57.35.07.12.07.72-.19 1.44z"
                fill="white"
            />
        </svg>
    );
}

const ICONOS = { Instagram: LogoInstagram, WhatsApp: LogoWhatsApp };

// La fase "actual" es la del partido sin cerrar mas proximo (el siguiente en
// jugarse). Si ya no queda ninguno sin cerrar, el torneo termino: se toma la
// fase del ultimo partido jugado, para que la Gran Final quede marcada.
function calcularFaseActual(partidos) {
    if (!partidos || partidos.length === 0) return null;

    const pendientes = partidos
        .filter((p) => p.estado !== 'cerrado')
        .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));
    if (pendientes.length > 0) return pendientes[0].fase;

    const jugados = [...partidos].sort((a, b) => new Date(b.fecha_hora_inicio) - new Date(a.fecha_hora_inicio));
    return jugados[0]?.fase ?? null;
}

export default function PuntosFasesSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer(0.07);
    const [faseActual, setFaseActual] = useState(null);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (data?.success) setFaseActual(calcularFaseActual(data.partidos));
            })
            .catch(() => {});
    }, []);

    return (
        <section id="puntos" className="w-full bg-white dark:bg-zinc-950 px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-5xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-4 print:break-after-avoid"
                >
                    ¿Cómo ganas puntos?
                </motion.h2>
                <p className="text-center text-zinc-500 dark:text-zinc-400 mb-2">
                    Mientras más avanza el torneo, más valen tus aciertos.
                </p>
                <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mb-16">
                    Un cupo no siempre equivale a un partido: el costo en cupos sube según la fase.
                </p>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="flex flex-col gap-3"
                >
                    {FASES_PUNTOS.map((f) => {
                        const esActual = f.claves?.includes(faseActual);
                        return (
                        <motion.div
                            key={f.fase}
                            variants={fadeUp}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.25 }}
                            className={`cf-card print:break-inside-avoid flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 hover:bg-zinc-100 dark:hover:bg-white/10 ${esActual ? 'border-amber-400 bg-amber-400/10 dark:bg-amber-400/10' : 'border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5'}`}
                        >
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                {esActual && (
                                    <span className="inline-flex items-center gap-1 self-start text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                                        <Star className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                                        Fase actual
                                    </span>
                                )}
                                <p className="font-bold text-zinc-950 dark:text-white text-sm sm:text-lg">
                                    {f.fase}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-10 shrink-0 text-right">
                                <div>
                                    <p className="font-display text-xl sm:text-3xl text-amber-600 dark:text-amber-400 leading-none">
                                        {f.exacto} <span className="text-xs font-sans font-normal text-zinc-400 dark:text-zinc-500">pts</span>
                                    </p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wide mt-1">marcador exacto</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl sm:text-2xl text-zinc-700 dark:text-zinc-300 leading-none">
                                        {f.tendencia} <span className="text-xs font-sans font-normal text-zinc-400 dark:text-zinc-500">pts</span>
                                    </p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wide mt-1">tendencia</p>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </motion.div>

                <div className="mt-16">
                    <motion.h3
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_ONCE}
                        className="flex items-center justify-center gap-2 font-bold text-xl text-zinc-950 dark:text-white mb-6 print:break-after-avoid"
                    >
                        <Star className="w-5 h-5 text-[#FCD116]" fill="#FCD116" aria-hidden="true" />
                        Puntos extra
                    </motion.h3>
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_ONCE}
                        className="grid grid-cols-2 gap-4 max-w-lg mx-auto"
                    >
                        {PUNTOS_EXTRA.map((p) => {
                            const Icono = ICONOS[p.icono];
                            return (
                                <motion.div
                                    key={p.titulo}
                                    variants={fadeUp}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.25 }}
                                    className="cf-card print:break-inside-avoid flex flex-col items-center text-center rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-5 gap-3"
                                >
                                    <Icono className="w-14 h-14 rounded-2xl shrink-0" />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-zinc-950 dark:text-white text-sm leading-tight">{p.titulo}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-snug">{p.descripcion}</p>
                                    </div>
                                    <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-white/10 w-full">
                                        <p className="font-display text-2xl text-amber-600 dark:text-amber-400 leading-none">{p.puntos}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wide mt-1">{p.tope}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
