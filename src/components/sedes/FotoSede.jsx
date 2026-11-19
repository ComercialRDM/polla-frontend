import { rutaFoto, srcsetFoto as srcset } from '../../data/sedes';

// Foto de sede con WebP + JPG de respaldo y versión de 800 px para celulares.
// Solo renderiza fotos listadas en sede.fotos: nunca hay imágenes rotas.
// `nombreMovil`: foto alterna para pantallas angostas (p. ej. fachada-vertical), si existe.
export default function FotoSede({ sede, nombre, nombreMovil, alt, className = '', prioridad = false, sizes = '100vw' }) {
    const datos = sede.fotos[nombre];
    if (!datos) return null;
    const movil = nombreMovil && sede.fotos[nombreMovil] ? nombreMovil : null;
    const MOVIL = '(max-width: 639px)';
    return (
        <picture className="contents">
            {movil && <source media={MOVIL} type="image/webp" srcSet={srcset(sede, movil, 'webp')} sizes="100vw" />}
            {movil && <source media={MOVIL} type="image/jpeg" srcSet={srcset(sede, movil, 'jpg')} sizes="100vw" />}
            <source type="image/webp" srcSet={srcset(sede, nombre, 'webp')} sizes={sizes} />
            <img
                src={`${rutaFoto(sede, nombre)}.jpg`}
                srcSet={srcset(sede, nombre, 'jpg')}
                sizes={sizes}
                width={datos.w}
                height={datos.h}
                alt={alt || datos.alt}
                loading={prioridad ? 'eager' : 'lazy'}
                fetchPriority={prioridad ? 'high' : undefined}
                decoding="async"
                className={className}
            />
        </picture>
    );
}
