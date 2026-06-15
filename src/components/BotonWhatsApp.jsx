const WHATSAPP_NUMERO = '573103963708';
const MENSAJE = 'Hola, necesito ayuda con la Polla Mundialista 🙋';

// Botón flotante de WhatsApp visible en toda la app para soporte a clientes.
export default function BotonWhatsApp({ desplazado, mostrarBottomNav }) {
    const base = mostrarBottomNav ? 'calc(4rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)';
    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="fixed z-50 flex items-center gap-2 py-3 px-4 rounded-full font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all"
            style={{
                right: 'max(1.25rem, env(safe-area-inset-right))',
                bottom: desplazado
                    ? `calc(${base} + 5.75rem)`
                    : `calc(${base} + 1.25rem)`,
            }}
        >
            <span className="text-xl">💬</span>
            <span className="hidden sm:inline">¿Necesitas ayuda?</span>
        </a>
    );
}
