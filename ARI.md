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
- `catrina-mural.webp` — la catrina del mural del local, repintada con IA y con
  la pared transparente. Va arriba de la página (`.muro`), pintada en la pared.
- `arte/` — de dónde sale: `catrina-weave.jpg` (lo que pintó la IA, ya sin el
  cable) e `integrar.py` (la vuelve `catrina-mural.webp`). Ver "Toque de catrina".
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
Sale del mural del local. Regla de Javi: **integrado, no pegado**, y con acabado
de artista profesional.
- El fondo de la página es la pared y la catrina está pintada en ella
  (`catrina-mural.webp`): sin franja ni rectángulo, la pintura se pierde suave en
  la pared; la parte de arriba queda detrás del encabezado y la portada encima.
- Cómo se hizo (para repetirlo):
  1. Weave (Figma) con el modelo **Nano Banana Pro**, 2K, proporción 3:2, ~11
     créditos de Weave. Imagen de referencia: el mural (URL pública de GitHub).
     Prompt: repintar el mural como mural profesional, mismo diseño, sobre pared
     crema lisa `#FAF5EA`, sin fondo negro, bordes que se pierden con aerógrafo.
  2. Bajar la imagen (`s3-alpha-sig.figma.com`, ya permitido en el entorno de
     Claude Code) y borrar el cable que copió de la foto (inpaint con OpenCV).
     Resultado: `arte/catrina-weave.jpg`.
  3. `python3 arte/integrar.py` → `catrina-mural.webp` (pared transparente; la
     cara blanca se mantiene sólida con un contorno trazado a mano).
- El mural sigue por la pared, con pocas piezas y siempre detrás del contenido
  (Javi: cuidar limpieza y amplitud, no saturar): monarca junto al título de la
  carta, cempasúchil grande asomando arriba de la tarjeta del restaurante;
  ya no hay flor en el pie (Javi). Clase `.pintura`; imágenes en `arte/`
  (`flor-tallo.webp`, `flor-boton.webp`, `monarca-izq.webp`, `monarca-der.webp`),
  recortadas de una segunda imagen de Weave (mismo modelo, la catrina como
  referencia).
- La monarca vuela de verdad (`#monarca`, JS "Mariposa monarca", a nivel de
  página): empieza en la pared junto al título de la carta, revolotea a 2-3
  botones que se vean y baja a posarse en el cempasúchil del restaurante, donde
  descansa 30-50 s y vuelve a empezar. Vuelo calculado cuadro por cuadro para que
  no sea robótico: rumbo que titubea, el cuerpo sube con cada aleteo, ritmo de
  aleteo variable, planeos cortos, gira hacia donde va, frena y revolotea antes
  de posarse; posada abre y cierra las alas despacio y sin ritmo fijo. Si tocan
  el botón donde está, se espanta. Solo se mueve con la carta o la flor en
  pantalla; con "reducir movimiento" se queda quieta.
- Talavera en línea, tono sobre tono, muy tenue en el fondo de toda la página.
- Los puntitos que rodean los ojos de la catrina, en el filo del encabezado.
- NO hacer catrinas dibujadas con código (SVG, Blender por script): se probaron
  y quedaron de caricatura.

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
