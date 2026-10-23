import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { cuentaRecuperar, cuentaRestablecer } from '../api';

// Recuperación de acceso al panel (todos los roles):
//   /acceso/recuperar    → pide el usuario y envía el enlace al correo de la empresa
//   /acceso/restablecer  → con el enlace (?t=…) se crea la contraseña nueva
const campo = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-amber-400';

function Recuperar() {
    const [usuario, setUsuario] = useState('');
    const [estado, setEstado] = useState(null);
    const [cargando, setCargando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setCargando(true);
        try {
            const r = await cuentaRecuperar(usuario.trim());
            setEstado(r?.success ? { ok: true, texto: r.mensaje } : { ok: false, texto: r?.error || 'No se pudo enviar' });
        } catch (err) {
            setEstado({ ok: false, texto: err.message });
        } finally {
            setCargando(false);
        }
    }

    return (
        <form onSubmit={enviar} className="w-full max-w-sm flex flex-col gap-4">
            <h1 className="font-display text-white text-4xl text-center">Recuperar acceso</h1>
            <p className="text-zinc-400 text-sm text-center">Escribe tu usuario. El enlace para crear una contraseña nueva se envía al correo de la empresa; pídeselo al administrador.</p>
            <input className={campo} placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
            {estado && <p className={`text-sm text-center ${estado.ok ? 'text-emerald-300' : 'text-red-400'}`}>{estado.texto}</p>}
            <button disabled={cargando || estado?.ok} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-full">
                {cargando ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </button>
            <a href="/revisionboletas" className="text-xs text-zinc-400 underline text-center">← Volver a iniciar sesión</a>
        </form>
    );
}

function Restablecer() {
    const [params] = useSearchParams();
    const token = params.get('t') || '';
    const [nueva, setNueva] = useState('');
    const [repetir, setRepetir] = useState('');
    const [estado, setEstado] = useState(null);
    const [cargando, setCargando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        if (nueva !== repetir) { setEstado({ ok: false, texto: 'Las contraseñas no coinciden.' }); return; }
        setCargando(true);
        try {
            const r = await cuentaRestablecer(token, nueva);
            setEstado(r?.success
                ? { ok: true, texto: `Listo: la contraseña del usuario "${r.usuario}" quedó cambiada. Ya puedes iniciar sesión.` }
                : { ok: false, texto: r?.error || 'No se pudo cambiar' });
        } catch (err) {
            setEstado({ ok: false, texto: err.message });
        } finally {
            setCargando(false);
        }
    }

    if (!token) return <p className="text-red-300">Este enlace no es válido. Solicita uno nuevo en <a className="underline" href="/acceso/recuperar">Recuperar acceso</a>.</p>;
    return (
        <form onSubmit={enviar} className="w-full max-w-sm flex flex-col gap-4">
            <h1 className="font-display text-white text-4xl text-center">Contraseña nueva</h1>
            <p className="text-zinc-400 text-sm text-center">Mínimo 12 caracteres, con letras y números. La verificación en dos pasos no cambia.</p>
            <input className={campo} type="password" placeholder="Contraseña nueva" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" required />
            <input className={campo} type="password" placeholder="Repite la contraseña" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" required />
            {estado && <p className={`text-sm text-center ${estado.ok ? 'text-emerald-300' : 'text-red-400'}`}>{estado.texto}</p>}
            {estado?.ok ? (
                <a href="/revisionboletas" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold py-3 rounded-full text-center">Iniciar sesión</a>
            ) : (
                <button disabled={cargando} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-full">
                    {cargando ? 'Guardando…' : 'Guardar contraseña'}
                </button>
            )}
        </form>
    );
}

export default function Acceso() {
    const { pathname } = useLocation();
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
            {pathname.startsWith('/acceso/restablecer') ? <Restablecer /> : <Recuperar />}
        </main>
    );
}
