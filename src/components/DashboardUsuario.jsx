import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenUsuario } from '../api';
import MisPronosticos from './MisPronosticos';

export default function DashboardUsuario({ sesion, onSalir }) {
    const [datos, setDatos] = useState(null);
    const nombre = sesion?.nombre?.split(' ')[0] || '';
    const equipos = sesion?.equipos_favoritos || [];

    useEffect(() => {
        if (!sesion?.id) return;
        obtenerResumenUsuario()
            .then(d => { if (d?.success) setDatos(d); })
            .catch(() => {});
    }, [sesion?.id]);

    return (
        <div className="w-full max-w-md px-4 mt-3">
            <div className="rounded-2xl bg-zinc-900 border border-[#FCD116]/30 overflow-hidden">

                {/* Cabecera: nombre + equipos + salir */}
                <div className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[#FCD116] font-black text-base leading-tight">
                            👋 Hola, {nombre}
                        </p>
                        {equipos.length > 0 && (
                            <p className="text-zinc-400 text-xs mt-0.5 truncate">
                                ❤️ {equipos.slice(0, 3).join(' · ')}
                                {equipos.length > 3 && ` +${equipos.length - 3}`}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onSalir}
                        className="flex-shrink-0 text-xs text-zinc-600 hover:text-zinc-300 underline transition-colors mt-0.5"
                    >
                        Salir
                    </button>
                </div>

                {!datos ? (
                    <div className="px-4 pb-4 text-zinc-600 text-xs text-center border-t border-white/5 pt-3">
                        Cargando tu tablero...
                    </div>
                ) : (
                    <>
                        {/* Bloque de ranking */}
                        <BloqueRanking datos={datos} />

                        {/* Grid de estadísticas */}
                        <div className="grid grid-cols-4 gap-2 px-3 pt-3 pb-3 border-t border-white/5">
                            <Stat icono="⭐" valor={datos.puntos} etiqueta="Puntos" color="text-[#FCD116]" />
                            <Stat icono="🎯" valor={datos.exactos} etiqueta="Exactos" color="text-green-400" />
                            <Stat icono="⚽" valor={datos.intentos_realizados} etiqueta="Usados" color="text-blue-400" />
                            <Stat
                                icono="🎟️"
                                valor={datos.intentos_disponibles}
                                etiqueta={datos.intentos_disponibles > 0 ? 'Quedan' : 'Agotados'}
                                color={datos.intentos_disponibles > 0 ? 'text-white' : 'text-zinc-600'}
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="px-3 pb-3 flex gap-2 border-t border-white/5 pt-3">
                            {datos.intentos_disponibles > 0 && datos.token_polla ? (
                                <Link
                                    to={`/polla?token=${datos.token_polla}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform"
                                >
                                    ⚽ Pronosticar ahora
                                </Link>
                            ) : null}
                            <Link
                                to="/comprar"
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm border border-[#FCD116]/40 text-[#FCD116] hover:bg-[#FCD116]/10 active:scale-95 transition-transform ${datos.intentos_disponibles > 0 && datos.token_polla ? 'px-4' : 'flex-1'}`}
                            >
                                {datos.intentos_disponibles > 0 ? '+ Bono' : '🎟️ Comprar intentos'}
                            </Link>
                        </div>

                        {/* Push a comprar un bono más grande */}
                        <div className="px-4 pb-3.5 border-t border-white/5 pt-3">
                            <p className="text-xs text-zinc-400 leading-snug">
                                {mensajePush(datos)}
                            </p>
                        </div>
                    </>
                )}


            </div>

            {/* Reta a un amigo */}
            {datos && <RetaAmigo token={datos.token_polla} />}

            {/* Historial de pronósticos */}
            <MisPronosticos usuarioId={sesion.id} />
        </div>
    );
}

// Mensaje motivacional para empujar la compra de un bono más grande / más partidos.
// No inventa estadísticas ("X% de usuarios compran...") que no podemos verificar en vivo
// — se ancla a hechos reales: el premio del Bono Colombia y la situación real del usuario.
function mensajePush(datos) {
    if (datos.intentos_disponibles === 0) {
        return '🔥 Se te acabaron los intentos. Compra otro bono ahora para seguir prediciendo y no perderte ningún partido.';
    }
    if (!datos.token_polla || datos.posicion > 3) {
        return '🚀 Sube a un bono de $50.000 o $100.000 para tener más intentos: más partidos pronosticados, más opciones de ganar hasta $1.000.000 en el Bono Colombia.';
    }
    return '💪 ¡Vas muy bien! Compra otro bono para asegurar tu lugar en el podio y seguir acumulando intentos.';
}

function BloqueRanking({ datos }) {
    const { posicion, total_participantes, puntos, puntos_para_superar } = datos;
    const esLider = posicion === 1 || puntos_para_superar === null;
    const puntosObjetivo = puntos + (puntos_para_superar || 0);
    const progreso = puntosObjetivo > 0 ? Math.min(100, Math.round((puntos / puntosObjetivo) * 100)) : 100;

    const medalla = posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : '🏅';

    return (
        <div className="px-4 py-3 border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-4xl text-white leading-none">#{posicion}</span>
                        <span className="text-zinc-500 text-xs">
                            de {total_participantes} {total_participantes === 1 ? 'participante' : 'participantes'}
                        </span>
                    </div>
                    <p className="text-xs mt-1 leading-tight">
                        {esLider ? (
                            <span className="text-[#FCD116] font-semibold">¡Vas en primer lugar! Sigue así 💪</span>
                        ) : (
                            <span className="text-zinc-400">
                                Te faltan{' '}
                                <span className="text-white font-bold">{puntos_para_superar} pt{puntos_para_superar === 1 ? '' : 's'}</span>
                                {' '}para subir al #{posicion - 1} ⬆️
                            </span>
                        )}
                    </p>
                </div>
                <span className="text-4xl flex-shrink-0">{medalla}</span>
            </div>

            {!esLider && (
                <div className="mt-2.5">
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#FCD116] to-amber-500 transition-all duration-700"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>Tus {puntos} pts</span>
                        <span>{puntosObjetivo} pts del #{posicion - 1}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ icono, valor, etiqueta, color }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-800/60 border border-white/5 py-2.5 px-1">
            <span className="text-sm mb-0.5">{icono}</span>
            <span className={`font-black text-xl leading-none ${color}`}>{valor}</span>
            <span className="text-zinc-500 text-[10px] mt-0.5 text-center leading-tight">{etiqueta}</span>
        </div>
    );
}

function RetaAmigo({ token }) {
    const [copiado, setCopiado] = useState(false);
    const url = `${window.location.origin}${token ? `/?ref=${token}` : ''}`;
    const texto = `🇨🇴⚽ ¡Te reto a participar en la Polla Mundialista de La Retoucherie de Manuela!\n\nPredice el marcador de los partidos y gana premios increíbles.\n\n👉 ${url}`;

    async function handleCompartir() {
        if (navigator.share) {
            try { await navigator.share({ text: texto, url }); } catch {}
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        }
    }

    function handleCopiar() {
        navigator.clipboard.writeText(url).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2200);
        });
    }

    return (
        <div className="w-full max-w-md px-4 mt-3">
            <div className="rounded-2xl bg-zinc-900 border border-white/8 px-4 py-3">
                <p className="text-white font-bold text-sm mb-0.5">🏆 Reta a un amigo</p>
                <p className="text-zinc-500 text-xs mb-3">
                    Comparte con tu grupo de fútbol y compitan juntos por los premios.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleCompartir}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
                    >
                        📲 Compartir
                    </button>
                    <button
                        onClick={handleCopiar}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-zinc-300 border border-white/10 bg-white/5 active:scale-95 transition-transform"
                    >
                        {copiado ? '✅ ¡Copiado!' : '🔗 Copiar link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
