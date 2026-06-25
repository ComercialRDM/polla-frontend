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
const RedimirCodigo = lazy(() => import('./pages/RedimirCodigo'));
const AdminQR = lazy(() => import('./pages/AdminQR'));
const Terminos = lazy(() => import('./pages/Terminos'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Anexo = lazy(() => import('./pages/Anexo'));
const ResultadosFinales = lazy(() => import('./pages/ResultadosFinales'));
const ComoFunciona = lazy(() => import('./pages/ComoFunciona'));

import BotonWhatsApp from './components/BotonWhatsApp';
import ThemeToggle from './components/ThemeToggle';
import BottomNav from './components/BottomNav';
import { ThemeProvider } from './context/ThemeContext';
import { obtenerSesion } from './utils/sesion';

const RUTAS_CON_BOTTOM_NAV = [];

const SPLASH_KEY = 'polla_splash_visto';
const REF_STORAGE_KEY = 'polla_ref_token';

function CapturarRef() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) localStorage.setItem(REF_STORAGE_KEY, ref);
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

    return (
        <>
            <CapturarRef />
            <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950" />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/premios" element={<Premios />} />
                    <Route path="/como-participo" element={<ComoParticipo />} />
                    <Route path="/como-funciona" element={<ComoFunciona />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/comprar" element={<Comprar />} />
                    <Route path="/gracias" element={<Gracias />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/iniciar-sesion" element={<IniciarSesion />} />
                    <Route path="/recuperar-password" element={<RecuperarPassword />} />
                    <Route path="/ingresar" element={<Ingresar />} />
                    <Route path="/polla" element={<Polla />} />
                    <Route path="/terminos" element={<Terminos />} />
                    <Route path="/privacidad" element={<Privacidad />} />
                    <Route path="/anexo" element={<Anexo />} />
                    <Route path="/resultados" element={<ResultadosFinales />} />
                    <Route path="/dashboardpollardm" element={<Admin />} />
                    <Route path="/redimircodigordm" element={<RedimirCodigo />} />
                    <Route path="/adminqr" element={<AdminQR />} />
                </Routes>
            </Suspense>
            <BotonWhatsApp mostrarBottomNav={mostrarBottomNav} />
            <ThemeToggle />
            {mostrarBottomNav && <BottomNav />}
        </>
    );
}

export default function App() {
    const [mostrarSplash, setMostrarSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY));

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
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ThemeProvider>
    );
}
