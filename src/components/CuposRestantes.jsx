import { useEffect, useState } from 'react';
import { obtenerBonosVendidos } from '../api';

const TOPE_BONOS = 3000;

// Urgencia real (no inventada): el negocio fijó un tope de 3.000 bonos en
// total. Se muestran los que realmente quedan, calculados contra las compras
// aprobadas reales en el backend.
export default function CuposRestantes() {
    const [restantes, setRestantes] = useState(null);

    useEffect(() => {
        obtenerBonosVendidos()
            .then((d) => {
                if (d?.success) setRestantes(Math.max(TOPE_BONOS - d.total, 0));
            })
            .catch(() => {});
    }, []);

    if (restantes === null) return null;

    return (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-300/40 dark:border-red-500/30 px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg flex-shrink-0">🔥</span>
            <p className="text-red-600 dark:text-red-400 text-xs font-bold leading-snug">
                Cupos limitados — quedan <span className="text-sm">{restantes.toLocaleString('es-CO')}</span> de 3.000 bonos disponibles.
            </p>
        </div>
    );
}
