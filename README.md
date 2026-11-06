# Invitación digital — temática Plim Plim

Invitación de cumpleaños de una sola página (React + Vite + TypeScript), basada en `invitacion-misssy`.

## 1. Editar los datos del evento

Todo lo editable está en **`src/config.ts`** (busca `TODO`):

- `nombre`, `cumpleanero`, `edad`, `edadTexto`
- `fechaEvento`: **el mes empieza en 0** (`new Date(2027, 0, 16, 15, 0)` = 16 de enero de 2027, 3:00 pm). La fecha corta, el texto del día, la cuenta regresiva y el botón "Agendar" se calculan a partir de ella.
- `lugar`, `direccion`, `referencia`, `mapsUrl`
- `youtubeVideoId`: música de fondo (vacío = sin música)
- `rsvpEndpoint`: dónde se guardan las confirmaciones (ver punto 5)
- textos de la galería, del álbum de fotos y de los modales (vestimenta, tips, regalos)

También actualiza `<title>` y las etiquetas `og:` en `index.html` (es lo que se ve al compartir el link por WhatsApp).

## 2. Imágenes

Ver `public/img/LEEME.txt`. En resumen: `foto-cumple.jpg`, `plim-hero.png`, `plim-saludo.png`, `plim-bienvenida.png` y las fotos de `galeria/`. Si falta alguna, no se muestra (sin íconos de imagen rota).

## 3. Invitados

Edita `db/invitados.json`:

```json
{ "nombre": "JUAN", "apellidos": "PÉREZ", "codigoInvitacion": "AB12CD" }
```

El link personalizado de cada invitado es:

```
https://danielqg93.github.io/invitacion-plimplim/#/AB12CD
```

## 4. Itinerario

Edita `db/itinerario.json`. Íconos disponibles: `calendar`, `pin`, `check`, `music`, `paint`, `food`, `party`, `balloon`, `dress`, `info`, `gift`, `instagram`, `heart`, `star`.

## 5. Confirmaciones de asistencia

- **Local (`bun run dev`) y Netlify:** `rsvpEndpoint: "/api/confirmaciones"` guarda en `db/confirmarAsistencia.json`. En Netlify ese archivo no es permanente, así que se recomienda usar Google Sheets.
- **GitHub Pages:** no tiene servidor. Crea tu propio Google Apps Script (con su propia hoja) y pon su URL `https://script.google.com/macros/s/.../exec` en `rsvpEndpoint`.

## Comandos

```bash
bun install
bun run dev      # http://localhost:5173/invitacion-plimplim/
bun run lint
bun run build
```

Al hacer push a `master`, GitHub Actions publica en GitHub Pages (`.github/workflows/deploy-pages.yml`).

> Las imágenes y la marca Plim Plim pertenecen a sus dueños. Úsalas solo para esta invitación personal.
