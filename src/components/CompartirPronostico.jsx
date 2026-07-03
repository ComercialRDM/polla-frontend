import { useState } from 'react';
import { registrarCompartida } from '../api';
import { bandera, codigoPais } from '../utils/banderas';
import imagenPlantilla from '../assets/DEFINITIVA PRONOSTICO COMPARTIR ----V1.0.png';

export default function CompartirPronostico({
    equipoLocal, equipoVisitante, localPred, visitantePred,
    tokenAcceso, partidoId,
    nombreUsuario, fotoUrl,
}) {
    const [copiado, setCopiado] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [ptoGanado, setPtoGanado] = useState(0);
    const [mensaje, setMensaje] = useState('');

    function loadImg(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    function drawCircleImg(ctx, img, cx, cy, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = (r * 2) / Math.min(iw, ih);
        ctx.drawImage(img, cx - (iw * scale) / 2, cy - (ih * scale) / 2, iw * scale, ih * scale);
        ctx.restore();
    }

    function drawEmojiFlag(ctx, emoji, cx, cy, size) {
        const prev = ctx.textBaseline;
        ctx.textBaseline = 'middle';
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(emoji, cx, cy);
        ctx.textBaseline = prev;
    }

    async function generarImagenStory() {
        const W = 1024, H = 1536;
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

        const codeL = codigoPais(equipoLocal);
        const codeV = codigoPais(equipoVisitante);

        const [imgFondo, imgL, imgV] = await Promise.all([
            loadImg(imagenPlantilla),
            codeL ? loadImg(`https://flagcdn.com/w320/${codeL}.png`) : Promise.resolve(null),
            codeV ? loadImg(`https://flagcdn.com/w320/${codeV}.png`) : Promise.resolve(null),
        ]);

        // ── FONDO: imagen plantilla diseñada ──
        if (imgFondo) ctx.drawImage(imgFondo, 0, 0, W, H);

        // ── NOMBRE DEL USUARIO (entre "MI PASIÓN" y las banderas) ──
        if (nombreUsuario) {
            ctx.fillStyle = 'rgba(0,0,0,0.48)';
            ctx.fillRect(0, 468, W, 118);

            let userSize = 52;
            ctx.font = `bold ${userSize}px Arial`;
            while (ctx.measureText(nombreUsuario).width > W - 60 && userSize > 24) {
                userSize -= 2;
                ctx.font = `bold ${userSize}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(nombreUsuario.toUpperCase(), W / 2, 548);
        }

        // Coordenadas exactas medidas del template 1024×1536
        const flagR = 100;
        const lCX = 281, vCX = 745, flagCY = 693;

        // Cubrir banderas placeholder con círculo oscuro
        [lCX, vCX].forEach((cx) => {
            ctx.fillStyle = '#030b03';
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR + 12, 0, Math.PI * 2);
            ctx.fill();
        });

        // Aro dorado
        [lCX, vCX].forEach((cx) => {
            ctx.shadowColor = 'rgba(252,209,22,0.7)';
            ctx.shadowBlur = 24;
            ctx.strokeStyle = '#FCD116';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Fondo interior bandera
        [lCX, vCX].forEach((cx) => {
            ctx.fillStyle = '#111118';
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR, 0, Math.PI * 2);
            ctx.fill();
        });

        // Dibujar banderas reales
        if (imgL) drawCircleImg(ctx, imgL, lCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoLocal), lCX, flagCY, flagR);
        if (imgV) drawCircleImg(ctx, imgV, vCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoVisitante), vCX, flagCY, flagR);

        // ── NOMBRES DE EQUIPOS ──
        const nameY = 847;
        [lCX, vCX].forEach((cx) => {
            ctx.fillStyle = '#030b03';
            ctx.fillRect(cx - 200, nameY - 44, 400, 56);
        });

        const drawFit = (text, cx, y, maxW) => {
            let size = 52;
            ctx.font = `bold ${size}px Arial`;
            while (ctx.measureText(text).width > maxW && size > 22) {
                size -= 2;
                ctx.font = `bold ${size}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(text, cx, y);
        };
        drawFit(equipoLocal.toUpperCase(), lCX, nameY, 380);
        drawFit(equipoVisitante.toUpperCase(), vCX, nameY, 380);

        // ── MARCADOR ──
        // Cubre exactamente el score card del template (medido: top=878, bottom=1028)
        ctx.fillStyle = '#050505';
        ctx.fillRect(25, 878, 974, 150);

        ctx.shadowColor = 'rgba(252,209,22,0.65)';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 130px monospace';
        ctx.textAlign = 'center';
        // Números en posiciones exactas medidas del template
        ctx.fillText(String(localPred),   297, 988);
        ctx.fillText('–',                 W / 2, 988);
        ctx.fillText(String(visitantePred), 724, 988);
        ctx.shadowBlur = 0;


        return canvas;
    }

    async function handleCompartir() {
        setGenerando(true);
        setMensaje('');
        try {
            const canvas = await generarImagenStory();
            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
            const file = new File([blob], 'pronostico-retoucherie.png', { type: 'image/png' });
            let compartido = false;

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mi pronóstico — Polla Mundialista La Retoucherie',
                });
                compartido = true;
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pronostico-retoucherie.png';
                a.click();
                URL.revokeObjectURL(url);
                setMensaje('📲 Imagen descargada — súbela desde tu galería a Instagram Stories o WhatsApp');
                compartido = true;
            }

            if (compartido && tokenAcceso && partidoId) {
                try {
                    const resp = await registrarCompartida(tokenAcceso, partidoId);
                    if (resp?.puntos_ganados > 0) {
                        setPtoGanado(resp.puntos_ganados);
                        setTimeout(() => setPtoGanado(0), 3000);
                    }
                } catch {
                    // No interrumpir la experiencia si falla el registro
                }
            }
        } catch (err) {
            if (err?.name !== 'AbortError') {
                setMensaje('No se pudo compartir. Intenta de nuevo o descarga la imagen manualmente.');
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
            {/* Vista previa compacta */}
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
                <div className="flex-1 relative">
                    <button
                        onClick={handleCompartir}
                        disabled={generando}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 active:scale-95 transition-transform disabled:opacity-60"
                    >
                        {generando ? 'Preparando imagen...' : '📲 Compartir mi pronóstico'}
                    </button>
                    {ptoGanado > 0 && (
                        <span className="absolute -top-2 right-2 bg-[#FCD116] text-black text-xs font-black px-2 py-0.5 rounded-full animate-bounce shadow-lg">
                            +{ptoGanado} pts ⭐
                        </span>
                    )}
                </div>
                <button
                    onClick={handleCopiar}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-sm text-zinc-400 border border-white/10 bg-white/5 active:scale-95 transition-transform"
                    title="Copiar texto al portapapeles"
                >
                    {copiado ? '✅' : '📋'}
                </button>
            </div>

            {mensaje ? (
                <p className="text-[#FCD116] text-[11px] text-center px-3 pb-3 leading-snug">{mensaje}</p>
            ) : (
                <p className="text-zinc-600 text-[10px] text-center pb-2.5">
                    Genera imagen con tu foto y pronóstico lista para compartir en redes o WhatsApp
                </p>
            )}
        </div>
    );
}
