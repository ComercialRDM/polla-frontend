import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';
import PlanesBono from '../components/PlanesBono';
import UltimosResultados from '../components/UltimosResultados';
import ListaPronosticos from '../components/ListaPronosticos';

const PREMIOS = [
    { imagen: camisetaImg, titulo: 'Camiseta Oficial', descripcion: 'Selección Colombia 2026' },
    { imagen: gorraImg, titulo: 'Gorra Edición Especial', descripcion: 'Tricolor bordada' },
    { imagen: balonImg, titulo: 'Balón Mundialista', descripcion: 'Réplica oficial' },
    { imagen: gafasImg, titulo: 'Bono Sorpresa', descripcion: 'Servicios Retoucherie' },
];

export default function Premios() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-950 stadium-glow pb-28">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            <div className="w-full max-w-md px-6 mt-8 relative z-10 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">
                    🏆 Premios de la Polla Mundialista
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Compra tu Bono Digital y participa por estos premios prediciendo el marcador de la Selección Colombia.
                </p>
            </div>

            <PlanesBono />

            <div className="w-full max-w-md px-6 mt-10 relative z-10">
                <h2 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-1">
                    🏆 Botín de Premios Mundialistas
                </h2>
                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Los aciertos más rápidos se llevan estos premios
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {PREMIOS.map((premio) => (
                        <div
                            key={premio.titulo}
                            className="group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-yellow-400 hover:via-blue-500 hover:to-red-500"
                        >
                            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-950/60 group-hover:bg-zinc-950/10 dark:group-hover:bg-zinc-950/80 p-4 transition-colors">
                                <img
                                    src={premio.imagen}
                                    alt={premio.titulo}
                                    className="w-full h-24 object-cover rounded-lg shadow-lg shadow-black/40 mb-2"
                                />
                                <p className="text-zinc-900 dark:text-white font-bold text-sm">{premio.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{premio.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <UltimosResultados />

            <ListaPronosticos />
        </div>
    );
}
