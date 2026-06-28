import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ELEMENTO_ID = 'escaner-qr-bono';

// Escanea con la cámara en vivo (modo por defecto) o, si el cliente mandó el
// QR por WhatsApp como foto, leyendo esa imagen directamente con
// Html5Qrcode.scanFile() — sin esto, había que apuntar la cámara a la
// pantalla del celular con la foto abierta, que es más lento y falla con
// fotos borrosas o mal iluminadas.
export default function EscanerQR({ onResultado, onError }) {
    const [modo, setModo] = useState('camara');
    const escanerRef = useRef(null);
    const inputFileRef = useRef(null);

    useEffect(() => {
        if (modo !== 'camara') return;

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
            if (!detenido) html5Qrcode.stop().catch(() => {});
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
            onError?.('No se pudo leer el código QR de esa imagen. Intenta con otra foto más nítida.');
        } finally {
            e.target.value = '';
        }
    }

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
