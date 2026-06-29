// Helpers de GA4 ecommerce (gtag.js). El proyecto ya carga gtag.js en
// index.html (measurement id G-B33ZXGVN96) -- este modulo solo agrega los
// eventos custom que faltaban, no toca esa configuracion base.
//
// Cada evento lee la atribucion guardada automaticamente (ver
// src/lib/attribution.js) y la adjunta como parametros custom, para no tener
// que pasarla a mano desde cada pantalla.

import { getStoredAttribution, getAttributionGroup } from './attribution';

const DEBUG = Boolean(import.meta.env.DEV);
const PREFIJO_PURCHASE_ENVIADO = 'polla_ga4_purchase_';

function log(...args) {
    if (DEBUG) console.log('[analytics]', ...args);
}

function gtagDisponible() {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function enviarEvento(nombre, parametros) {
    if (!gtagDisponible()) {
        log('gtag no disponible, evento no enviado:', nombre, parametros);
        return;
    }
    window.gtag('event', nombre, parametros);
    log('evento enviado:', nombre, parametros);
}

// Construye los parametros custom de atribucion que se adjuntan a los
// eventos de ecommerce, por fuera del array `items` (estandar de GA4: los
// parametros de campana van al nivel del evento, no dentro de cada item).
function construirParametrosAtribucion() {
    const atribucion = getStoredAttribution();
    const grupo = getAttributionGroup(atribucion);

    const parametros = {
        campaign_source: atribucion.utmSource || undefined,
        campaign_medium: atribucion.utmMedium || undefined,
        campaign_name: atribucion.utmCampaign || undefined,
        campaign_content: atribucion.utmContent || undefined,
        referral_group: grupo,
    };

    // influencer_name / friend_name: utm_content normalizado segun el grupo
    // resuelto (ver decision documentada en README_ATTRIBUTION_TRACKING.md --
    // referral_group manda sobre el utm_medium libre, que solo aporta el
    // nombre/identificador en utm_content).
    if (grupo === 'influencer' && atribucion.utmContent) {
        parametros.influencer_name = atribucion.utmContent;
    }
    if (grupo === 'friend' && atribucion.utmContent) {
        parametros.friend_name = atribucion.utmContent;
    }

    return parametros;
}

function itemDeGA4({ itemId, itemName, price, quantity = 1 }) {
    return {
        item_id: String(itemId ?? ''),
        item_name: itemName ?? '',
        price: Number(price) || 0,
        quantity,
    };
}

/**
 * Evento view_item: cuando el usuario ve el detalle de un plan/bono antes de
 * comprar. `plan` = { valor, saldoBono, etiqueta } (ver config/planes.js).
 */
function trackViewItem(plan) {
    if (!plan) return;
    enviarEvento('view_item', {
        currency: 'COP',
        value: Number(plan.valor) || 0,
        items: [itemDeGA4({ itemId: plan.valor, itemName: `Bono ${plan.etiqueta || plan.valor}`, price: plan.valor })],
        ...construirParametrosAtribucion(),
    });
}

/**
 * Evento begin_checkout: cuando el usuario ya eligio plan y partido y entra
 * a llenar sus datos/metodo de pago.
 */
function trackBeginCheckout(plan, { partidoId, landingPageType } = {}) {
    if (!plan) return;
    enviarEvento('begin_checkout', {
        currency: 'COP',
        value: Number(plan.valor) || 0,
        items: [itemDeGA4({ itemId: plan.valor, itemName: `Bono ${plan.etiqueta || plan.valor}`, price: plan.valor })],
        landing_page_type: landingPageType || undefined,
        partido_id: partidoId ?? undefined,
        ...construirParametrosAtribucion(),
    });
}

/**
 * Evento add_payment_info: cuando el usuario elige metodo de pago (Wompi/
 * PSE/Bancolombia/Transferencia) y envia el formulario.
 */
function trackAddPaymentInfo(plan, { metodoPago } = {}) {
    if (!plan) return;
    enviarEvento('add_payment_info', {
        currency: 'COP',
        value: Number(plan.valor) || 0,
        payment_type: metodoPago || undefined,
        items: [itemDeGA4({ itemId: plan.valor, itemName: `Bono ${plan.etiqueta || plan.valor}`, price: plan.valor })],
        ...construirParametrosAtribucion(),
    });
}

/**
 * Evento purchase: SOLO debe llamarse cuando el backend ya confirmo
 * `estado_pago = 'APROBADO'` para esta transaccion (nunca en estado
 * "verificando"/"demorado"). `transactionId` debe ser estable y unico por
 * compra -- se usa el token_acceso, que ya cumple ese rol en el resto del
 * sistema. Protegido contra doble disparo: si ya se envio purchase para este
 * transactionId en este navegador, no lo repite (ver limitacion documentada
 * en README_ATTRIBUTION_TRACKING.md sobre multi-dispositivo/storage borrado).
 */
function trackPurchase({ transactionId, value, currency = 'COP', items }) {
    if (!transactionId) {
        log('trackPurchase sin transactionId, se ignora');
        return false;
    }

    const claveEnviado = PREFIJO_PURCHASE_ENVIADO + transactionId;
    try {
        if (localStorage.getItem(claveEnviado)) {
            log('purchase ya enviado antes para', transactionId, '-- se omite duplicado');
            return false;
        }
    } catch {
        // sin acceso a localStorage: se sigue intentando enviar, mejor un
        // posible duplicado ocasional que perder la venta por completo.
    }

    enviarEvento('purchase', {
        transaction_id: String(transactionId),
        value: Number(value) || 0,
        currency,
        items: items && items.length > 0 ? items : [itemDeGA4({ itemId: transactionId, itemName: 'Bono Retoucherie', price: value })],
        ...construirParametrosAtribucion(),
    });

    try {
        localStorage.setItem(claveEnviado, '1');
    } catch {
        // si no se pudo marcar, queda el riesgo de reenvio en otra visita --
        // limitacion conocida y documentada, no bloquea el flujo.
    }

    return true;
}

export { trackViewItem, trackBeginCheckout, trackAddPaymentInfo, trackPurchase };
