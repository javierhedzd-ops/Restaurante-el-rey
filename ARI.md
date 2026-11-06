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
- `fotos/` — fotos propias con nombres fijos; la lista está en `fotos/LEEME.md`.
  Si falta una, la página muestra el hueco vacío.
- `pruebas/web.test.js` — pruebas sin dependencias.

## Paleta (sale del logo)
Mostaza `#D9942A` (escudo), negro café `#22150E` (contornos), madera `#875628`,
rojo `#D7261E` de los flyers. Encabezado negro café con filo mostaza; tarjetas
con contorno negro y sombra mostaza desplazada (Javi la quiso así).

## Cómo se ejecuta
- Servir: `cd ~/restaurante-el-rey && python3 -m http.server 8092 --bind 0.0.0.0`
  (en segundo plano: `ari-bg "web" python3 -m http.server 8092 --bind 0.0.0.0`)
- Abrir: `http://192.168.1.156:8092/` (la IP cambia, comprobarla con `ifconfig`).
  Con `--bind 127.0.0.1` no se ve desde el navegador del teléfono.
  No usar 8090-8096 ni 8082: son de Ari.

## Cómo se comprueba
- `npm test` — 7 pruebas: el JS compila, existen los archivos que pide la
  página, no carga nada de fuera, el menú es coherente (ids únicos, foto y
  precio válidos), el teléfono del pie es el de WhatsApp, el horario escrito
  coincide con `HORARIO`, y está la regla `[hidden]`.
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
