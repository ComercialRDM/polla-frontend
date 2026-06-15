import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Comprar from './pages/Comprar';
import Ingresar from './pages/Ingresar';
import Registro from './pages/Registro';
import IniciarSesion from './pages/IniciarSesion';
import RecuperarPassword from './pages/RecuperarPassword';
import Polla from './pages/Polla';
import Admin from './pages/Admin';
import RedimirCodigo from './pages/RedimirCodigo';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import Anexo from './pages/Anexo';
import BotonWhatsApp from './components/BotonWhatsApp';
import InstalarApp from './components/InstalarApp';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { obtenerSesion } from './utils/sesion';

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

export default function App() {
    const [mostrarSplash, setMostrarSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
    const [mostrarInstalarApp, setMostrarInstalarApp] = useState(false);

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
                <CapturarRef />
                <Routes>
                    <Route path="/" element={<RutaProtegida><Home /></RutaProtegida>} />
                    <Route path="/comprar" element={<RutaProtegida><Comprar /></RutaProtegida>} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/iniciar-sesion" element={<IniciarSesion />} />
                    <Route path="/recuperar-password" element={<RecuperarPassword />} />
                    <Route path="/ingresar" element={<Ingresar />} />
                    <Route path="/polla" element={<Polla />} />
                    <Route path="/terminos" element={<Terminos />} />
                    <Route path="/privacidad" element={<Privacidad />} />
                    <Route path="/anexo" element={<Anexo />} />
                    <Route path="/dashboardpollardm" element={<Admin />} />
                    <Route path="/redimircodigordm" element={<RedimirCodigo />} />
                </Routes>
                <BotonWhatsApp desplazado={mostrarInstalarApp} />
                <InstalarApp onVisibleChange={setMostrarInstalarApp} />
                <ThemeToggle />
            </BrowserRouter>
        </ThemeProvider>
    );
}
