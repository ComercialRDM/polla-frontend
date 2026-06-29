import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Star } from 'lucide-react';
import { FASES_PUNTOS, PUNTOS_EXTRA } from '../../data/comoFuncionaData';
import { obtenerPartidos } from '../../api';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

// Logos de marca (Instagram/WhatsApp) en SVG propio: lucide-react solo trae
// iconos genericos de linea, no logos de marca.
function IconoInstagram(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
        </svg>
    );
}

function IconoWhatsApp(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.99.55 3.85 1.5 5.45L2 22l4.78-1.55a9.9 9.9 0 0 0 5.26 1.5h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.55 17.5 2 12.04 2zm0 18.1a8.17 8.17 0 0 1-4.16-1.14l-.3-.18-3.1 1 1.03-3.02-.2-.31a8.18 8.18 0 0 1-1.27-4.36c0-4.51 3.67-8.17 8.18-8.17 4.51 0 8.17 3.67 8.17 8.17 0 4.51-3.67 8.17-8.17 8.17z" />
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-1.75-.87-2.89-1.56-4.04-3.54-.31-.52.3-.49.87-1.62.1-.2.05-.37-.05-.52-.1-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.07.15.2 2.06 3.15 4.99 4.29 2.93 1.14 2.93.76 3.45.71.53-.05 1.72-.7 1.96-1.38.24-.67.24-1.25.17-1.37-.07-.13-.27-.2-.57-.35z" />
        </svg>
    );
}

const ICONOS = { Instagram: IconoInstagram, WhatsApp: IconoWhatsApp, UserPlus };

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
                                    <p className="font-display text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 leading-none">
                                        {f.exacto} <span className="text-xs font-sans font-normal text-zinc-400 dark:text-zinc-500">pts</span>
                                    </p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wide mt-1">marcador exacto</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl sm:text-2xl text-zinc-700 dark:text-zinc-300 leading-none">
                                        {f.tendencia} <span className="text-xs font-sans font-normal text-zinc-400 dark:text-zinc-500">pts</span>
                                    </p>
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
