import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import logoRetoucherie from '../../assets/LOGO_RDM.jpeg';

export default function HeroComoFunciona() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

    // Parallax muy ligero: el contenido se desplaza un poco más lento que el scroll
    // y se desvanece justo antes de salir de pantalla.
    const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);

    return (
        <section
            ref={ref}
            className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-white dark:bg-zinc-950 print:min-h-0 print:break-inside-avoid-page"
        >
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-zinc-900 dark:bg-white" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <motion.div style={{ y, opacity }} className="flex flex-col items-center">
                <motion.img
                    initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={logoRetoucherie}
                    alt="La Retoucherie de Manuela"
                    decoding="async"
                    className="h-[73px] w-auto rounded-lg mb-10"
                />

                <motion.h1
                    initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-wide text-zinc-950 dark:text-white max-w-4xl"
                >
                    ¿Cómo funciona la <span className="text-[#CE1126]">Polla Mundialista</span>?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl"
                >
                    Todo lo que necesitas saber para participar y ganar.
                </motion.p>

                <motion.a
                    href="#premios"
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="mt-10 inline-flex items-center justify-center rounded-full bg-zinc-950 dark:bg-[#FCD116] text-white dark:text-zinc-950 font-bold text-base px-9 py-4 shadow-lg shadow-zinc-950/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD116]"
                >
                    Comenzar
                </motion.a>
            </motion.div>

            <a
                href="#premios"
                aria-hidden="true"
                tabIndex={-1}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-400 dark:text-zinc-600 text-2xl animate-bounce motion-reduce:animate-none print:hidden"
            >
                ↓
            </a>
        </section>
    );
}
