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

        // ── FONDO ──
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, W, H);

        const topGlow = ctx.createRadialGradient(W / 2, -80, 0, W / 2, -80, 850);
        topGlow.addColorStop(0, 'rgba(215, 90, 5, 0.75)');
        topGlow.addColorStop(0.45, 'rgba(170, 60, 5, 0.38)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, W, H);

        [[0, 260, 0.18], [W, 260, 0.18]].forEach(([x, y, a]) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 500);
            g.addColorStop(0, `rgba(255,180,30,${a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        });

        const sg = ctx.createRadialGradient(W / 2, 860, 0, W / 2, 860, 550);
        sg.addColorStop(0, 'rgba(252,209,22,0.13)');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);

        // Franjas doradas top/bottom
        ctx.fillStyle = '#FCD116';
        ctx.fillRect(0, 0, W, 16);
        ctx.fillRect(0, H - 16, W, 16);

        // ── CABECERA ──
        ctx.textAlign = 'center';

        if (imgLogo) {
            const logoH = 130;
            const logoW = logoH * ((imgLogo.naturalWidth || imgLogo.width) / (imgLogo.naturalHeight || imgLogo.height));
            ctx.drawImage(imgLogo, (W - logoW) / 2, 22, logoW, logoH);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('POLLA MUNDIALISTA  ·  MUNDIAL 2026', W / 2, 200);

        const sepGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
        sepGrad.addColorStop(0, 'rgba(252,209,22,0)');
        sepGrad.addColorStop(0.5, 'rgba(252,209,22,0.6)');
        sepGrad.addColorStop(1, 'rgba(252,209,22,0)');
        ctx.strokeStyle = sepGrad;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(60, 235); ctx.lineTo(W - 60, 235); ctx.stroke();

        // "MI PRONÓSTICO" — desplazado 65px arriba vs versión anterior
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px Arial';
        ctx.fillText('MI PRONÓSTICO', W / 2, 315);

        // ── BANDERAS (flagCY=495, antes 560) ──
        const flagR = 118;
        const lCX = 255, vCX = W - 255, flagCY = 495;

        [lCX, vCX].forEach((cx) => {
            ctx.shadowColor = 'rgba(252,209,22,0.5)';
            ctx.shadowBlur = 25;
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
        else drawEmojiFlag(ctx, bandera(equipoLocal), lCX, flagCY, 120);

        if (imgV) drawCircleImg(ctx, imgV, vCX, flagCY, flagR);
        else drawEmojiFlag(ctx, bandera(equipoVisitante), vCX, flagCY, 120);

        ctx.shadowColor = 'rgba(252,209,22,0.7)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', W / 2, 503);
        ctx.shadowBlur = 0;

        // Nombres de equipos (y=655, antes 720)
        const drawFit = (text, cx, y, maxW) => {
            let size = 58;
            ctx.font = `bold ${size}px Arial`;
            while (ctx.measureText(text).width > maxW && size > 28) {
                size -= 2;
                ctx.font = `bold ${size}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(text, cx, y);
        };
        drawFit(equipoLocal, lCX, 655, 430);
        drawFit(equipoVisitante, vCX, 655, 430);

        // ── TARJETA MARCADOR (y=707, antes 772) ──
        ctx.shadowColor = 'rgba(252,209,22,0.65)';
        ctx.shadowBlur = 55;
        ctx.fillStyle = '#FCD116';
        rr(68, 707, W - 136, 308, 36);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#07070f';
        rr(76, 715, W - 152, 292, 30);
        ctx.fill();

        ctx.shadowColor = 'rgba(252,209,22,0.45)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 215px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${localPred}  -  ${visitantePred}`, W / 2, 935);
        ctx.shadowBlur = 0;

        // ── SEPARADOR (y=1073, antes 1138) ──
        const sep2 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sep2.addColorStop(0, 'rgba(255,255,255,0)');
        sep2.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        sep2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sep2;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 1073); ctx.lineTo(W - 60, 1073); ctx.stroke();

        // ── LLAMADA A LA ACCIÓN (desplazada -65) ──
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 76px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¿Y TÚ, QUÉ MARCADOR', W / 2, 1210);
        ctx.fillText('CREES QUE VA A QUEDAR?', W / 2, 1297);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '46px Arial';
        ctx.fillText('Compra tu bono y participa en la', W / 2, 1395);
        ctx.fillText('Polla Mundialista La Retoucherie 2026', W / 2, 1455);

        // ── SECCIÓN USUARIO ──
        // Separador sutil antes del avatar
        const sep3 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sep3.addColorStop(0, 'rgba(255,255,255,0)');
        sep3.addColorStop(0.5, 'rgba(255,255,255,0.07)');
        sep3.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sep3;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 1495); ctx.lineTo(W - 60, 1495); ctx.stroke();

        const uCX = W / 2, uCY = 1572, uR = 65;

        // Anillo dorado exterior
        ctx.shadowColor = 'rgba(252,209,22,0.45)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#FCD116';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(uCX, uCY, uR + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Círculo de fondo oscuro
        ctx.fillStyle = '#12122a';
        ctx.beginPath();
        ctx.arc(uCX, uCY, uR, 0, Math.PI * 2);
        ctx.fill();

        if (imgUsuario) {
            drawCircleImg(ctx, imgUsuario, uCX, uCY, uR);
        } else if (nombreUsuario) {
            // Iniciales cuando no hay foto
            const iniciales = nombreUsuario.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
            ctx.fillStyle = '#FCD116';
            ctx.font = 'bold 52px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(iniciales, uCX, uCY);
            ctx.textBaseline = 'alphabetic';
        }

        // Nombre del usuario
        if (nombreUsuario) {
            const maxNW = W - 120;
            let nameSize = 54;
            ctx.font = `bold ${nameSize}px Arial`;
            while (ctx.measureText(nombreUsuario).width > maxNW && nameSize > 28) {
                nameSize -= 2;
                ctx.font = `bold ${nameSize}px Arial`;
            }
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(nombreUsuario, uCX, 1705);
        }

        // ── BOTÓN URL (y=1748) ──
        ctx.shadowColor = 'rgba(252,209,22,0.55)';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#FCD116';
        rr(68, 1748, W - 136, 112, 28);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 54px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, 1820);

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
