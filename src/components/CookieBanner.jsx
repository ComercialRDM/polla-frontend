import { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'polla_cookies_ok';

export default function CookieBanner() {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

    if (!visible) return null;

    function aceptar() {
        localStorage.setItem(STORAGE_KEY, '1');
        setVisible(false);
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
            <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto">
                <span className="text-lg shrink-0" aria-hidden="true">🍪</span>
                <p className="text-zinc-300 text-xs flex-1 leading-relaxed">
                    Usamos cookies de analítica para mejorar tu experiencia.
                    Al continuar aceptas nuestra{' '}
                    <Link to="/privacidad" className="underline text-amber-400 hover:text-amber-300 transition-colors">
                        Política de privacidad
                    </Link>.
                </p>
                <button
                    onClick={aceptar}
                    className="shrink-0 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}
