import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Comprar from './pages/Comprar';
import Ingresar from './pages/Ingresar';
import Polla from './pages/Polla';
import Admin from './pages/Admin';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';

const SPLASH_KEY = 'polla_splash_visto';

export default function App() {
    const [mostrarSplash, setMostrarSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY));

    function cerrarSplash() {
        sessionStorage.setItem(SPLASH_KEY, '1');
        setMostrarSplash(false);
    }

    if (mostrarSplash) {
        return <Splash onFinish={cerrarSplash} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/comprar" element={<Comprar />} />
                <Route path="/ingresar" element={<Ingresar />} />
                <Route path="/polla" element={<Polla />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/dashboardpollardm" element={<Admin />} />
            </Routes>
        </BrowserRouter>
    );
}
