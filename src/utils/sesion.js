const SESION_KEY = 'polla_sesion';

export function guardarSesion(usuario, recordar = true) {
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem(SESION_KEY, JSON.stringify(usuario));
}

export function obtenerSesion() {
    try {
        const data = localStorage.getItem(SESION_KEY) || sessionStorage.getItem(SESION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function obtenerToken() {
    return obtenerSesion()?.token || null;
}

export function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
    sessionStorage.removeItem(SESION_KEY);
}
