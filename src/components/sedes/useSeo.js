import { useEffect } from 'react';

// Actualiza title, meta, canonical, Open Graph y JSON-LD al navegar dentro de la app.
// (Para Google, el mismo contenido ya viene en el HTML generado por scripts/prerender-sedes.mjs.)
function meta(selector, crear, valor) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement(crear.tag);
        Object.entries(crear.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
    }
    const attr = crear.tag === 'link' ? 'href' : 'content';
    const previo = el.getAttribute(attr);
    el.setAttribute(attr, valor);
    return () => (previo == null ? el.removeAttribute(attr) : el.setAttribute(attr, previo));
}

export default function useSeo({ title, description, url, image }, jsonLd) {
    const ld = JSON.stringify(jsonLd);
    useEffect(() => {
        const tituloPrevio = document.title;
        document.title = title;
        const deshacer = [
            meta('meta[name="description"]', { tag: 'meta', attrs: { name: 'description' } }, description),
            meta('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } }, url),
            meta('meta[property="og:title"]', { tag: 'meta', attrs: { property: 'og:title' } }, title),
            meta('meta[property="og:description"]', { tag: 'meta', attrs: { property: 'og:description' } }, description),
            meta('meta[property="og:url"]', { tag: 'meta', attrs: { property: 'og:url' } }, url),
            meta('meta[property="og:image"]', { tag: 'meta', attrs: { property: 'og:image' } }, image),
        ];
        // El prerender ya trae el JSON-LD de la página; solo se agrega si falta.
        let script = document.head.querySelector('script[data-seo="sedes"]');
        let creado = false;
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.dataset.seo = 'sedes';
            document.head.appendChild(script);
            creado = true;
        }
        const ldPrevio = script.textContent;
        script.textContent = ld;
        const lang = document.documentElement.lang;
        document.documentElement.lang = 'es-CO';
        return () => {
            document.title = tituloPrevio;
            deshacer.forEach((fn) => fn());
            if (creado) script.remove(); else script.textContent = ldPrevio;
            document.documentElement.lang = lang;
        };
    }, [title, description, url, image, ld]);
}
