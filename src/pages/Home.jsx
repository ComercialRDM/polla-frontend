import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-black text-zinc-950 shadow-lg shadow-orange-500/30 mb-6">
                LM
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                Polla Mundialista
            </h1>
            <p className="text-amber-400 font-semibold mb-1">La Retoucherie de Manuela</p>
            <p className="text-zinc-400 text-sm max-w-sm mb-10">
                Compra tu Bono Digital y participa prediciendo el marcador de la Selección Colombia 🇨🇴
            </p>

            <div className="w-full max-w-sm flex flex-col gap-4">
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
    );
}
