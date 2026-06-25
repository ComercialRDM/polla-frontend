import { Link } from 'react-router-dom';
import TrustBadges from './TrustBadges';

export default function Footer() {
    return (
        <footer className="w-full max-w-md px-6 py-8 text-center">
            <TrustBadges compact />
            <div className="flex justify-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 mt-4 mb-3">
                <Link to="/terminos" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Términos y condiciones</Link>
                <span>·</span>
                <Link to="/privacidad" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Política de privacidad</Link>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Arreglos y Transformaciones Retoucherie de Manuela · Barranquilla · NIT 901765354
            </p>
        </footer>
    );
}
