import { bandera, codigoPais } from '../utils/banderas';

// size: 'sm' = w40, 'md' = w80, 'lg' = w160 (para pantallas retina/grandes)
const CDN_SIZE = { sm: 'w40', md: 'w80', lg: 'w160' };

export default function Bandera({ equipo, className = 'w-6 h-6', size = 'md', gloss = false }) {
    const codigo = codigoPais(equipo);
    const res = CDN_SIZE[size] ?? 'w80';

    if (!codigo) {
        return <span className={className}>{bandera(equipo)}</span>;
    }

    if (gloss) {
        return (
            <div
                className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
                style={{
                    boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
            >
                <img
                    src={`https://flagcdn.com/${res}/${codigo}.png`}
                    srcSet={`https://flagcdn.com/w40/${codigo}.png 40w, https://flagcdn.com/w80/${codigo}.png 80w, https://flagcdn.com/w160/${codigo}.png 160w`}
                    sizes="(max-width: 640px) 40px, 80px"
                    alt={equipo}
                    title={equipo}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full rounded-full object-cover"
                />
                {/* Destello superior */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 35%, transparent 60%)' }}
                />
                {/* Profundidad inferior */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-2/5 rounded-b-full pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.28), transparent)' }}
                />
            </div>
        );
    }

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
