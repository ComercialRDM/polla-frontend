import { Link, useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../utils/sesion';
import HeroPrediccion from '../components/HeroPrediccion';
import ProximosPartidos from '../components/ProximosPartidos';
import PlanesBono from '../components/PlanesBono';
import CuposRestantes from '../components/CuposRestantes';
import ResumenPublico from '../components/ResumenPublico';
import Testimonios from '../components/Testimonios';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import DashboardUsuario from '../components/DashboardUsuario';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

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

    function handleCerrarSesion() {
        cerrarSesion();
        navigate(0); // recarga la página
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-100 dark:bg-zinc-950 pb-12">

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

            {/* ── HERO: usuario logueado ve su Dashboard, visitante nuevo ve el formulario de predicción ── */}
            {sesion ? (
                <DashboardUsuario sesion={sesion} onSalir={handleCerrarSesion} />
            ) : (
                <>
                    {/* Botones auth */}
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

                    <HeroPrediccion />
                    <ProximosPartidos limite={10} titulo="⚽ Próximos 10 partidos" />
                </>
            )}

            {/* ── BONOS ── */}
            <Divisor />
            <SeccionHeader titulo="🎟️ Bonos" id="bonos" />
            <PlanesBono />
            <div className="w-full max-w-md px-4 mt-3">
                <CuposRestantes />
            </div>

            {/* ── PRUEBA SOCIAL ── */}
            <Divisor />
            <SeccionHeader titulo="💬 Confían en nosotros" id="confianza" />
            <ResumenPublico />
            <Testimonios />

            <FAQ />

            <Footer />
        </div>
    );
}
