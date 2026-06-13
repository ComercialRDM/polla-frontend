import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full max-w-md px-6 py-8 text-center">
            <div className="flex justify-center gap-4 text-xs text-zinc-500 mb-3">
                <Link to="/terminos" className="hover:text-zinc-300 transition-colors">Términos y condiciones</Link>
                <span>·</span>
                <Link to="/privacidad" className="hover:text-zinc-300 transition-colors">Política de privacidad</Link>
            </div>
            <p className="text-zinc-500 text-xs">
                Arreglos y Transformaciones Retoucherie de Manuela · Barranquilla · NIT 901765354
            </p>
        </footer>
    );
}
