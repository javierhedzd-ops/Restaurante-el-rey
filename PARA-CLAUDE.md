# Encargo para Claude Code: web de Carnitas Michoacán El Rey

Este archivo lo escribe Ari (la agente de Javi en Termux) para que Claude Code
retome el trabajo de la web sin tener que reconstruir el contexto. Léelo entero
antes de tocar nada.

## Qué es este proyecto

Web de **Carnitas Michoacán El Rey** (Chuminópolis, Mérida, Yucatán). HTML, CSS y
JS a mano, sin frameworks ni CDN. Menú, horario, carrito y pedido por WhatsApp.

- Carpeta: `~/restaurante-el-rey`
- Reglas del proyecto: `ARI.md` (léelo; manda sobre este archivo en lo que choque)
- Dirección de arte: `DESIGN.md`
- Datos del negocio (precios, horario, teléfonos, FAQ): `datos.js`
- Lógica pura: `logica.js` · DOM: `main.js` · Estilos: `styles.css`
- Pruebas: `pruebas/` (52 pruebas, todas en verde ahora mismo)

## Estado actual (23 oct 2026)

Hay **dos versiones** en el repo:

1. `index.html` + `styles.css` + `main.js` en la raíz: la web "de verdad",
   con carrito, pedido por WhatsApp, preguntas frecuentes y galería.
2. `maqueta/`: copia de trabajo donde Ari está haciendo un rediseño de la carta
   (carta de una columna con puntos, hero a dos columnas con la foto sangrando,
   galería en mosaico, sección "Arma tu kilo", "Visítanos" con mapa SVG).

**Cambios sin commitear** (los hizo Ari, están probados con `npm test` en verde):

- `datos.js`: precios de kilos y preguntas frecuentes.
- `index.html`, `main.js`, `logica.js`, `styles.css`: sección de preguntas
  frecuentes con `<details>` y ajustes de la carta.
- `pruebas/interfaz.test.js`: prueba nueva de las preguntas frecuentes.
- `maqueta/index.html`, `maqueta/styles.css`: rediseño (carta, "Arma tu kilo",
  "Visítanos", cierre de carta). Incluye el arreglo del detector `lopsided`
  (la foto de `.cazo__foto` se estira con `align-self: stretch` y
  `min-height: 22rem`; en tableta `.cazo` va a dos columnas iguales).
- `maqueta/fotos/mapa.svg`: mapa dibujado a mano (sin CDN, sin red).

Archivos temporales que **no** deben subirse: `maqueta/.probe-*.mjs`,
`maqueta/_vis.html`, `maqueta/.taste-skill/`, `ari-bg.log`, `servidor.log`.

## Lo que falta (lo que te toca)

### 1. Terminar la maqueta y pasarla a la web real

**Hecho por Ari (ronda 1, 23 oct 2026):**

- Las **3 secciones vacías** de `maqueta/` ya tienen contenido. La maqueta tiene
  8 secciones: `inicio`, `cazo`, `menu`, `nosotros`, `preguntas`, `galeria`,
  `reservas`, `visitanos`.
- Detector `lopsided` arreglado: ya cuenta la foto de `.cazo__foto`.
- `npm test` en verde (49/49) y `ari-web-check` en verde.

**Lo que te toca:**

- Revisar visualmente "Visítanos" y "Nosotros" con `inspect.mjs` (ver sección 2)
  en 390px y 1280px: que el mapa SVG y el bloque de llamada al pedido no se
  corten ni se salgan.
- **Portar** los cambios de `maqueta/` a la raíz (`index.html`, `styles.css`,
  `main.js`) sin romper el carrito ni las pruebas. La raíz es la que se sirve en
  `http://192.168.1.156:8092/`; la maqueta, en el 8097.
- Al terminar: `npm test` y `~/bin/ari-web-check` en verde, y apuntar en
  `ARI.md` lo que cambie de costumbres.

**Hecho por Claude (24 oct 2026), rama `ari/rediseno-cazo`:**

- Revisión en Chromium de "Visítanos" y "Nosotros" a 390 y 1280 px: nada se
  corta ni se sale (sin scroll horizontal, sin piezas fuera de pantalla, sin
  solapes, imágenes cargadas). De paso se arregló:
  - El aviso flotante ("… añadido") se asomaba vacío al pie de la pantalla
    (pastilla oscura de 42×22 px): ahora, escondido, también es transparente.
  - El mapa en el teléfono tenía letras de 6 px: en pantallas de 560 px o menos
    se recorta (5:4) hacia el pin y la etiqueta. Es un enlace a Google Maps.
  - El mapa traía calles inventadas ("Calle 93", "Calle 95", "Calle 16"; el
    93-F es el número, no una calle) y una flecha de norte sin confirmar: se
    quitaron. Solo queda la Calle 14.
  - `taqueria.jpg` es la fachada de "Taquería Medina" en Isla Mujeres y se
    usaba en Nosotros y Reservas como si fuera el local. Ahora van
    `carnitas-michoacan.jpg` (Nosotros) y `salsas.jpg` (Reservas).
- Portado a la raíz: `index.html` y `styles.css` de la maqueta, y
  `fotos/mapa.svg`. Los JS de la raíz eran más nuevos (normalizarCarrito,
  reservas que se limpian, aviso antes de repintar) y se quedaron; se copiaron
  a `maqueta/` para que las dos versiones sean iguales.
- Prueba nueva `pruebas/coherencia.test.js` (precios y teléfonos del HTML contra
  `datos.js`, y que existan todas las fotos). `npm test`: 52/52.
- Carrito y pedido por WhatsApp probados en Chromium de verdad: se añade, el
  aviso sale y se va, el carrito abre y el enlace de WhatsApp lleva el pedido.
- Temporales fuera del repo (`.gitignore`). Siguen en el historial por si hacen
  falta: `git show b3285a9:maqueta/.probe-nosotros.mjs`.

**Para que confirme Javi (no se tocaron, son datos del negocio):**

- El enlace de Facebook de `datos.js` es la página "EL REY Suc Canek", no la de
  Chuminópolis: ¿es la correcta?
- `½ kg surtido` cuesta $240 y `1 kg surtida` $238: medio kilo sale más caro que
  el kilo. ¿Es así?
- `puesto.jpg` ("Local Carnitas Teremar") y `mercado.jpg` ("Carnitas Doña Lulú")
  son de otros negocios y salen en la carta. Lo ideal: fotos propias.
- El repositorio en GitHub es público: se ven `ARI.md`, este archivo y el
  historial. Si no hace falta para GitHub Pages, mejor privado.

### 2. Herramientas que Ari ya usó (verificadas en este equipo)

Ari trabaja en **Termux aarch64** (Android). Esto es lo que comprobó de verdad,
con sus comandos, para que no lo busques otra vez:

- **Chromium SÍ está instalado**: `/data/data/com.termux/files/usr/bin/chromium-browser`.
  No hace falta Playwright ni `pkg install chromium`.
- **Skill `design-taste-frontend`** (en `~/ari-skills/design-taste-frontend/`),
  sin dependencias, habla con Chromium por CDP (`scripts/lib/cdp.mjs`, que ya
  busca `/usr/bin/chromium-browser`):
  - `node ~/ari-skills/design-taste-frontend/scripts/inspect.mjs index.html --widths 390,768,1280 --out .taste-skill/inspect`
    → renderiza, mide y fotografía; sale con código 1 si hay algo FAIL.
  - `node ~/ari-skills/design-taste-frontend/scripts/lint.mjs .` → escaneo
    estático de lo que la skill prohíbe (sin navegador, rápido).
  - `node ~/ari-skills/design-taste-frontend/scripts/draw.mjs --show` → la
    dirección de arte sorteada que se guardó en `.taste-skill/direction.json`.
  - **Lánzalos con `~/bin/ari-bg "descripción" comando...`**: abren Chromium y
    en el teléfono tardan; en primer plano se cortan.
- **Sondas propias** de Ari en `maqueta/.probe-*.mjs` (lopsided, menú, vacíos,
  "nosotros"): importan `lib/cdp.mjs` y evalúan JS en la página para medir cajas
  de texto, medios y controles. Sirven de plantilla para nuevas comprobaciones.
- **jsdom**: ya está en `node_modules`; es lo que usan las pruebas de interfaz.
- **`~/bin/ari-web-check`**: pruebas + que el servidor responda 200 en `/`,
  `styles.css`, `main.js`, `datos.js`, `logica.js` + que el CSS servido lleve
  `[hidden]`.
- **`Captura` / `Ver`** (herramientas de Ari): foto de la página y revisión con
  ojos de diseñador.
- Si instalas algo nuevo, apúntalo en `ARI.md`, sección "Notas de este equipo".

### 3. Datos del restaurante "en tiempo real"

La web es estática y **no puede** llamar a Google Places ni a ninguna API con
clave desde el navegador (la clave quedaría a la vista). Lo que sí se puede:

- **Horario y "abierto ahora"**: ya se calculan en `logica.js` con
  `NEGOCIO.zonaHoraria` (`America/Merida`) y `NEGOCIO.horario`. Revisar que el
  cálculo sea correcto y que se actualice solo cada minuto.
- **Estado del negocio en vivo** (cerrado por día festivo, se acabó la carnita,
  tiempo de espera): un archivo `estado.json` en la misma carpeta que la web,
  que el dueño o Ari actualicen. La web lo lee con `fetch` cada minuto y muestra
  un aviso. Sin claves, sin servicios de fuera, funciona sin red externa.
- **Reseñas y fotos de Google**: si Javi quiere, se hace con un script de Ari
  (o un Zap de Zapier) que consulte Google Places **desde el servidor** y
  escriba `resenas.json`; la web solo lee ese archivo. Nunca la clave en el
  navegador.
- **Datos de contacto y redes**: ya están en `datos.js` (teléfonos, dirección,
  Google Maps, Instagram, Facebook). Si hay que verificarlos, se hace a mano
  contra el perfil de Google del negocio; no inventar teléfonos ni horarios.

### 4. Pruebas

- `npm test` debe seguir en verde (52 pruebas ahora).
- `~/bin/ari-web-check` comprueba que el servidor responde 200 en `/`,
  `styles.css`, `main.js`, `datos.js`, `logica.js` y que el CSS servido lleva
  la regla `[hidden]`.
- Si añades `estado.json`, añade prueba de que la web lo lee y de que, si no
  existe o falla, la web sigue funcionando (sin aviso).
- **No cambies los valores esperados de las pruebas existentes** para que pasen.

## Cómo se ejecuta

```bash
cd ~/restaurante-el-rey
python3 -m http.server 8092 --bind 0.0.0.0   # web real
cd maqueta && python3 -m http.server 8097 --bind 0.0.0.0   # maqueta (8090-8096 son de Ari)
```

Desde el teléfono: `http://192.168.1.156:8092/` (comprobar la IP con `ifconfig`
antes de darla; ha cambiado más de una vez). La maqueta, en el 8097.

## Costumbres

- Textos en español, tono directo, sin promesas que no se puedan probar.
- Un solo color de acento: azul hielo `#7fd4ff` en la web de Ari; en esta web
  manda `DESIGN.md`.
- CSS con `@layer` (reset, base, componentes, utilidades).
- Lógica de negocio en `logica.js` (pura, testeable); DOM solo en `main.js`.
- Commits en español, en imperativo.
- Nada de CDN ni fuentes externas: la página tiene que cargar sin red.

## Condiciones para que Ari se actualice sola (importante)

Ari vive en este mismo teléfono, en `~/ari-assistant/agente`, y corre con PM2
(`ari-agente`). Para que lo que hagas le llegue sin que Javi tenga que traducirlo
a mano, cumple esto:

1. **Deja el repo limpio y en una rama con nombre claro** (`ari/<tema>` o la que
   use Javi). Nada de cambios sueltos sin commitear: Ari lee el árbol de trabajo
   y un `git status` sucio le hace dudar de qué es suyo y qué es tuyo.
2. **Apunta lo que cambias en `ARI.md`** (costumbres y notas del equipo) y en
   `docs/ARI_ESTADO.md` si tocas algo de Ari. Ari lee esos archivos al empezar
   cada tarea: es su única forma de enterarse.
3. **No toques `~/ari-assistant/agente` desde aquí.** Si necesitas un cambio en
   Ari (una herramienta, un permiso, un detector), descríbelo en la sección
   "Peticiones a Ari" de este archivo y Javi decide.
4. **Deja los comandos de comprobación funcionando tal cual**: `npm test` y
   `~/bin/ari-web-check`. Si añades uno nuevo, documéntalo con la ruta completa.
5. **Nada de procesos en primer plano largos**: si lanzas Chromium o un servidor,
   que sea con `~/bin/ari-bg "descripción" comando...` y dejando la salida en
   `ari-bg.log`.
6. **No inventes datos del negocio** (precios, teléfonos, horarios): salen de
   `datos.js` y los confirma Javi.

## Peticiones a Ari (las escribe Claude, las decide Javi)

- **Comprobación de secciones en la skill de diseño.** Las sondas
  `.probe-*.mjs` eran de usar y tirar. Propuesta: un `scripts/secciones.mjs` en
  `design-taste-frontend` que, para cada `#id` que se le pase y cada ancho, diga
  si hay scroll horizontal, piezas fuera de la pantalla, contenido recortado
  (`scrollWidth > clientWidth` con overflow oculto), hijos que se pisan e
  imágenes que no cargan, y saque una captura de la sección sin la cabecera fija
  (si no, la tapa). Es lo que se usó el 24/10 para revisar Visítanos y Nosotros.
- **Elementos fijos que se asoman.** Que `inspect.mjs` avise de elementos
  `position: fixed` visibles y sin texto (así se habría visto antes la pastilla
  vacía del aviso).
