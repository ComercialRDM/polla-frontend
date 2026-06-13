import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import camisetaImg from '../assets/premios/camiseta.webp';
import gorraImg from '../assets/premios/gorra.webp';
import balonImg from '../assets/premios/balon.webp';
import gafasImg from '../assets/premios/gafas.webp';
import CountdownPartido from '../components/CountdownPartido';
import ResumenPublico from '../components/ResumenPublico';
import Footer from '../components/Footer';

const WHATSAPP_NUMERO = '573103963708';
const INSTAGRAM_USUARIO = '@retoucherie_col';

const SEDES = [
    { ciudad: 'Barranquilla', nombre: 'Cc Buenavista', direccion: 'Sótano 2, local 17', telefono: '6053131966' },
    { ciudad: 'Barranquilla', nombre: 'Cc Viva Barranquilla', direccion: 'Sótano 1', telefono: '6053093750' },
    { ciudad: 'Barranquilla', nombre: 'Cc Aranjuez', direccion: 'Calle 82 #53', telefono: '6052022021' },
    { ciudad: 'Cartagena', nombre: 'Cc Caribe Plaza', direccion: 'Sótano 1', telefono: '6056515251' },
];

const REF_STORAGE_KEY = 'polla_ref_token';

const PREMIOS = [
    { imagen: camisetaImg, titulo: 'Camiseta Oficial', descripcion: 'Selección Colombia 2026' },
    { imagen: gorraImg, titulo: 'Gorra Edición Especial', descripcion: 'Tricolor bordada' },
    { imagen: balonImg, titulo: 'Balón Mundialista', descripcion: 'Réplica oficial' },
    { imagen: gafasImg, titulo: 'Bono Sorpresa', descripcion: 'Servicios Retoucherie' },
];

const PASOS = [
    { emoji: '💳', titulo: 'Compra tu Bono Digital', descripcion: 'Elige el plan que más te guste: $50.000, $100.000 o $200.000.' },
    { emoji: '🎁', titulo: 'Recibe tu bono y tus intentos', descripcion: 'Te llega por correo tu Bono Digital y tus intentos para pronosticar.' },
    { emoji: '⚽', titulo: 'Predice el marcador de Colombia', descripcion: 'Antes de que inicie el partido, ingresa tu pronóstico exacto.' },
    { emoji: '🏆', titulo: 'Gana premios si aciertas', descripcion: 'Los pronósticos exactos se llevan premios y usan su bono en La Retoucherie.' },
];

const COLORES_CONFETI = ['#FCD116', '#003893', '#CE1126', '#ffffff'];

export default function Home() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) localStorage.setItem(REF_STORAGE_KEY, ref);
    }, [searchParams]);

    useEffect(() => {
        if (localStorage.getItem('confeti_bienvenida')) return;
        localStorage.setItem('confeti_bienvenida', '1');

        const disparo = (opciones) =>
            confetti({ colors: COLORES_CONFETI, ...opciones });

        disparo({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 }, angle: 60 });
        disparo({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 }, angle: 120 });
        disparo({ particleCount: 80, spread: 100, origin: { y: 0.4 } });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-950 stadium-glow">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            {/* Hero */}
            <div className="w-full max-w-md px-6 mt-8 relative z-10 text-center">
                <span className="inline-block bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    🇨🇴 Mundial 2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                    Compra tu <span className="text-amber-400">Bono Digital</span> de La Retoucherie de Manuela y participa GRATIS en la Polla Mundialista
                </h1>
                <p className="text-zinc-400 text-sm">
                    Compra servicios de belleza con tu bono y, de regalo, recibe intentos para predecir el marcador de la Selección Colombia. Si aciertas, ganas premios 🏆
                </p>
            </div>

            <div className="w-full max-w-md px-6 mt-6 relative z-10">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg shadow-[0_0_15px_rgba(234,179,8,0.15)] p-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
                        Polla Mundialista
                    </h2>
                    <p className="text-amber-400 font-semibold mb-1">La Retoucherie de Manuela</p>
                    <p className="text-zinc-400 text-sm mb-6">
                        Compra tu Bono Digital y participa prediciendo el marcador de la Selección Colombia 🇨🇴
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/comprar"
                            className="w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
                        >
                            Comprar mi bono
                        </Link>
                        <Link
                            to="/ingresar"
                            className="w-full py-4 rounded-xl font-bold text-center text-white border border-white/15 bg-white/5 backdrop-blur-sm active:scale-95 transition-transform"
                        >
                            Ya compré mi bono → Ingresar
                        </Link>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md px-6 mt-6 relative z-10">
                <CountdownPartido />
            </div>

            <ResumenPublico />

            {/* Cómo funciona */}
            <div className="w-full max-w-md px-6 mt-10 relative z-10">
                <h2 className="text-center text-white font-black text-xl mb-4">
                    ¿Cómo funciona?
                </h2>
                <div className="flex flex-col gap-3">
                    {PASOS.map((paso, i) => (
                        <div
                            key={paso.titulo}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4"
                        >
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-lg font-black text-amber-400">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-white font-bold text-sm">{paso.emoji} {paso.titulo}</p>
                                <p className="text-zinc-400 text-xs mt-0.5">{paso.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botín de Premios Mundialistas */}
            <div className="w-full max-w-md px-6 mt-10 relative z-10">
                <h2 className="text-center text-white font-black text-xl mb-1">
                    🏆 Botín de Premios Mundialistas
                </h2>
                <p className="text-center text-zinc-400 text-sm mb-4">
                    Los aciertos más rápidos se llevan estos premios
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {PREMIOS.map((premio) => (
                        <div
                            key={premio.titulo}
                            className="group rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-yellow-400 hover:via-blue-500 hover:to-red-500"
                        >
                            <div className="rounded-xl bg-zinc-950/60 group-hover:bg-zinc-950/80 p-4 transition-colors">
                                <img
                                    src={premio.imagen}
                                    alt={premio.titulo}
                                    className="w-full h-24 object-cover rounded-lg shadow-lg shadow-black/40 mb-2"
                                />
                                <p className="text-white font-bold text-sm">{premio.titulo}</p>
                                <p className="text-zinc-400 text-xs">{premio.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quiénes somos */}
            <div className="w-full max-w-md px-6 mt-10 relative z-10">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-6 text-center">
                    <h2 className="text-white font-black text-xl mb-2">Quiénes somos</h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        La Retoucherie es un centro de belleza y bienestar con sedes en Barranquilla y Cartagena.
                        Esta Polla Mundialista es nuestro regalo para celebrar el Mundial 2026 junto a nuestros clientes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-left">
                        {SEDES.map((sede) => (
                            <div key={sede.nombre} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="text-white font-bold text-xs">{sede.nombre}</p>
                                <p className="text-zinc-400 text-xs">{sede.ciudad} · {sede.direccion}</p>
                                <p className="text-zinc-400 text-xs">📞 {sede.telefono}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={`https://instagram.com/${INSTAGRAM_USUARIO.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block py-2.5 px-4 rounded-xl font-bold text-sm text-center text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
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

            <Footer />
        </div>
    );
}
