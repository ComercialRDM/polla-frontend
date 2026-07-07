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
            className="relative w-full min-h-[92vh] flex flex-col items-center text-center overflow-hidden bg-white dark:bg-zinc-950 print:min-h-0 print:break-inside-avoid-page"
        >
            {/* Franja tricolor */}
            <div className="w-full h-1.5 flex flex-shrink-0">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-zinc-900 dark:bg-white" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            {/* Barra de navegación: logo centrado, botones a los lados */}
            <div className="w-full flex items-center justify-between px-4 py-3 flex-shrink-0 print:hidden">
                <Link
                    to="/iniciar-sesion"
                    className="flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] shadow-sm active:scale-95 transition-transform whitespace-nowrap"
                >
                    Iniciar Sesión
                </Link>

                <motion.img
                    initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    src={logoRetoucherie}
                    alt="La Retoucherie de Manuela"
                    decoding="async"
                    className="h-12 w-auto rounded-lg"
                />

                <Link
                    to="/registro"
                    className="flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm text-white bg-zinc-900 dark:bg-zinc-800 shadow-sm active:scale-95 transition-transform whitespace-nowrap"
                >
                    Registrarse
                </Link>
            </div>

            {/* Contenido principal con parallax — ocupa el espacio restante */}
            <motion.div
                style={{ y, opacity }}
                className="flex flex-col items-center justify-center flex-1 px-6 py-8 w-full"
            >
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
                className="mb-8 text-zinc-400 dark:text-zinc-600 text-2xl animate-bounce motion-reduce:animate-none print:hidden flex-shrink-0"
            >
                ↓
            </a>
        </section>
    );
}
