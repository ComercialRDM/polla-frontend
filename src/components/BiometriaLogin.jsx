import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { guardarSesion } from '../utils/sesion';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function BiometriaLogin({ onExito }) {
    const [estado, setEstado] = useState('idle');
    const [error, setError] = useState('');

    async function handleLogin() {
        setEstado('cargando');
        setError('');
        try {
            const optsRes = await fetch(`${API}/api/passkey/login-opciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const opts = await optsRes.json();
            if (opts.error) throw new Error(opts.error);

            const authResp = await startAuthentication({ optionsJSON: opts });

            const verRes = await fetch(`${API}/api/passkey/login-verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: authResp, _key: opts._key }),
            });
            const ver = await verRes.json();
            if (!ver.success) throw new Error(ver.error);

            guardarSesion({ ...ver.usuario, token: ver.token });
            onExito?.();
        } catch (err) {
            setEstado('idle');
            setError(
                err.name === 'NotAllowedError'
                    ? 'Cancelaste la autenticación.'
                    : err.name === 'NotSupportedError'
                    ? 'Este navegador no soporta biometría. Usa tu contraseña.'
                    : err.message?.includes('no reconocida')
                    ? 'No hay biometría registrada en este dispositivo. Usa tu contraseña e iníciala desde la app.'
                    : err.message || 'No se pudo autenticar.'
            );
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleLogin}
                disabled={estado === 'cargando'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-zinc-900 dark:text-white border-2 border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 active:scale-95 transition-transform disabled:opacity-60"
            >
                {estado === 'cargando' ? '⏳ Verificando...' : <><span className="text-xl">👆</span> Entrar con huella o Face ID</>}
            </button>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
    );
}
