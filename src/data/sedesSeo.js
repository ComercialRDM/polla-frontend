// Metadatos SEO y preguntas frecuentes de las sedes. JavaScript puro: lo usan las
// páginas (para la navegación dentro de la app) y el prerender (HTML sin JavaScript).
import {
    SEDES, SITIO, MARCA, REDES, RESPUESTAS_FAQ, DIAS, urlSede, rutaFoto,
} from './sedes.js';
import { horaLegible } from '../utils/horario.js';

export const SEO_INDICE = {
    title: 'Arreglo de ropa en Barranquilla | La Retoucherie de Manuela',
    description: 'Arreglo de ropa y sastrería en Barranquilla: sedes en los CC Buenavista II, '
        + 'Viva Barranquilla y Aranjuez. Horarios, cómo llegar y WhatsApp.',
    url: `${SITIO}/sedes`,
    image: `${SITIO}/og-image.jpg`,
};

export function tituloSede(sede) {
    return `Arreglo de ropa en CC ${sede.nombreTitulo || sede.nombreCorto} | ${MARCA}`;
}

export function h1Sede(sede) {
    return `Arreglo de ropa y sastrería en el CC ${sede.nombreTitulo || sede.nombreCorto}, Barranquilla`;
}

export function descripcionSede(sede) {
    return `Arreglo de ropa en el CC ${sede.nombreCorto}, ${sede.ubicacionInterna}. `
        + 'Dobladillos, estrechar pantalones, vestidos y parches de jean. Escríbenos por WhatsApp.';
}

export function imagenSede(sede) {
    return sede.fotos.fachada ? `${SITIO}${rutaFoto(sede, 'fachada')}.jpg` : `${SITIO}/og-image.jpg`;
}

export function seoSede(sede) {
    return {
        title: tituloSede(sede),
        description: descripcionSede(sede),
        url: urlSede(sede),
        image: imagenSede(sede),
    };
}

// Preguntas frecuentes con respuesta. Las que no tienen respuesta no se muestran.
export function faqSede(sede) {
    const domingo = sede.horario.dias[0];
    const festivo = sede.horario.festivo;
    const lista = [
        {
            p: '¿En qué parte del centro comercial están?',
            r: `Estamos en el ${sede.centroComercial}, ${sede.ubicacionInterna} (${sede.direccion}, Barranquilla).`
                + (sede.referencia ? ` Referencia: ${sede.referencia.charAt(0).toLowerCase()}${sede.referencia.slice(1)}.` : ''),
        },
        RESPUESTAS_FAQ.demora && { p: '¿Cuánto se demora un arreglo?', r: RESPUESTAS_FAQ.demora },
        RESPUESTAS_FAQ.express && { p: '¿Tienen servicio express?', r: RESPUESTAS_FAQ.express },
        { p: '¿Hay parqueadero?', r: `Sí, puedes usar el parqueadero del ${sede.centroComercial}.` },
        {
            p: '¿Atienden domingos y festivos?',
            r: domingo || festivo
                ? `Sí. Domingos: ${domingo ? `${horaLegible(domingo.abre)} a ${horaLegible(domingo.cierra)}` : 'cerrado'}. `
                  + `Festivos: ${festivo ? `${horaLegible(festivo.abre)} a ${horaLegible(festivo.cierra)}` : 'cerrado'}.`
                : 'No, los domingos y festivos esta sede permanece cerrada.',
        },
    ];
    return lista.filter(Boolean);
}

const NOMBRE_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function horarioSchema(sede) {
    // Agrupa los días con el mismo horario: menos ruido en el JSON-LD.
    const grupos = new Map();
    sede.horario.dias.forEach((r, dow) => {
        if (!r) return;
        const clave = `${r.abre}-${r.cierra}`;
        if (!grupos.has(clave)) grupos.set(clave, { ...r, dias: [] });
        grupos.get(clave).dias.push(`https://schema.org/${NOMBRE_SCHEMA[dow]}`);
    });
    return [...grupos.values()].map((g) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: g.dias.length === 1 ? g.dias[0] : g.dias,
        opens: g.abre,
        closes: g.cierra,
    }));
}

export function jsonLdSede(sede) {
    const negocio = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        additionalType: 'https://en.wikipedia.org/wiki/Tailor',
        '@id': `${urlSede(sede)}#negocio`,
        name: sede.nombre,
        image: imagenSede(sede),
        url: urlSede(sede),
        telephone: sede.telefonoFijo,
        address: {
            '@type': 'PostalAddress',
            streetAddress: sede.direccion, // NAP: idéntico a la ficha de Google
            addressLocality: 'Barranquilla',
            addressRegion: 'Atlántico',
            addressCountry: 'CO',
        },
        openingHoursSpecification: horarioSchema(sede),
        sameAs: REDES,
        containedInPlace: { '@type': 'ShoppingCenter', name: sede.centroComercial },
        parentOrganization: { '@type': 'Organization', name: MARCA, url: SITIO },
    };
    if (sede.lat != null && sede.lng != null) {
        negocio.geo = { '@type': 'GeoCoordinates', latitude: sede.lat, longitude: sede.lng };
    }
    if (sede.googleMapsUrl) negocio.hasMap = sede.googleMapsUrl;
    if (sede.desde) negocio.foundingDate = String(sede.desde);

    const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSede(sede).map(({ p, r }) => ({
            '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r },
        })),
    };
    return [negocio, faq];
}

export function jsonLdIndice() {
    return [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Sedes de ${MARCA} en Barranquilla`,
        itemListElement: SEDES.map((s, i) => ({
            '@type': 'ListItem', position: i + 1, url: urlSede(s), name: s.nombre,
        })),
    }];
}

export { DIAS };
