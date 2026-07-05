import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Componente desactivado — se activa con VITE_SHOW_MARCAS_PARTICIPANTES=true
// Muestra la grilla de marcas donde los clientes pueden redimir sus bonos.
const SHOW = import.meta.env.VITE_SHOW_MARCAS_PARTICIPANTES === 'true';

export default function MarcasParticipantes() {
    const [marcas, setMarcas] = useState([]);

    useEffect(() => {
        if (!SHOW) return;
        fetch(`${API_BASE}/api/marcas/publicas`)
            .then((r) => r.json())
            .then((d) => { if (d?.success) setMarcas(d.marcas); })
            .catch(() => {});
    }, []);

    if (!SHOW || marcas.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
            <h3 className="text-sm font-black text-white mb-3">🏪 Redime tu bono en estas marcas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {marcas.map((m) => (
                    <div key={m.id} className="flex flex-col items-center gap-2 rounded-xl bg-zinc-800 border border-white/5 p-3">
                        {m.tiene_logo ? (
                            <img
                                src={`${API_BASE}/api/admin/marcas/${m.id}/logo`}
                                alt={m.nombre}
                                className="w-14 h-14 object-contain rounded-lg"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center text-2xl">🏪</div>
                        )}
                        <p className="text-white text-xs font-bold text-center leading-tight">{m.nombre}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
