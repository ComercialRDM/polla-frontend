import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const RED_LABEL = {
    instagram: '📸 Instagram',
    tiktok: '🎵 TikTok',
    ambas: '📸🎵 Instagram & TikTok',
};

function formatSeguidores(n) {
    if (!n) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

export default function InvitacionInfluencer() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [invitacion, setInvitacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [aceptando, setAceptando] = useState(false);
    const [aceptado, setAceptado] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/invitacion/${encodeURIComponent(token)}`)
            .then(r => r.json())
            .then(d => {
                if (d?.success) {
                    setInvitacion(d.invitacion);
                    if (d.invitacion.estado === 'aceptado') setAceptado(true);
                } else {
                    setError('Esta invitación no existe o ya no es válida.');
                }
            })
            .catch(() => setError('No se pudo cargar la invitación. Verifica tu conexión.'))
            .finally(() => setCargando(false));
    }, [token]);

    async function handleAceptar() {
        setAceptando(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/invitacion/${encodeURIComponent(token)}/aceptar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data?.success && data.token_acceso) {
                navigate(`/polla?token=${encodeURIComponent(data.token_acceso)}`);
            } else {
                setError(data?.error || 'No se pudo completar. Intenta de nuevo.');
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setAceptando(false);
        }
    }

    if (cargando) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#FCD116] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error && !invitacion) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center gap-4">
                <p className="text-4xl">❌</p>
                <p className="text-white font-bold text-lg">{error}</p>
                <button onClick={() => navigate('/')} className="text-zinc-400 text-sm underline">Ir al inicio</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center pb-16 relative">
            {/* Barra Colombia */}
            <div className="w-full h-1.5 flex">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#003087]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="w-full max-w-md px-4 mt-8 flex flex-col items-center gap-6">
                {/* Logo */}
                <img
                    src={logoRetoucherie}
                    alt="La Retoucherie de Manuela"
                    className="h-20 w-20 object-cover rounded-2xl ring-4 ring-[#FCD116]/40 shadow-xl"
                />

                {aceptado ? (
                    /* Ya aceptó antes */
                    <div className="w-full rounded-2xl bg-zinc-900 border border-green-500/30 p-6 text-center">
                        <p className="text-3xl mb-3">✅</p>
                        <p className="text-white font-extrabold text-xl mb-2">¡Ya eres parte!</p>
                        <p className="text-zinc-400 text-sm mb-5">
                            {invitacion?.nombre_completo}, ya aceptaste la invitación.
                            Ingresa a tu dashboard para ver tus pronósticos y el ranking de creadores.
                        </p>
                        <button
                            onClick={handleAceptar}
                            disabled={aceptando}
                            className="w-full py-3 rounded-xl font-black text-zinc-950 bg-[#FCD116] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 text-sm"
                        >
                            {aceptando ? 'Cargando...' : 'Entrar a mi dashboard'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center">
                            <p className="text-[#FCD116] font-black text-xs uppercase tracking-widest mb-2">Invitación especial</p>
                            <h1 className="text-white font-extrabold text-2xl leading-tight">
                                {invitacion?.nombre_completo},<br />
                                <span className="text-[#FCD116]">eres parte de la Polla</span>
                            </h1>
                            <p className="text-zinc-400 text-sm mt-2">
                                Te seleccionamos como creador de contenido para la<br />
                                <strong className="text-white">Polla Mundialista de La Retoucherie</strong>
                            </p>
                        </div>

                        {/* Stats del influencer */}
                        {(invitacion?.seguidores || invitacion?.tasa_engagement || invitacion?.red_social) && (
                            <div className="w-full flex gap-3">
                                {invitacion.seguidores && (
                                    <div className="flex-1 rounded-xl bg-zinc-900 border border-white/5 p-3 text-center">
                                        <p className="text-white font-black text-xl">{formatSeguidores(invitacion.seguidores)}</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5">Seguidores</p>
                                    </div>
                                )}
                                {invitacion.tasa_engagement && (
                                    <div className="flex-1 rounded-xl bg-zinc-900 border border-white/5 p-3 text-center">
                                        <p className="text-[#FCD116] font-black text-xl">{invitacion.tasa_engagement}%</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5">Engagement</p>
                                    </div>
                                )}
                                {invitacion.red_social && (
                                    <div className="flex-1 rounded-xl bg-zinc-900 border border-white/5 p-3 text-center">
                                        <p className="text-white font-black text-sm">{RED_LABEL[invitacion.red_social] || invitacion.red_social}</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5">Red</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Beneficios */}
                        <div className="w-full rounded-2xl bg-zinc-900 border border-[#FCD116]/20 p-4">
                            <p className="text-white font-bold text-sm mb-3">¿Qué obtienes al aceptar?</p>
                            <div className="flex flex-col gap-2">
                                {[
                                    ['⚽', '30 intentos para predecir marcadores del Mundial'],
                                    ['🏆', 'Ranking propio de creadores de contenido (top 3 gana premio)'],
                                    ['🎖️', 'Bono de $500.000 en servicios de La Retoucherie'],
                                    ['🔗', 'Link único de referido: ganas por cada amigo que compra'],
                                    ['📊', 'Dashboard con tus estadísticas en tiempo real'],
                                ].map(([ico, txt]) => (
                                    <div key={txt} className="flex items-start gap-2.5">
                                        <span className="text-base flex-shrink-0 mt-0.5">{ico}</span>
                                        <p className="text-zinc-300 text-xs leading-snug">{txt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-2 w-full text-center">{error}</p>
                        )}

                        <button
                            onClick={handleAceptar}
                            disabled={aceptando}
                            className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_24px_rgba(252,209,22,0.35)] hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {aceptando ? 'Activando tu cuenta...' : 'Aceptar y entrar a la Polla '}
                        </button>

                        <p className="text-zinc-600 text-[10px] text-center leading-relaxed px-4">
                            Al aceptar confirmas que eres el creador de contenido invitado y aceptas los
                            términos de participación de la Polla Mundialista de La Retoucherie de Manuela.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
