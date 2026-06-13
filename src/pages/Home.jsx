import { Link } from 'react-router-dom';
import promoFlyer from '../assets/promo-flyer.jpg';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            <div className="w-full max-w-md">
                <img
                    src={promoFlyer}
                    alt="¡Arma tu Polla Mundialista 2026! La Retoucherie de Manuela"
                    className="w-full h-auto block"
                />
            </div>

            <div className="w-full max-w-md px-6 -mt-6 relative z-10">
                <div className="rounded-2xl border border-amber-400/30 bg-zinc-950/90 backdrop-blur-sm shadow-xl shadow-black/40 p-6 text-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                        Polla Mundialista
                    </h1>
                    <p className="text-amber-400 font-semibold mb-1">La Retoucherie de Manuela</p>
                    <p className="text-zinc-400 text-sm mb-6">
                        Compra tu Bono Digital y participa prediciendo el marcador de la Selección Colombia 🇨🇴
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/comprar"
                            className="w-full py-4 rounded-xl font-bold text-zinc-950 text-center bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                        >
                            Comprar mi bono
                        </Link>
                        <Link
                            to="/ingresar"
                            className="w-full py-4 rounded-xl font-bold text-center text-white border border-white/15 bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
                        >
                            Ya compré mi bono → Ingresar
                        </Link>
                    </div>
                </div>
            </div>

            <p className="text-zinc-500 text-xs text-center px-6 py-8">
                Arreglos y Transformaciones Retoucherie de Manuela · Barranquilla
            </p>
        </div>
    );
}
