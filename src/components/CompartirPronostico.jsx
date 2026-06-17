import { useState } from 'react';

export default function CompartirPronostico({ equipoLocal, equipoVisitante, localPred, visitantePred }) {
    const [copiado, setCopiado] = useState(false);
    const [generando, setGenerando] = useState(false);

    // Genera imagen 1080×1920 (9:16 Stories) usando Canvas — sin librerías extra
    async function generarImagenStory() {
        const W = 1080, H = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        const rr = (x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        // Fondo negro
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        // Barras amarillas top/bottom
        ctx.fillStyle = '#FCD116';
        ctx.fillRect(0, 0, W, 20);
        ctx.fillRect(0, H - 20, W, 20);

        // Marca
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LA RETOUCHERIE DE MANUELA', W / 2, 140);

        ctx.fillStyle = '#666666';
        ctx.font = '42px Arial';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, 205);

        // Línea separadora
        ctx.strokeStyle = '#FCD116';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 240);
        ctx.lineTo(W - 80, 240);
        ctx.stroke();

        // Título
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 88px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MI PRONÓSTICO', W / 2, 390);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '56px Arial';
        ctx.fillText(`${equipoLocal}  vs  ${equipoVisitante}`, W / 2, 480);

        // Recuadro marcador
        ctx.fillStyle = '#161616';
        rr(120, 550, W - 240, 280, 32);
        ctx.fill();
        ctx.strokeStyle = '#FCD116';
        ctx.lineWidth = 4;
        rr(120, 550, W - 240, 280, 32);
        ctx.stroke();

        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 190px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${localPred}  -  ${visitantePred}`, W / 2, 780);

        // Equipos debajo del marcador
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 66px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(equipoLocal, 130, 900);
        ctx.textAlign = 'right';
        ctx.fillText(equipoVisitante, W - 130, 900);

        // Separador
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 940);
        ctx.lineTo(W - 80, 940);
        ctx.stroke();

        // CTA
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 70px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¿Y TÚ, QUÉ MARCADOR', W / 2, 1090);
        ctx.fillText('CREES QUE VA A QUEDAR?', W / 2, 1180);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '52px Arial';
        ctx.fillText('¡Participa y gana premios increíbles!', W / 2, 1300);

        ctx.font = '90px Arial';
        ctx.fillText('🇨🇴 ⚽ 🏆', W / 2, 1420);

        // Botón URL
        ctx.fillStyle = '#FCD116';
        rr(150, 1490, W - 300, 120, 24);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 54px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, 1567);

        return canvas;
    }

    async function handleCompartir() {
        setGenerando(true);
        try {
            const canvas = await generarImagenStory();
            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
            const file = new File([blob], 'pronostico-retoucherie.png', { type: 'image/png' });

            // Si el navegador soporta compartir archivos → Instagram Stories / WhatsApp
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
                return;
            }

            // Fallback: compartir texto + URL (Android/desktop sin soporte de archivos)
            if (navigator.share) {
                await navigator.share({
                    text: `⚽ Mi pronóstico: ${equipoLocal} ${localPred} – ${visitantePred} ${equipoVisitante}\n¡Participa en la Polla Mundialista de La Retoucherie! 🇨🇴`,
                    url: 'https://www.ganaconretoucherie.com',
                });
                return;
            }

            // Desktop: descargar la imagen directamente
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pronostico-retoucherie.png';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err?.name !== 'AbortError') {
                // El usuario canceló — ignorar
            }
        } finally {
            setGenerando(false);
        }
    }

    function handleCopiar() {
        const texto = `⚽ Mi pronóstico: ${equipoLocal} ${localPred} – ${visitantePred} ${equipoVisitante}\n¡Participa en la Polla Mundialista de La Retoucherie de Manuela!\n👉 www.ganaconretoucherie.com`;
        navigator.clipboard.writeText(texto).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
        });
    }

    return (
        <div className="mt-4 rounded-xl bg-zinc-950 border border-[#FCD116]/25 overflow-hidden">
            {/* Tarjeta visual */}
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

            {/* Botones */}
            <div className="px-3 py-3 flex gap-2">
                <button
                    onClick={handleCompartir}
                    disabled={generando}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 active:scale-95 transition-transform disabled:opacity-60"
                >
                    {generando ? 'Preparando imagen...' : '📲 Compartir en Stories'}
                </button>
                <button
                    onClick={handleCopiar}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-sm text-zinc-400 border border-white/10 bg-white/5 active:scale-95 transition-transform"
                >
                    {copiado ? '✅' : '📋'}
                </button>
            </div>
            <p className="text-zinc-600 text-[10px] text-center pb-2.5">
                Genera imagen 9:16 lista para Instagram Stories y WhatsApp
            </p>
        </div>
    );
}
