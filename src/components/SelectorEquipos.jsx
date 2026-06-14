import { EQUIPOS_MUNDIAL } from '../utils/equipos';
import Bandera from './Bandera';

export default function SelectorEquipos({ seleccionados, onToggle, max }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
            {EQUIPOS_MUNDIAL.map((equipo) => {
                const activo = seleccionados.includes(equipo);
                const deshabilitado = !activo && seleccionados.length >= max;
                return (
                    <button
                        key={equipo}
                        type="button"
                        onClick={() => onToggle(equipo)}
                        disabled={deshabilitado}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-colors text-center ${
                            activo
                                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                : deshabilitado
                                    ? 'bg-white/5 border-white/5 text-zinc-500 opacity-50'
                                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 active:scale-95'
                        }`}
                    >
                        <Bandera equipo={equipo} className="w-6 h-6 flex-shrink-0" />
                        <span className="text-[10px] font-semibold leading-tight">{equipo}</span>
                    </button>
                );
            })}
        </div>
    );
}
