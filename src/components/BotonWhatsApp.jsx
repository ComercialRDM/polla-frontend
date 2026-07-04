import { useEffect, useState } from 'react';

const WHATSAPP_NUMERO = '573103963708';
const MENSAJE = 'Hola, necesito ayuda con la Polla Mundialista 🙋';

// Botón flotante de WhatsApp visible en toda la app para soporte a clientes.
// En mobile se oculta mientras el usuario scrollea (scroll-to-hide) para no
// tapar CTAs ni texto cercanos al borde derecho; reaparece 800ms después de parar.
export default function BotonWhatsApp({ desplazado, mostrarBottomNav }) {
    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        let timeout;
        function onScroll() {
            setScrolling(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setScrolling(false), 800);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timeout); };
    }, []);

    const base = mostrarBottomNav ? 'calc(4rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)';

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className={`fixed z-40 flex items-center gap-2 py-3 px-4 rounded-full font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all duration-300 ${
                scrolling ? 'sm:opacity-100 opacity-0 pointer-events-none sm:pointer-events-auto' : 'opacity-100'
            }`}
            style={{
                right: 'max(1.25rem, env(safe-area-inset-right))',
                bottom: desplazado
                    ? `calc(${base} + 5.75rem)`
                    : `calc(${base} + 1.25rem)`,
            }}
        >
            <span className="text-xl leading-none">💬</span>
            <span className="hidden sm:inline">¿Necesitas ayuda?</span>
        </a>
    );
}
