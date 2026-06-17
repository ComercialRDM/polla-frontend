import { Link, useSearchParams } from 'react-router-dom';

export default function Gracias() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-16 flex flex-col items-center text-center">

                <span className="text-6xl mb-4">🎉</span>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
                    ¡Pago exitoso!
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                    Tu Bono Digital fue procesado correctamente. Ya eres parte de la Polla Mundialista de La Retoucherie.
                </p>

                {/* CTA registro */}
                <div className="w-full rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 p-6 mb-6 text-left">
                    <p className="text-2xl mb-2">🏆</p>
                    <p className="text-zinc-900 dark:text-white font-extrabold text-lg mb-2">
                        ¡Un paso más para ganar!
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">
                        Regístrate para poder:
                    </p>
                    <ul className="flex flex-col gap-2 mb-5">
                        <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="text-amber-500 font-bold mt-0.5">✓</span>
                            Ver los resultados de los partidos de Colombia en tiempo real
                        </li>
                        <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="text-amber-500 font-bold mt-0.5">✓</span>
                            Ingresar tu pronóstico antes de cada partido
                        </li>
                        <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="text-amber-500 font-bold mt-0.5">✓</span>
                            Saber si ganaste un premio y cómo reclamarlo
                        </li>
                        <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="text-amber-500 font-bold mt-0.5">✓</span>
                            Recibir notificaciones por WhatsApp de tus partidos
                        </li>
                    </ul>
                    <Link
                        to="/registro"
                        className="block w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform"
                    >
                        Registrarme ahora — ¡es gratis!
                    </Link>
                </div>

                {/* Opciones secundarias */}
                <div className="flex flex-col gap-3 w-full">
                    <Link
                        to="/iniciar-sesion"
                        className="block w-full py-3 rounded-xl font-bold text-sm text-zinc-900 dark:text-white text-center border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60"
                    >
                        Ya tengo cuenta — Iniciar sesión
                    </Link>
                    {token && (
                        <Link
                            to={`/polla?token=${token}`}
                            className="text-center text-xs text-zinc-400 dark:text-zinc-500 underline"
                        >
                            Ver mi bono sin registrarme
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
