# Cómo cambiar las fotos de la web

Ahora la web usa fotos libres de Wikimedia Commons (con su crédito). Están
pensadas para cambiarse por fotos propias del restaurante cuando las haya.

## Las fotos de la página: un hueco con nombre fijo

| Hueco | Archivo | Dónde sale | Forma que mejor queda |
|---|---|---|---|
| `portada` | `fotos/sitio/portada.jpg` | Lo primero que se ve, a la derecha | Vertical, 1280 px de ancho o más |
| `arma-tu-kilo` | `fotos/sitio/arma-tu-kilo.jpg` | Al lado del armador del kilo | Vertical (4:5) |
| `nosotros` | `fotos/sitio/nosotros.jpg` | Sección Nosotros | Horizontal (3:2) |
| `galeria-1` | `fotos/sitio/galeria-1.jpg` | Galería, la grande | Vertical o cuadrada |
| `galeria-2` … `galeria-6` | `fotos/sitio/galeria-N.jpg` | Galería | Cualquiera (se recorta al centro) |
| `reservas` | `fotos/sitio/reservas.jpg` | Junto al formulario de reservas | Vertical u horizontal |

### Cambiar una (3 pasos)

1. Pon la foto nueva en `fotos/sitio/` **con el mismo nombre** (por ejemplo,
   tu foto del cazo como `fotos/sitio/portada.jpg`). JPEG, de 1–2 MB como mucho.
2. En `datos.js`, en `FOTOS`, corrige ese hueco:
   - `alt`: qué se ve en la foto (para quien no ve la imagen).
   - `pie`: el texto debajo de la foto, o `""` para no poner pie.
   - `credito`: `null` si la foto es vuestra; si es de otra persona,
     `"Autor · Licencia"`.
3. En Termux: `npm run fotos` (deja `index.html` al día: medidas, textos y
   créditos del pie de página) y después `npm test`.

Si prefieres otro nombre de archivo, cambia también `src` en `FOTOS`.

## Las fotos de los platos

Están en `datos.js`, en cada plato de `PLATOS`, en el campo `foto`
(`src`, `alt`, `credito`). Pon la foto en `fotos/`, cambia esos tres datos y
listo: la carta las pinta sola. Después corre `npm run fotos` para que los
créditos del pie de página se actualicen.

## Reglas

- Solo fotos del restaurante tomadas por vosotros o cedidas por el dueño, o
  fotos libres con su crédito. Las que suben clientes a Google Maps son suyas.
- Nada de fotos de otros negocios (letreros o fachadas ajenas).
- Si se cambia una foto de Wikimedia por una propia, quítala también de
  `fotos/CREDITOS.md`.
