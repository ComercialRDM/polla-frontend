import { obtenerToken } from './utils/sesion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function authHeader() {
    const token = obtenerToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

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

export function obtenerResumenUsuario() {
    return request('/api/polla/resumen-usuario', { headers: authHeader() });
}

export function obtenerMisPronosticos() {
    return request('/api/polla/mis-pronosticos', { headers: authHeader() });
}

export function obtenerPartidosFlash() {
    return request('/api/polla/flash');
}

export function votarFlash({ celular, partido_id, local, visitante }) {
    return request('/api/polla/votar-flash', {
        method: 'POST',
        body: JSON.stringify({ celular, partido_id, local, visitante }),
    });
}

// `atribucion` = el objeto de src/lib/attribution.js getStoredAttribution()
// (utm_source/medium/campaign/content/term, referrer, landing_page,
// first_touch_at). Se manda tal cual con nombres snake_case porque asi los
// espera el backend (ver src/utils/atribucion.js en polla-backend).
function camposAtribucion(atribucion) {
    if (!atribucion) return {};
    return {
        utm_source: atribucion.utmSource,
        utm_medium: atribucion.utmMedium,
        utm_campaign: atribucion.utmCampaign,
        utm_content: atribucion.utmContent,
        utm_term: atribucion.utmTerm,
        referrer: atribucion.referrer,
        landing_page: atribucion.landingPage,
        first_touch_at: atribucion.firstTouchAt,
    };
}

export function crearLinkPago({ nombre, correo, celular, partido_id, valor, ref, aff_token, atribucion }) {
    return request('/api/transacciones/crear-link', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, celular, partido_id, valor, ref, aff_token, ...camposAtribucion(atribucion) }),
    });
}

export async function crearTransferencia({ nombre, correo, celular, partido_id, valor, comprobante, metodo, ref, aff_token, atribucion }) {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('celular', celular);
    formData.append('partido_id', partido_id);
    formData.append('valor', valor);
    formData.append('comprobante', comprobante);
    if (metodo) formData.append('metodo', metodo);
    if (ref) formData.append('ref', ref);
    if (aff_token) formData.append('aff_token', aff_token);
    Object.entries(camposAtribucion(atribucion)).forEach(([clave, valorCampo]) => {
        if (valorCampo) formData.append(clave, valorCampo);
    });

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

export function obtenerBancosPse() {
    return request('/api/transacciones/bancos-pse');
}

export function crearPSE({ nombre, correo, celular, partido_id, valor, tipo_documento, documento, financial_institution_code, ref, aff_token, atribucion }) {
    return request('/api/transacciones/crear-pse', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, celular, partido_id, valor, tipo_documento, documento, financial_institution_code, ref, aff_token, ...camposAtribucion(atribucion) }),
    });
}

export function crearBancolombia({ nombre, correo, celular, partido_id, valor, ref, aff_token, atribucion }) {
    return request('/api/transacciones/crear-bancolombia', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, celular, partido_id, valor, ref, aff_token, ...camposAtribucion(atribucion) }),
    });
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

export function obtenerDatosRegistroPorToken(token) {
    return request(`/api/polla/datos-registro/${token}`);
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

export function solicitarCodigoTelefono(celular) {
    return request('/api/auth/telefono/solicitar-codigo', {
        method: 'POST',
        body: JSON.stringify({ celular }),
    });
}

export function verificarCodigoTelefono({ celular, codigo }) {
    return request('/api/auth/telefono/verificar-codigo', {
        method: 'POST',
        body: JSON.stringify({ celular, codigo }),
    });
}

export function completarRegistroTelefono({ celular, registro_token, nombre, equipos_favoritos }) {
    return request('/api/auth/telefono/completar', {
        method: 'POST',
        body: JSON.stringify({ celular, registro_token, nombre, equipos_favoritos }),
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

export function adminLogin(usuario, password, totp_code) {
    return request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password, ...(totp_code ? { totp_code } : {}) }),
    });
}

export function admin2faEstado(token) {
    return request('/api/admin/2fa/estado', { headers: { Authorization: `Bearer ${token}` } });
}

export function admin2faSetup(token) {
    return request('/api/admin/2fa/setup', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

export function admin2faConfirmar(token, code) {
    return request('/api/admin/2fa/confirmar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
    });
}

export function admin2faDesactivar(token, code) {
    return request('/api/admin/2fa/desactivar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
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

export function localLogin(usuario, password, totp_code) {
    return request('/api/local/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password, ...(totp_code ? { totp_code } : {}) }),
    });
}

export function localBuscarBono(token, tokenAcceso) {
    return request(`/api/local/bono/${tokenAcceso}`, {
        headers: { Authorization: `Bearer ${token}` },
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

export function localRedimirBono(token, tokenAcceso, monto, sede) {
    return request('/api/local/bono/redimir', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token_acceso: tokenAcceso, monto, sede }),
    });
}

export function adminRedencionesResumen(token, fecha) {
    const params = fecha ? `?fecha=${fecha}` : '';
    return request(`/api/admin/redenciones/resumen${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminRedencionesExport(token, desde, hasta) {
    const params = new URLSearchParams({ desde, hasta });
    return request(`/api/admin/redenciones/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
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

export function adminRankingGlobal(token, limit = 100) {
    return request(`/api/admin/ranking-global?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminEliminarUsuario(token, id) {
    return request(`/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminMarcarUsuarioTest(token, id, es_test) {
    return request(`/api/admin/usuarios/${id}/es-test`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ es_test }),
    });
}

export function adminCrearEspeciales(token, { personas, valorBono, intentos }) {
    return request('/api/admin/especiales/crear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ personas, valorBono, intentos }),
    });
}

export function adminListarEspeciales(token) {
    return request('/api/admin/especiales', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminRankingEspeciales(token) {
    return request('/api/admin/ranking-especiales', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminInvitarEspecial(token, id) {
    return request(`/api/admin/especiales/${id}/invitar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminReenviarBono(token, id) {
    return request(`/api/admin/especiales/${id}/reenviar-bono`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function subirFotoPerfil(tokenAcceso, foto) {
    const formData = new FormData();
    formData.append('token_acceso', tokenAcceso);
    formData.append('foto', foto);
    const res = await fetch(`${API_BASE}/api/polla/foto-perfil`, { method: 'POST', body: formData });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
    return data;
}

export async function registrarInfluencer({ nombre, correo, celular, red_contenido, foto, autoriza_foto }) {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('celular', celular);
    formData.append('red_contenido', red_contenido);
    formData.append('autoriza_foto', autoriza_foto ? 'true' : 'false');
    if (foto) formData.append('foto', foto);

    const res = await fetch(`${API_BASE}/api/influencers/registrar`, {
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

export function adminListarRegistrosInfluencer(token) {
    return request('/api/admin/influencers/registros', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminMarcarRegistroInfluencer(token, id, atendido) {
    return request(`/api/admin/influencers/registros/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ atendido }),
    });
}

export async function adminAbrirFotoRegistroInfluencer(token, id) {
    const res = await fetch(`${API_BASE}/api/admin/influencers/registros/${id}/foto`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error('No se pudo cargar la foto');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

export function registrarClicAfiliado({ codigo_afiliado, utm_source, utm_medium, utm_campaign }) {
    return request('/api/referidos/clic', {
        method: 'POST',
        body: JSON.stringify({ codigo_afiliado, utm_source, utm_medium, utm_campaign }),
    });
}

export function adminVentasPorCanal(token, fecha_inicio, fecha_fin) {
    const params = fecha_inicio && fecha_fin ? `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}` : '';
    return request(`/api/admin/ventas-por-canal${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminVentasPorCampana(token) {
    return request('/api/admin/ventas-por-campana', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminRankingAmigos(token) {
    return request('/api/admin/ranking-amigos', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminListarAfiliados(token) {
    return request('/api/admin/afiliados', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminEditarAfiliado(token, id, { porcentaje_comision, activo }) {
    return request(`/api/admin/afiliados/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ porcentaje_comision, activo }),
    });
}

export function adminListarComisiones(token, estado) {
    const params = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    return request(`/api/admin/comisiones${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminActualizarEstadoComision(token, id, estado) {
    return request(`/api/admin/comisiones/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado }),
    });
}

export function obtenerRankingInfluencers(token) {
    return request(`/api/polla/ranking-influencers?token_acceso=${encodeURIComponent(token)}`);
}

export function urlFotoInfluencer(usuarioId) {
    return `${API_BASE}/api/polla/foto-influencer/${usuarioId}`;
}

export function adminFlashGanadores(token) {
    return request('/api/admin/flash-ganadores', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminRankingFinal(token) {
    return request('/api/admin/ranking-final', {
        headers: { Authorization: `Bearer ${token}` },
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

export function local2faEstado(token) {
    return request('/api/local/2fa/estado', { headers: { Authorization: `Bearer ${token}` } });
}

export function local2faSetup(token) {
    return request('/api/local/2fa/setup', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

export function local2faConfirmar(token, code) {
    return request('/api/local/2fa/confirmar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
    });
}

export function local2faDesactivar(token, code) {
    return request('/api/local/2fa/desactivar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
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

export function adminUsuarios(token) {
    return request('/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function adminReportes(token, fecha_inicio, fecha_fin) {
    return request(`/api/admin/reportes?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function registrarCompartida(token_acceso, partido_id) {
    return request('/api/polla/registrar-compartida', {
        method: 'POST',
        body: JSON.stringify({ token_acceso, partido_id }),
    });
}

export function crearGrupo({ token_acceso, nombre, partido_id }) {
    return request('/api/grupo', {
        method: 'POST',
        body: JSON.stringify({ token_acceso, nombre, partido_id }),
    });
}

export function obtenerMisGrupos(token_acceso) {
    return request(`/api/grupo/mio?token_acceso=${encodeURIComponent(token_acceso)}`);
}

export function obtenerGrupo(token_grupo, token_acceso) {
    const q = token_acceso ? `?token_acceso=${encodeURIComponent(token_acceso)}` : '';
    return request(`/api/grupo/${token_grupo}${q}`);
}

export function unirseGrupo(token_grupo, token_acceso) {
    return request(`/api/grupo/${token_grupo}/unirse`, {
        method: 'POST',
        body: JSON.stringify({ token_acceso }),
    });
}

export function actualizarPerfilDemografico({ token_acceso, fecha_nacimiento, sexo }) {
    return request('/api/polla/perfil-demografico', {
        method: 'PATCH',
        body: JSON.stringify({ token_acceso, fecha_nacimiento, sexo }),
    });
}

export function adminDemograficos(token) {
    return request('/api/admin/demograficos', { headers: { Authorization: `Bearer ${token}` } });
}

export function adminMarketingResumen(token) {
    return request('/api/admin/marketing/resumen', { headers: { Authorization: `Bearer ${token}` } });
}

export function adminMarketingAgregarGasto(token, { tipo, descripcion, monto, fecha }) {
    return request('/api/admin/marketing/gastos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo, descripcion, monto, fecha }),
    });
}

export function adminMarketingEliminarGasto(token, id) {
    return request(`/api/admin/marketing/gastos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export { API_BASE };
