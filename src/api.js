const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok && !data) {
        throw new Error(`Error ${res.status}`);
    }

    return data;
}

export function obtenerPartidos() {
    return request('/api/partidos');
}

export function crearLinkPago({ nombre, correo, celular, partido_id, valor }) {
    return request('/api/transacciones/crear-link', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, celular, partido_id, valor }),
    });
}

export function obtenerInfoPolla(token_acceso) {
    const params = new URLSearchParams({ token_acceso });
    return request(`/api/polla/info?${params.toString()}`);
}

export function verificarAcceso({ contacto, partido_id }) {
    const params = new URLSearchParams({ contacto, partido_id });
    return request(`/api/polla/verificar-acceso?${params.toString()}`);
}

export function votar({ token_acceso, partido_id, marcadores }) {
    return request('/api/polla/votar', {
        method: 'POST',
        body: JSON.stringify({ token_acceso, partido_id, marcadores }),
    });
}

export function adminLogin(token) {
    return request('/api/admin/pendientes', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminPendientes(token) {
    return request('/api/admin/pendientes', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminAprobar(token, transaccion_id) {
    return request('/api/admin/aprobar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transaccion_id }),
    });
}

export function adminCrearPartido(token, { equipo_local, equipo_visitante, fecha_hora_inicio }) {
    return request('/api/admin/partidos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equipo_local, equipo_visitante, fecha_hora_inicio }),
    });
}

export function adminEliminarPartido(token, id) {
    return request(`/api/admin/partidos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminRechazar(token, transaccion_id) {
    return request('/api/admin/rechazar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transaccion_id }),
    });
}

export { API_BASE };
