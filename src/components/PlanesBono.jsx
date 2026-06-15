import { Link } from 'react-router-dom';
import { PLANES, formatoPesos } from '../config/planes';

// Tarjetas de planes de Bono Digital, con link directo a /comprar?plan=X.
// Reemplaza el flyer con zonas clicables por superficie de toque clara y accesible.
export default function PlanesBono() {
    return (
        <div className="w-full max-w-md px-6 mt-6 relative z-10">
            <h2 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-1">
                Elige tu Bono Digital
            </h2>
            <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                Mientras más alto el bono, más intentos para predecir y ganar.
            </p>

            <div className="flex flex-col gap-3">
                {PLANES.map((plan) => (
                    <Link
                        key={plan.valor}
                        to={`/comprar?plan=${plan.valor}`}
                        className={`relative flex items-center justify-between gap-3 rounded-2xl border p-4 backdrop-blur-lg active:scale-[0.98] transition-transform ${
                            plan.destacado === 'premium'
                                ? 'border-amber-400 bg-gradient-to-r from-amber-400/15 to-yellow-400/5 shadow-[0_0_20px_rgba(234,179,8,0.25)]'
                                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none'
                        }`}
                    >
                        {plan.destacado && (
                            <span
                                className={`absolute -top-2.5 left-4 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    plan.destacado === 'premium'
                                        ? 'bg-amber-400 text-slate-950'
                                        : 'bg-amber-50 dark:bg-white/10 text-amber-600 dark:text-amber-400 border border-amber-400/30'
                                }`}
                            >
                                {plan.destacado === 'premium' ? '⭐ Mejor opción' : '🔥 Más popular'}
                            </span>
                        )}

                        <div>
                            <p className="text-zinc-900 dark:text-white font-extrabold text-lg">{formatoPesos(plan.valor)}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                Bono de servicios: <span className="text-amber-500 dark:text-amber-400 font-semibold">{formatoPesos(plan.saldoBono)}</span>
                            </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className="text-amber-500 dark:text-amber-400 font-black text-sm">{plan.etiqueta}</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-[11px]">para pronosticar</p>
                        </div>
                    </Link>
                ))}
            </div>

            <Link
                to="/comprar"
                className="block text-center text-zinc-500 dark:text-zinc-400 text-xs mt-3 underline hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
                ¿Quieres otro monto? Personalízalo aquí
            </Link>
        </div>
    );
}
