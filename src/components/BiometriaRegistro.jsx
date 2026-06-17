import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function BiometriaRegistro({ usuarioId }) {
    const [estado, setEstado] = useState('idle'); // idle | cargando | ok | error
    const [msg, setMsg] = useState('');

    async function handleRegistrar() {
        setEstado('cargando');
        setMsg('');
        try {
            const optsRes = await fetch(`${API}/api/passkey/registro-opciones?usuario_id=${usuarioId}`);
            const opts = await optsRes.json();
            if (opts.error) throw new Error(opts.error);

            const attResp = await startRegistration({ optionsJSON: opts });

            const verRes = await fetch(`${API}/api/passkey/registro-verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuarioId, response: attResp }),
            });
            const ver = await verRes.json();
            if (!ver.success) throw new Error(ver.error);

            setEstado('ok');
            setMsg('¡Biometría activada! La próxima vez puedes entrar sin contraseña.');
        } catch (err) {
            setEstado('error');
            setMsg(
                err.name === 'NotAllowedError'
                    ? 'Cancelaste el registro. Intenta de nuevo.'
                    : err.name === 'InvalidStateError'
                    ? 'Este dispositivo ya tiene la biometría registrada.'
                    : err.message || 'No se pudo activar la biometría.'
            );
        }
    }

    if (estado === 'ok') {
        return (
            <div className="rounded-xl bg-green-600/15 border border-green-500/30 px-4 py-3 text-center">
                <p className="text-green-400 font-bold text-sm">✅ {msg}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleRegistrar}
                disabled={estado === 'cargando'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-zinc-950 bg-[#FCD116] active:scale-95 transition-transform disabled:opacity-60"
            >
                {estado === 'cargando' ? (
                    '⏳ Activando...'
                ) : (
                    <>
                        <span className="text-lg">👆</span> Activar huella / Face ID en este dispositivo
                    </>
                )}
            </button>
            {estado === 'error' && (
                <p className="text-red-400 text-xs text-center">{msg}</p>
            )}
            <p className="text-zinc-500 text-xs text-center">
                Solo funciona en este dispositivo. Puedes activarlo en cada dispositivo que uses.
            </p>
        </div>
    );
}
