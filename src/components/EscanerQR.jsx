import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENTO_ID = 'escaner-qr-bono';

// iOS Safari ignora .click() en inputs con display:none.
// En iOS usamos <label htmlFor> + input posicionado fuera de pantalla
// (no display:none) para abrir la cámara nativa con capture="environment".
const ES_IOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

const ESTILO_FUERA = {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
    top: -9999,
    left: -9999,
};

export default function EscanerQR({ onResultado, onError }) {
    const [modo, setModo] = useState('camara');
    const [procesando, setProcesando] = useState(false);
    const escanerRef = useRef(null);
    const inputFileRef = useRef(null);

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
        setProcesando(true);
        try {
            const scanner = new Html5Qrcode(ELEMENTO_ID);
            const decodedText = await scanner.scanFile(archivo, false);
            onResultado(decodedText);
        } catch {
            onError?.('No se pudo leer el código QR. Intenta con mejor luz o más cerca.');
        } finally {
            e.target.value = '';
            setProcesando(false);
        }
    }

    // ── iOS: cámara nativa con capture="environment" ──────────────────────────
    // <label htmlFor> es la única forma confiable de activar un file input en
    // iOS Safari — .click() sobre display:none es ignorado por el navegador.
    if (ES_IOS) {
        return (
            <div className="flex flex-col gap-4">
                {/* Elemento fuera de pantalla requerido por Html5Qrcode.scanFile() */}
                <div id={ELEMENTO_ID} style={{ ...ESTILO_FUERA, width: 300, height: 300 }} />

                {/* Input de cámara nativa — posicionado fuera, NO display:none */}
                <input
                    id="escaner-capture-ios"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleArchivo}
                    style={ESTILO_FUERA}
                />

                <label
                    htmlFor="escaner-capture-ios"
                    className="w-full py-4 rounded-xl font-black text-zinc-950 text-base bg-[#FCD116] shadow-[0_0_20px_rgba(252,209,22,0.3)] active:scale-95 transition-all text-center cursor-pointer block"
                >
                    {procesando ? '⏳ Leyendo QR...' : '📷 Abrir cámara y escanear QR'}
                </label>

                <p className="text-zinc-500 text-xs text-center leading-relaxed">
                    Se abrirá la cámara. Apunta al QR del cliente y toma la foto.
                </p>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-zinc-600 text-xs">¿QR por WhatsApp?</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Input de galería / foto recibida */}
                <input
                    id="escaner-file-ios"
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArchivo}
                    style={ESTILO_FUERA}
                />
                <label
                    htmlFor="escaner-file-ios"
                    className="w-full py-3 rounded-xl font-bold text-zinc-300 text-sm bg-zinc-800 border border-white/10 active:scale-95 transition-all text-center cursor-pointer block"
                >
                    🖼️ Seleccionar foto del QR
                </label>
            </div>
        );
    }

    // ── Android / desktop: cámara en vivo con Html5Qrcode ────────────────────
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
