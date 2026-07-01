import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CTAFijoMovil() {
    const [visible, setVisible] = useState(false);
    const [linkCuenta, setLinkCuenta] = useState('/ingresar');

    useEffect(() => {
        // Si el usuario ya compró y tiene token guardado, llevarlo directo a su cuenta.
        const token = localStorage.getItem('polla_token_acceso');
        if (token) setLinkCuenta(`/polla?token=${token}`);
    }, []);

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
        <div className="sm:hidden print:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-white/10 flex gap-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <Link
                to={linkCuenta}
                className="flex-shrink-0 flex items-center justify-center px-4 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 font-semibold text-sm py-3.5 gap-1.5"
            >
                👤 Mi cuenta
            </Link>
            <Link
                to="/comprar"
                className="flex-1 text-center rounded-full bg-[#FCD116] text-zinc-950 font-bold text-base py-3.5 shadow-lg shadow-amber-400/30"
            >
                ¡Quiero Participar!
            </Link>
        </div>
    );
}
