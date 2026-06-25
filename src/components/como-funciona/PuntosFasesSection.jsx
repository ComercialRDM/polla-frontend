import { motion } from 'framer-motion';
import { Share2, UserPlus, Star } from 'lucide-react';
import { FASES_PUNTOS, PUNTOS_EXTRA } from '../../data/comoFuncionaData';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

const ICONOS = { Share2, UserPlus };

export default function PuntosFasesSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer(0.07);

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
                <p className="text-center text-zinc-500 dark:text-zinc-400 mb-16">
                    Mientras más avanza el torneo, más valen tus aciertos.
                </p>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="flex flex-col gap-3"
                >
                    {FASES_PUNTOS.map((f) => (
                        <motion.div
                            key={f.fase}
                            variants={fadeUp}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.25 }}
                            className="cf-card print:break-inside-avoid flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-6 py-5 hover:bg-zinc-100 dark:hover:bg-white/10"
                        >
                            <p className="font-bold text-zinc-950 dark:text-white text-base sm:text-lg w-40 sm:w-56 shrink-0">
                                {f.fase}
                            </p>
                            <div className="flex items-center gap-6 sm:gap-10 ml-auto text-right">
                                <div>
                                    <p className="font-display text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 leading-none">{f.exacto}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wide mt-1">marcador exacto</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl sm:text-2xl text-zinc-700 dark:text-zinc-300 leading-none">{f.tendencia}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wide mt-1">tendencia</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {PUNTOS_EXTRA.map((p) => {
                            const Icono = ICONOS[p.icono];
                            return (
                                <motion.div
                                    key={p.titulo}
                                    variants={fadeUp}
                                    className="cf-card print:break-inside-avoid flex items-center gap-4 rounded-2xl border border-zinc-100 dark:border-white/10 p-5"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-950 dark:bg-[#FCD116] shrink-0">
                                        <Icono className="w-5 h-5 text-white dark:text-zinc-950" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-950 dark:text-white text-sm">{p.titulo}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{p.descripcion}</p>
                                    </div>
                                    <div className="ml-auto text-right shrink-0">
                                        <p className="font-display text-xl text-amber-600 dark:text-amber-400">{p.puntos}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px]">{p.tope}</p>
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
