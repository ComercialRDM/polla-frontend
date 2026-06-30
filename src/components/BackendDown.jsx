import { useState } from 'react';
import logo from '../assets/LOGO_RDM.jpeg';
import arte from '../assets/Polla Mundialista Retoucherie_Comprimida.webp';

export default function BackendDown() {
    const [reintentando, setReintentando] = useState(false);

    function reintentar() {
        setReintentando(true);
        setTimeout(() => window.location.reload(), 800);
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 px-6 text-center overflow-hidden">

            {/* Arte de fondo con blur */}
            <img
                src={arte}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-110 pointer-events-none select-none"
            />

            <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full">

                {/* Logo */}
                <img
                    src={logo}
                    alt="La Retoucherie de Manuela"
                    className="w-24 h-24 rounded-2xl object-cover shadow-2xl ring-2 ring-white/10"
                />

                {/* Icono animado */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center animate-pulse">
                            <span className="text-2xl">🔧</span>
                        </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
                </div>

                {/* Mensaje principal */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white font-black text-2xl leading-tight">
                        Ya estamos resolviendo
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        El servidor está en mantenimiento momentáneo.<br />
                        Pronto estaremos de vuelta.
                    </p>
                </div>

                {/* Barra animada de "trabajando en ello" */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
                        style={{ width: '40%', animation: 'shimmer 2s ease-in-out infinite' }} />
                </div>

                {/* Tiempo estimado */}
                <p className="text-zinc-500 text-xs">
                    Intenta de nuevo en <span className="text-amber-400 font-bold">5 minutos</span>
                </p>

                {/* Botón de reintentar */}
                <button
                    onClick={reintentar}
                    disabled={reintentando}
                    className="w-full py-3.5 rounded-xl font-black text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-amber-400/20"
                >
                    {reintentando ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                            Intentando...
                        </span>
                    ) : (
                        '↺ Intentar de nuevo'
                    )}
                </button>

                {/* Footer */}
                <p className="text-zinc-600 text-[11px]">
                    Polla Mundialista · La Retoucherie de Manuela
                </p>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); width: 40%; }
                    50% { width: 70%; }
                    100% { transform: translateX(250%); width: 40%; }
                }
            `}</style>
        </div>
    );
}
