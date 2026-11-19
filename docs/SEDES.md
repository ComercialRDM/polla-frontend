# Páginas de sedes

Rutas: `/sedes`, `/sedes/buenavista`, `/sedes/viva`, `/sedes/aranjuez`, `/sedes/caribe-plaza` (Cartagena). Funcionan también con
`MODO_PROXIMAMENTE = true`.

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Datos de cada sede (dirección, teléfono, horario, links, fotos) | `src/data/sedes.js` |
| Title, description, JSON-LD y preguntas frecuentes | `src/data/sedesSeo.js` |
| "Abierto ahora", festivos de Colombia | `src/utils/horario.js` (los festivos se calculan solos, Ley Emiliani) |
| HTML estático para Google | `scripts/prerender-sedes.mjs` (corre en `npm run build`) |
| Fotos | `public/sedes/{slug}/` |

Un dato en `null` no se muestra en la página. Nunca escribir marcadores tipo `[LOCAL]` en
`sedes.js`: se publicarían.

**NAP:** el nombre, la dirección y el teléfono de `sedes.js` deben ser idénticos a la ficha de
Google de cada sede. Si se cambia uno, cambiar el otro.

## Agregar o cambiar fotos

Cada foto va en `.jpg` y `.webp`, en tamaño grande (lado mayor 1600 px) y en versión `-800`, y se
registra en `fotos` de la sede con su ancho, alto y texto `alt`. Las fotos no listadas en `fotos`
no se muestran. Nombres que usa la página: `fachada` (hero y og:image), `fachada-vertical`
(hero en celular), `fachada-2`, `fachada-3`, `taller`, `atencion` (galería), `interior`
("Así trabajamos"), `recorrido-1`, `recorrido-2` ("¿Dónde estamos exactamente?").

## Ficha de Google (Perfil de Empresa): campo "Sitio web"

| Sede | URL |
|---|---|
| Buenavista | `https://www.ganaconretoucherie.com/sedes/buenavista?utm_source=google&utm_medium=organic&utm_campaign=gbp_buenavista` |
| Viva | `https://www.ganaconretoucherie.com/sedes/viva?utm_source=google&utm_medium=organic&utm_campaign=gbp_viva` |
| Aranjuez | `https://www.ganaconretoucherie.com/sedes/aranjuez?utm_source=google&utm_medium=organic&utm_campaign=gbp_aranjuez` |
| Caribe Plaza (Cartagena) | `https://www.ganaconretoucherie.com/sedes/caribe-plaza?utm_source=google&utm_medium=organic&utm_campaign=gbp_caribe-plaza` |

Se usa `www.` porque es el dominio canónico del sitio (evita una redirección).

## Deploy (Render)

El sitio es un Static Site de Render detrás de Cloudflare (`vercel.json` no se aplica). Al fusionar
en `main`, Render ejecuta `npm run build`, que ya incluye el prerender.

Después del deploy, verificar que Render entrega el HTML de la sede y no el genérico:

```sh
curl -s https://www.ganaconretoucherie.com/sedes/viva | grep -o "<title>[^<]*"
# Debe decir: Arreglo de ropa en CC Viva | La Retoucherie de Manuela
```

Si sale "Nuevo concurso muy pronto", agregar en Render → Redirects/Rewrites, **antes** de la regla
`/* → /index.html`, una regla Rewrite por página: `/sedes` → `/sedes/index.html`,
`/sedes/buenavista` → `/sedes/buenavista/index.html`, y así con `viva` y `aranjuez`.

Luego: enviar `sitemap.xml` en Google Search Console y pedir indexación de las 4 URLs.

Si más adelante se agrega una Content-Security-Policy completa en Render, debe permitir
`frame-src https://www.google.com` para el mapa.
