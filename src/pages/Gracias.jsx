import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerInfoPolla, votar, unirseGrupo } from '../api';
import { obtenerMarcadoresPendientes, quitarMarcadorPendiente } from '../utils/marcadorPendiente';
import { obtenerSesion } from '../utils/sesion';
import { trackPurchase } from '../lib/analytics';

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
    const [marcadoresConfirmados, setMarcadoresConfirmados] = useState([]);
    // La cuenta y la sesión ya quedaron creadas desde Comprar.jsx al generar el
    // pago (antes incluso de que se confirme) — si existe, no hay que pedirle
    // que se registre, solo lo mandamos a su dashboard.
    const tieneSesion = Boolean(obtenerSesion());

    // Evento Meta Pixel: Lead — se dispara una sola vez al confirmar la compra
    useEffect(() => {
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'Lead');
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        let cancelado = false;
        let intentos = 0;

        // Si el usuario predijo uno o varios marcadores antes de pagar (Hero o la
        // lista de "Próximos partidos" en Home, guardados en marcadorPendiente.js),
        // apenas se confirma el pago se envían solos, uno por uno, reutilizando el
        // mismo endpoint de voto pagado que usa el flujo manual — sin pedirle al
        // usuario ninguna acción extra. Los cupos disponibles se van descontando
        // localmente a medida que cada uno se confirma, para no exceder el plan
        // que realmente compró.
        async function confirmarMarcadoresPendientes(data) {
            const pendientes = obtenerMarcadoresPendientes();
            if (pendientes.length === 0) return;

            let cuposRestantes = data.cupos_disponibles;
            const confirmados = [];

            for (const pendiente of pendientes) {
                const partidoInfo = data.partidos?.find((p) => p.partido_id === pendiente.partido_id);
                if (!partidoInfo || partidoInfo.ya_pronosticado) {
                    quitarMarcadorPendiente(pendiente.partido_id);
                    continue;
                }
                if (cuposRestantes < partidoInfo.cupos_costo) {
                    // No hay cupos suficientes para este partido con el plan comprado;
                    // se deja pendiente para que lo registre manualmente.
                    continue;
                }

                try {
                    const resultado = await votar({
                        token_acceso: token,
                        partido_id: pendiente.partido_id,
                        local: pendiente.local,
                        visitante: pendiente.visitante,
                    });
                    if (resultado?.success) {
                        quitarMarcadorPendiente(pendiente.partido_id);
                        cuposRestantes -= partidoInfo.cupos_costo;
                        confirmados.push({
                            partido_id: pendiente.partido_id,
                            equipo_local: partidoInfo.equipo_local,
                            equipo_visitante: partidoInfo.equipo_visitante,
                            local: pendiente.local,
                            visitante: pendiente.visitante,
                        });
                    }
                } catch {
                    // se deja el marcador pendiente, no se bloquea la pantalla de éxito
                }
            }

            if (confirmados.length > 0) setMarcadoresConfirmados(confirmados);
        }

        async function verificar() {
            try {
                const data = await obtenerInfoPolla(token);
                if (cancelado) return;
                if (data?.acceso) {
                    // Guardar el token_acceso en localStorage para que /grupo/:token identifique al usuario
                    if (token) localStorage.setItem('polla_token_acceso', token);

                    // Auto-unirse al grupo si venía de una invitación
                    const grupoPendiente = localStorage.getItem('polla_grupo_pendiente');
                    if (grupoPendiente && token) {
                        try {
                            await unirseGrupo(grupoPendiente, token);
                            localStorage.removeItem('polla_grupo_pendiente');
                        } catch {
                            // silencioso — el usuario puede unirse manualmente desde /grupo/:token
                        }
                    }

                    await confirmarMarcadoresPendientes(data);
                    // purchase: solo aqui, porque data.acceso=true significa que el
                    // backend ya confirmo estado_pago='APROBADO' para este token (no
                    // se dispara en 'verificando'/'demorado'). trackPurchase tiene su
                    // propia guardia anti-duplicado por transactionId (el token).
                    trackPurchase({
                        transactionId: token,
                        value: data.valor_pagado,
                        currency: 'COP',
                        items: [{ item_id: String(data.valor_pagado ?? token), item_name: 'Bono Retoucherie', price: data.valor_pagado, quantity: 1 }],
                    });
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
                            La confirmación está tardando más de lo usual. No te preocupes: en cuanto Wompi confirme tu pago, te avisaremos por correo electrónico y tu bono quedará activo.
                        </p>
                    </>
                )}

                {estado === 'aprobado' && (
                    <>
                        <span className="text-7xl mb-3">🎉</span>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                            ¡Ya estás participando!
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-5">
                            Tu Bono Digital fue procesado correctamente. Ya eres parte de la Polla Mundialista de La Retoucherie.
                        </p>

                        {marcadoresConfirmados.length > 0 && (
                            <div className="w-full rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/15 px-5 py-4 mb-4 text-center">
                                <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                                    ✓ {marcadoresConfirmados.length === 1 ? 'Marcador registrado' : `${marcadoresConfirmados.length} marcadores registrados`}
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {marcadoresConfirmados.map((m) => (
                                        <p key={m.partido_id} className="text-zinc-900 dark:text-white font-bold text-sm">
                                            {m.equipo_local} <span className="text-2xl font-black tracking-tight">{m.local} - {m.visitante}</span> {m.equipo_visitante}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <ul className="w-full flex flex-col gap-2 mb-8">
                            <li className="flex items-center gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs shrink-0">✓</span>
                                Bono adquirido
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs shrink-0">✓</span>
                                Correo enviado
                            </li>
                        </ul>
                    </>
                )}

                {/* CTA: si ya hay sesión (se guarda desde Comprar.jsx al generar el pago),
                    no tiene sentido pedirle que se registre — se le manda directo a su cuenta. */}
                <div className="w-full rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 p-6 mb-6 text-left">
                    <p className="text-2xl mb-2">🏆</p>
                    <p className="text-zinc-900 dark:text-white font-extrabold text-lg mb-2">
                        {tieneSesion ? '¡Ya quedaste registrado!' : '¡Un paso más para ganar!'}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">
                        {tieneSesion ? 'Desde tu cuenta puedes:' : 'Regístrate para poder:'}
                    </p>
                    <ul className="flex flex-col gap-2.5 mb-5">
                        <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black shrink-0 mt-0.5">1</span>
                            Ver los resultados de los partidos de Colombia en tiempo real
                        </li>
                        <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black shrink-0 mt-0.5">2</span>
                            Ingresar tu pronóstico antes de cada partido
                        </li>
                        <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black shrink-0 mt-0.5">3</span>
                            Saber si ganaste un premio y cómo reclamarlo
                        </li>
                        <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black shrink-0 mt-0.5">4</span>
                            Recibir notificaciones por WhatsApp de tus partidos
                        </li>
                    </ul>
                    <Link
                        to={tieneSesion ? '/' : '/registro'}
                        className="block w-full py-4 rounded-xl font-black text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.35)] active:scale-95 transition-transform"
                    >
                        {tieneSesion ? 'Ir a mi cuenta' : 'Registrarme ahora — ¡es gratis!'}
                    </Link>
                </div>

                {/* Opciones secundarias */}
                <div className="flex flex-col gap-3 w-full">
                    {!tieneSesion && (
                        <Link
                            to="/iniciar-sesion"
                            className="block w-full py-3 rounded-xl font-bold text-sm text-zinc-900 dark:text-white text-center border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60"
                        >
                            Ya tengo cuenta — Iniciar sesión
                        </Link>
                    )}
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
