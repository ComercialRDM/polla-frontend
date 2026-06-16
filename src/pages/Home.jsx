import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import CountdownPartido from '../components/CountdownPartido';
import ProximosPartidos from '../components/ProximosPartidos';
import ResumenPublico from '../components/ResumenPublico';
import PlanesBono from '../components/PlanesBono';
import campanaImg from '../assets/Polla Mundialista Retoucherie.png';

const COLORES_CONFETI = ['#FCD116', '#000000', '#CE1126', '#ffffff'];

export default function Home() {
    useEffect(() => {
        if (localStorage.getItem('confeti_bienvenida')) return;
        localStorage.setItem('confeti_bienvenida', '1');
        const disparo = (o) => confetti({ colors: COLORES_CONFETI, ...o });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 }, angle: 60 });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 }, angle: 120 });
        disparo({ particleCount: 80, spread: 100, origin: { y: 0.4 } });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-100 dark:bg-zinc-950 pb-28">

            {/* Header marca - negro con acento amarillo */}
            <header className="w-full bg-zinc-950 border-b-4 border-[#FCD116]">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="font-display text-[#FCD116] text-xl tracking-widest uppercase leading-none">La Retoucherie</p>
                        <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">de Manuela · Polla Mundialista</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-wide">En vivo</span>
                    </div>
                </div>
            </header>

            {/* Imagen de campaña */}
            <div className="w-full max-w-md px-4 mt-4">
                <img
                    src={campanaImg}
                    alt="Polla Mundialista La Retoucherie"
                    className="w-full rounded-xl shadow-lg object-cover"
                />
            </div>

            {/* Countdown */}
            <div className="w-full max-w-md px-4 mt-4">
                <CountdownPartido />
            </div>

            {/* CTA comprar */}
            <div className="w-full max-w-md px-4 mt-4">
                <Link
                    to="/comprar"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-2xl tracking-wide text-zinc-950 bg-[#FCD116] shadow-lg active:scale-95 transition-transform"
                >
                    ⚽ COMPRAR MI BONO
                </Link>
            </div>

            {/* Planes */}
            <PlanesBono />

            {/* Ya tengo bono */}
            <div className="w-full max-w-md px-4 mt-3">
                <Link
                    to="/ingresar"
                    className="w-full flex items-center justify-center py-3 rounded-xl font-bold text-sm text-zinc-400 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 active:scale-95 transition-transform"
                >
                    Ya tengo mi bono → Ingresar
                </Link>
            </div>

            {/* Sección próximos partidos */}
            <div className="w-full max-w-md px-4 mt-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                    <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                        Partidos del día
                    </h2>
                </div>
            </div>

            <ProximosPartidos />

            <ResumenPublico />
        </div>
    );
}
