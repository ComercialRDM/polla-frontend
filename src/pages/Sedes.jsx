import { Link } from 'react-router-dom';
import { SEDES, ESPECIALIDAD } from '../data/sedes';
import { SEO_INDICE, jsonLdIndice } from '../data/sedesSeo';
import useSeo from '../components/sedes/useSeo';
import { TarjetaSede } from '../components/sedes/Comunes';

export default function Sedes() {
    useSeo(SEO_INDICE, jsonLdIndice());
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200">
            <main className="max-w-5xl mx-auto px-4 py-12">
                <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">La Retoucherie de Manuela</p>
                <h1 className="mt-3 font-display text-white text-5xl sm:text-6xl leading-none">
                    Arreglo de ropa y sastrería en Barranquilla y Cartagena
                </h1>
                <p className="mt-4 max-w-2xl text-zinc-300">
                    Dobladillos, ajustes, cremalleras, vestidos de fiesta y parches de jean en cuatro centros comerciales.
                    {' '}{ESPECIALIDAD}
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                    {SEDES.map((s) => <TarjetaSede key={s.slug} sede={s} />)}
                </div>
            </main>
            <footer className="px-4 py-8 border-t border-zinc-800 text-center text-xs text-zinc-400">
                <Link to="/privacidad" className="hover:text-zinc-300">Política de privacidad</Link>
                <span aria-hidden="true"> · </span>
                <Link to="/terminos" className="hover:text-zinc-300">Términos y condiciones</Link>
            </footer>
        </div>
    );
}
