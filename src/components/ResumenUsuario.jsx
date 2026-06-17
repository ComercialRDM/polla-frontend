import { useEffect, useState } from 'react';
import { obtenerResumenUsuario } from '../api';

export default function ResumenUsuario({ usuarioId }) {
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        if (!usuarioId) return;
        obtenerResumenUsuario(usuarioId)
            .then(data => { if (data?.success) setDatos(data); })
            .catch(() => {});
    }, [usuarioId]);

    if (!datos) return null;

    const { intentos_realizados, intentos_disponibles, puntos, posicion, total_participantes } = datos;

    return (
        <div className="grid grid-cols-4 gap-2 mt-3">
            <Stat
                valor={puntos}
                etiqueta="Puntos"
                color="text-[#FCD116]"
                icono="⭐"
            />
            <Stat
                valor={`#${posicion}`}
                etiqueta={`de ${total_participantes}`}
                color="text-emerald-400"
                icono="🏆"
            />
            <Stat
                valor={intentos_realizados}
                etiqueta="Intentos"
                color="text-blue-400"
                icono="⚽"
            />
            <Stat
                valor={intentos_disponibles}
                etiqueta="Disponibles"
                color={intentos_disponibles > 0 ? 'text-white' : 'text-zinc-500'}
                icono="🎟️"
            />
        </div>
    );
}

function Stat({ valor, etiqueta, color, icono }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-800/60 border border-white/5 py-2 px-1">
            <span className="text-xs mb-0.5">{icono}</span>
            <span className={`font-black text-lg leading-none ${color}`}>{valor}</span>
            <span className="text-zinc-500 text-[10px] mt-0.5 text-center leading-tight">{etiqueta}</span>
        </div>
    );
}
