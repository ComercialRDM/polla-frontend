import { useState } from 'react';

export default function CompartirPronostico({ equipoLocal, equipoVisitante, localPred, visitantePred }) {
    const [copiado, setCopiado] = useState(false);

    const texto = `⚽ ¡Acabo de anotar mi pronóstico en la Polla Mundialista de La Retoucherie!\n\n🏟️ ${equipoLocal} ${localPred} – ${visitantePred} ${equipoVisitante}\n\n¿Y tú? ¡Participa y gana premios! 🇨🇴\n👉 www.ganaconretoucherie.com`;

    async function handleCompartir() {
        if (navigator.share) {
            try {
                await navigator.share({
                    text: texto,
                    url: 'https://www.ganaconretoucherie.com',
                });
            } catch {
                // usuario canceló
            }
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        }
    }

    function handleCopiar() {
        navigator.clipboard.writeText(texto).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
        });
    }

    return (
        <div className="mt-4 rounded-xl bg-zinc-950 border border-[#FCD116]/25 overflow-hidden">
            {/* Tarjeta visual (para captura de pantalla) */}
            <div className="px-4 pt-4 pb-3 text-center border-b border-white/5">
                <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-1">Mi pronóstico</p>
                <div className="flex items-center justify-center gap-3 my-2">
                    <span className="text-white font-bold text-sm leading-tight text-center flex-1">{equipoLocal}</span>
                    <span className="font-black text-3xl text-[#FCD116] font-scoreboard tabular-nums">
                        {localPred} – {visitantePred}
                    </span>
                    <span className="text-white font-bold text-sm leading-tight text-center flex-1">{equipoVisitante}</span>
                </div>
                <p className="text-zinc-600 text-[10px] tracking-widest mt-1">www.ganaconretoucherie.com</p>
            </div>

            {/* Botones de compartir */}
            <div className="px-3 py-3 flex gap-2">
                <button
                    onClick={handleCompartir}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 active:scale-95 transition-transform"
                >
                    📲 Compartir en redes
                </button>
                <button
                    onClick={handleCopiar}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-sm text-zinc-400 border border-white/10 bg-white/5 active:scale-95 transition-transform"
                >
                    {copiado ? '✅' : '📋'}
                </button>
            </div>
            <p className="text-zinc-600 text-[10px] text-center pb-2.5">
                Toca "Compartir" → Instagram Stories o WhatsApp
            </p>
        </div>
    );
}
