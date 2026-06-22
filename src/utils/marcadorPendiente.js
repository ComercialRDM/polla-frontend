const MARCADOR_KEY = 'polla_marcador_pendiente';

export function guardarMarcadorPendiente({ partido_id, local, visitante }) {
    try {
        localStorage.setItem(MARCADOR_KEY, JSON.stringify({ partido_id, local, visitante }));
    } catch {
        // localStorage no disponible, ignorar
    }
}

export function obtenerMarcadorPendiente() {
    try {
        const data = localStorage.getItem(MARCADOR_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function limpiarMarcadorPendiente() {
    try {
        localStorage.removeItem(MARCADOR_KEY);
    } catch {
        // localStorage no disponible, ignorar
    }
}
