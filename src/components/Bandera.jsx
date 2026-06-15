import { bandera, codigoPais } from '../utils/banderas';

/**
 * Muestra la bandera de un país como imagen circular (flagcdn.com).
 * Si no hay código de país mapeado, muestra el emoji de respaldo.
 */
export default function Bandera({ equipo, className = 'w-6 h-6' }) {
    const codigo = codigoPais(equipo);

    if (!codigo) {
        return <span className={className}>{bandera(equipo)}</span>;
    }

    return (
        <img
            src={`https://flagcdn.com/w40/${codigo}.png`}
            alt={equipo}
            title={equipo}
            className={`inline-block rounded-full object-cover border border-zinc-200 dark:border-white/20 ${className}`}
        />
    );
}
