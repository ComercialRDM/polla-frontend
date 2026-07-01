import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PLANES, formatoPesos, MONTO_PERSONALIZADO_MIN, MONTO_PERSONALIZADO_MAX } from '../../config/planes';
import { useFadeUp, useStaggerContainer, VIEWPORT_ONCE } from './motion';

export default function BonosSection() {
    const fadeUp = useFadeUp();
    const stagger = useStaggerContainer();
    // Orden descendente para efecto de anclaje: el usuario ve primero el mayor
    // valor y percibe los demás como "más baratos" (CRO: anchoring effect).
    const planesOrdenados = [...PLANES].reverse();

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
                    de ropa en La Retoucherie de Manuela. Cómpralo, úsalo cuando quieras. Bonos válidos
                    hasta el 1 de marzo de 2027. Y de regalo participas en la Polla Mundialista.
                </motion.p>

                {/* items-end: todas las tarjetas se alinean al fondo, la popular
                    sobresale hacia arriba por su mayor padding interno. */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end"
                >
                    {planesOrdenados.map((plan) => {
                        const esFavorito = plan.destacado === 'popular';
                        const bono = plan.saldoBono - plan.valor;
                        return (
                        <motion.div
                            key={plan.valor}
                            variants={fadeUp}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className={esFavorito ? 'relative z-10 sm:col-span-2 lg:col-span-1' : ''}
                        >
                            <Link
                                to={`/comprar?plan=${plan.valor}`}
                                className={`cf-card relative flex flex-col h-full rounded-3xl print:break-inside-avoid transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-[#FCD116]
                                    ${esFavorito
                                        ? 'card-bdb-popular border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-400/10 dark:to-amber-400/5 shadow-2xl shadow-amber-400/25 hover:shadow-2xl p-7 sm:p-8'
                                        : 'card-bdb-regular border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg p-5'
                                    }`}
                            >
                                {esFavorito && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black uppercase px-4 py-1.5 rounded-full bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/30">
                                        ⭐ Más popular
                                    </span>
                                )}

                                <p className={`font-black text-zinc-950 dark:text-white leading-tight mt-1 ${esFavorito ? 'text-xl' : 'text-base'}`}>
                                    {plan.etiqueta}
                                </p>
                                <p className={`text-zinc-500 dark:text-zinc-400 font-medium ${esFavorito ? 'text-sm mb-4' : 'text-xs mb-3'}`}>
                                    Polla Mundialista
                                </p>

                                <p className={`font-display text-zinc-950 dark:text-white ${esFavorito ? 'text-5xl' : 'text-3xl'}`}>
                                    {formatoPesos(plan.valor)}
                                </p>

                                <span className={`inline-flex items-center gap-1 self-start rounded-full font-black uppercase tracking-wide
                                    ${esFavorito
                                        ? 'mt-4 px-4 py-1.5 text-sm bg-green-100 dark:bg-green-400/15 text-green-700 dark:text-green-400'
                                        : 'mt-3 px-3 py-1 text-xs bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400'
                                    }`}>
                                    +{formatoPesos(bono)} gratis
                                </span>

                                <p className={`text-zinc-500 dark:text-zinc-400 ${esFavorito ? 'text-base mt-3 mb-6' : 'text-sm mt-2 mb-5'}`}>
                                    Recibes{' '}
                                    <strong className={esFavorito ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-200'}>
                                        {formatoPesos(plan.saldoBono)}
                                    </strong>{' '}
                                    en servicios
                                </p>

                                <span className="mt-auto w-full flex items-center justify-between gap-2">
                                    <span className={`font-semibold text-zinc-600 dark:text-zinc-300 ${esFavorito ? 'text-sm' : 'text-xs'}`}>
                                        Comprar este bono
                                    </span>
                                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-xl bg-[#FCD116] text-zinc-950 font-black shadow-md shadow-amber-400/20
                                        ${esFavorito ? 'px-5 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'}`}>
                                        Comprar →
                                    </span>
                                </span>
                            </Link>
                        </motion.div>
                        );
                    })}

                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                        <Link
                            to="/comprar"
                            className="cf-card card-bdb-gold relative flex flex-col h-full rounded-3xl border-2 border-[#FCD116] bg-zinc-950 p-6 hover:shadow-xl transition-shadow print:break-inside-avoid print:bg-white print:border-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD116]"
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

                <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs mt-8">
                    Cada cupo te deja predecir un partido en Grupos, Dieciseisavos u Octavos. En Cuartos,
                    Semifinal y Tercer Puesto un partido cuesta 2 cupos, y en la Gran Final 4 cupos.
                </p>
            </div>
        </section>
    );
}
