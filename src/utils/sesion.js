const SESION_KEY = 'polla_sesion';

// Guarda los datos del usuario (nombre, id, etc.) pero NO el token JWT:
// la sesión se mantiene mediante la cookie httpOnly `polla_token` que el
// backend establece en cada login. Así el token no es accesible desde JS.
export function guardarSesion(sesion, recordar = true) {
    const { token: _descartado, ...datos } = sesion || {};
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem(SESION_KEY, JSON.stringify(datos));
}

export function obtenerSesion() {
    try {
        const data = localStorage.getItem(SESION_KEY) || sessionStorage.getItem(SESION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

// Fallback para sesiones antiguas que aún tienen el token en localStorage.
// Las sesiones nuevas no lo tienen — usan la cookie httpOnly.
export function obtenerToken() {
    return obtenerSesion()?.token || null;
}

export function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
    sessionStorage.removeItem(SESION_KEY);
}
