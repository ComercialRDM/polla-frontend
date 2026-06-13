import { Link } from 'react-router-dom';
import promoFlyer from '../assets/promo-flyer.jpg';
import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';

const PREMIOS = [
    { imagen: camisetaImg, titulo: 'Camiseta Oficial', descripcion: 'Selección Colombia 2026' },
    { imagen: gorraImg, titulo: 'Gorra Edición Especial', descripcion: 'Tricolor bordada' },
    { imagen: balonImg, titulo: 'Balón Mundialista', descripcion: 'Réplica oficial' },
    { imagen: gafasImg, titulo: 'Bono Sorpresa', descripcion: 'Servicios Retoucherie' },
];

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-950 stadium-glow">
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
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] p-6 text-center">
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
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
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

            {/* Botín de Premios Mundialistas */}
            <div className="w-full max-w-md px-6 mt-10 relative z-10">
                <h2 className="text-center text-white font-black text-xl mb-1">
                    🏆 Botín de Premios Mundialistas
                </h2>
                <p className="text-center text-zinc-400 text-sm mb-4">
                    Los aciertos más rápidos se llevan estos premios
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {PREMIOS.map((premio) => (
                        <div
                            key={premio.titulo}
                            className="group rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-yellow-400 hover:via-blue-500 hover:to-red-500"
                        >
                            <div className="rounded-xl bg-zinc-950/60 group-hover:bg-zinc-950/80 p-4 transition-colors">
                                <img
                                    src={premio.imagen}
                                    alt={premio.titulo}
                                    className="w-full h-24 object-cover rounded-lg shadow-lg shadow-black/40 mb-2"
                                />
                                <p className="text-white font-bold text-sm">{premio.titulo}</p>
                                <p className="text-zinc-400 text-xs">{premio.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-zinc-500 text-xs text-center px-6 py-8">
                Arreglos y Transformaciones Retoucherie de Manuela · Barranquilla
            </p>
        </div>
    );
}
