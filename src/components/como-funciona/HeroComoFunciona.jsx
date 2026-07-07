import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import logoRetoucherie from '../../assets/LOGO_RDM.jpeg';
import { PREMIOS_PRINCIPALES } from '../../data/comoFuncionaData';
import { formatoPesos } from '../../config/planes';
import CTAComprarBono from './CTAComprarBono';
import CountdownLanding from './CountdownLanding';

export default function HeroComoFunciona() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

    const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);

    const premioMax = PREMIOS_PRINCIPALES[0].montoMax;

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

            <div className="absolute top-4 left-4 flex gap-2 print:hidden">
                <Link
                    to="/iniciar-sesion"
                    className="flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] shadow-sm active:scale-95 transition-transform"
                >
                    Iniciar Sesión
                </Link>
                <Link
                    to="/registro"
                    className="flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm text-white bg-zinc-900 dark:bg-zinc-800 shadow-sm active:scale-95 transition-transform"
                >
                    Registrarse
                </Link>
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

                <motion.span
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black uppercase tracking-wide bg-[#CE1126] text-white mb-6"
                >
                    🏆 Hasta {formatoPesos(premioMax)} en premios
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-wide text-zinc-950 dark:text-white max-w-4xl"
                >
                    Compra tu bono y gana hasta{' '}
                    <span className="text-[#CE1126]">{formatoPesos(premioMax)}</span>{' '}
                    en el Mundial 2026
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl"
                >
                    Tu bono ya es tuyo, ganes o no la Polla. Saldo real para arreglos de ropa en La Retoucherie de Manuela.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-10"
                >
                    <CTAComprarBono microcopy="Sin costo adicional. Tu bono siempre es tuyo." />
                </motion.div>

                <CountdownLanding />
            </motion.div>

            <a
                href="#participar"
                aria-hidden="true"
                tabIndex={-1}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-400 dark:text-zinc-600 text-2xl animate-bounce motion-reduce:animate-none print:hidden"
            >
                ↓
            </a>
        </section>
    );
}
