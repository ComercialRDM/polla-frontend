import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// CTA reusable de "Comprar Bono Digital" para repetir en puntos estrategicos
// de /como-funciona (justo despues de resolver una objecion o un pico de
// motivacion), sin duplicar el markup del boton en cada seccion.
export default function CTAComprarBono({ microcopy, className = '' }) {
    return (
        <div className={`flex flex-col items-center text-center print:hidden ${className}`}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Link
                    to="/comprar"
                    className="inline-flex items-center justify-center rounded-full bg-[#FCD116] text-zinc-950 font-bold text-base px-9 py-4 shadow-lg shadow-amber-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD116]"
                >
                    ¡Quiero Participar!
                </Link>
            </motion.div>
            {microcopy && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">{microcopy}</p>
            )}
        </div>
    );
}
