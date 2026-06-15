import { useEffect, useState } from 'react';

const STORAGE_KEY = 'polla_instalar_app_cerrado';

function esIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function yaInstalada() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// Banner para invitar a instalar la app en la pantalla de inicio (PWA).
// En Android/desktop usa el prompt nativo de Chrome (beforeinstallprompt).
// En iOS, Safari no soporta ese prompt, así que se muestran instrucciones manuales.
export default function InstalarApp({ onVisibleChange }) {
    const [promptEvent, setPromptEvent] = useState(null);
    const [mostrarIOS] = useState(() => esIOS() && !yaInstalada());
    const [cerrado, setCerrado] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

    useEffect(() => {
        if (yaInstalada()) return;

        function handleBeforeInstall(e) {
            e.preventDefault();
            setPromptEvent(e);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }, []);

    const visible = !cerrado && (!!promptEvent || mostrarIOS);

    useEffect(() => {
        onVisibleChange?.(visible);
    }, [visible, onVisibleChange]);

    function cerrar() {
        localStorage.setItem(STORAGE_KEY, '1');
        setCerrado(true);
    }

    async function instalar() {
        if (!promptEvent) return;
        promptEvent.prompt();
        await promptEvent.userChoice;
        setPromptEvent(null);
        cerrar();
    }

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 px-4 flex justify-center"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
            <div className="w-full max-w-md rounded-2xl border border-amber-400/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-[0_4px_25px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(234,179,8,0.25)] p-4 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">📲</span>

                <div className="flex-1 min-w-0">
                    <p className="text-zinc-900 dark:text-white font-bold text-sm">¡Vive el Mundial con GanaConRetoucherie!</p>
                    {promptEvent ? (
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Instala la app para acceder más rápido y no perderte ningún partido.</p>
                    ) : (
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                            Toca <span className="text-amber-500 dark:text-amber-400 font-semibold">Compartir</span>{' '}
                            <span aria-hidden="true">⬆️</span> y luego{' '}
                            <span className="text-amber-500 dark:text-amber-400 font-semibold">&quot;Agregar a inicio&quot;</span>.
                        </p>
                    )}
                </div>

                {promptEvent && (
                    <button
                        onClick={instalar}
                        className="flex-shrink-0 py-2 px-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 active:scale-95 transition-transform"
                    >
                        Instalar
                    </button>
                )}

                <button
                    onClick={cerrar}
                    aria-label="Cerrar"
                    className="flex-shrink-0 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-lg leading-none px-1"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
