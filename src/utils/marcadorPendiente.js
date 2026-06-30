const MARCADORES_KEY = 'polla_marcadores_pendientes';

function leerLista() {
    try {
        const data = localStorage.getItem(MARCADORES_KEY);
        const lista = data ? JSON.parse(data) : [];
        return Array.isArray(lista) ? lista : [];
    } catch {
        return [];
    }
}

function guardarLista(lista) {
    try {
        localStorage.setItem(MARCADORES_KEY, JSON.stringify(lista));
    } catch {
        // localStorage no disponible, ignorar
    }
}

// Upsert por partido_id: si ya había una predicción pendiente para ese
// partido (p. ej. el usuario cambió el marcador antes de comprar), se
// reemplaza en vez de duplicarla.
export function agregarMarcadorPendiente({ partido_id, local, visitante }) {
    const lista = leerLista().filter((m) => m.partido_id !== partido_id);
    lista.push({ partido_id, local, visitante });
    guardarLista(lista);
}

export function quitarMarcadorPendiente(partido_id) {
    guardarLista(leerLista().filter((m) => m.partido_id !== partido_id));
}

export function obtenerMarcadoresPendientes() {
    return leerLista();
}

export function limpiarMarcadoresPendientes() {
    try {
        localStorage.removeItem(MARCADORES_KEY);
    } catch {
        // localStorage no disponible, ignorar
    }
}
