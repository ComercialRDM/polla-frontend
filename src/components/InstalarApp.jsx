import { useEffect, useRef, useState } from 'react';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const STORAGE_KEY = 'polla_instalar_app_dismissido_at';
const DIAS_SNOOZE = 30;

function yaDescartado() {
    const ts = localStorage.getItem(STORAGE_KEY);
    return ts && Date.now() - Number(ts) < DIAS_SNOOZE * 24 * 60 * 60 * 1000;
}

function yaInstalada() {
    if (navigator.standalone) return true;
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    return false;
}

function detectarNavegador() {
    const ua = navigator.userAgent;
    const esIOS = /iphone|ipad|ipod/i.test(ua);
    const esSafariIOS = esIOS && /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
    const esChromeIOS = esIOS && /crios/i.test(ua);
    const esSamsung = /samsungbrowser/i.test(ua);
    const esEdge = /edg\//i.test(ua) && !esIOS;
    const esChrome = /chrome/i.test(ua) && !esEdge && !esSamsung && !esIOS;
    const esFirefox = /firefox|fxios/i.test(ua);

    if (esSafariIOS) return 'safari-ios';
    if (esChromeIOS) return 'chrome-ios';
    if (esChrome || esEdge || esSamsung) return 'chromium';
    if (esFirefox) return 'firefox';
    return 'otro';
}

export default function InstalarApp({ delayMs = 30000 }) {
    const [visible, setVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [instalando, setInstalando] = useState(false);
    const navegador = useRef(detectarNavegador()).current;

    useEffect(() => {
        if (yaInstalada() || yaDescartado()) return;

        function onBeforeInstall(e) {
            e.preventDefault();
            setDeferredPrompt(e);
        }
        function onInstalled() { cerrar(); }

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onInstalled);

        const timer = setTimeout(() => setVisible(true), delayMs);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, [delayMs]);

    function cerrar() {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setVisible(false);
    }

    async function instalarChrome() {
        if (!deferredPrompt) return;
        setInstalando(true);
        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') cerrar();
        } finally {
            setInstalando(false);
            setDeferredPrompt(null);
        }
    }

    if (!visible || yaInstalada()) return null;

    return (
        <div className="fixed bottom-20 left-3 right-3 z-50 max-w-sm mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl shadow-black/30 p-4 flex flex-col gap-3">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src={logoRetoucherie} alt="La Retoucherie" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div>
                            <p className="font-black text-zinc-900 dark:text-white text-sm leading-tight">
                                Agrega la app a tu pantalla
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                                Accede más rápido sin buscar el link
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={cerrar}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-2xl leading-none shrink-0 -mt-0.5"
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>

                {/* Safari iOS */}
                {navegador === 'safari-ios' && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3 flex flex-col gap-2">
                        <p className="text-zinc-700 dark:text-zinc-200 text-xs font-bold">Cómo hacerlo en Safari:</p>
                        <ol className="flex flex-col gap-1.5">
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">1.</span>
                                Toca el botón <span className="mx-0.5 text-sm">⬆️</span> <strong>Compartir</strong> en la barra inferior
                            </li>
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">2.</span>
                                Desplázate y toca <strong>"Agregar a pantalla de inicio"</strong>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">3.</span>
                                Toca <strong>"Agregar"</strong> arriba a la derecha ✓
                            </li>
                        </ol>
                    </div>
                )}

                {/* Chrome en iPhone (debe abrir en Safari) */}
                {navegador === 'chrome-ios' && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3 flex flex-col gap-1.5">
                        <p className="text-zinc-700 dark:text-zinc-200 text-xs font-bold">Para agregar en iPhone:</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                            Abre esta página en <strong>Safari</strong> y usa el botón <span className="text-sm">⬆️</span> → <strong>"Agregar a pantalla de inicio"</strong>.
                        </p>
                    </div>
                )}

                {/* Chrome / Edge / Samsung con prompt nativo */}
                {navegador === 'chromium' && deferredPrompt && (
                    <button
                        onClick={instalarChrome}
                        disabled={instalando}
                        className="w-full py-3 rounded-xl font-black text-zinc-950 text-sm bg-[#FCD116] hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-amber-400/20"
                    >
                        {instalando ? 'Instalando...' : '📲 Instalar app ahora'}
                    </button>
                )}

                {/* Chrome sin prompt disponible (instrucciones manuales) */}
                {navegador === 'chromium' && !deferredPrompt && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3 flex flex-col gap-2">
                        <p className="text-zinc-700 dark:text-zinc-200 text-xs font-bold">Cómo hacerlo en Chrome / Samsung:</p>
                        <ol className="flex flex-col gap-1.5">
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">1.</span>
                                Toca el menú <strong>⋮</strong> arriba a la derecha
                            </li>
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">2.</span>
                                Toca <strong>"Agregar a pantalla de inicio"</strong>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">3.</span>
                                Confirma tocando <strong>"Agregar"</strong> ✓
                            </li>
                        </ol>
                    </div>
                )}

                {/* Firefox */}
                {navegador === 'firefox' && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3 flex flex-col gap-2">
                        <p className="text-zinc-700 dark:text-zinc-200 text-xs font-bold">Cómo hacerlo en Firefox:</p>
                        <ol className="flex flex-col gap-1.5">
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">1.</span>
                                Toca el menú <strong>☰</strong> abajo a la derecha
                            </li>
                            <li className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="shrink-0 font-bold text-amber-500">2.</span>
                                Toca <strong>"Instalar"</strong> o <strong>"Agregar a pantalla de inicio"</strong>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Otro navegador */}
                {navegador === 'otro' && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3">
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                            Busca <strong className="text-zinc-700 dark:text-zinc-200">"Agregar a pantalla de inicio"</strong> en el menú de tu navegador (⋮ o ☰).
                        </p>
                    </div>
                )}

                <button onClick={cerrar} className="text-center text-xs text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                    Ahora no
                </button>
            </div>
        </div>
    );
}
