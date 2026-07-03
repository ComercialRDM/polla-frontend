import { useState } from 'react';
import { registrarCompartida } from '../api';
import { bandera, codigoPais } from '../utils/banderas';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

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

        const codeL = codigoPais(equipoLocal);
        const codeV = codigoPais(equipoVisitante);

        const [imgL, imgV, imgLogo] = await Promise.all([
            codeL ? loadImg(`https://flagcdn.com/w320/${codeL}.png`) : Promise.resolve(null),
            codeV ? loadImg(`https://flagcdn.com/w320/${codeV}.png`) : Promise.resolve(null),
            loadImg(logoRetoucherie),
        ]);

        // ── FONDO: estadio oscuro ──
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, W, H);

        // Ráfaga de luz superior (focos del estadio)
        const topGlow = ctx.createRadialGradient(W / 2, -100, 0, W / 2, -100, 1100);
        topGlow.addColorStop(0, 'rgba(255,140,0,0.9)');
        topGlow.addColorStop(0.2, 'rgba(200,80,0,0.5)');
        topGlow.addColorStop(0.5, 'rgba(252,209,22,0.10)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, W, H);

        // Focos laterales
        [[0, 200, 0.25], [W, 200, 0.25]].forEach(([x, y, a]) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 600);
            g.addColorStop(0, `rgba(255,160,20,${a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        });

        // Halo dorado central (zona marcador)
        const midGlow = ctx.createRadialGradient(W / 2, 980, 0, W / 2, 980, 500);
        midGlow.addColorStop(0, 'rgba(252,209,22,0.15)');
        midGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = midGlow;
        ctx.fillRect(0, 0, W, H);

        // Rayos diagonales de luz
        ctx.save();
        for (let i = 0; i < 12; i++) {
            const x = i * 130 - 300;
            const gRay = ctx.createLinearGradient(x + H * 0.18, H, x, 0);
            gRay.addColorStop(0, 'rgba(252,209,22,0)');
            gRay.addColorStop(0.5, `rgba(252,209,22,${i % 3 === 0 ? 0.045 : 0.022})`);
            gRay.addColorStop(1, 'rgba(255,130,0,0.05)');
            ctx.fillStyle = gRay;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 90, 0);
            ctx.lineTo(x + 90 + H * 0.18, H);
            ctx.lineTo(x + H * 0.18, H);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Viñeta oscura cinematográfica
        const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.82);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // Franjas top/bottom
        ctx.fillStyle = '#FCD116';
        ctx.fillRect(0, 0, W, 14);
        ctx.fillRect(0, H - 14, W, 14);

        // ── LOGO ──
        ctx.textAlign = 'center';
        if (imgLogo) {
            const logoSize = 110;
            const logoAR = (imgLogo.naturalWidth || imgLogo.width) / (imgLogo.naturalHeight || imgLogo.height);
            const logoW = logoSize * logoAR;
            ctx.save();
            rr((W - logoW) / 2, 22, logoW, logoSize, 16);
            ctx.clip();
            ctx.drawImage(imgLogo, (W - logoW) / 2, 22, logoW, logoSize);
            ctx.restore();
        }

        // "POLLA MUNDIALISTA · MUNDIAL 2026"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px Arial';
        ctx.fillText('POLLA MUNDIALISTA  ·  MUNDIAL 2026', W / 2, 168);

        // Separador dorado
        const sep1 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sep1.addColorStop(0, 'rgba(252,209,22,0)');
        sep1.addColorStop(0.5, 'rgba(252,209,22,0.65)');
        sep1.addColorStop(1, 'rgba(252,209,22,0)');
        ctx.strokeStyle = sep1;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(60, 195); ctx.lineTo(W - 60, 195); ctx.stroke();

        // "MI PRONÓSTICO" (blanco)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 108px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MI PRONÓSTICO', W / 2, 308);

        // "MI PASIÓN" (amarillo con glow)
        ctx.shadowColor = 'rgba(252,209,22,0.55)';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 108px Arial';
        ctx.fillText('MI PASIÓN', W / 2, 428);
        ctx.shadowBlur = 0;

        // Nombre del usuario
        if (nombreUsuario) {
            const sepN = ctx.createLinearGradient(60, 0, W - 60, 0);
            sepN.addColorStop(0, 'rgba(255,255,255,0)');
            sepN.addColorStop(0.5, 'rgba(255,255,255,0.1)');
            sepN.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = sepN;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(100, 464); ctx.lineTo(W - 100, 464); ctx.stroke();

            let nameSize = 58;
            ctx.font = `bold ${nameSize}px Arial`;
            while (ctx.measureText(nombreUsuario).width > W - 120 && nameSize > 28) {
                nameSize -= 2;
                ctx.font = `bold ${nameSize}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(nombreUsuario, W / 2, 530);
        }

        // ── BANDERAS ──
        const flagR = 128;
        const lCX = 240, vCX = W - 240, flagCY = nombreUsuario ? 668 : 622;

        [lCX, vCX].forEach((cx) => {
            ctx.shadowColor = 'rgba(252,209,22,0.55)';
            ctx.shadowBlur = 32;
            ctx.strokeStyle = '#FCD116';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        [lCX, vCX].forEach((cx) => {
            ctx.fillStyle = '#12122a';
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR, 0, Math.PI * 2);
            ctx.fill();
        });

        if (imgL) drawCircleImg(ctx, imgL, lCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoLocal), lCX, flagCY, 122);

        if (imgV) drawCircleImg(ctx, imgV, vCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoVisitante), vCX, flagCY, 122);

        // VS
        ctx.shadowColor = 'rgba(252,209,22,0.85)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', W / 2, flagCY + 16);
        ctx.shadowBlur = 0;

        // Nombres de equipos
        const drawFit = (text, cx, y, maxW, color = '#ffffff') => {
            let size = 60;
            ctx.font = `bold ${size}px Arial`;
            while (ctx.measureText(text).width > maxW && size > 28) {
                size -= 2;
                ctx.font = `bold ${size}px Arial`;
            }
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.fillText(text, cx, y);
        };
        drawFit(equipoLocal.toUpperCase(), lCX, flagCY + 178, 430);
        drawFit(equipoVisitante.toUpperCase(), vCX, flagCY + 178, 430);

        const scoreY = flagCY + 233;

        // ── TARJETA MARCADOR ──
        ctx.shadowColor = 'rgba(252,209,22,0.65)';
        ctx.shadowBlur = 55;
        ctx.fillStyle = '#FCD116';
        rr(60, scoreY, W - 120, 265, 40);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#050508';
        rr(70, scoreY + 10, W - 140, 245, 32);
        ctx.fill();

        ctx.shadowColor = 'rgba(252,209,22,0.6)';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 190px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${localPred}  –  ${visitantePred}`, W / 2, scoreY + 203);
        ctx.shadowBlur = 0;

        const ctaY = scoreY + 323;

        // ── CTA ──
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 70px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¿Y TÚ, QUÉ MARCADOR', W / 2, ctaY);

        ctx.shadowColor = 'rgba(252,209,22,0.5)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 70px Arial';
        ctx.fillText('CREES QUE VA A QUEDAR?', W / 2, ctaY + 92);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#a0a0a0';
        ctx.font = '40px Arial';
        ctx.fillText('Compra tu bono y participa en la', W / 2, ctaY + 180);

        // "Polla Mundialista " (gris) + "La Retoucherie" (amarillo) + " 2026" (gris)
        ctx.font = '40px Arial';
        const p1 = 'Polla Mundialista ', p2 = 'La Retoucherie', p3 = ' 2026';
        const tw = ctx.measureText(p1).width + ctx.measureText(p2).width + ctx.measureText(p3).width;
        const sx = (W - tw) / 2;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#a0a0a0'; ctx.fillText(p1, sx, ctaY + 232);
        ctx.fillStyle = '#FCD116'; ctx.fillText(p2, sx + ctx.measureText(p1).width, ctaY + 232);
        ctx.fillStyle = '#a0a0a0'; ctx.fillText(p3, sx + ctx.measureText(p1).width + ctx.measureText(p2).width, ctaY + 232);
        ctx.textAlign = 'center';

        // Íconos: CO + ⚽ + 🏆
        ctx.font = '74px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('🇨🇴', W / 2 - 140, ctaY + 328);
        ctx.fillText('⚽', W / 2, ctaY + 328);
        ctx.fillText('🏆', W / 2 + 140, ctaY + 328);
        ctx.textBaseline = 'alphabetic';

        // ── BOTÓN URL ──
        const btnY = ctaY + 412;
        ctx.shadowColor = 'rgba(252,209,22,0.55)';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#FCD116';
        rr(60, btnY, W - 120, 100, 30);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, btnY + 65);

        // Condiciones
        ctx.fillStyle = '#606060';
        ctx.font = '32px Arial';
        ctx.fillText('*Aplican condiciones y restricciones.', W / 2, btnY + 150);

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
