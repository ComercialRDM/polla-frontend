import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENTO_ID = 'escaner-qr-bono';

// Escáner de QR con la cámara del dispositivo. Llama a onResultado(texto) con
// el contenido decodificado (el token_acceso del bono) y se detiene automáticamente.
export default function EscanerQR({ onResultado, onError }) {
    const escanerRef = useRef(null);

    useEffect(() => {
        const html5Qrcode = new Html5Qrcode(ELEMENTO_ID);
        escanerRef.current = html5Qrcode;
        let detenido = false;

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
            onError?.(err?.message || 'No se pudo acceder a la cámara.');
        });

        return () => {
            if (!detenido) {
                html5Qrcode.stop().catch(() => {});
            }
        };
    }, [onResultado, onError]);

    return <div id={ELEMENTO_ID} className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />;
}
