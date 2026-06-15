import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import CountdownPartido from '../components/CountdownPartido';
import ProximosPartidos from '../components/ProximosPartidos';
import ResumenPublico from '../components/ResumenPublico';

const COLORES_CONFETI = ['#FCD116', '#003893', '#CE1126', '#ffffff'];

export default function Home() {
    useEffect(() => {
        if (localStorage.getItem('confeti_bienvenida')) return;
        localStorage.setItem('confeti_bienvenida', '1');

        const disparo = (opciones) =>
            confetti({ colors: COLORES_CONFETI, ...opciones });

        disparo({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 }, angle: 60 });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 }, angle: 120 });
        disparo({ particleCount: 80, spread: 100, origin: { y: 0.4 } });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-950 stadium-glow pb-28">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            {/* Hero */}
            <div className="w-full max-w-md px-6 mt-8 relative z-10 text-center">
                <span className="inline-block bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    🇨🇴 Mundial 2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">
                    Compra tu <span className="text-amber-500 dark:text-amber-400">Bono Digital</span> de La Retoucherie de Manuela y participa GRATIS en la Polla Mundialista
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Compra servicios de belleza con tu bono y, de regalo, recibe intentos para predecir el marcador de la Selección Colombia. Si aciertas, ganas premios 🏆
                </p>
            </div>

            <div className="w-full max-w-md px-6 mt-6 relative z-10">
                <CountdownPartido />
            </div>

            <div className="w-full max-w-md px-6 relative z-10">
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur-lg p-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">
                        Polla Mundialista
                    </h2>
                    <p className="text-amber-500 dark:text-amber-400 font-semibold mb-1">La Retoucherie de Manuela</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                        Compra tu Bono Digital y participa prediciendo el marcador de la Selección Colombia 🇨🇴
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/comprar"
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
                        >
                            Comprar mi bono
                        </Link>
                        <Link
                            to="/ingresar"
                            className="w-full py-4 rounded-xl font-bold text-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
                        >
                            Ya compré mi bono → Ingresar
                        </Link>
                    </div>
                </div>
            </div>

            <ProximosPartidos />

            <ResumenPublico />
        </div>
    );
}
