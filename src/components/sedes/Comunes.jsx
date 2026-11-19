import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Navigation, Phone, MapPin, Clock } from 'lucide-react';
import {
    enlaceMaps, enlaceTel, enlaceWhatsApp, mensajeSede, lineaDireccion,
} from '../../data/sedes';
import { estadoAhora, horarioDeHoy, rangoLegible } from '../../utils/horario';
import FotoSede from './FotoSede';

// "Abierto ahora / Cerrado · abre a las…", recalculado cada minuto en hora de Colombia.
export function EstadoAhora({ sede, className = '' }) {
    const [estado, setEstado] = useState(() => estadoAhora(sede));
    useEffect(() => {
        const id = setInterval(() => setEstado(estadoAhora(sede)), 60000);
        return () => clearInterval(id);
    }, [sede]);
    return (
        <p className={`inline-flex items-center gap-2 text-sm font-semibold ${className}`} aria-live="polite">
            <span
                aria-hidden="true"
                className={`w-2.5 h-2.5 rounded-full ${estado.abierto ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className={estado.abierto ? 'text-green-300' : 'text-red-300'}>{estado.texto}</span>
        </p>
    );
}

const boton = 'flex flex-1 items-center justify-center gap-2 min-h-12 px-3 rounded-xl font-bold text-sm '
    + 'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400';

export function BotonesSede({ sede, fijo = false }) {
    const contenido = (
        <div className="flex gap-2 w-full max-w-3xl mx-auto">
            <a
                href={enlaceWhatsApp(mensajeSede(sede))}
                target="_blank"
                rel="noopener noreferrer"
                className={`${boton} bg-green-700 hover:bg-green-600 text-white`}
            >
                <MessageCircle size={18} aria-hidden="true" /> WhatsApp
            </a>
            <a
                href={enlaceMaps(sede)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${boton} bg-amber-400 hover:bg-amber-300 text-zinc-950`}
            >
                <Navigation size={18} aria-hidden="true" /> Cómo llegar
            </a>
            <a href={enlaceTel(sede)} className={`${boton} bg-zinc-800 hover:bg-zinc-700 text-white`}>
                <Phone size={18} aria-hidden="true" /> Llamar
            </a>
        </div>
    );
    if (!fijo) return contenido;
    return (
        <div
            className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-3 pt-3 sm:hidden"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
            {contenido}
        </div>
    );
}

// Tarjeta de sede para el índice y para "Otras sedes".
export function TarjetaSede({ sede, encabezado: Encabezado = 'h2' }) {
    const hoy = horarioDeHoy(sede);
    return (
        <article className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <Link to={`/sedes/${sede.slug}`} className="block focus-visible:outline-2 focus-visible:outline-amber-400">
                {sede.fotos.fachada ? (
                    <FotoSede
                        sede={sede}
                        nombre="fachada"
                        alt={`Fachada de La Retoucherie de Manuela en el ${sede.centroComercial}`}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="w-full aspect-[4/3] object-cover"
                    />
                ) : (
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-400/20 to-zinc-900 flex items-end p-4">
                        <span className="font-display text-4xl text-amber-400">{sede.nombreCorto}</span>
                    </div>
                )}
            </Link>
            <div className="flex flex-col gap-3 p-4 flex-1">
                <Encabezado className="font-display text-white text-3xl leading-none">
                    <Link to={`/sedes/${sede.slug}`} className="hover:text-amber-400 transition-colors">
                        CC {sede.nombreCorto}
                    </Link>
                </Encabezado>
                <p className="flex gap-2 text-sm text-zinc-300">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
                    <span>{sede.ubicacionInterna} · {lineaDireccion(sede)}</span>
                </p>
                <p className="flex gap-2 text-sm text-zinc-300">
                    <Clock size={16} className="shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
                    <span>Hoy{hoy.festivo ? ' (festivo)' : ''}: {rangoLegible(hoy.rango)}</span>
                </p>
                <EstadoAhora sede={sede} />
                <div className="mt-auto pt-2">
                    <BotonesSede sede={sede} />
                </div>
            </div>
        </article>
    );
}
