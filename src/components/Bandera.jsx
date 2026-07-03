import { bandera, codigoPais } from '../utils/banderas';

// size: 'sm' = w40, 'md' = w80, 'lg' = w160 (para pantallas retina/grandes)
const CDN_SIZE = { sm: 'w40', md: 'w80', lg: 'w160' };

export default function Bandera({ equipo, className = 'w-6 h-6', size = 'md' }) {
    const codigo = codigoPais(equipo);

    if (!codigo) {
        return <span className={className}>{bandera(equipo)}</span>;
    }

    const res = CDN_SIZE[size] ?? 'w80';
    return (
        <img
            src={`https://flagcdn.com/${res}/${codigo}.png`}
            alt={equipo}
            title={equipo}
            className={`inline-block rounded-full object-cover border border-zinc-200 dark:border-white/20 ${className}`}
        />
    );
}
