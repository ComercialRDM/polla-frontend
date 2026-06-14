import { useEffect, useState } from 'react';
import { obtenerPartidos, obtenerPronosticosPublicos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import Bandera from './Bandera';

export default function ListaPronosticos() {
    const [partido, setPartido] = useState(null);
    const [pronosticos, setPronosticos] = useState([]);

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (!data?.success || data.partidos.length === 0) return;
                const proximo = partidosFuturos(data.partidos, 1)[0];
                if (!proximo) return;
                setPartido(proximo);
                return obtenerPronosticosPublicos(proximo.id);
            })
            .then((data) => {
                if (data?.success) setPronosticos(data.pronosticos);
            })
            .catch(() => {});
    }, []);

    if (!partido || pronosticos.length === 0) return null;

    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4">
                <p className="text-white font-bold text-sm mb-1 text-center">
                    🔥 ¡{pronosticos.length} {pronosticos.length === 1 ? 'persona ya hizo' : 'personas ya hicieron'} su pronóstico!
                </p>
                <p className="text-zinc-400 text-xs mb-3 text-center">
                    <Bandera equipo={partido.equipo_local} className="w-4 h-4 inline-block mr-1" />
                    {partido.equipo_local} vs
                    <Bandera equipo={partido.equipo_visitante} className="w-4 h-4 inline-block ml-1 mr-1" />
                    {partido.equipo_visitante}
                </p>
                <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-1.5">
                    {pronosticos.map((p, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-3 py-2"
                        >
                            <span className="text-zinc-200 text-sm font-medium truncate">{p.nombre}</span>
                            <span className="font-scoreboard text-amber-400 text-sm flex-shrink-0 ml-2">
                                {p.goles_local} - {p.goles_visitante}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
