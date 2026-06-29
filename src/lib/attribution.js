// Captura y almacenamiento de atribucion de marketing (UTMs, referrer, landing
// page). Vive en paralelo al sistema existente de afiliados/amigos
// (ver App.jsx: CapturarAfiliado / CapturarRef, claves polla_aff_token /
// polla_ref_token) -- no lo toca ni lo reemplaza. La diferencia: esto captura
// SIEMPRE (no solo cuando viene ?aff=) y no requiere verificacion en backend,
// porque las UTMs no mueven comision/dinero, solo describen el canal.
//
// Modelo: "first touch" (primer contacto real) se guarda una sola vez y nunca
// se sobreescribe. "last touch" se actualiza cada vez que llega una visita
// con UTMs nuevas (modelo "last click", el mismo que ya usa
// referidoTokens.js para los clics de afiliados). getStoredAttribution()
// combina ambos: usa las UTMs del ultimo touch (la senal mas reciente) pero
// conserva la fecha del primer touch (cuando se adquirio al visitante).

const KEY_FIRST = 'polla_attribution_first';
const KEY_LAST = 'polla_attribution_last';
const TTL_DIAS = 30;
const TTL_MS = TTL_DIAS * 24 * 60 * 60 * 1000;

const DOMINIOS_SOCIALES = ['facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com', 'threads.net'];
const DOMINIOS_BUSCADORES = ['google.', 'bing.com', 'yahoo.', 'duckduckgo.com'];

function leerStorage(key) {
    try {
        const crudo = localStorage.getItem(key);
        if (!crudo) return null;
        const datos = JSON.parse(crudo);
        if (!datos.expiraEn || Date.now() > datos.expiraEn) {
            localStorage.removeItem(key);
            return null;
        }
        return datos;
    } catch {
        return null;
    }
}

function guardarStorage(key, touch) {
    try {
        localStorage.setItem(key, JSON.stringify({ ...touch, expiraEn: Date.now() + TTL_MS }));
    } catch {
        // localStorage lleno o bloqueado (modo incognito estricto): se pierde la
        // atribucion de esta visita, pero no debe romper la navegacion.
    }
}

function construirTouchActual() {
    const params = new URLSearchParams(window.location.search);
    return {
        utmSource: params.get('utm_source') || null,
        utmMedium: params.get('utm_medium') || null,
        utmCampaign: params.get('utm_campaign') || null,
        utmContent: params.get('utm_content') || null,
        utmTerm: params.get('utm_term') || null,
        referrer: document.referrer || null,
        landingPage: window.location.pathname + window.location.search,
        capturadoEn: new Date().toISOString(),
    };
}

function tieneUtm(touch) {
    return Boolean(touch.utmSource || touch.utmMedium || touch.utmCampaign || touch.utmContent || touch.utmTerm);
}

/**
 * Captura la atribucion de la URL actual y la guarda en localStorage.
 * Debe llamarse en cada carga/navegacion (ver componente CapturarAtribucion
 * en App.jsx) -- es idempotente y segura de llamar varias veces.
 */
function captureAttributionFromUrl() {
    const touchActual = construirTouchActual();
    const conUtm = tieneUtm(touchActual);

    const primerTouchExistente = leerStorage(KEY_FIRST);
    if (!primerTouchExistente) {
        // Primera visita jamas registrada (con o sin UTM): se guarda como first
        // touch y tambien sirve de semilla para el last touch.
        guardarStorage(KEY_FIRST, touchActual);
        guardarStorage(KEY_LAST, touchActual);
        return;
    }

    // Ya existe first touch: nunca se sobreescribe. Solo se actualiza el last
    // touch, y solo cuando la visita trae una UTM nueva real (un clic de
    // campana), para que la navegacion interna normal no borre la atribucion
    // de la ultima campana que si trajo al visitante.
    if (conUtm) {
        guardarStorage(KEY_LAST, touchActual);
    }
}

/**
 * Devuelve la atribucion vigente para usar al momento de la compra: las UTMs
 * del ultimo touch (la senal de canal mas reciente) junto con la fecha del
 * primer touch (cuando se adquirio al visitante). Devuelve todo en null si no
 * hay nada guardado o si ya vencio el TTL de 30 dias.
 */
function getStoredAttribution() {
    const primero = leerStorage(KEY_FIRST);
    const ultimo = leerStorage(KEY_LAST) || primero;

    if (!ultimo) {
        return {
            utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null,
            referrer: null, landingPage: null, firstTouchAt: null,
        };
    }

    return {
        utmSource: ultimo.utmSource,
        utmMedium: ultimo.utmMedium,
        utmCampaign: ultimo.utmCampaign,
        utmContent: ultimo.utmContent,
        utmTerm: ultimo.utmTerm,
        referrer: ultimo.referrer,
        landingPage: ultimo.landingPage,
        firstTouchAt: primero ? primero.capturadoEn : ultimo.capturadoEn,
    };
}

function clearAttribution() {
    try {
        localStorage.removeItem(KEY_FIRST);
        localStorage.removeItem(KEY_LAST);
    } catch {
        // nada que limpiar si localStorage no esta disponible
    }
}

function dominioCoincide(referrer, dominios) {
    if (!referrer) return false;
    const referrerNorm = referrer.toLowerCase();
    return dominios.some((d) => referrerNorm.indexOf(d) !== -1);
}

/**
 * Clasificacion liviana de canal SOLO para etiquetar el evento de GA4 en el
 * navegador. Postgres (ver src/utils/atribucion.js en el backend) es la
 * fuente de verdad para reportes -- esta version no conoce si un
 * aff_token/ref fueron verificados, asi que usa su mera presencia en
 * localStorage como aproximacion. Misma tabla de reglas documentada en
 * README_ATTRIBUTION_TRACKING.md.
 */
function getAttributionGroup(atribucion) {
    const atrib = atribucion || getStoredAttribution();
    const medium = (atrib.utmMedium || '').toLowerCase();
    const source = (atrib.utmSource || '').toLowerCase();

    let tieneAffToken = false;
    let tieneRef = false;
    try {
        tieneAffToken = Boolean(localStorage.getItem('polla_aff_token'));
        tieneRef = Boolean(localStorage.getItem('polla_ref_token'));
    } catch {
        // sin acceso a localStorage: se sigue solo con las UTMs
    }

    if (tieneAffToken) return 'influencer';
    if (tieneRef) return 'friend';

    if (medium === 'email') return 'email';
    if (medium === 'sms') return 'sms';
    if (medium === 'whatsapp' || source === 'whatsapp' || source === 'manychat') return 'whatsapp';
    if (medium === 'influencer') return 'influencer';
    if (medium === 'friend') return 'friend';
    if (medium === 'paid_social' || medium === 'cpc') return 'paid_ads';

    if (!atrib.utmSource) {
        if (dominioCoincide(atrib.referrer, DOMINIOS_SOCIALES)) return 'organic_social';
        if (dominioCoincide(atrib.referrer, DOMINIOS_BUSCADORES)) return 'organic_search';
        if (!atrib.referrer) return 'direct';
    }

    return 'referral';
}

export { captureAttributionFromUrl, getStoredAttribution, clearAttribution, getAttributionGroup };
