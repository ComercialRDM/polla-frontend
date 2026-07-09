import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENTO_ID = 'escaner-qr-bono';

// iOS Safari rechaza getUserMedia cuando no viene de un gesto explícito del
// usuario (el useEffect se ejecuta automáticamente → iOS lo bloquea).
// Solución: en iOS usar capture="environment" que abre la cámara nativa y
// luego decodificar la foto con scanFile(). En Android/desktop la cámara
// en vivo de Html5Qrcode funciona sin problemas.
const ES_IOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

export default function EscanerQR({ onResultado, onError }) {
    const [modo, setModo] = useState('camara');
    const escanerRef = useRef(null);
    const inputFileRef = useRef(null);
    const inputCaptureRef = useRef(null);

    useEffect(() => {
        if (modo !== 'camara' || ES_IOS) return;

        let html5Qrcode;
        let detenido = false;

        try {
            html5Qrcode = new Html5Qrcode(ELEMENTO_ID);
            escanerRef.current = html5Qrcode;

            html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 220 },
                (decodedText) => {
                    if (detenido) return;
                    detenido = true;
                    html5Qrcode.stop().catch(() => {});
                    onResultado(decodedText);
                },
                () => {}
            ).catch((err) => {
                onError?.(err?.message || 'No se pudo acceder a la cámara. Usa "Subir foto".');
            });
        } catch (err) {
            onError?.(err?.message || 'No se pudo iniciar el escáner. Usa "Subir foto".');
        }

        return () => {
            detenido = true;
            if (html5Qrcode) html5Qrcode.stop().catch(() => {});
        };
    }, [modo, onResultado, onError]);

    async function handleArchivo(e) {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        try {
            const html5Qrcode = new Html5Qrcode(ELEMENTO_ID);
            const decodedText = await html5Qrcode.scanFile(archivo, false);
            onResultado(decodedText);
        } catch {
            onError?.('No se pudo leer el código QR. Intenta con mejor luz o más cerca.');
        } finally {
            e.target.value = '';
        }
    }

    // iOS: cámara nativa vía capture="environment" (getUserMedia no funciona
    // sin gesto explícito en iOS Safari)
    if (ES_IOS) {
        return (
            <div className="flex flex-col gap-4">
                {/* Elemento oculto requerido por Html5Qrcode.scanFile() */}
                <div id={ELEMENTO_ID} style={{ width: 1, height: 1, overflow: 'hidden', position: 'absolute', opacity: 0 }} />

                {/* Input para cámara nativa */}
                <input
                    ref={inputCaptureRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleArchivo}
                    className="hidden"
                />
                {/* Input para seleccionar foto existente (QR enviado por WhatsApp) */}
                <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArchivo}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => inputCaptureRef.current?.click()}
                    className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_20px_rgba(252,209,22,0.3)] active:scale-95 transition-all"
                >
                    📷 Abrir cámara y escanear QR
                </button>
                <p className="text-zinc-500 text-xs text-center leading-relaxed">
                    Se abrirá la cámara. Apunta al código QR del cliente y toma la foto.
                </p>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-zinc-600 text-xs">¿QR por WhatsApp?</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                    type="button"
                    onClick={() => inputFileRef.current?.click()}
                    className="w-full py-3 rounded-xl font-bold text-zinc-300 text-sm bg-zinc-800 border border-white/10 active:scale-95 transition-all"
                >
                    🖼️ Seleccionar foto del QR
                </button>
            </div>
        );
    }

    // Android / desktop: cámara en vivo con Html5Qrcode
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2 self-center">
                <button
                    type="button"
                    onClick={() => setModo('camara')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${modo === 'camara' ? 'bg-[#FCD116] text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
                >
                    📷 Cámara
                </button>
                <button
                    type="button"
                    onClick={() => { setModo('foto'); inputFileRef.current?.click(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${modo === 'foto' ? 'bg-[#FCD116] text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
                >
                    🖼️ Subir foto
                </button>
            </div>

            {modo === 'camara' && (
                <div id={ELEMENTO_ID} className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />
            )}

            {modo === 'foto' && (
                <div className="flex flex-col items-center gap-2">
                    <div id={ELEMENTO_ID} className="hidden" />
                    <p className="text-zinc-400 text-xs text-center">
                        Selecciona la foto del QR que te mandaron por WhatsApp.
                    </p>
                    <input
                        ref={inputFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleArchivo}
                        className="text-xs text-zinc-300"
                    />
                </div>
            )}
        </div>
    );
}
