// Horarios de las sedes en hora de Colombia (America/Bogota), con festivos.
// JavaScript puro: lo usan las páginas y el script de prerender.

const ZONA = 'America/Bogota';
const DIA_INGLES = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Fecha y hora actuales en Colombia, sin depender de la zona horaria del celular.
export function ahoraBogota(fecha = new Date()) {
    const partes = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
        }).formatToParts(fecha).map((p) => [p.type, p.value]),
    );
    return {
        y: +partes.year, m: +partes.month, d: +partes.day,
        dow: DIA_INGLES[partes.weekday],
        minutos: +partes.hour * 60 + +partes.minute,
    };
}

const iso = (y, m, d) => {
    const f = new Date(Date.UTC(y, m - 1, d));
    return f.toISOString().slice(0, 10);
};

function domingoDePascua(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), hh = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7;
    const m = Math.floor((a + 11 * hh + 22 * l) / 451);
    const mes = Math.floor((hh + l - 7 * m + 114) / 31);
    const dia = ((hh + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(y, mes - 1, dia);
}

// Ley Emiliani: el festivo se corre al lunes siguiente si no cae en lunes.
function alLunes(y, m, d) {
    const f = new Date(Date.UTC(y, m - 1, d));
    const dow = f.getUTCDay();
    if (dow !== 1) f.setUTCDate(f.getUTCDate() + ((8 - dow) % 7));
    return f.toISOString().slice(0, 10);
}

const cache = new Map();

// Festivos de Colombia del año (formato YYYY-MM-DD).
export function festivosColombia(y) {
    if (cache.has(y)) return cache.get(y);
    const pascua = domingoDePascua(y);
    const desdePascua = (dias) => new Date(pascua + dias * 86400000).toISOString().slice(0, 10);
    const lista = new Set([
        iso(y, 1, 1), iso(y, 5, 1), iso(y, 7, 20), iso(y, 8, 7), iso(y, 12, 8), iso(y, 12, 25),
        alLunes(y, 1, 6), alLunes(y, 3, 19), alLunes(y, 6, 29), alLunes(y, 8, 15),
        alLunes(y, 10, 12), alLunes(y, 11, 1), alLunes(y, 11, 11),
        desdePascua(-3), desdePascua(-2), // Jueves y Viernes Santo
        desdePascua(43), desdePascua(64), desdePascua(71), // Ascensión, Corpus, Sagrado Corazón
    ]);
    cache.set(y, lista);
    return lista;
}

export function esFestivo(y, m, d) {
    return festivosColombia(y).has(iso(y, m, d));
}

const aMinutos = (hhmm) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    return hh * 60 + mm;
};

// "8:00 a. m.", "7:30 p. m." (formato colombiano)
export function horaLegible(hhmm) {
    const [hh, mm] = hhmm.split(':').map(Number);
    const sufijo = hh < 12 ? 'a. m.' : 'p. m.';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${sufijo}`;
}

// Un día puede ser un tramo, una lista de tramos (jornada partida) o null.
export const tramos = (dia) => (dia ? (Array.isArray(dia) ? dia : [dia]) : []);

export function rangoLegible(dia) {
    const t = tramos(dia);
    return t.length ? t.map((r) => `${horaLegible(r.abre)} – ${horaLegible(r.cierra)}`).join(' y ') : 'Cerrado';
}

function horarioDe(sede, y, m, d, dow) {
    return esFestivo(y, m, d) ? sede.horario.festivo : sede.horario.dias[dow];
}

export function horarioDeHoy(sede, fecha = new Date()) {
    const a = ahoraBogota(fecha);
    return { rango: horarioDe(sede, a.y, a.m, a.d, a.dow), festivo: esFestivo(a.y, a.m, a.d), dow: a.dow };
}

const NOMBRE_DIA = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];

// { abierto, texto }: "Abierto ahora · cierra a las 7:00 p. m." o "Cerrado · abre mañana a las…"
export function estadoAhora(sede, fecha = new Date()) {
    const a = ahoraBogota(fecha);
    const hoy = tramos(horarioDe(sede, a.y, a.m, a.d, a.dow));
    const actual = hoy.find((r) => a.minutos >= aMinutos(r.abre) && a.minutos < aMinutos(r.cierra));
    if (actual) {
        return { abierto: true, texto: `Abierto ahora · cierra a las ${horaLegible(actual.cierra)}` };
    }
    const luego = hoy.find((r) => a.minutos < aMinutos(r.abre));
    if (luego) {
        return { abierto: false, texto: `Cerrado · abre hoy a las ${horaLegible(luego.abre)}` };
    }
    for (let i = 1; i <= 7; i++) {
        const f = new Date(Date.UTC(a.y, a.m - 1, a.d + i));
        const dow = f.getUTCDay();
        const [primero] = tramos(horarioDe(sede, f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate(), dow));
        if (primero) {
            const cuando = i === 1 ? 'mañana' : NOMBRE_DIA[dow];
            return { abierto: false, texto: `Cerrado · abre ${cuando} a las ${horaLegible(primero.abre)}` };
        }
    }
    return { abierto: false, texto: 'Cerrado' };
}
