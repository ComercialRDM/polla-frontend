import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// 'aceptadas' | 'rechazadas'. La clave anterior (polla_cookies_ok) no cuenta como
// consentimiento: el banner viejo no daba opción de rechazar.
const STORAGE_KEY = 'polla_cookies';

function leerDecision() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export default function CookieBanner() {
    const { pathname } = useLocation();
    const [visible, setVisible] = useState(() => !leerDecision());

    // En el panel interno no se carga analítica, así que no hay nada que preguntar.
    if (!visible || window.__esRutaInterna?.(pathname)) return null;

    function decidir(valor) {
        try { localStorage.setItem(STORAGE_KEY, valor); } catch { /* sin almacenamiento: se vuelve a preguntar */ }
        setVisible(false);
        if (valor === 'aceptadas') window.__cargarAnalitica?.();
    }

    const boton = 'shrink-0 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
            <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl px-4 py-3 pointer-events-auto">
                <p className="text-zinc-300 text-xs leading-relaxed">
                    <span aria-hidden="true">🍪 </span>
                    Usamos cookies de analítica (Google Analytics, Microsoft Clarity y Meta) para medir y mejorar
                    el sitio. Solo se activan si las aceptas. Más información en la{' '}
                    <Link to="/privacidad" className="underline text-amber-400 hover:text-amber-300 transition-colors">
                        Política de privacidad
                    </Link>.
                </p>
                <div className="flex gap-2 mt-3">
                    <button onClick={() => decidir('rechazadas')} className={`${boton} flex-1 bg-zinc-700 hover:bg-zinc-600 text-white`}>
                        Rechazar
                    </button>
                    <button onClick={() => decidir('aceptadas')} className={`${boton} flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-900`}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
