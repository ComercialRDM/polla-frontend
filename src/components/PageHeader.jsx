import { Link } from 'react-router-dom';
import logo from '../assets/LOGO_RDM.jpeg';

/**
 * Header sticky compartido para páginas internas.
 * Incluye la franja Colombia arriba + barra con logo, botón Inicio y título.
 * Reemplaza el bloque "franja + sticky header" que antes cada página duplicaba.
 */
export default function PageHeader({ titulo = '' }) {
    return (
        <>
            {/* Franja Colombia */}
            <div className="fixed top-0 left-0 right-0 h-1.5 flex z-50">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            {/* Barra de navegación */}
            <div className="sticky top-1.5 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3">
                {/* Botón ← Inicio estilizado */}
                <Link
                    to="/"
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:border-zinc-400 dark:hover:border-white/30 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                    ← Inicio
                </Link>

                {/* Logo centrado */}
                <Link to="/" className="absolute left-1/2 -translate-x-1/2">
                    <img
                        src={logo}
                        alt="La Retoucherie de Manuela"
                        className="h-8 w-auto object-contain rounded"
                    />
                </Link>

                {/* Título a la derecha */}
                {titulo && (
                    <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[110px] text-right">
                        {titulo}
                    </p>
                )}
            </div>
        </>
    );
}
