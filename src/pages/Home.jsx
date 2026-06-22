import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../utils/sesion';
import confetti from 'canvas-confetti';
import CountdownPartido from '../components/CountdownPartido';
import ProximosPartidos from '../components/ProximosPartidos';
import ResumenPublico from '../components/ResumenPublico';
import PlanesBono from '../components/PlanesBono';
import CuposRestantes from '../components/CuposRestantes';
import UltimosResultados from '../components/UltimosResultados';
import ListaPronosticos from '../components/ListaPronosticos';
import FAQ from '../components/FAQ';
import Testimonios from '../components/Testimonios';
import Footer from '../components/Footer';
import PartidosFlash from '../components/PartidosFlash';
import DashboardUsuario from '../components/DashboardUsuario';
import campanaImg from '../assets/Polla Mundialista Retoucherie_Comprimida.webp';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';
import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';

const COLORES_CONFETI = ['#FCD116', '#000000', '#CE1126', '#ffffff'];

const PREMIOS = [
    { imagen: camisetaImg, titulo: 'Camiseta Oficial', descripcion: 'Selección Colombia 2026' },
    { imagen: gorraImg, titulo: 'Gorra Edición Especial', descripcion: 'Tricolor bordada' },
    { imagen: balonImg, titulo: 'Balón Mundialista', descripcion: 'colores disponibles' },
    { imagen: gafasImg, titulo: 'Gafas oficiales', descripcion: 'colores disponibles' },
];

const PASOS = [
    { emoji: '💳', titulo: 'Compra tu Bono Digital', descripcion: 'Elige el plan que más te guste: $50.000, $100.000 o $200.000.' },
    { emoji: '🎁', titulo: 'Recibe tu bono y tus intentos', descripcion: 'Te llega por correo tu Bono Digital y tus intentos para pronosticar.' },
    { emoji: '⚽', titulo: 'Predice el marcador de Colombia', descripcion: 'Antes de que inicie el partido, ingresa tu pronóstico exacto.' },
    { emoji: '🏆', titulo: 'Gana premios si aciertas', descripcion: 'Los pronósticos exactos se llevan premios y usan su bono en La Retoucherie.' },
];

const WHATSAPP_NUMERO = '573103963708';
const INSTAGRAM_USUARIO = '@retoucherie_col';

const SEDES = [
    { ciudad: 'Barranquilla', nombre: 'Cc Buenavista', direccion: 'Sótano 2, local 17', telefono: '6053131966' },
    { ciudad: 'Barranquilla', nombre: 'Cc Viva Barranquilla', direccion: 'Sótano 1', telefono: '6053093750' },
    { ciudad: 'Barranquilla', nombre: 'Cc Aranjuez', direccion: 'Calle 82 #53', telefono: '6052022021' },
    { ciudad: 'Cartagena', nombre: 'Cc Caribe Plaza', direccion: 'Sótano 1', telefono: '6056515251' },
];

function Divisor() {
    return (
        <div className="w-full max-w-md px-4 mt-12">
            <div className="w-full flex rounded-full overflow-hidden h-1">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#003893]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>
        </div>
    );
}

function SeccionHeader({ titulo, id }) {
    return (
        <div id={id} className="w-full max-w-md px-4 mt-8">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                    {titulo}
                </h2>
            </div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const sesion = obtenerSesion();

    useEffect(() => {
        const disparo = (o) => confetti({ colors: COLORES_CONFETI, ...o });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 }, angle: 60 });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 }, angle: 120 });
        disparo({ particleCount: 80, spread: 100, origin: { y: 0.4 } });
    }, []);

    function handleCerrarSesion() {
        cerrarSesion();
        navigate(0); // recarga la página
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-100 dark:bg-zinc-950 pb-28">

            {/* ── INICIO ── */}
            <header id="inicio" className="w-full bg-zinc-950 border-b-4 border-[#FCD116]">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logoRetoucherie} alt="La Retoucherie de Manuela" className="h-9 w-auto rounded-sm" />
                        <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">Polla Mundialista Retoucherie</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-[10px] font-bold uppercase tracking-wide">En vivo</span>
                    </div>
                </div>
            </header>

            {/* Bienvenida / Auth */}
            {sesion ? (
                <DashboardUsuario sesion={sesion} onSalir={handleCerrarSesion} />
            ) : (
                <div className="w-full max-w-md px-4 mt-3 flex gap-3">
                    <Link
                        to="/registro"
                        className="flex-1 flex items-center justify-center py-2.5 rounded-xl font-bold text-sm text-white bg-zinc-900 active:scale-95 transition-transform"
                    >
                        Registrarse
                    </Link>
                    <Link
                        to="/iniciar-sesion"
                        className="flex-1 flex items-center justify-center py-2.5 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            )}

            {!sesion && (
                <div className="w-full max-w-md px-4 mt-4">
                    <Link to="/iniciar-sesion">
                        <img
                            src={campanaImg}
                            alt="Polla Mundialista La Retoucherie"
                            className="w-[88%] mx-auto block rounded-xl shadow-lg object-cover active:scale-95 transition-transform cursor-pointer"
                        />
                    </Link>
                </div>
            )}

            <PartidosFlash />

            <div className="w-full max-w-md px-4 mt-4">
                <Link
                    to="/comprar"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-2xl tracking-wide text-zinc-950 bg-[#FCD116] shadow-lg active:scale-95 transition-transform"
                >
                    ⚽ COMPRAR MI BONO
                </Link>
            </div>

            <PlanesBono />

            <div className="w-full max-w-md px-4 mt-3">
                <CuposRestantes />
            </div>

            <SeccionHeader titulo="Partidos del día" id="partidos" />
            <div className="w-full max-w-md px-4 mt-4">
                <CountdownPartido />
            </div>
            <ProximosPartidos />
            <ResumenPublico />

            {/* ── PREMIOS ── */}
            <Divisor />
            <SeccionHeader titulo="🏆 Premios" id="premios" />

            <div className="w-full max-w-md px-4 mt-1">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Compra tu Bono Digital y participa por estos premios prediciendo el marcador de la Selección Colombia.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {PREMIOS.map((premio) => (
                        <div
                            key={premio.titulo}
                            className="group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-yellow-400 hover:via-blue-500 hover:to-red-500"
                        >
                            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-950/60 group-hover:bg-zinc-950/10 dark:group-hover:bg-zinc-950/80 p-4 transition-colors">
                                <img
                                    src={premio.imagen}
                                    alt={premio.titulo}
                                    className="w-full h-24 object-cover rounded-lg shadow-lg shadow-black/40 mb-2"
                                />
                                <p className="text-zinc-900 dark:text-white font-bold text-sm">{premio.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{premio.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <UltimosResultados />
            <ListaPronosticos />

            {/* ── CÓMO PARTICIPO ── */}
            <Divisor />
            <SeccionHeader titulo="¿Cómo participo?" id="como-participo" />

            <div className="w-full max-w-md px-4 mt-1">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Así de fácil es participar y ganar premios en la Polla Mundialista.
                </p>
                <div className="flex flex-col gap-3">
                    {PASOS.map((paso, i) => (
                        <div
                            key={paso.titulo}
                            className="flex items-start gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4"
                        >
                            <span className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.5)] flex items-center justify-center text-xl font-black text-zinc-950">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-zinc-900 dark:text-white font-bold text-sm">{paso.emoji} {paso.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{paso.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── NOSOTROS ── */}
            <Divisor />
            <SeccionHeader titulo="📍 Nosotros" id="nosotros" />

            <div className="w-full max-w-md px-4 mt-1">
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-6 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                        La Retoucherie es un centro de belleza y bienestar con sedes en Barranquilla y Cartagena.
                        Esta Polla Mundialista es nuestro regalo para celebrar el Mundial 2026 junto a nuestros clientes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-left">
                        {SEDES.map((sede) => (
                            <div key={sede.nombre} className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                                <p className="text-zinc-900 dark:text-white font-bold text-xs">{sede.nombre}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{sede.ciudad} · {sede.direccion}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">📞 {sede.telefono}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={`https://instagram.com/${INSTAGRAM_USUARIO.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block py-2.5 px-4 rounded-xl font-bold text-sm text-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                        >
                            📷 {INSTAGRAM_USUARIO}
                        </a>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Hola, tengo una pregunta sobre la Polla Mundialista 🙋')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block py-2.5 px-4 rounded-xl font-bold text-sm text-center text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            💬 Escríbenos por WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* ── TESTIMONIOS ── */}
            <Divisor />
            <SeccionHeader titulo="💬 Nuestros clientes" id="testimonios" />
            <Testimonios />

            <FAQ />

            {/* Botón volver arriba */}
            <div className="w-full max-w-md px-4 mt-8">
                <button
                    onClick={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-[#FCD116] border-2 border-[#FCD116] bg-zinc-950 hover:bg-[#FCD116] hover:text-zinc-950 transition-colors"
                >
                    ↑ Volver al inicio
                </button>
            </div>

            <Footer />
        </div>
    );
}
