/**
 * Filtra los partidos activos cuya hora de inicio todavía no ha pasado,
 * en el orden en que vienen del backend (fecha_hora_inicio ASC).
 * @param {Array} partidos
 * @param {number} limite
 */
export function partidosFuturos(partidos, limite = 5) {
    const ahora = Date.now();
    return partidos
        .filter((p) => p.estado === 'activo' && new Date(p.fecha_hora_inicio).getTime() > ahora)
        .slice(0, limite);
}
