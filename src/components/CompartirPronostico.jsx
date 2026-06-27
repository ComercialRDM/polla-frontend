import { useState } from 'react';
import { registrarCompartida } from '../api';
import { bandera, codigoPais } from '../utils/banderas';
import logoRetoucherie from '../assets/LOGO_RDM.jpeg';

export default function CompartirPronostico({ equipoLocal, equipoVisitante, localPred, visitantePred, tokenAcceso, partidoId }) {
    const [copiado, setCopiado] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [ptoGanado, setPtoGanado] = useState(0);
    const [mensaje, setMensaje] = useState('');

    // Carga una imagen con soporte CORS (para flagcdn.com)
    function loadImg(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Dibuja una bandera como imagen circular recortada
    function drawCircleFlag(ctx, img, cx, cy, r) {
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

    // Dibuja emoji de bandera centrado verticalmente
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

        // Carga de banderas en paralelo
        const codeL = codigoPais(equipoLocal);
        const codeV = codigoPais(equipoVisitante);
        const [imgL, imgV, imgLogo] = await Promise.all([
            codeL ? loadImg(`https://flagcdn.com/w320/${codeL}.png`) : Promise.resolve(null),
            codeV ? loadImg(`https://flagcdn.com/w320/${codeV}.png`) : Promise.resolve(null),
            loadImg(logoRetoucherie),
        ]);

        // ── FONDO ──
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, W, H);

        // Glow naranja-ámbar en la parte superior (estadio al atardecer)
        const topGlow = ctx.createRadialGradient(W / 2, -80, 0, W / 2, -80, 850);
        topGlow.addColorStop(0, 'rgba(215, 90, 5, 0.75)');
        topGlow.addColorStop(0.45, 'rgba(170, 60, 5, 0.38)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, W, H);

        // Focos laterales (luces de estadio)
        [[0, 260, 0.18], [W, 260, 0.18]].forEach(([x, y, a]) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 500);
            g.addColorStop(0, `rgba(255,180,30,${a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        });

        // Glow dorado detrás del marcador
        const sg = ctx.createRadialGradient(W / 2, 890, 0, W / 2, 890, 550);
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

        // Logo oficial Retoucherie
        if (imgLogo) {
            const logoH = 150;
            const logoW = logoH * ((imgLogo.naturalWidth || imgLogo.width) / (imgLogo.naturalHeight || imgLogo.height));
            ctx.drawImage(imgLogo, (W - logoW) / 2, 20, logoW, logoH);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('POLLA MUNDIALISTA  ·  MUNDIAL 2026', W / 2, 200);

        // Línea separadora
        const sepGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
        sepGrad.addColorStop(0, 'rgba(252,209,22,0)');
        sepGrad.addColorStop(0.5, 'rgba(252,209,22,0.6)');
        sepGrad.addColorStop(1, 'rgba(252,209,22,0)');
        ctx.strokeStyle = sepGrad;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(60, 235); ctx.lineTo(W - 60, 235); ctx.stroke();

        // Título principal
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px Arial';
        ctx.fillText('MI PRONÓSTICO', W / 2, 380);

        // ── BANDERAS ──
        const flagR = 118;
        const lCX = 255, vCX = W - 255, flagCY = 560;

        // Anillo dorado detrás de cada bandera
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

        // Fondo circular oscuro (fallback si no carga imagen)
        [lCX, vCX].forEach((cx) => {
            ctx.fillStyle = '#12122a';
            ctx.beginPath();
            ctx.arc(cx, flagCY, flagR, 0, Math.PI * 2);
            ctx.fill();
        });

        // Bandera local
        if (imgL) {
            drawCircleFlag(ctx, imgL, lCX, flagCY, flagR);
        } else {
            drawEmojiFlag(ctx, bandera(equipoLocal), lCX, flagCY, 120);
        }

        // Bandera visitante
        if (imgV) {
            drawCircleFlag(ctx, imgV, vCX, flagCY, flagR);
        } else {
            drawEmojiFlag(ctx, bandera(equipoVisitante), vCX, flagCY, 120);
        }

        // "VS" en el centro
        ctx.shadowColor = 'rgba(252,209,22,0.7)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', W / 2, 568);
        ctx.shadowBlur = 0;

        // Nombres de equipos (se achican si son largos)
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
        drawFit(equipoLocal, lCX, 720, 430);
        drawFit(equipoVisitante, vCX, 720, 430);

        // ── TARJETA MARCADOR ──
        // Sombra dorada exterior
        ctx.shadowColor = 'rgba(252,209,22,0.65)';
        ctx.shadowBlur = 55;
        ctx.fillStyle = '#FCD116';
        rr(68, 772, W - 136, 308, 36);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Fondo interior oscuro
        ctx.fillStyle = '#07070f';
        rr(76, 780, W - 152, 292, 30);
        ctx.fill();

        // Marcador
        ctx.shadowColor = 'rgba(252,209,22,0.45)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#FCD116';
        ctx.font = 'bold 215px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${localPred}  -  ${visitantePred}`, W / 2, 1000);
        ctx.shadowBlur = 0;

        // ── SEPARADOR ──
        const sep2 = ctx.createLinearGradient(60, 0, W - 60, 0);
        sep2.addColorStop(0, 'rgba(255,255,255,0)');
        sep2.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        sep2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sep2;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, 1138); ctx.lineTo(W - 60, 1138); ctx.stroke();

        // ── LLAMADA A LA ACCIÓN ──
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 76px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¿Y TÚ, QUÉ MARCADOR', W / 2, 1275);
        ctx.fillText('CREES QUE VA A QUEDAR?', W / 2, 1362);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '46px Arial';
        ctx.fillText('Compra tu bono y participa en la', W / 2, 1460);
        ctx.fillText('Polla Mundialista La Retoucherie 2026', W / 2, 1520);

        // Emojis
        ctx.font = '84px sans-serif';
        ctx.fillText('🇨🇴  ⚽  🏆', W / 2, 1648);

        // Botón URL con glow
        ctx.shadowColor = 'rgba(252,209,22,0.55)';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#FCD116';
        rr(68, 1718, W - 136, 128, 28);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 54px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('www.ganaconretoucherie.com', W / 2, 1797);

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

            // Path 1: Web Share API con archivo — abre el share sheet nativo del sistema
            // En iOS/Android muestra "Instagram" → va directo a crear Story con la imagen
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mi pronóstico — Polla Mundialista La Retoucherie',
                });
                compartido = true;
            } else {
                // Path 2: descarga directa (desktop o browsers sin Web Share)
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pronostico-retoucherie.png';
                a.click();
                URL.revokeObjectURL(url);
                setMensaje('📲 Imagen descargada — súbela desde tu galería a Instagram Stories');
                compartido = true;
            }

            // Registrar compartida y otorgar puntos (máx 1/partido)
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
            {/* Tarjeta visual previa */}
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
                        {generando ? 'Preparando imagen...' : '📲 Compartir en Instagram Stories'}
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

            {/* Mensaje dinámico */}
            {mensaje ? (
                <p className="text-[#FCD116] text-[11px] text-center px-3 pb-3 leading-snug">{mensaje}</p>
            ) : (
                <p className="text-zinc-600 text-[10px] text-center pb-2.5">
                    Genera imagen 9:16 con tu pronóstico lista para Instagram Stories
                </p>
            )}
        </div>
    );
}
