import { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function tiempoRelativo(fechaStr) {
    const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} días`;
}

function formatoCompacto(valor) {
    const n = Number(valor);
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n.toLocaleString('es-CO')}`;
}

export default function NotificacionActividad() {
    const [actividad, setActividad] = useState([]);
    const [actual, setActual] = useState(null);
    const [visible, setVisible] = useState(false);
    const idxRef = useRef(0);
    const timerRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/polla/actividad-reciente`)
            .then(r => r.json())
            .then(d => { if (d?.success && d.actividad?.length > 0) setActividad(d.actividad); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (actividad.length === 0) return;

        function mostrarSiguiente() {
            const item = actividad[idxRef.current % actividad.length];
            idxRef.current += 1;
            setActual(item);
            setVisible(true);

            // Ocultar después de 4 segundos
            timerRef.current = setTimeout(() => {
                setVisible(false);
                // Mostrar el siguiente después de 45 segundos de pausa
                timerRef.current = setTimeout(mostrarSiguiente, 45000);
            }, 4000);
        }

        // Primera notificación a los 20 segundos
        timerRef.current = setTimeout(mostrarSiguiente, 20000);

        return () => clearTimeout(timerRef.current);
    }, [actividad]);

    if (!actual) return null;

    return (
        <div
            className={`fixed bottom-24 left-3 z-40 max-w-[280px] transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl shadow-black/20 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 text-lg">
                    🛒
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-zinc-900 dark:text-white text-xs font-bold leading-tight">
                        {actual.primer_nombre} compró su bono
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                        {formatoCompacto(actual.saldo_bono)} · {tiempoRelativo(actual.fecha_creacion)}
                    </p>
                </div>
                <button
                    onClick={() => { setVisible(false); clearTimeout(timerRef.current); }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none shrink-0"
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
