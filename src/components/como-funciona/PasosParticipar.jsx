import { motion } from 'framer-motion';
import { ShoppingCart, Goal, Trophy, Scissors, Gift, TrendingUp } from 'lucide-react';
import { PASOS_PARTICIPAR, SIEMPRE_GANAS } from '../../data/comoFuncionaData';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';
import CTAComprarBono from './CTAComprarBono';

const ICONOS = { ShoppingCart, Goal, Trophy, Scissors, Gift, TrendingUp };

export default function PasosParticipar() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer();

    return (
        <section id="participar" className="w-full bg-white dark:bg-zinc-950 px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-16 print:break-after-avoid"
                >
                    Participar es muy fácil
                </motion.h2>

                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-16 -mt-10"
                >
                    Tu bono no es una apuesta: es saldo real para arreglos y transformaciones de ropa
                    en La Retoucherie de Manuela. La Polla Mundialista es un beneficio gratuito que se
                    suma a tu compra.
                </motion.p>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 items-start"
                >
                    {PASOS_PARTICIPAR.map((paso, i) => {
                        const Icono = ICONOS[paso.icono];
                        return (
                            <motion.div key={paso.titulo} variants={fadeUp} className="flex flex-col items-center text-center print:break-inside-avoid">
                                <motion.div
                                    whileHover={{ y: -4, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.15)' }}
                                    transition={{ duration: 0.3 }}
                                    className="cf-card flex items-center justify-center w-24 h-24 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 mb-6"
                                >
                                    <Icono className="w-10 h-10 text-zinc-950 dark:text-[#FCD116]" strokeWidth={1.75} aria-hidden="true" />
                                </motion.div>
                                <p className="font-bold text-xl text-zinc-950 dark:text-white">{paso.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-[260px]">{paso.descripcion}</p>

                                {i < PASOS_PARTICIPAR.length - 1 && (
                                    <span className="sm:hidden print:hidden text-zinc-300 dark:text-zinc-700 text-2xl mt-8" aria-hidden="true">↓</span>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="cf-card print:break-inside-avoid mt-16 rounded-3xl border-2 border-[#FCD116] bg-zinc-50 dark:bg-white/5 p-8 sm:p-10"
                >
                    <p className="font-display text-2xl sm:text-3xl text-zinc-950 dark:text-white text-center mb-6">
                        {SIEMPRE_GANAS.titulo}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {SIEMPRE_GANAS.bullets.map((bullet) => {
                            const Icono = ICONOS[bullet.icono];
                            return (
                                <div key={bullet.texto} className="flex flex-col items-center text-center">
                                    <Icono className="w-7 h-7 text-zinc-950 dark:text-[#FCD116] mb-3" strokeWidth={1.75} aria-hidden="true" />
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{bullet.texto}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <CTAComprarBono microcopy="Tu bono ya es tuyo, ganes o no la Polla." className="mt-16" />
            </div>
        </section>
    );
}
