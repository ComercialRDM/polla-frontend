const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function request(path, options = {}) {
    const { headers, ...rest } = options;
    const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
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

export function obtenerResumenUsuario(usuario_id) {
    return request(`/api/polla/resumen-usuario?usuario_id=${usuario_id}`);
}

export function obtenerMisPronosticos(usuario_id) {
    return request(`/api/polla/mis-pronosticos?usuario_id=${usuario_id}`);
}

export function obtenerPartidosFlash() {
    return request('/api/polla/flash');
}

export function votarFlash({ usuario_id, partido_id, local, visitante }) {
    return request('/api/polla/votar-flash', {
        method: 'POST',
        body: JSON.stringify({ usuario_id, partido_id, local, visitante }),
    });
}

export function crearLinkPago({ nombre, correo, celular, partido_id, valor, ref }) {
    return request('/api/transacciones/crear-link', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, celular, partido_id, valor, ref }),
    });
}

export async function crearTransferencia({ nombre, correo, celular, partido_id, valor, comprobante, ref }) {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('celular', celular);
    formData.append('partido_id', partido_id);
    formData.append('valor', valor);
    formData.append('comprobante', comprobante);
    if (ref) formData.append('ref', ref);

    const res = await fetch(`${API_BASE}/api/transacciones/crear-transferencia`, {
        method: 'POST',
        body: formData,
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

export function obtenerInfoPolla(token_acceso) {
    const params = new URLSearchParams({ token_acceso });
    return request(`/api/polla/info?${params.toString()}`);
}

export function verificarAcceso({ contacto }) {
    const params = new URLSearchParams({ contacto });
    return request(`/api/polla/verificar-acceso?${params.toString()}`);
}

export function obtenerRanking(partidoId) {
    return request(`/api/partidos/${partidoId}/ranking`);
}

export function obtenerResumenPublico(partidoId) {
    return request(`/api/partidos/${partidoId}/resumen-publico`);
}

export function obtenerPronosticosPublicos(partidoId) {
    return request(`/api/partidos/${partidoId}/pronosticos-publicos`);
}

// Suscribe a eventos en tiempo real (SSE) del partido. `onActualizado` se llama
// cada vez que el backend avisa que cambió el ranking/marcador.
export function suscribirseEventosPartido(partidoId, onActualizado) {
    const eventSource = new EventSource(`${API_BASE}/api/partidos/${partidoId}/eventos`);
    eventSource.addEventListener('actualizado', onActualizado);
    return eventSource;
}

export function actualizarEquiposFavoritos({ token_acceso, equipos_favoritos }) {
    return request('/api/polla/equipos-favoritos', {
        method: 'PUT',
        body: JSON.stringify({ token_acceso, equipos_favoritos }),
    });
}

export function votar({ token_acceso, partido_id, local, visitante }) {
    return request('/api/polla/votar', {
        method: 'POST',
        body: JSON.stringify({ token_acceso, partido_id, local, visitante }),
    });
}

export function registrarCuenta({ celular, password, nombre, correo, equipos_favoritos }) {
    return request('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ celular, password, nombre, correo, equipos_favoritos }),
    });
}

export function iniciarSesion({ celular, password }) {
    return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ celular, password }),
    });
}

export function solicitarResetPassword({ celular, metodo = 'whatsapp' }) {
    return request('/api/auth/solicitar-reset', {
        method: 'POST',
        body: JSON.stringify({ celular, metodo }),
    });
}

export function restablecerPassword({ celular, codigo, nueva_password }) {
    return request('/api/auth/restablecer-password', {
        method: 'POST',
        body: JSON.stringify({ celular, codigo, nueva_password }),
    });
}

export function loginConGoogle(credential) {
    return request('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    });
}

export function completarRegistroGoogle({ credential, celular, equipos_favoritos }) {
    return request('/api/auth/google/completar', {
        method: 'POST',
        body: JSON.stringify({ credential, celular, equipos_favoritos }),
    });
}

export function adminLogin(usuario, password) {
    return request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password }),
    });
}

export function adminPendientes(token) {
    return request('/api/admin/pendientes', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminSimuladorMetricas(token) {
    return request('/api/admin/simulador/metricas', {
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

export function adminCrearPartido(token, { equipo_local, equipo_visitante, fecha_hora_inicio, fase = 'grupos' }) {
    return request('/api/admin/partidos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ equipo_local, equipo_visitante, fecha_hora_inicio, fase }),
    });
}

export function adminActualizarPartido(token, id, cambios) {
    return request(`/api/admin/partidos/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(cambios),
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

export function adminNotificarRecompra(token, { partido_id_origen, partido_id_destino }) {
    return request('/api/admin/notificar-recompra', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ partido_id_origen, partido_id_destino }),
    });
}

export function localLogin(usuario, password) {
    return request('/api/local/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password }),
    });
}

export function localBuscarBono(token, tokenAcceso) {
    return request(`/api/local/bono/${tokenAcceso}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function localConsumirBono(token, tokenAcceso) {
    return request('/api/local/bono/consumir', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token_acceso: tokenAcceso }),
    });
}

export function localEstadisticas(token) {
    return request('/api/local/estadisticas', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminApuestas(token, { partido_id, page = 1, limit = 100, search = '' }) {
    const params = new URLSearchParams({ partido_id, page, limit, search });
    return request(`/api/admin/apuestas?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminApuestasExport(token, partidoId) {
    return request(`/api/admin/apuestas/export?partido_id=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function localRedimirBono(token, tokenAcceso, monto) {
    return request('/api/local/bono/redimir', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token_acceso: tokenAcceso, monto }),
    });
}

export async function adminAbrirComprobante(token, transaccion_id) {
    const res = await fetch(`${API_BASE}/api/admin/comprobante/${transaccion_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error('No se pudo cargar el comprobante');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

export function urlCalendarioIcs(calendarioToken) {
    return `${API_BASE}/api/polla/calendario/${calendarioToken}.ics`;
}

export function obtenerPozo() {
    return request('/api/polla/pozo');
}

export function obtenerResultadosFinales() {
    return request('/api/polla/resultados-finales');
}

export function adminTestWhatsapp(token, celular) {
    return request('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ celular }),
    });
}

export function adminBonosColombia(token) {
    return request('/api/admin/bonos-colombia', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminMarcarReclamado(token, id) {
    return request(`/api/admin/bonos-colombia/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function localResetPassword(correo) {
    return request('/api/local/reset-password', {
        method: 'POST',
        body: JSON.stringify({ correo }),
    });
}

export function adminLocalUsuarios(token) {
    return request('/api/admin/local-usuarios', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminCrearLocalUsuario(token, { usuario, password, nombre_local, correo }) {
    return request('/api/admin/local-usuarios', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ usuario, password, nombre_local, correo }),
    });
}

export function adminResetLocalPassword(token, id) {
    return request(`/api/admin/local-usuarios/${id}/reset-password`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminToggleLocalUsuario(token, id) {
    return request(`/api/admin/local-usuarios/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function registrarCompartida(token_acceso, partido_id) {
    return request('/api/polla/registrar-compartida', {
        method: 'POST',
        body: JSON.stringify({ token_acceso, partido_id }),
    });
}

export { API_BASE };
