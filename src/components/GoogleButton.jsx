import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptPromise = null;
function cargarScriptGoogle() {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
        document.head.appendChild(script);
    });
    return scriptPromise;
}

// Botón "Continuar con Google" usando Google Identity Services.
// Llama a onCredential(credential) con el ID token cuando el usuario inicia sesión.
export default function GoogleButton({ onCredential }) {
    const contenedorRef = useRef(null);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        let cancelado = false;
        cargarScriptGoogle().then(() => {
            if (cancelado || !contenedorRef.current) return;
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => onCredential(response.credential),
            });
            window.google.accounts.id.renderButton(contenedorRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                width: 340,
                text: 'continue_with',
            });
        }).catch(() => {});

        return () => {
            cancelado = true;
        };
    }, [onCredential]);

    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

    return <div ref={contenedorRef} className="flex justify-center" />;
}
