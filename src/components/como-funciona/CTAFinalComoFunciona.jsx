import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoRetoucherie from '../../assets/LOGO_RDM.jpeg';
import { useFadeUp, VIEWPORT_ONCE } from './motion';

export default function CTAFinalComoFunciona() {
    const fadeUp = useFadeUp();

    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="w-full bg-zinc-950 px-6 py-20 text-center print:bg-white print:break-inside-avoid-page"
        >
            <img
                src={logoRetoucherie}
                alt="La Retoucherie de Manuela"
                decoding="async"
                className="h-10 w-auto rounded-md mx-auto mb-6"
            />
            <p className="text-zinc-400 print:text-zinc-600 text-sm mb-8">ganaconretoucherie.com</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="inline-block">
                <Link
                    to="/comprar"
                    className="inline-flex items-center justify-center rounded-full bg-[#FCD116] text-zinc-950 font-bold text-base px-10 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Comprar Bono Digital
                </Link>
            </motion.div>
        </motion.section>
    );
}
