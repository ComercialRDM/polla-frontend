import { useState } from 'react';
import { actualizarEquiposFavoritos } from '../api';
import { EQUIPOS_MUNDIAL, MAX_EQUIPOS_FAVORITOS } from '../utils/equipos';
import Bandera from './Bandera';
import AgendarCalendario from './AgendarCalendario';

export default function EquiposFavoritos({ token, equiposIniciales, calendarioToken, onGuardado }) {
    const [editando, setEditando] = useState(equiposIniciales.length === 0);
    const [seleccionados, setSeleccionados] = useState(equiposIniciales);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    function toggleEquipo(equipo) {
        setError('');
        setSeleccionados((prev) => {
            if (prev.includes(equipo)) return prev.filter((e) => e !== equipo);
            if (prev.length >= MAX_EQUIPOS_FAVORITOS) return prev;
            return [...prev, equipo];
        });
    }

    async function handleGuardar() {
        setGuardando(true);
        setError('');
        try {
            const data = await actualizarEquiposFavoritos({ token_acceso: token, equipos_favoritos: seleccionados });
            if (data?.success) {
                onGuardado(data.equipos_favoritos);
                setEditando(false);
            } else {
                setError(data?.error || 'No se pudieron guardar tus equipos favoritos.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    }

    if (!editando) {
        return (
            <>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-lg p-4 mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold text-sm">⭐ Tus equipos favoritos:</span>
                            {seleccionados.map((equipo) => (
                                <span key={equipo} className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-zinc-200">
                                    <Bandera equipo={equipo} className="w-4 h-4" />
                                    {equipo}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => setEditando(true)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors"
                        >
                            Editar
                        </button>
                    </div>
                </div>

                {seleccionados.length > 0 && <AgendarCalendario calendarioToken={calendarioToken} />}
            </>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-400/20 bg-slate-900/60 backdrop-blur-lg p-4 mb-6">
            <p className="text-white font-bold text-sm mb-1">⭐ Elige tus equipos favoritos</p>
            <p className="text-zinc-400 text-xs mb-3">
                Opcional: selecciona hasta {MAX_EQUIPOS_FAVORITOS} equipos para personalizar tu experiencia ({seleccionados.length}/{MAX_EQUIPOS_FAVORITOS}).
            </p>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 mb-3">
                {EQUIPOS_MUNDIAL.map((equipo) => {
                    const activo = seleccionados.includes(equipo);
                    return (
                        <button
                            key={equipo}
                            onClick={() => toggleEquipo(equipo)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                                activo
                                    ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                            }`}
                        >
                            <Bandera equipo={equipo} className="w-4 h-4" />
                            {equipo}
                        </button>
                    );
                })}
            </div>

            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

            <div className="flex gap-2">
                <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 disabled:opacity-60 active:scale-95 transition-transform"
                >
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                {equiposIniciales.length > 0 && (
                    <button
                        onClick={() => {
                            setSeleccionados(equiposIniciales);
                            setError('');
                            setEditando(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white text-center border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}
