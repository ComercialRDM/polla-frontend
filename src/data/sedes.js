// Datos de las sedes. Es la ÚNICA fuente: la usan las páginas de React y el script de
// prerender (scripts/prerender-sedes.mjs), así que debe seguir siendo JavaScript puro
// (sin JSX ni imports de Vite).
//
// Un campo en null es un dato pendiente: la página lo oculta. Nunca escribir aquí
// marcadores tipo "[LOCAL]": se verían publicados.
//
// NAP (nombre, dirección, teléfono): debe coincidir carácter por carácter con la ficha
// de Google de cada sede.

export const SITIO = 'https://www.ganaconretoucherie.com';
export const MARCA = 'La Retoucherie de Manuela';
export const WHATSAPP = '573233833253'; // mismo número para las 3 sedes
export const REDES = [
    'https://www.instagram.com/retoucherie_col/',
    'https://www.facebook.com/RetoucherieColombia/',
];

// Horario por día de la semana, en el orden de Date.getDay(): 0 = domingo … 6 = sábado.
// Cada día es un tramo h(abre, cierra), una lista de tramos (jornada partida) o null (cerrado).
// `festivo` es el horario de los festivos de Colombia.
const h = (abre, cierra) => ({ abre, cierra });

// Fotos disponibles por sede (en public/sedes/{slug}/). Cada una existe en .webp y .jpg,
// con el lado mayor en 1600 px (o menos si el original es más pequeño) y en versión "-800".
// `w`/`h` son las dimensiones de la versión grande; `alt` describe la foto.
// Solo se muestran las fotos listadas aquí: así no hay huecos ni imágenes rotas.

export const SEDES = [
    {
        slug: 'buenavista',
        nombre: 'La Retoucherie de Manuela – CC Buenavista II',
        nombreCorto: 'Buenavista II',
        centroComercial: 'Centro Comercial Buenavista II',
        ubicacionInterna: 'Sótano 2, Local 17',
        direccion: 'Calle 99 # 52-53',
        barrio: 'Riomar',
        municipio: 'Barranquilla',
        departamento: 'Atlántico',
        ciudad: 'Barranquilla, Atlántico',
        telefonoFijo: '(605) 313 1966',
        horario: {
            dias: [h('11:00', '17:00'), h('08:00', '19:00'), h('08:00', '19:00'), h('08:00', '19:00'),
                h('08:00', '19:00'), h('08:00', '20:00'), h('08:00', '20:00')],
            festivo: h('11:00', '17:00'),
        },
        comoLlegar: null,
        referencia: null,
        googleMapsUrl: 'https://maps.google.com/?cid=15582889929506480103',
        resenaUrl: 'https://g.page/r/CeffPkbUi0HYEAI/review',
        lat: 11.0143499,
        lng: -74.8279714,
        desde: 2010,
        videoComoLlegar: null,
        videoLocal: null,
        fotos: {
            fachada: { w: 1555, h: 1036, alt: 'Fachada de La Retoucherie de Manuela, arreglo de ropa en el CC Buenavista II, sótano 2, local 17' },
            'fachada-vertical': { w: 1067, h: 1600, alt: 'Entrada de La Retoucherie de Manuela en el CC Buenavista II, con su vitrina en forma de metro de costura' },
            'fachada-2': { w: 1067, h: 1600, alt: 'Vitrina de La Retoucherie de Manuela en el CC Buenavista II con el aviso de arreglo en 1 hora' },
            'fachada-3': { w: 1067, h: 1600, alt: 'Aviso de La Retoucherie de Manuela, arreglos y transformaciones, en el CC Buenavista II' },
            interior: { w: 1600, h: 1067, alt: 'Mostrador y taller de arreglo de ropa de La Retoucherie de Manuela en el CC Buenavista II' },
            taller: { w: 1067, h: 1600, alt: 'Modista trabajando en un arreglo de ropa en La Retoucherie de Manuela, CC Buenavista II' },
        },
    },
    {
        slug: 'viva',
        nombre: 'La Retoucherie de Manuela – CC Viva Barranquilla',
        nombreCorto: 'Viva Barranquilla',
        nombreTitulo: 'Viva', // versión corta para el <title> (≈60 caracteres)
        centroComercial: 'Centro Comercial Viva Barranquilla',
        ubicacionInterna: 'Sótano 1',
        direccion: 'Cra. 51B # 87-50',
        barrio: null,
        municipio: 'Barranquilla',
        departamento: 'Atlántico',
        ciudad: 'Barranquilla, Atlántico',
        telefonoFijo: '(605) 309 3750',
        horario: {
            dias: [h('11:00', '20:00'), h('10:00', '20:30'), h('10:00', '20:30'), h('10:00', '20:30'),
                h('10:00', '20:30'), h('10:00', '21:00'), h('10:00', '21:00')],
            festivo: h('11:00', '20:00'),
        },
        comoLlegar: null,
        referencia: 'Columna amarilla en forma de metro de costura frente al mostrador',
        googleMapsUrl: 'https://maps.google.com/?cid=2666015706441699424',
        resenaUrl: 'https://g.page/r/CWDQEewol_8kEAI/review',
        lat: 11.0077564,
        lng: -74.8206942,
        desde: null,
        videoComoLlegar: null,
        videoLocal: 'https://www.instagram.com/reel/CqGxQEIguSu/',
        fotos: {
            fachada: { w: 1536, h: 1024, alt: 'La Retoucherie de Manuela en el CC Viva Barranquilla, con la columna amarilla en forma de metro de costura' },
            'fachada-2': { w: 1536, h: 1024, alt: 'Mostrador de La Retoucherie de Manuela, sastrería y arreglo de ropa en el CC Viva Barranquilla' },
            interior: { w: 1536, h: 1024, alt: 'Modistas cosiendo en el taller de La Retoucherie de Manuela, CC Viva Barranquilla' },
            taller: { w: 1600, h: 1067, alt: 'Taller de arreglo de ropa de La Retoucherie de Manuela en el CC Viva Barranquilla' },
            atencion: { w: 816, h: 1224, alt: 'Modista preparando una prenda para arreglo en La Retoucherie de Manuela, CC Viva Barranquilla' },
        },
    },
    {
        slug: 'aranjuez',
        nombre: 'La Retoucherie de Manuela – CC Aranjuez',
        nombreCorto: 'Aranjuez',
        centroComercial: 'Centro Comercial Aranjuez',
        ubicacionInterna: 'Local 06, junto a las escaleras',
        // Ficha de Google: "Centro Comercial Aranjuez, Local 06, Cl. 82 #53 10, Barranquilla, Atlántico"
        direccion: 'Calle 82 # 53-10',
        barrio: null,
        municipio: 'Barranquilla',
        departamento: 'Atlántico',
        ciudad: 'Barranquilla, Atlántico',
        telefonoFijo: '(605) 202 2021',
        horario: {
            dias: [null, h('09:00', '18:00'), h('09:00', '18:00'), h('09:00', '18:00'),
                h('09:00', '18:00'), h('09:00', '18:00'), h('09:00', '16:00')],
            festivo: null,
        },
        comoLlegar: null,
        referencia: 'Escaleras al lado del local',
        googleMapsUrl: 'https://maps.google.com/?cid=7967078546597910916',
        resenaUrl: null,
        lat: 11.0062345,
        lng: -74.8126868,
        desde: null,
        videoComoLlegar: null,
        videoLocal: null,
        fotos: {
            fachada: { w: 1536, h: 1024, alt: 'Fachada de La Retoucherie de Manuela, arreglo de ropa en el CC Aranjuez, local 06' },
        },
    },
    {
        slug: 'caribe-plaza',
        nombre: 'La Retoucherie de Manuela – CC Caribe Plaza',
        nombreCorto: 'Caribe Plaza',
        centroComercial: 'Centro Comercial Caribe Plaza',
        ubicacionInterna: 'Sótano 1',
        // Dirección del centro comercial (ficha de Google del CC). El local aún no tiene ficha propia:
        // al crearla, usar exactamente esta dirección.
        direccion: 'Calle 29D # 22-108',
        barrio: 'Pie de la Popa',
        municipio: 'Cartagena',
        departamento: 'Bolívar',
        ciudad: 'Cartagena, Bolívar',
        telefonoFijo: '(605) 651 5251',
        horario: {
            dias: [[h('11:00', '13:00'), h('14:00', '20:00')], h('09:00', '19:30'), h('09:00', '19:30'), h('09:00', '19:30'),
                h('09:00', '19:30'), h('09:00', '19:30'), h('10:00', '19:30')],
            festivo: [h('11:00', '13:00'), h('14:00', '20:00')],
        },
        comoLlegar: null,
        referencia: null,
        googleMapsUrl: null,
        resenaUrl: null,
        // Coordenadas del centro comercial (OpenStreetMap), no del local: cambiar por las de la ficha de Google.
        lat: 10.4144625,
        lng: -75.5298711,
        desde: null,
        videoComoLlegar: null,
        videoLocal: null,
        fotos: {},
    },
];

export const SERVICIOS = [
    'Dobladillo de pantalón',
    'Estrechar pantalón',
    'Estrechar camisa',
    'Arreglo de vestidos de fiesta y de grado',
    'Parche y remiendo de jean',
    'Cambio de cremallera',
    'Ajuste por cambio de talla',
    'Entalle de trajes',
    'Servicio express',
];

export const ESPECIALIDAD = 'Especialistas en prendas de punto, gamuza y cuero.';

// Respuestas de preguntas frecuentes que dependen del negocio. null = la pregunta no se
// muestra (ni en la página ni en el JSON-LD) hasta tener la respuesta.
export const RESPUESTAS_FAQ = {
    demora: null,
    express: null,
};

export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function sedePorSlug(slug) {
    return SEDES.find((s) => s.slug === slug) || null;
}

export function urlSede(sede) {
    return sede ? `${SITIO}/sedes/${sede.slug}` : `${SITIO}/sedes`;
}

// "Calle 99 # 52-53, Riomar, Barranquilla" (omite los datos pendientes).
export function lineaDireccion(sede) {
    return [sede.direccion, sede.barrio, sede.municipio].filter(Boolean).join(', ');
}

export function enlaceMaps(sede) {
    if (sede.googleMapsUrl) return sede.googleMapsUrl;
    const q = `${sede.nombre}, ${lineaDireccion(sede)}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function mapaEmbebido(sede) {
    const q = sede.lat != null && sede.lng != null
        ? `${sede.lat},${sede.lng}`
        : `${sede.nombre}, ${lineaDireccion(sede)}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=17&output=embed`;
}

export function enlaceWhatsApp(texto) {
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

export function mensajeSede(sede, servicio) {
    return servicio
        ? `Hola, quiero información sobre ${servicio.toLowerCase()} en la sede ${sede.nombreCorto}`
        : `Hola, quiero información sobre un arreglo en la sede ${sede.nombreCorto}`;
}

export function enlaceTel(sede) {
    return `tel:+57${sede.telefonoFijo.replace(/\D/g, '')}`;
}

export function rutaFoto(sede, nombre) {
    return `/sedes/${sede.slug}/${nombre}`;
}

// srcset de una foto: versión "-800" (lado mayor 800 px, sin ampliar) y versión grande.
export function srcsetFoto(sede, nombre, ext) {
    const { w, h } = sede.fotos[nombre];
    const w800 = Math.round(w * Math.min(1, 800 / Math.max(w, h)));
    const base = rutaFoto(sede, nombre);
    return `${base}-800.${ext} ${w800}w, ${base}.${ext} ${w}w`;
}
