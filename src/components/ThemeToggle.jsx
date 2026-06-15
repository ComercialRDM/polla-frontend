import { useTheme } from '../context/ThemeContext';

const ORDEN = ['auto', 'light', 'dark'];

const ICONOS = {
    auto: '🌓',
    light: '☀️',
    dark: '🌙',
};

const ETIQUETAS = {
    auto: 'Automático (según la hora)',
    light: 'Modo claro',
    dark: 'Modo oscuro',
};

// Botón flotante para alternar entre modo automático (claro de día, oscuro de
// noche), claro fijo y oscuro fijo.
export default function ThemeToggle() {
    const { modo, cambiarModo } = useTheme();

    function siguienteModo() {
        const i = ORDEN.indexOf(modo);
        cambiarModo(ORDEN[(i + 1) % ORDEN.length]);
    }

    return (
        <button
            onClick={siguienteModo}
            aria-label={`Tema: ${ETIQUETAS[modo]}. Toca para cambiar.`}
            title={ETIQUETAS[modo]}
            className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md text-lg active:scale-90 transition-transform"
        >
            {ICONOS[modo]}
        </button>
    );
}
