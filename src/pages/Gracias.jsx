import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerInfoPolla, votar } from '../api';
import { obtenerMarcadorPendiente, limpiarMarcadorPendiente } from '../utils/marcadorPendiente';

const INTENTOS_MAX = 6;
const INTERVALO_MS = 3000;

export default function Gracias() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // El webhook de Wompi que aprueba el pago llega de forma asíncrona, así que
    // este "¡Pago exitoso!" no se muestra a ciegas: se confirma contra el
    // backend (si no hay token, no hay nada que verificar y se asume éxito,
    // igual que antes).
    const [estado, setEstado] = useState(token ? 'verificando' : 'aprobado');
    const [marcadorConfirmado, setMarcadorConfirmado] = useState(null);

    useEffect(() => {
        if (!token) return;
        let cancelado = false;
        let intentos = 0;

        // Si el usuario predijo un marcador en el Hero antes de pagar (guardado
        // en marcadorPendiente.js), apenas se confirma el pago se envía solo,
        // reutilizando el mismo endpoint de voto pagado que usa el flujo manual
        // — sin pedirle al usuario ninguna acción extra.
        async function confirmarMarcadorPendiente(data) {
            const pendiente = obtenerMarcadorPendiente();
            if (!pendiente) return;

            const partidoInfo = data.partidos?.find((p) => p.partido_id === pendiente.partido_id);
            if (!partidoInfo || partidoInfo.ya_pronosticado) {
                limpiarMarcadorPendiente();
                return;
            }
            if (data.cupos_disponibles < partidoInfo.cupos_costo) {
                // No hay cupos suficientes para este partido con el plan comprado;
                // se deja el marcador pendiente para que lo registre manualmente.
                return;
            }

            try {
                const resultado = await votar({
                    token_acceso: token,
                    partido_id: pendiente.partido_id,
                    local: pendiente.local,
                    visitante: pendiente.visitante,
                });
                if (resultado?.success) {
                    limpiarMarcadorPendiente();
                    setMarcadorConfirmado({ local: pendiente.local, visitante: pendiente.visitante });
                }
            } catch {
                // se deja el marcador pendiente, no se bloquea la pantalla de éxito
            }
        }

        async function verificar() {
            try {
                const data = await obtenerInfoPolla(token);
                if (cancelado) return;
                if (data?.acceso) {
                    await confirmarMarcadorPendiente(data);
                    if (!cancelado) setEstado('aprobado');
                    return;
                }
            } catch {
                // sigue intentando
            }
            intentos += 1;
            if (intentos >= INTENTOS_MAX) {
                if (!cancelado) setEstado('demorado');
                return;
            }
            setTimeout(verificar, INTERVALO_MS);
        }

        verificar();
        return () => { cancelado = true; };
    }, [token]);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-16 flex flex-col items-center text-center">

                {estado === 'verificando' && (
                    <>
                        <span className="text-6xl mb-4">⏳</span>
                        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
                            Confirmando tu pago...
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                            Estamos verificando tu pago con Wompi. Esto toma solo unos segundos.
                        </p>
                    </>
                )}

                {estado === 'demorado' && (
                    <>
                        <span className="text-6xl mb-4">📨</span>
                        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
                            Tu pago está en proceso
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                            La confirmación está tardando más de lo usual. No te preocupes: en cuanto Wompi confirme tu pago, te avisaremos por WhatsApp o correo y tu bono quedará activo.
                        </p>
                    </>
                )}

                {estado === 'aprobado' && (
                    <>
                        <span className="text-6xl mb-4">🎉</span>
                        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
                            Ya estás participando
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                            Tu Bono Digital fue procesado correctamente. Ya eres parte de la Polla Mundialista de La Retoucherie.
                        </p>
                        <ul className="w-full flex flex-col gap-2 mb-8 text-left">
                            {marcadorConfirmado && (
                                <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="text-green-500 font-bold">✓</span>
                                    Marcador registrado: {marcadorConfirmado.local} - {marcadorConfirmado.visitante}
                                </li>
                            )}
                            <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-green-500 font-bold">✓</span>
                                Bono adquirido
                            </li>
                            <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-green-500 font-bold">✓</span>
                                Correo enviado
                            </li>
                        </ul>
                    </>
                )}

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
