import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, UserPlus, Star } from 'lucide-react';
import { FASES_PUNTOS, PUNTOS_EXTRA } from '../../data/comoFuncionaData';
import { obtenerPartidos } from '../../api';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

const ICONOS = { Share2, UserPlus };

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
                    {FASES_PUNTOS.map((f) => {
                        const esActual = f.claves?.includes(faseActual);
                        return (
                        <motion.div
                            key={f.fase}
                            variants={fadeUp}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.25 }}
                            className={`cf-card print:break-inside-avoid flex items-center justify-between gap-4 rounded-2xl border px-6 py-5 hover:bg-zinc-100 dark:hover:bg-white/10 ${esActual ? 'border-amber-400 bg-amber-400/10 dark:bg-amber-400/10' : 'border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5'}`}
                        >
                            <div className="flex flex-col gap-1.5 w-40 sm:w-56 shrink-0">
                                {esActual && (
                                    <span className="inline-flex items-center gap-1 self-start text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                                        <Star className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                                        Fase actual
                                    </span>
                                )}
                                <p className="font-bold text-zinc-950 dark:text-white text-base sm:text-lg">
                                    {f.fase}
                                </p>
                            </div>
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
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {PUNTOS_EXTRA.map((p) => {
                            const Icono = ICONOS[p.icono];
                            return (
                                <motion.div
                                    key={p.titulo}
                                    variants={fadeUp}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.25 }}
                                    className="cf-card print:break-inside-avoid flex items-center gap-5 rounded-2xl border border-zinc-100 dark:border-white/10 p-6"
                                >
                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 dark:bg-[#FCD116] shrink-0">
                                        <Icono className="w-7 h-7 text-white dark:text-zinc-950" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-950 dark:text-white text-base sm:text-lg">{p.titulo}</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{p.descripcion}</p>
                                    </div>
                                    <div className="ml-auto text-right shrink-0">
                                        <p className="font-display text-3xl sm:text-4xl text-amber-600 dark:text-amber-400 leading-none">{p.puntos}</p>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wide mt-1.5">{p.tope}</p>
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
