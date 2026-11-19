// Genera HTML estático para /sedes y /sedes/{slug} después de `vite build`.
//
// El sitio es una SPA: sin esto, Google recibiría el index.html genérico ("Nuevo concurso
// muy pronto"). Aquí se escribe dist/sedes/index.html y dist/sedes/{slug}/index.html con
// title, description, canonical, Open Graph y JSON-LD propios, más el contenido principal
// en HTML plano. Render sirve esos archivos directamente (un archivo existente tiene
// prioridad sobre la regla de reescritura a /index.html) y luego React monta la página
// interactiva encima, con los mismos datos de src/data/sedes.js.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    SEDES, SERVICIOS, ESPECIALIDAD, DIAS, enlaceMaps, enlaceWhatsApp, mensajeSede, enlaceTel, rutaFoto, srcsetFoto, lineaDireccion,
} from '../src/data/sedes.js';
import {
    SEO_INDICE, seoSede, jsonLdSede, jsonLdIndice, faqSede, h1Sede,
} from '../src/data/sedesSeo.js';
import { rangoLegible } from '../src/utils/horario.js';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const plantilla = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (t) => String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON dentro de <script>: evita que un "</script>" en los datos cierre la etiqueta.
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

function reemplazar(html, patron, nuevo) {
    if (!patron.test(html)) throw new Error(`prerender-sedes: no se encontró ${patron} en dist/index.html`);
    return html.replace(patron, nuevo);
}

function pagina({ title, description, url, image }, jsonLd, cuerpo, extraHead = '') {
    let html = plantilla;
    html = reemplazar(html, /<html lang="[^"]*">/, '<html lang="es-CO">');
    html = reemplazar(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    html = reemplazar(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);
    html = reemplazar(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
    html = reemplazar(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(url)}" />`);
    html = reemplazar(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`);
    html = reemplazar(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`);
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${esc(image)}" />`);
    // El tamaño 1200x630 era el de og-image.jpg; con la foto de la sede ya no aplica.
    if (!image.endsWith('/og-image.jpg')) {
        html = html.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*"\s*\/?>/g, '');
    }
    html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/g, `<meta name="twitter:title" content="${esc(title)}" />`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/g, `<meta name="twitter:description" content="${esc(description)}" />`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/g, `<meta name="twitter:image" content="${esc(image)}" />`);
    html = reemplazar(html, /<\/head>/, `    ${extraHead}<script type="application/ld+json" data-seo="sedes">${json(jsonLd)}</script>\n  </head>`);
    html = reemplazar(html, /<div id="root"><\/div>/, `<div id="root">${cuerpo}</div>`);
    return html;
}

// Estilos mínimos del contenido estático (React lo reemplaza al cargar).
const ESTILO = '<style>.pre{background:#09090b;color:#e4e4e7;font-family:Inter,system-ui,sans-serif;'
    + 'line-height:1.5;padding:24px 16px;max-width:768px;margin:0 auto}.pre h1,.pre h2{font-family:"Bebas Neue",Impact,sans-serif;'
    + 'color:#fff;line-height:1;font-weight:400}.pre h1{font-size:44px}.pre h2{font-size:32px;margin-top:32px}'
    + '.pre a{color:#fbbf24}.pre img{width:100%;height:auto;border-radius:12px}.pre td,.pre th{padding:4px 8px;text-align:left}</style>';

const MOVIL = '(max-width: 639px)';
const movilDe = (sede) => (sede.fotos['fachada-vertical'] ? 'fachada-vertical' : null);

// Misma foto (mismas URLs) que el hero de React: al montar React ya está en caché.
function fotoEstatica(sede) {
    const f = sede.fotos.fachada;
    if (!f) return '';
    const movil = movilDe(sede);
    return '<picture>'
        + (movil ? `<source media="${MOVIL}" type="image/webp" srcset="${srcsetFoto(sede, movil, 'webp')}" sizes="100vw">` : '')
        + `<source type="image/webp" srcset="${srcsetFoto(sede, 'fachada', 'webp')}" sizes="100vw">`
        + `<img src="${rutaFoto(sede, 'fachada')}.jpg" srcset="${srcsetFoto(sede, 'fachada', 'jpg')}" sizes="100vw"`
        + ` width="${f.w}" height="${f.h}" alt="${esc(f.alt)}" fetchpriority="high"></picture>`;
}

// Precarga la foto del hero desde el <head> (es el elemento más grande de la página).
function precargaHero(sede) {
    if (!sede.fotos.fachada) return '';
    const movil = movilDe(sede);
    const link = (nombre, media) => `<link rel="preload" as="image" type="image/webp" fetchpriority="high"`
        + ` imagesrcset="${srcsetFoto(sede, nombre, 'webp')}" imagesizes="100vw"${media ? ` media="${media}"` : ''}>`;
    return movil ? link(movil, MOVIL) + link('fachada', '(min-width: 640px)') : link('fachada');
}

function cuerpoSede(sede) {
    const filas = [1, 2, 3, 4, 5, 6, 0]
        .map((d) => `<tr><th>${DIAS[d]}</th><td>${esc(rangoLegible(sede.horario.dias[d]))}</td></tr>`)
        .join('') + `<tr><th>Festivos</th><td>${esc(rangoLegible(sede.horario.festivo))}</td></tr>`;
    const faq = faqSede(sede).map(({ p, r }) => `<h3>${esc(p)}</h3><p>${esc(r)}</p>`).join('');
    const otras = SEDES.filter((s) => s.slug !== sede.slug)
        .map((s) => `<li><a href="/sedes/${s.slug}">${esc(s.nombre)}</a> · ${esc(s.ubicacionInterna)}</li>`).join('');
    return `${ESTILO}<div class="pre">
<nav aria-label="Ruta"><a href="/">Inicio</a> › <a href="/sedes">Sedes</a> › CC ${esc(sede.nombreCorto)}</nav>
${fotoEstatica(sede)}
<h1>${esc(h1Sede(sede))}</h1>
<p><strong>${esc(sede.ubicacionInterna)}</strong> · ${esc(sede.centroComercial)} · ${esc(lineaDireccion(sede))}</p>
<p><a href="${esc(enlaceWhatsApp(mensajeSede(sede)))}">WhatsApp</a> · <a href="${esc(enlaceMaps(sede))}">Cómo llegar</a> · <a href="${esc(enlaceTel(sede))}">Llamar ${esc(sede.telefonoFijo)}</a></p>
<h2>¿Dónde estamos exactamente?</h2>
<p>${esc(sede.ubicacionInterna)}, ${esc(sede.centroComercial)}. ${esc(lineaDireccion(sede))}, ${esc(sede.departamento)}.</p>
${sede.referencia ? `<p>Referencia: ${esc(sede.referencia)}</p>` : ''}${sede.comoLlegar ? `<p>${esc(sede.comoLlegar)}</p>` : ''}
<h2>Horario</h2><table>${filas}</table>
<h2>Servicios</h2><p>${esc(ESPECIALIDAD)}</p><ul>${SERVICIOS.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
<h2>Preguntas frecuentes</h2>${faq}
<h2>Otras sedes</h2><ul>${otras}</ul>
</div>`;
}

function cuerpoIndice() {
    const items = SEDES.map((s) => `<li><h2><a href="/sedes/${s.slug}">CC ${esc(s.nombreCorto)}</a></h2>`
        + `<p>${esc(s.ubicacionInterna)} · ${esc(lineaDireccion(s))} · ${esc(s.telefonoFijo)}</p></li>`).join('');
    return `${ESTILO}<div class="pre"><h1>Arreglo de ropa y sastrería en Barranquilla y Cartagena</h1>`
        + `<p>${esc(ESPECIALIDAD)}</p><ul>${items}</ul></div>`;
}

function escribir(ruta, html) {
    const archivo = join(DIST, ruta, 'index.html');
    mkdirSync(dirname(archivo), { recursive: true });
    writeFileSync(archivo, html);
    console.log(`prerender-sedes: ${archivo}`);
}

escribir('sedes', pagina(SEO_INDICE, jsonLdIndice(), cuerpoIndice()));
for (const sede of SEDES) {
    escribir(join('sedes', sede.slug), pagina(seoSede(sede), jsonLdSede(sede), cuerpoSede(sede), precargaHero(sede)));
}
