import { motion } from 'framer-motion';
import camisetaImg from '../../assets/premios/camiseta.webp';
import gorraImg from '../../assets/premios/gorra.webp';
import balonImg from '../../assets/premios/balon.webp';
import gafasImg from '../../assets/premios/gafas.webp';
import { PREMIOS_PRINCIPALES, BONO_COLOMBIA, PREMIOS_FLASH } from '../../data/comoFuncionaData';
import { formatoPesos } from '../../config/planes';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

const PREMIOS_FLASH_IMAGENES = [
    { imagen: camisetaImg, titulo: 'Camiseta Oficial' },
    { imagen: gorraImg, titulo: 'Gorra Edición Especial' },
    { imagen: balonImg, titulo: 'Balón Mundialista' },
    { imagen: gafasImg, titulo: 'Bono Sorpresa' },
];

export default function PremiosSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer();

    return (
        <section id="premios" className="w-full bg-zinc-50 dark:bg-black px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-16 print:break-after-avoid"
                >
                    Premios
                </motion.h2>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5"
                >
                    {PREMIOS_PRINCIPALES.map((premio) => (
                        <motion.div
                            key={premio.puesto}
                            variants={fadeUp}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.3 }}
                            className="cf-card print:break-inside-avoid rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 p-8 text-center shadow-sm hover:shadow-xl"
                        >
                            <span className="text-5xl" role="img" aria-label={premio.puesto}>{premio.icono}</span>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wide mt-4">Hasta</p>
                            <p className="font-display text-4xl text-[#CE1126] mt-1">{formatoPesos(premio.montoMax)}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">{premio.descripcion}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                    <motion.div
                        variants={fadeUp}
                        className="cf-card print:break-inside-avoid rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 p-8 text-center sm:text-left shadow-sm"
                    >
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <span className="text-3xl" role="img" aria-label="Bandera de Colombia">{BONO_COLOMBIA.icono}</span>
                            <p className="font-bold text-xl text-zinc-950 dark:text-white">{BONO_COLOMBIA.titulo}</p>
                        </div>
                        <p className="font-display text-3xl text-amber-600 dark:text-amber-400 mt-3">
                            {formatoPesos(BONO_COLOMBIA.monto)}
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">{BONO_COLOMBIA.descripcion}</p>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="cf-card print:break-inside-avoid print:bg-white print:border print:border-zinc-300 rounded-3xl bg-zinc-950 dark:bg-white/5 border border-zinc-950 dark:border-white/10 p-8 text-center sm:text-left shadow-sm"
                    >
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <span className="text-3xl" role="img" aria-label="Premios Flash">{PREMIOS_FLASH.icono}</span>
                            <p className="font-bold text-xl text-white print:text-zinc-950">{PREMIOS_FLASH.titulo}</p>
                        </div>
                        <p className="text-zinc-400 print:text-zinc-600 text-sm mt-2 mb-5">{PREMIOS_FLASH.descripcion}</p>
                        <div className="grid grid-cols-4 gap-2">
                            {PREMIOS_FLASH_IMAGENES.map((p) => (
                                <img
                                    key={p.titulo}
                                    src={p.imagen}
                                    alt={p.titulo}
                                    loading="lazy"
                                    decoding="async"
                                    width={120}
                                    height={64}
                                    className="w-full h-16 object-cover rounded-xl bg-white/10 transition-transform hover:scale-105"
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs mt-8">
                    Premios entregados en Gift Cards · No se entrega dinero en efectivo
                </p>
            </div>
        </section>
    );
}
