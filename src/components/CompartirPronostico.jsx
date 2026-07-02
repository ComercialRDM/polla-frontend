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

        // Rectángulo redondeado
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

        const [imgL, imgV, imgLogo, imgUsuario] = await Promise.all([
            codeL ? loadImg(`https://flagcdn.com/w320/${codeL}.png`) : Promise.resolve(null),
            codeV ? loadImg(`https://flagcdn.com/w320/${codeV}.png`) : Promise.resolve(null),
            loadImg(logoRetoucherie),
            fotoUrl ? loadImg(fotoUrl) : Promise.resolve(null),
        ]);

        // ── FONDO: estadio de alta tensión ──
        ctx.fillStyle = '#030310';
        ctx.fillRect(0, 0, W, H);

        // Ráfaga de luz desde arriba (focos del estadio)
        const topGlow = ctx.createRadialGradient(W / 2, -150, 0, W / 2, -150, 1200);
        topGlow.addColorStop(0, 'rgba(255,130,0,0.95)');
        topGlow.addColorStop(0.25, 'rgba(200,70,0,0.55)');
        topGlow.addColorStop(0.55, 'rgba(252,209,22,0.12)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, W, H);

        // Focos laterales
        [[0, 220, 0.28], [W, 220, 0.28]].forEach(([x, y, a]) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 650);
            g.addColorStop(0, `rgba(255,160,20,${a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        });

        // Halo dorado central (sobre la zona del marcador)
        const midGlow = ctx.createRadialGradient(W / 2, 1060, 0, W / 2, 1060, 480);
        midGlow.addColorStop(0, 'rgba(252,209,22,0.20)');
        midGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = midGlow;
        ctx.fillRect(0, 0, W, H);

        // Halo inferior (detrás del CTA)
        const botGlow = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 700);
        botGlow.addColorStop(0, 'rgba(252,209,22,0.10)');
        botGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = botGlow;
        ctx.fillRect(0, 0, W, H);

        // Rayos diagonales de luz (como estadio)
        ctx.save();
        for (let i = 0; i < 12; i++) {
            const x = i * 130 - 300;
            const gRay = ctx.createLinearGradient(x + H * 0.18, H, x, 0);
            gRay.addColorStop(0, 'rgba(252,209,22,0)');
            gRay.addColorStop(0.5, `rgba(252,209,22,${i % 3 === 0 ? 0.05 : 0.025})`);
            gRay.addColorStop(1, 'rgba(255,130,0,0.06)');
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

        // Partículas doradas flotantes
        ctx.save();
        [
            [95, 430, 5], [985, 410, 4], [180, 720, 3.5], [900, 680, 4.5],
            [140, 1120, 4], [940, 1080, 3], [75, 1520, 3.5], [1005, 1450, 4],
            [310, 290, 3], [790, 310, 3.5], [460, 1710, 2.5], [640, 190, 3],
            [115, 960, 2.5], [965, 940, 3], [510, 1600, 2], [280, 1340, 2.5],
            [810, 1350, 2], [540, 580, 2], [200, 1680, 1.8], [880, 1700, 2],
        ].forEach(([px, py, pr]) => {
            const gp = ctx.createRadialGradient(px, py, 0, px, py, pr * 4);
            gp.addColorStop(0, 'rgba(252,209,22,0.8)');
            gp.addColorStop(0.4, 'rgba(252,209,22,0.3)');
            gp.addColorStop(1, 'rgba(252,209,22,0)');
            ctx.fillStyle = gp;
            ctx.beginPath();
            ctx.arc(px, py, pr * 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Viñeta oscura en esquinas (efecto cinematográfico)
        const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // Franjas doradas top/bottom
        ctx.fillStyle = '#FCD116';
        ctx.fillRect(0, 0, W, 16);
        ctx.fillRect(0, H - 16, W, 16);

        // ── CABECERA ──
        ctx.textAlign = 'center';

        if (imgLogo) {
            const logoH = 115;
            const logoW = logoH * ((imgLogo.naturalWidth || imgLogo.width) / (imgLogo.naturalHeight || imgLogo.height));
            ctx.drawImage(imgLogo, (W - logoW) / 2, 24, logoW, logoH);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('POLLA MUNDIALISTA  ·  MUNDIAL 2026', W / 2, 185);

        const sepGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
        sepGrad.addColorStop(0, 'rgba(252,209,22,0)');
        sepGrad.addColorStop(0.5, 'rgba(252,209,22,0.7)');
        sepGrad.addColorStop(1, 'rgba(252,209,22,0)');
        ctx.strokeStyle = sepGrad;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(60, 213); ctx.lineTo(W - 60, 213); ctx.stroke();

        // "MI PRONÓSTICO"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 92px Arial';
        ctx.fillText('MI PRONÓSTICO', W / 2, 295);

        // ── SECCIÓN USUARIO ──
        const sepU = ctx.createLinearGradient(60, 0, W - 60, 0);
        sepU.addColorStop(0, 'rgba(255,255,255,0)');
        sepU.addColorStop(0.5, 'rgba(255,255,255,0.08)');
        sepU.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sepU;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 328); ctx.lineTo(W - 60, 328); ctx.stroke();

        const uCX = W / 2, uCY = 415, uR = 62;

        ctx.shadowColor = 'rgba(252,209,22,0.55)';
        ctx.shadowBlur = 25;
        ctx.strokeStyle = '#FCD116';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(uCX, uCY, uR + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#12122a';
        ctx.beginPath();
        ctx.arc(uCX, uCY, uR, 0, Math.PI * 2);
        ctx.fill();

        if (imgUsuario) {
            drawCircleImg(ctx, imgUsuario, uCX, uCY, uR);
        } else if (nombreUsuario) {
            const iniciales = nombreUsuario.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
            ctx.fillStyle = '#FCD116';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(iniciales, uCX, uCY);
            ctx.textBaseline = 'alphabetic';
        }

        if (nombreUsuario) {
            const maxNW = W - 120;
            let nameSize = 50;
            ctx.font = `bold ${nameSize}px Arial`;
            while (ctx.measureText(nombreUsuario).width > maxNW && nameSize > 26) {
                nameSize -= 2;
                ctx.font = `bold ${nameSize}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(nombreUsuario, uCX, 545);
        }

        const sepU2 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sepU2.addColorStop(0, 'rgba(255,255,255,0)');
        sepU2.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        sepU2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sepU2;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 585); ctx.lineTo(W - 60, 585); ctx.stroke();

        // ── BANDERAS ──
        const flagR = 110;
        const lCX = 255, vCX = W - 255, flagCY = 733;

        [lCX, vCX].forEach((cx) => {
            ctx.shadowColor = 'rgba(252,209,22,0.55)';
            ctx.shadowBlur = 28;
            ctx.strokeStyle = '#FCD116';
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR + 7, 0, Math.PI * 2);
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
        else drawEmojiFlag(ctx, bandera(equipoLocal), lCX, flagCY, 112);

        if (imgV) drawCircleImg(ctx, imgV, vCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoVisitante), vCX, flagCY, 112);

        ctx.shadowColor = 'rgba(252,209,22,0.8)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 68px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', W / 2, 741);
        ctx.shadowBlur = 0;

        const drawFit = (text, cx, y, maxW) => {
            let size = 55;
            ctx.font = `bold ${size}px Arial`;
            while (ctx.measureText(text).width > maxW && size > 26) {
                size -= 2;
                ctx.font = `bold ${size}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(text, cx, y);
        };
        drawFit(equipoLocal, lCX, 888, 420);
        drawFit(equipoVisitante, vCX, 888, 420);

        // ── TARJETA MARCADOR ──
        ctx.shadowColor = 'rgba(252,209,22,0.7)';
        ctx.shadowBlur = 60;
        ctx.fillStyle = '#FCD116';
        rr(68, 918, W - 136, 265, 36);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#06060f';
        rr(76, 926, W - 152, 249, 30);
        ctx.fill();

        ctx.shadowColor = 'rgba(252,209,22,0.5)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 185px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${localPred}  -  ${visitantePred}`, W / 2, 1115);
        ctx.shadowBlur = 0;

        // ── BANNER FOMO ──
        // Panel con borde dorado brillante
        ctx.shadowColor = 'rgba(252,209,22,0.5)';
        ctx.shadowBlur = 45;
        ctx.fillStyle = 'rgba(252,209,22,0.07)';
        rr(50, 1207, W - 100, 255, 22);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FCD116';
        ctx.lineWidth = 3;
        rr(50, 1207, W - 100, 255, 22);
        ctx.stroke();

        // "ESTOY PARTICIPANDO POR"
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ESTOY PARTICIPANDO POR', W / 2, 1268);

        // "$5.000.000" — grande, dorado, con glow fuerte
        ctx.shadowColor = 'rgba(252,209,22,0.9)';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 90px Arial';
        ctx.fillText('$5.000.000', W / 2, 1362);
        ctx.shadowBlur = 0;

        // "CON MI MARCADOR"
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('CON MI MARCADOR', W / 2, 1440);

        // ── SEPARADOR ──
        const sep2 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sep2.addColorStop(0, 'rgba(255,255,255,0)');
        sep2.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        sep2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sep2;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 1483); ctx.lineTo(W - 60, 1483); ctx.stroke();

        // ── LLAMADA A LA ACCIÓN ──
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 68px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¿Y TÚ, QUÉ MARCADOR', W / 2, 1560);
        ctx.fillText('CREES QUE VA A QUEDAR?', W / 2, 1638);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '40px Arial';
        ctx.fillText('Compra tu bono y participa en la', W / 2, 1705);
        ctx.fillText('Polla Mundialista La Retoucherie 2026', W / 2, 1753);

        // ── BOTÓN URL ──
        ctx.shadowColor = 'rgba(252,209,22,0.6)';
        ctx.shadowBlur = 38;
        ctx.fillStyle = '#FCD116';
        rr(68, 1795, W - 136, 95, 28);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, 1858);

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
