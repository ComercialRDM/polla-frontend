import { motion } from 'framer-motion';
import { ShieldCheck, Banknote, Clock, MapPin } from 'lucide-react';
import { INFO_IMPORTANTE } from '../../data/comoFuncionaData';
import TrustBadges from '../TrustBadges';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';
import CTAComprarBono from './CTAComprarBono';

const ICONOS = { ShieldCheck, Banknote, Clock, MapPin };

export default function InfoImportanteSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer();

    return (
        <section id="info" className="w-full bg-white dark:bg-zinc-950 px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-16 print:break-after-avoid"
                >
                    Información importante
                </motion.h2>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    {INFO_IMPORTANTE.map((info) => {
                        const Icono = ICONOS[info.icono];
                        return (
                            <motion.div
                                key={info.titulo}
                                variants={fadeUp}
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.25 }}
                                className="cf-card print:break-inside-avoid rounded-3xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-7 text-center"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-950 dark:bg-[#FCD116] mx-auto mb-4">
                                    <Icono className="w-5 h-5 text-white dark:text-zinc-950" aria-hidden="true" />
                                </div>
                                <p className="font-bold text-zinc-950 dark:text-white text-sm">{info.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">{info.descripcion}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <div className="mt-10 flex justify-center">
                    <TrustBadges />
                </div>

                <CTAComprarBono microcopy="Pago 100% seguro · Tu saldo no vence hasta marzo de 2027." className="mt-12" />
            </div>
        </section>
    );
}
