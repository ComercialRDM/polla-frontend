import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Boton fijo solo en movil (sm:hidden) para no obligar al usuario a buscar
// el siguiente CTA en el scroll. Aparece despues de pasar el Hero (no desde
// el primer instante, para no competir con el boton "Comenzar" del Hero).
export default function CTAFijoMovil() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > window.innerHeight * 0.6);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (!visible) return null;

    return (
        <div className="sm:hidden print:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-white/10" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <Link
                to="/comprar"
                className="block w-full text-center rounded-full bg-zinc-950 dark:bg-[#FCD116] text-white dark:text-zinc-950 font-bold text-base py-3.5 shadow-lg shadow-zinc-950/20"
            >
                Comprar Bono Digital
            </Link>
        </div>
    );
}
