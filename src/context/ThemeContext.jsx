import { createContext, useContext, useEffect, useReducer, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'polla_tema';
const HORA_INICIO_NOCHE = 19; // 7pm
const HORA_FIN_NOCHE = 6; // 6am

function esHoraNocturna() {
    const hora = new Date().getHours();
    return hora >= HORA_INICIO_NOCHE || hora < HORA_FIN_NOCHE;
}

// 'auto' = sigue el horario (claro de día, oscuro de noche).
// 'light' / 'dark' = elegido manualmente por el usuario, fijo.
function leerModoGuardado() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado === 'light' || guardado === 'dark' ? guardado : 'auto';
}

function calcularTema(modo) {
    return modo === 'auto' ? (esHoraNocturna() ? 'dark' : 'light') : modo;
}

export function ThemeProvider({ children }) {
    const [modo, setModo] = useState(leerModoGuardado);
    const [, recalcular] = useReducer((c) => c + 1, 0);
    const tema = calcularTema(modo);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', tema === 'dark');
    }, [tema]);

    useEffect(() => {
        if (modo !== 'auto') return;

        // Revisa cada 10 minutos si cambió la franja horaria (día/noche)
        // para usuarios que dejan la app abierta.
        const intervalo = setInterval(recalcular, 10 * 60 * 1000);
        return () => clearInterval(intervalo);
    }, [modo]);

    function cambiarModo(nuevoModo) {
        setModo(nuevoModo);
        if (nuevoModo === 'auto') {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, nuevoModo);
        }
    }

    return (
        <ThemeContext.Provider value={{ tema, modo, cambiarModo }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext);
}
