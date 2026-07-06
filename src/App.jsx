import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Comprar from './pages/Comprar';

// Code-splitting: estas rutas se descargan solo cuando el usuario navega a
// ellas, en vez de ir todas en el bundle inicial (la mayoría son de bajo
// tráfico: admin, legales, resultados, etc.). Home y Comprar quedan eager
// porque son las rutas de entrada del embudo de compra.
const Premios = lazy(() => import('./pages/Premios'));
const ComoParticipo = lazy(() => import('./pages/ComoParticipo'));
const Nosotros = lazy(() => import('./pages/Nosotros'));
const Gracias = lazy(() => import('./pages/Gracias'));
const Ingresar = lazy(() => import('./pages/Ingresar'));
const Registro = lazy(() => import('./pages/Registro'));
const IniciarSesion = lazy(() => import('./pages/IniciarSesion'));
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'));
const Polla = lazy(() => import('./pages/Polla'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminQR = lazy(() => import('./pages/AdminQR'));
const Terminos = lazy(() => import('./pages/Terminos'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Anexo = lazy(() => import('./pages/Anexo'));
const ResultadosFinales = lazy(() => import('./pages/ResultadosFinales'));
const ComoFunciona = lazy(() => import('./pages/ComoFunciona'));
const RegistroInfluencer = lazy(() => import('./pages/RegistroInfluencer'));
const Grupo = lazy(() => import('./pages/Grupo'));
const InvitacionInfluencer = lazy(() => import('./pages/InvitacionInfluencer'));
const ColombiaLanding = lazy(() => import('./pages/ColombiaLanding'));
const CuartosLanding = lazy(() => import('./pages/CuartosLanding'));
const MarcasRegistro = lazy(() => import('./pages/MarcasRegistro'));

import ErrorBoundary from './components/ErrorBoundary';
import BotonWhatsApp from './components/BotonWhatsApp';
import ThemeToggle from './components/ThemeToggle';
import BottomNav from './components/BottomNav';
import CookieBanner from './components/CookieBanner';
import BackendDown from './components/BackendDown';
import NotificacionActividad from './components/NotificacionActividad';
import { ThemeProvider } from './context/ThemeContext';
import { obtenerSesion } from './utils/sesion';
import { registrarClicAfiliado } from './api';
import { captureAttributionFromUrl, getStoredAttribution } from './lib/attribution';

const RUTAS_CON_BOTTOM_NAV = [];

const SPLASH_KEY = 'polla_splash_visto';
const REF_STORAGE_KEY = 'polla_ref_token';
const AFF_STORAGE_KEY = 'polla_aff_token';

function CapturarRef() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) localStorage.setItem(REF_STORAGE_KEY, ref);
    }, [searchParams]);

    return null;
}

// Programa de afiliados (influencers): captura ?aff=codigo, registra el clic
// en el backend (que valida el código y lo firma) y guarda el token firmado
// devuelto — nunca el código en texto plano — para reenviarlo al comprar.
// Es un sistema paralelo a CapturarRef/REF_STORAGE_KEY (el de "invita amigos"
// ya existente): no lo toca ni lo reemplaza.
function CapturarAfiliado() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const codigo = searchParams.get('aff');
        if (!codigo) return;

        registrarClicAfiliado({
            codigo_afiliado: codigo,
            utm_source: searchParams.get('utm_source') || undefined,
            utm_medium: searchParams.get('utm_medium') || undefined,
            utm_campaign: searchParams.get('utm_campaign') || undefined,
        })
            .then((data) => {
                if (data?.success && data.token) {
                    localStorage.setItem(AFF_STORAGE_KEY, data.token);
                }
            })
            .catch(() => {});
    }, [searchParams]);

    return null;
}

// Captura general de atribucion (UTMs + referrer + landing page), corre en
// CADA navegacion a diferencia de CapturarAfiliado (que solo actua cuando
// hay ?aff=). Ver src/lib/attribution.js para el modelo first/last touch.
function CapturarAtribucion() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        captureAttributionFromUrl();
        if (import.meta.env.DEV) {
            console.log('[atribucion] capturada:', getStoredAttribution());
            window.__pollaAttribution = getStoredAttribution;
        }
    }, [searchParams]);

    return null;
}

function RutaProtegida({ children }) {
    const sesion = obtenerSesion();
    if (!sesion) return <Navigate to="/registro" replace />;
    return children;
}

function AppRoutes() {
    const location = useLocation();
    const mostrarBottomNav = RUTAS_CON_BOTTOM_NAV.includes(location.pathname);
    // /como-funciona tiene su propio boton fijo de compra en movil (CTAFijoMovil);
    // se desplaza el de WhatsApp hacia arriba para que no se encimen.
    const conCTAFijo = location.pathname === '/' || location.pathname === '/como-funciona';
    const ocultarWhatsApp = location.pathname === '/colombia' || location.pathname === '/partidos6Julio' || location.pathname.startsWith('/dashboardpollardm') || location.pathname.startsWith('/adminqr');

    return (
        <>
            <CapturarRef />
            <CapturarAfiliado />
            <CapturarAtribucion />
            <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
                <Routes>
                    <Route path="/" element={<ComoFunciona />} />
                    <Route path="/landing" element={<Home />} />
                    <Route path="/como-funciona" element={<Navigate to="/" replace />} />
                    <Route path="/premios" element={<Premios />} />
                    <Route path="/como-participo" element={<ComoParticipo />} />
                    <Route path="/influencers" element={<RegistroInfluencer />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/comprar" element={<Comprar />} />
                    <Route path="/gracias" element={<Gracias />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/iniciar-sesion" element={<IniciarSesion />} />
                    <Route path="/recuperar-password" element={<RecuperarPassword />} />
                    <Route path="/ingresar" element={<Navigate to="/iniciar-sesion" replace />} />
                    <Route path="/polla" element={<Polla />} />
                    <Route path="/terminos" element={<Terminos />} />
                    <Route path="/privacidad" element={<Privacidad />} />
                    <Route path="/anexo" element={<Anexo />} />
                    <Route path="/resultados" element={<ResultadosFinales />} />
                    <Route path="/dashboardpollardm" element={<Admin />} />
                    <Route path="/adminqr" element={<AdminQR />} />
                    <Route path="/grupo/:token" element={<Grupo />} />
                    <Route path="/invitacion/:token" element={<InvitacionInfluencer />} />
                    <Route path="/colombia" element={<ColombiaLanding />} />
                    <Route path="/partidos6Julio" element={<CuartosLanding />} />
                    <Route path="/marcas/registro/:token" element={<MarcasRegistro />} />
                </Routes>
            </Suspense>
            {!ocultarWhatsApp && <BotonWhatsApp mostrarBottomNav={mostrarBottomNav} desplazado={conCTAFijo} />}
            <ThemeToggle />
            {mostrarBottomNav && <BottomNav />}
            <CookieBanner />
        </>
    );
}

export default function App() {
    const [mostrarSplash, setMostrarSplash] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const vieneDeAd = params.has('utm_source') || params.has('utm_medium') || params.has('utm_campaign');
        if (vieneDeAd) return false;
        return !sessionStorage.getItem(SPLASH_KEY);
    });
    const [backendCaido, setBackendCaido] = useState(false);

    useEffect(() => {
        const abajo = () => setBackendCaido(true);
        const arriba = () => setBackendCaido(false);
        window.addEventListener('backend:down', abajo);
        window.addEventListener('backend:up', arriba);
        return () => { window.removeEventListener('backend:down', abajo); window.removeEventListener('backend:up', arriba); };
    }, []);

    function cerrarSplash() {
        sessionStorage.setItem(SPLASH_KEY, '1');
        setMostrarSplash(false);
    }

    if (mostrarSplash) {
        return (
            <ThemeProvider>
                <Splash onFinish={cerrarSplash} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <ErrorBoundary>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                {backendCaido && <BackendDown />}
                <NotificacionActividad />
            </ErrorBoundary>
        </ThemeProvider>
    );
}
