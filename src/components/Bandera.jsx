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
            srcSet={`https://flagcdn.com/w40/${codigo}.png 40w, https://flagcdn.com/w80/${codigo}.png 80w, https://flagcdn.com/w160/${codigo}.png 160w`}
            sizes="(max-width: 640px) 40px, 80px"
            alt={equipo}
            title={equipo}
            loading="lazy"
            decoding="async"
            className={`inline-block rounded-full object-cover border border-zinc-200 dark:border-white/20 ${className}`}
        />
    );
}
