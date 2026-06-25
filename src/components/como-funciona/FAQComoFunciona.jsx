import { motion } from 'framer-motion';
import { FAQ_COMO_FUNCIONA } from '../../data/comoFuncionaData';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

export default function FAQComoFunciona() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer(0.06);

    return (
        <section id="faq" className="w-full bg-zinc-50 dark:bg-black px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-3xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-16 print:break-after-avoid"
                >
                    Preguntas frecuentes
                </motion.h2>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="flex flex-col gap-3"
                >
                    {FAQ_COMO_FUNCIONA.map((item) => (
                        <motion.details
                            key={item.pregunta}
                            variants={fadeUp}
                            className="cf-card print:break-inside-avoid group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-zinc-950 dark:text-white font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD116] rounded-md">
                                {item.pregunta}
                                <span className="text-[#CE1126] transition-transform duration-300 group-open:rotate-45 text-2xl leading-none shrink-0" aria-hidden="true">+</span>
                            </summary>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 leading-relaxed">{item.respuesta}</p>
                        </motion.details>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
