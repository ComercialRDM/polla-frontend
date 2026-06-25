import { useReducedMotion } from 'framer-motion';

// Variantes compartidas para todas las secciones de /como-funciona: fade + slide-up
// sutil al entrar en viewport, con stagger para grids de tarjetas. Si el usuario
// tiene prefers-reduced-motion activado, se elimina el desplazamiento y el stagger.

export function useFadeUp() {
    const reduce = useReducedMotion();
    return {
        hidden: { opacity: 0, y: reduce ? 0 : 22 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] } },
    };
}

export function useStaggerContainer(staggerDelay = 0.1) {
    const reduce = useReducedMotion();
    return {
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : staggerDelay, delayChildren: reduce ? 0 : 0.05 } },
    };
}

export const VIEWPORT_ONCE = { once: true, amount: 0.25 };
