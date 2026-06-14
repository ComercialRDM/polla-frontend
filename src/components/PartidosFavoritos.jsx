import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPartidos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import Bandera from './Bandera';

export default function PartidosFavoritos({ equipos }) {
    const [partidos, setPartidos] = useState([]);

    useEffect(() => {
        if (!equipos || equipos.length === 0) return;

        obtenerPartidos()
            .then((data) => {
                if (!data?.success) return;
                const equiposLower = equipos.map((e) => e.toLowerCase());
                const futuros = partidosFuturos(data.partidos, 50).filter(
                    (p) =>
                        equiposLower.includes(p.equipo_local.toLowerCase()) ||
                        equiposLower.includes(p.equipo_visitante.toLowerCase())
                );
                setPartidos(futuros.slice(0, 5));
            })
            .catch(() => {});
    }, [equipos]);

    if (!equipos || equipos.length === 0 || partidos.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 mb-6">
            <p className="text-white font-bold text-sm mb-3">🔔 Próximos partidos de tus equipos</p>
            <div className="flex flex-col gap-2">
                {partidos.map((p) => (
                    <Link
                        key={p.id}
                        to={`/comprar?partido=${p.id}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                    >
                        <span className="flex items-center gap-1.5 text-zinc-200 text-sm font-medium truncate">
                            <Bandera equipo={p.equipo_local} className="w-5 h-5" />
                            {p.equipo_local} vs {p.equipo_visitante}
                            <Bandera equipo={p.equipo_visitante} className="w-5 h-5" />
                        </span>
                        <span className="text-amber-400 text-xs font-bold flex-shrink-0">
                            {new Date(p.fecha_hora_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
