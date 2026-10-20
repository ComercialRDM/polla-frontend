import logo from '../assets/LOGO_RDM.jpeg';

const WHATSAPP_NUMERO = '573233833253';
const MENSAJE = 'Hola, quiero saber del nuevo concurso de La Retoucherie 🙋';

// Página de espera mientras se prepara el nuevo concurso. La Polla Mundialista
// terminó; su código queda en el tag `polla-mundialista-final`.
export default function Proximamente() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-7 max-w-md w-full">
                <img
                    src={logo}
                    alt="La Retoucherie de Manuela"
                    className="w-28 h-28 rounded-2xl object-cover shadow-2xl ring-2 ring-white/10"
                />

                <span className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
                    Gana con Retoucherie
                </span>

                <h1 className="font-display text-white text-5xl sm:text-6xl leading-none">
                    Nuevo concurso<br />muy pronto
                </h1>

                <p className="text-zinc-400 text-base leading-relaxed">
                    Estamos preparando una nueva forma de ganar con
                    La Retoucherie de Manuela. ¡Gracias a todos los que
                    participaron en la Polla Mundialista!
                </p>

                <div className="w-16 h-1 rounded-full bg-amber-400" />

                <a
                    href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-6 py-3 rounded-full transition-colors"
                >
                    Avísame por WhatsApp
                </a>

                <nav className="flex gap-4 text-xs text-zinc-500">
                    <a href="/terminos" className="hover:text-zinc-300 transition-colors">Términos y condiciones</a>
                    <span>·</span>
                    <a href="/privacidad" className="hover:text-zinc-300 transition-colors">Política de privacidad</a>
                </nav>
            </div>
        </main>
    );
}
