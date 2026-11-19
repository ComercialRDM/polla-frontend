import { Link, Navigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Star, ChevronDown, Scissors, Car, PlayCircle } from 'lucide-react';
import {
    SEDES, SERVICIOS, ESPECIALIDAD, DIAS, sedePorSlug, mapaEmbebido, enlaceWhatsApp, mensajeSede, enlaceTel,
} from '../data/sedes';
import { seoSede, jsonLdSede, faqSede, h1Sede } from '../data/sedesSeo';
import { rangoLegible, horarioDeHoy } from '../utils/horario';
import FotoSede from '../components/sedes/FotoSede';
import useSeo from '../components/sedes/useSeo';
import { EstadoAhora, BotonesSede, TarjetaSede } from '../components/sedes/Comunes';

const GALERIA = ['fachada-2', 'fachada-3', 'taller', 'atencion'];
const RECORRIDO = ['recorrido-1', 'recorrido-2'];
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0]; // lunes primero

function Seccion({ id, titulo, children }) {
    return (
        <section aria-labelledby={id} className="px-4 py-10 border-t border-zinc-800">
            <div className="max-w-3xl mx-auto">
                <h2 id={id} className="font-display text-white text-4xl leading-none mb-5">{titulo}</h2>
                {children}
            </div>
        </section>
    );
}

export default function Sede() {
    const { slug } = useParams();
    const sede = sedePorSlug(slug);
    if (!sede) return <Navigate to="/sedes" replace />;
    return <PaginaSede key={sede.slug} sede={sede} />;
}

function PaginaSede({ sede }) {
    useSeo(seoSede(sede), jsonLdSede(sede));
    const hoy = horarioDeHoy(sede);
    const galeria = GALERIA.filter((n) => sede.fotos[n]);
    const recorrido = RECORRIDO.filter((n) => sede.fotos[n]);
    const faq = faqSede(sede);
    const otras = SEDES.filter((s) => s.slug !== sede.slug);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 pb-24 sm:pb-0">
            <header className="px-4 py-3 border-b border-zinc-800">
                <nav aria-label="Ruta" className="max-w-3xl mx-auto text-xs text-zinc-400">
                    <Link to="/" className="hover:text-white">Inicio</Link>
                    <span aria-hidden="true"> › </span>
                    <Link to="/sedes" className="hover:text-white">Sedes</Link>
                    <span aria-hidden="true"> › </span>
                    <span className="text-zinc-200" aria-current="page">CC {sede.nombreCorto}</span>
                </nav>
            </header>

            <main>
                {/* 1. Hero */}
                <section className="relative isolate flex items-end min-h-[62vh] sm:min-h-[70vh]">
                    {sede.fotos.fachada ? (
                        <div className="absolute inset-0 -z-10">
                            <FotoSede
                                sede={sede}
                                nombre="fachada"
                                nombreMovil="fachada-vertical"
                                prioridad
                                sizes="100vw"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/10" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-400/15 to-zinc-950" />
                    )}
                    <div className="w-full max-w-3xl mx-auto px-4 pb-8 pt-24">
                        <h1 className="font-display text-white text-5xl sm:text-6xl leading-none">{h1Sede(sede)}</h1>
                        <p className="mt-4 flex items-start gap-2 text-amber-400 text-2xl sm:text-3xl font-bold leading-tight">
                            <MapPin size={26} className="shrink-0 mt-1" aria-hidden="true" />
                            <span>{sede.ubicacionInterna}</span>
                        </p>
                        <p className="mt-2 text-zinc-200">
                            {sede.centroComercial} · {sede.direccion}{sede.barrio ? `, ${sede.barrio}` : ''} · Barranquilla
                        </p>
                        <EstadoAhora sede={sede} className="mt-4 bg-zinc-950/80 rounded-full px-3 py-1.5" />
                        <div className="hidden sm:block mt-6">
                            <BotonesSede sede={sede} />
                        </div>
                    </div>
                </section>

                {/* 2. Barra fija en celular */}
                <BotonesSede sede={sede} fijo />

                {/* 3. Ubicación */}
                <Seccion id="donde" titulo="¿Dónde estamos exactamente?">
                    <dl className="grid gap-3 text-zinc-300">
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-zinc-400">Ubicación</dt>
                            <dd className="text-white font-semibold">{sede.ubicacionInterna}, {sede.centroComercial}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-zinc-400">Dirección</dt>
                            <dd>{sede.direccion}{sede.barrio ? `, ${sede.barrio}` : ''}, {sede.ciudad}</dd>
                        </div>
                        {sede.referencia && (
                            <div>
                                <dt className="text-xs uppercase tracking-wider text-zinc-400">Referencia</dt>
                                <dd>{sede.referencia}</dd>
                            </div>
                        )}
                        {sede.comoLlegar && (
                            <div>
                                <dt className="text-xs uppercase tracking-wider text-zinc-400">Cómo llegar</dt>
                                <dd>{sede.comoLlegar}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-zinc-400">Teléfono</dt>
                            <dd>
                                <a href={enlaceTel(sede)} className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 underline">
                                    <Phone size={14} aria-hidden="true" /> {sede.telefonoFijo}
                                </a>
                            </dd>
                        </div>
                    </dl>
                    {recorrido.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-3 mt-6">
                            {recorrido.map((n) => (
                                <FotoSede key={n} sede={sede} nombre={n} sizes="(min-width: 640px) 50vw, 100vw"
                                    className="w-full rounded-xl object-cover" />
                            ))}
                        </div>
                    )}
                    {sede.videoComoLlegar && (
                        <a href={sede.videoComoLlegar} target="_blank" rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 min-h-11 text-amber-400 hover:text-amber-300 font-semibold">
                            <PlayCircle size={20} aria-hidden="true" /> Ver video: cómo llegar
                        </a>
                    )}
                    <iframe
                        title={`Mapa de ${sede.nombre}`}
                        src={mapaEmbebido(sede)}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="mt-6 w-full h-72 rounded-xl border border-zinc-800 bg-zinc-900"
                    />
                </Seccion>

                {/* 4. Horario */}
                <Seccion id="horario" titulo="Horario">
                    <table className="w-full text-left">
                        <caption className="sr-only">Horario de atención de la sede {sede.nombreCorto}</caption>
                        <tbody>
                            {ORDEN_DIAS.map((dow) => {
                                const esHoy = dow === hoy.dow;
                                return (
                                    <tr key={dow} className={esHoy ? 'bg-amber-400/10 text-white font-semibold' : 'text-zinc-300'}>
                                        <th scope="row" className="py-2 px-3 font-normal rounded-l-lg">
                                            {DIAS[dow]}{esHoy && <span className="ml-2 text-xs text-amber-400 font-bold">HOY</span>}
                                        </th>
                                        <td className="py-2 px-3 text-right rounded-r-lg">{rangoLegible(sede.horario.dias[dow])}</td>
                                    </tr>
                                );
                            })}
                            <tr className={hoy.festivo ? 'bg-amber-400/10 text-white font-semibold' : 'text-zinc-300'}>
                                <th scope="row" className="py-2 px-3 font-normal rounded-l-lg">Festivos</th>
                                <td className="py-2 px-3 text-right rounded-r-lg">{rangoLegible(sede.horario.festivo)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-3 text-xs text-zinc-400">
                        En festivos aplica el horario de festivos. El horario puede cambiar en temporadas especiales del centro comercial.
                    </p>
                </Seccion>

                {/* 5. Así trabajamos */}
                {(sede.fotos.interior || galeria.length > 0 || sede.videoLocal) && (
                    <Seccion id="trabajamos" titulo="Así trabajamos">
                        {sede.fotos.interior && (
                            <FotoSede sede={sede} nombre="interior" sizes="(min-width: 768px) 768px, 100vw"
                                className="w-full rounded-xl object-cover" />
                        )}
                        {galeria.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                {galeria.map((n) => (
                                    <FotoSede key={n} sede={sede} nombre={n} sizes="(min-width: 640px) 33vw, 50vw"
                                        className="w-full aspect-square rounded-xl object-cover" />
                                ))}
                            </div>
                        )}
                        {sede.videoLocal && (
                            <a href={sede.videoLocal} target="_blank" rel="noopener noreferrer"
                                className="mt-5 inline-flex items-center gap-2 min-h-11 text-amber-400 hover:text-amber-300 font-semibold">
                                <PlayCircle size={20} aria-hidden="true" /> Así es nuestra sede (video en Instagram)
                            </a>
                        )}
                    </Seccion>
                )}

                {/* 6. Servicios */}
                <Seccion id="servicios" titulo="Servicios">
                    <p className="mb-4 text-zinc-300">{ESPECIALIDAD}</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                        {SERVICIOS.map((s) => (
                            <li key={s} className="flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                                <span className="flex items-center gap-2 text-white">
                                    <Scissors size={16} className="text-amber-400 shrink-0" aria-hidden="true" /> {s}
                                </span>
                                <a
                                    href={enlaceWhatsApp(mensajeSede(sede, s))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Consultar ${s.toLowerCase()} por WhatsApp`}
                                    className="shrink-0 inline-flex items-center min-h-11 text-xs font-bold text-green-400 hover:text-green-300"
                                >
                                    Consulta por WhatsApp
                                </a>
                            </li>
                        ))}
                    </ul>
                </Seccion>

                {/* 7. Reseñas */}
                {sede.resenaUrl && (
                    <Seccion id="opiniones" titulo="¿Ya nos visitaste?">
                        <p className="text-zinc-300 mb-4">Tu opinión ayuda a otras personas a encontrarnos.</p>
                        <a href={sede.resenaUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 min-h-12 px-5 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-colors">
                            <Star size={18} aria-hidden="true" /> Déjanos tu opinión en Google
                        </a>
                    </Seccion>
                )}

                {/* 8. Preguntas frecuentes */}
                <Seccion id="faq" titulo="Preguntas frecuentes">
                    <div className="flex flex-col gap-2">
                        {faq.map(({ p, r }) => (
                            <details key={p} className="group bg-zinc-900 border border-zinc-800 rounded-xl">
                                <summary className="flex items-center justify-between gap-3 min-h-12 px-4 py-3 cursor-pointer text-white font-semibold list-none">
                                    {p}
                                    <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                                </summary>
                                <p className="px-4 pb-4 text-zinc-300">
                                    {p === '¿Hay parqueadero?' && <Car size={16} className="inline mr-1.5 text-amber-400" aria-hidden="true" />}
                                    {r}
                                </p>
                            </details>
                        ))}
                    </div>
                </Seccion>

                {/* 9. Otras sedes */}
                <Seccion id="otras" titulo="Otras sedes">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {otras.map((s) => <TarjetaSede key={s.slug} sede={s} encabezado="h3" />)}
                    </div>
                </Seccion>
            </main>

            <footer className="px-4 py-8 border-t border-zinc-800 text-center text-xs text-zinc-400">
                <p>{sede.nombre} · {sede.direccion} · {sede.telefonoFijo}</p>
                <p className="mt-2">
                    <Link to="/sedes" className="hover:text-zinc-300">Todas las sedes</Link>
                    <span aria-hidden="true"> · </span>
                    <Link to="/privacidad" className="hover:text-zinc-300">Política de privacidad</Link>
                </p>
            </footer>
        </div>
    );
}
