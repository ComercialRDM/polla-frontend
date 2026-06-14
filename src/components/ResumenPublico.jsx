import { useEffect, useState } from 'react';
import { obtenerPartidos, obtenerResumenPublico } from '../api';
import { partidosFuturos } from '../utils/partidos';

export default function ResumenPublico() {
    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (!data?.success || data.partidos.length === 0) return;
                const partido = partidosFuturos(data.partidos, 1)[0];
                if (!partido) return;
                return obtenerResumenPublico(partido.id);
            })
            .then((data) => {
                if (data?.success) setResumen(data);
            })
            .catch(() => {});
    }, []);

    if (!resumen || resumen.totalParticipantes === 0) return null;

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 text-center">
                <p className="text-white font-bold text-sm mb-1">
                    🔥 {resumen.totalParticipantes} {resumen.totalParticipantes === 1 ? 'persona ya compró' : 'personas ya compraron'} su bono
                </p>
                {resumen.top.length > 0 && (
                    <div className="mt-2 text-xs text-zinc-400">
                        <p className="mb-1">Van acertando el marcador exacto:</p>
                        <ul className="flex flex-col gap-0.5">
                            {resumen.top.map((g) => (
                                <li key={g.posicion} className="text-zinc-300">
                                    {g.posicion}. {g.nombre}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
