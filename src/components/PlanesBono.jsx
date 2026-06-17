import { Link } from 'react-router-dom';
import { PLANES, formatoPesos } from '../config/planes';

export default function PlanesBono() {
    return (
        <div className="w-full max-w-md px-4 mt-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-7 bg-[#FCD116] rounded-full" />
                <h2 className="font-display text-2xl text-zinc-900 dark:text-white tracking-wide uppercase">
                    Elige tu Bono
                </h2>
            </div>

            <div className="flex flex-col gap-3">
                {PLANES.map((plan) => (
                    <Link
                        key={plan.valor}
                        to={`/comprar?plan=${plan.valor}`}
                        className={`relative flex items-center justify-between gap-4 rounded-xl border-2 p-4 active:scale-[0.98] transition-all ${
                            plan.destacado === 'premium'
                                ? 'border-[#FCD116] bg-zinc-900'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                        }`}
                    >
                        {plan.destacado && (
                            <span className={`absolute -top-3 left-4 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-sm ${plan.destacado === 'premium' ? 'bg-[#FCD116] text-zinc-950' : 'bg-zinc-900 text-[#FCD116] border border-[#FCD116]/50'}`}>
                                {plan.destacado === 'premium' ? '⭐ MEJOR OPCIÓN' : '🔥 MÁS POPULAR'}
                            </span>
                        )}
                        <div className="flex-1">
                            <p className={`font-display text-3xl leading-none tracking-wide ${plan.destacado === 'premium' ? 'text-[#FCD116]' : 'text-zinc-900 dark:text-white'}`}>
                                {formatoPesos(plan.valor)}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                                Bono de <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatoPesos(plan.saldoBono)}</span> en servicios
                            </p>
                        </div>
                        <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[72px] ${plan.destacado === 'premium' ? 'bg-[#FCD116]' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                            <p className={`font-display text-2xl leading-none ${plan.destacado === 'premium' ? 'text-zinc-950' : 'text-zinc-900 dark:text-white'}`}>
                                {plan.intentos}
                            </p>
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${plan.destacado === 'premium' ? 'text-zinc-800' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {plan.intentos === 1 ? 'intento' : 'intentos'}
                            </p>
                        </div>
                        <span className={`text-xl font-black ${plan.destacado === 'premium' ? 'text-[#FCD116]' : 'text-zinc-400'}`}>›</span>
                    </Link>
                ))}
            </div>

            <Link
                to="/comprar"
                className="relative flex items-center justify-between gap-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 mt-1 active:scale-[0.98] transition-all"
            >
                <div className="flex-1">
                    <p className="font-display text-3xl leading-none tracking-wide text-zinc-900 dark:text-white">
                        ¿Otro monto?
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                        Personaliza el valor de tu bono
                    </p>
                </div>
                <span className="text-xl font-black text-zinc-400">›</span>
            </Link>
        </div>
    );
}
