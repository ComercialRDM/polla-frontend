import { useEffect } from 'react';

const SITE_URL = 'https://www.ganaconretoucherie.com';

function setMetaTag(attr, key, content) {
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

function setLinkTag(rel, href) {
    let tag = document.head.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
}

function setJsonLd(id, data) {
    let script = document.getElementById(id);
    if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
}

// Gestiona title/description/OG/Twitter/canonical/schema para rutas de esta SPA
// (no hay SSR, así que se aplican en el cliente vía useEffect). Al desmontar,
// restaura los valores por defecto definidos en index.html.
export function useSeo({ title, description, path = '', jsonLd }) {
    useEffect(() => {
        const prevTitle = document.title;
        const url = `${SITE_URL}${path}`;

        document.title = title;
        setMetaTag('name', 'description', description);
        setLinkTag('canonical', url);

        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:url', url);

        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);

        if (jsonLd) setJsonLd('seo-jsonld-route', jsonLd);

        return () => {
            document.title = prevTitle;
            const old = document.getElementById('seo-jsonld-route');
            if (old) old.remove();
        };
    }, [title, description, path, jsonLd]);
}
