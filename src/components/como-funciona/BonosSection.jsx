import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PLANES, formatoPesos, MONTO_PERSONALIZADO_MIN, MONTO_PERSONALIZADO_MAX } from '../../config/planes';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

export default function BonosSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer();

    return (
        <section id="bonos" className="w-full bg-zinc-50 dark:bg-black px-6 py-24 sm:py-32 print:break-inside-avoid-page">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center font-display text-4xl sm:text-5xl text-zinc-950 dark:text-white mb-16 print:break-after-avoid"
                >
                    Bonos
                </motion.h2>

                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="text-center text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-16 -mt-10"
                >
                    Cada bono es un crédito real que puedes usar en arreglos, ajustes y transformaciones
                    de ropa en La Retoucherie de Manuela. Cómpralo, úsalo cuando quieras, y de regalo
                    participas en la Polla Mundialista.
                </motion.p>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch"
                >
                    {PLANES.map((plan) => {
                        const esFavorito = plan.destacado === 'popular';
                        const bono = plan.saldoBono - plan.valor;
                        return (
                        <motion.div key={plan.valor} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                            <Link
                                to={`/comprar?plan=${plan.valor}`}
                                className={`cf-card relative flex flex-col h-full rounded-3xl p-7 hover:shadow-xl transition-shadow print:break-inside-avoid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-[#FCD116] ${esFavorito ? 'border-2 border-amber-400 bg-amber-50 dark:bg-amber-400/5 shadow-lg shadow-amber-400/10' : 'border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900'}`}
                            >
                                {esFavorito && (
                                    <span className="absolute -top-3 left-6 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-400 text-zinc-950">
                                        ⭐ Favorito
                                    </span>
                                )}
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wide mt-1">{plan.etiqueta}</p>
                                <p className="font-display text-3xl text-zinc-950 dark:text-white mt-2">{formatoPesos(plan.valor)}</p>
                                <span className="inline-flex items-center gap-1 self-start mt-3 px-3 py-1 rounded-full bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-black uppercase tracking-wide">
                                    +{formatoPesos(bono)} gratis
                                </span>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                                    Recibes <strong className="text-zinc-700 dark:text-zinc-200">{formatoPesos(plan.saldoBono)}</strong> en servicios
                                </p>
                                <span className="mt-auto pt-6 text-sm font-bold text-zinc-950 dark:text-white">
                                    Comprar este bono →
                                </span>
                            </Link>
                        </motion.div>
                        );
                    })}

                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                        <Link
                            to="/comprar"
                            className="cf-card relative flex flex-col h-full rounded-3xl border-2 border-[#FCD116] bg-zinc-950 p-7 hover:shadow-xl transition-shadow print:break-inside-avoid print:bg-white print:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD116]"
                        >
                            <span className="absolute -top-3 left-6 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#FCD116] text-zinc-950">
                                Más recomendado
                            </span>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wide mt-1 print:text-zinc-600">Monto personalizado</p>
                            <p className="font-display text-3xl text-[#FCD116] mt-2 print:text-zinc-950">
                                {formatoPesos(MONTO_PERSONALIZADO_MIN)} – {formatoPesos(MONTO_PERSONALIZADO_MAX)}
                            </p>
                            <p className="text-zinc-400 text-sm mt-2 print:text-zinc-600">
                                Recibe <strong className="text-white print:text-zinc-950">160%</strong> en servicios y 1 cupo por cada $10.000
                            </p>
                            <span className="mt-auto pt-6 text-sm font-bold text-[#FCD116] print:text-zinc-950">
                                Elegir mi monto →
                            </span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
