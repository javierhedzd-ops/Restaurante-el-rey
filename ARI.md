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
- `catrina-nicho.webp` — la catrina del mural del local, dentro del nicho de
  arco de la portada (`.muro`, dentro de `main`).
- `arte/` — de dónde sale: `catrina-weave.jpg` (su mural repintado con Weave) e
  `integrar.py` (la exporta a `catrina-nicho.webp`). Ver "Toque de catrina".
- `fotos/` — fotos propias con nombres fijos; la lista está en `fotos/LEEME.md`.
  Si falta una, la página muestra el hueco vacío.
- `pruebas/web.test.js` — pruebas sin dependencias.

## Computadora (pantallas de 1000 px o más)
Dos columnas: arriba catrina | portada; abajo vitrina y restaurante | carta
(`grid-template-areas` en `main.container`, clases `.s-portada`, `.s-vitrina`,
`.s-carta`, `.s-resto`). En celular y tableta, una sola columna.

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
- La catrina va dentro de un **nicho de arco** (como los nichos pintados en las
  paredes): contorno negro y sombra mostaza como las tarjetas, franja de
  talavera mostaza alrededor, filete interior y sombra adentro para que se
  sienta hundido. Una monarca quieta posada en el filo del arco, arriba a la
  derecha (`.muro-mariposa`, alas `arte/monarca-izq.webp` y `-der.webp`). Así el corte
  de la imagen (cabello arriba, barbilla abajo) se ve intencional y no
  recortado (Javi: "que no se vea cortada"). Aparece despacio. Se probaron
  desvanecidos en los bordes y sombreados: se veían pegados y cortados.
- La actual es la de Weave (su mismo mural repintado), a tamaño completo y
  más chica (Javi: "esa sí se veía bien"). Se probó una generada con Figma IA
  (solo texto) y no le gustó: se veía genérica, no era su catrina.
- Cómo se hizo: Weave (Figma) con el modelo Nano Banana Pro, 2K, 3:2, foto del
  mural como referencia; se borró el cable con OpenCV → `arte/catrina-weave.jpg`;
  `python3 arte/integrar.py` → `catrina-nicho.webp`. Weave ya pide plan de pago
  (las 2 corridas gratis se usaron).
- El mural sigue por la pared, con pocas piezas y siempre detrás del contenido
  (Javi: cuidar limpieza y amplitud, no saturar): un cempasúchil grande
  asomando arriba de la tarjeta del restaurante;
  ya no hay flor en el pie (Javi). Clase `.pintura`; imágenes en `arte/`
  (`flor-tallo.webp`),
  recortadas de una segunda imagen de Weave (mismo modelo, la catrina como
  referencia).
- Se probó una monarca que volaba por la carta y se posaba en los botones; se
  quitó: en una taquería distrae del pedido. No poner animaciones decorativas.
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
