# restaurante-el-rey

Web de Carnitas Michoacán El Rey (Chuminópolis, Mérida). Un solo `index.html`
con su CSS y JS dentro, sin frameworks ni CDN. Menú, carrusel con galería,
horario que dice solo si está abierto, carrito y pedido por WhatsApp.

**6/11/2026: la web se reemplazó por una versión nueva** (decisión de Javi).
La versión anterior (rediseño del cazo, `datos.js`, `admin.html`, maqueta, 52
pruebas) sigue en el historial: commit `14ff34c`. Para verla:
`git show 14ff34c:index.html` o `git checkout 14ff34c -- <archivo>`.

## Archivos
- `index.html` — toda la página. Arriba del `<script>` está la sección
  **CONFIGURACIÓN**: `WHATSAPP`, `HORARIO`, `MENU` (precios) y `VITRINA_PRIMERO`.
  Precios, platillos y horario se cambian ahí y en ningún otro sitio.
- `logo-escudo.png` (encabezado), `logo-completo.png` (pie, con "PURO SABOR
  MEXICANO"), `favicon.png` — recortados del logo original de los flyers.
- `fuentes/` — Inter Tight y JetBrains Mono (woff2, solo latín) servidas desde
  aquí: nada de Google Fonts.
- `catrina-mural.webp` — el mural de la catrina del local recortado de la única
  foto que hay (7/11/2026), con bordes de aerosol y fondo transparente. Va
  arriba de la página (`.muro`), pintado sobre la pared.
- `fotos/` — fotos propias con nombres fijos; la lista está en `fotos/LEEME.md`.
  Si falta una, la página muestra el hueco vacío.
- `pruebas/web.test.js` — pruebas sin dependencias.

## Idiomas (español e inglés)
- Botón ES/EN en el encabezado. Abre en inglés si el teléfono está en inglés,
  recuerda lo que elige cada quien (`localStorage`: `rey_idioma`) y se puede
  forzar con `?lang=en` o `?lang=es`.
- Textos fijos: atributo `data-en` (y `data-en-alt`, `data-en-placeholder`,
  `data-en-aria-label`) junto al texto en español.
- Textos que arma el código: objeto `TXT` (mismas claves en `es` y `en`).
- Carta: `n_en` / `d_en` en cada platillo y `titulo_en` / `nota_en` /
  `etiqueta_en` en cada sección, dentro de `MENU`. Si se agrega un platillo hay
  que ponerle su inglés (lo revisa `npm test`). Los nombres típicos (maciza,
  Reyna, chilaquiles, buche...) se dejan en español.
- El mensaje de WhatsApp siempre va en español (lo lee el restaurante); si el
  cliente usó inglés, el mensaje lo avisa.
- El modo dueño solo está en español.

## Modo dueño (demostración)
- Se abre añadiendo `#dueno` a la dirección: `…/Restaurante-el-rey/#dueno`.
  Los clientes no ven ningún botón.
- Permite cambiar precios (en la carta y la galería) y poner fotos (portada,
  carrusel, restaurante y galería). Se guarda **solo en el navegador de quien lo
  usa** (`localStorage`: `rey_demo_precios`, `rey_demo_fotos`); los clientes
  siguen viendo los precios de `MENU` y las fotos de `fotos/`.
- Es para que el dueño lo pruebe. Si le gusta, el panel de verdad (que todos
  vean los cambios) necesita un servicio con base de datos; se habló de Supabase.

## Paleta (sale del logo)
Mostaza `#D9942A` (escudo), negro café `#22150E` (contornos), madera `#875628`,
rojo `#D7261E` de los flyers. Encabezado negro café con filo mostaza; tarjetas
con contorno negro y sombra mostaza desplazada (Javi la quiso así).

### Toque de catrina (7/11/2026)
Sale del mural del local. Regla de Javi: **integrado, no pegado**.
- El fondo de la página es la pared y la catrina está pintada en ella:
  `catrina-mural.webp` con bordes de aerosol (puntos de lata), `mix-blend-mode:
  multiply` para que tome el tono de la pared. Nada de franjas ni rectángulos.
  La portada queda encima y deja ver los ojos.
- Piso de talavera en línea, tono sobre tono: muy tenue en el fondo de toda la
  página, un poco más marcado en los huecos de foto y en el pie.
- Los puntitos que rodean los ojos de la catrina, en el filo del encabezado.
- Las catrinas dibujadas (SVG a mano y grafiti hecho con Blender por código) no
  dieron el nivel del mural. No volver a ponerlas.
- Si consiguen una foto mejor del mural (de frente, buena luz, sin sillas),
  rehacer `catrina-mural.webp` con el mismo encuadre y bordes de aerosol.

## Cómo se ejecuta
- Servir: `cd ~/restaurante-el-rey && python3 -m http.server 8092 --bind 0.0.0.0`
  (en segundo plano: `ari-bg "web" python3 -m http.server 8092 --bind 0.0.0.0`)
- Abrir: `http://192.168.1.156:8092/` (la IP cambia, comprobarla con `ifconfig`).
  Con `--bind 127.0.0.1` no se ve desde el navegador del teléfono.
  No usar 8090-8096 ni 8082: son de Ari.

## Cómo se comprueba
- `npm test` — 9 pruebas: el JS compila, existen los archivos que pide la
  página, no carga nada de fuera, el menú es coherente (ids únicos, foto y
  precio válidos), el teléfono del pie es el de WhatsApp, el horario escrito
  coincide con `HORARIO`, está la regla `[hidden]`, cada platillo tiene su inglés y `TXT` tiene las
  mismas claves en los dos idiomas.
- `~/bin/ari-web-check` **hay que actualizarlo**: comprueba `styles.css`,
  `main.js`, `datos.js` y `logica.js`, que ya no existen. Ver "Peticiones a Ari"
  en `PARA-CLAUDE.md`.

después de editar: npm test

## Skills y plugin de diseño en el repositorio (para Claude Code)
- En `.claude/skills/` (las carga cualquier sesión de Claude Code en este repo):
  `design-taste-frontend` (tasteskill v2, Leonxlnx/taste-skill), `impeccable`
  (pbakaus/impeccable) y las de Emil Kowalski (emilkowalski/skill):
  `emil-design-eng`, `animate`, `improve-animations`, `review-animations`,
  `find-animation-opportunities`, `animation-vocabulary`, `animation-performance`,
  `break-ui`, `apple-design` y `prototype`. Copiadas tal cual el 24/10/2026.
- `.claude/settings.json` activa el plugin oficial `figma@claude-plugins-official`
  (necesita que Javi conecte su cuenta de Figma la primera vez).
- Las reglas de este proyecto mandan sobre las skills: nada de CDN ni fuentes
  externas.

## Fotos
- Solo de comida o del local propio. Nada de fotos de clientes de Google Maps
  sin permiso ni de otros negocios.
- Reducirlas a unos 1200 px de ancho antes de subirlas.

## Costumbres
- Textos en español, tono directo.
- Commits en español, en imperativo.
- No inventar datos del negocio (precios, teléfonos, horarios): los da Javi.
  Los actuales salen de los flyers que mandó el 6/11/2026: ½ kg y kilo,
  Promokilo $409, tacos $35 (surtidos $28), desechable +$10 (solo aviso),
  abre 12:30 PM y cierra 11:50 PM, martes cerrado.
- Los temporales (`ari-bg.log`, `.taste-skill/`, `.probe-*.mjs`, `_vis.html`)
  están en `.gitignore`; no se suben.
