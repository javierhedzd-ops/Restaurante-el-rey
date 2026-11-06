# Encargo para Claude Code: web de Carnitas Michoacán El Rey

Léelo junto con `ARI.md`, que manda en lo que choque.

## Estado (6 nov 2026)

Javi pidió reemplazar la web publicada por una versión nueva, hecha en una
sesión de Claude Code a partir de su propio HTML y de los flyers del
restaurante. Lo que cambió respecto a la versión del cazo:

- Todo vive en `index.html` (CSS y JS dentro). Ya no existen `datos.js`,
  `logica.js`, `main.js`, `styles.css`, `admin.*`, `editor.js`, `maqueta/` ni
  las 52 pruebas de jsdom. Están en el commit `14ff34c` por si hacen falta.
- Logo: PNG recortados del logo original (`logo-escudo.png`, `logo-completo.png`).
- Paleta tomada del logo (ver `ARI.md`).
- Carrusel con todo el menú (flechas y deslizar); al tocarlo abre la galería.
- Pedido: botones − y +, hoja con nombre, recoger o domicilio, dirección y
  notas; el mensaje de WhatsApp sale ordenado.
- Ya no hay panel del dueño. Javi está enseñándole al dueño una demostración
  (cambiar precios y fotos, guardado solo en su dispositivo). Si le gusta, se
  hará un panel de verdad; la opción hablada fue Supabase (gratis, con fotos).

## Cómo se ejecuta

```bash
cd ~/restaurante-el-rey
python3 -m http.server 8092 --bind 0.0.0.0
npm test
```

Desde el teléfono: `http://192.168.1.156:8092/` (comprobar la IP con `ifconfig`).

## Condiciones para que Ari se actualice sola (importante)

Ari vive en este mismo teléfono, en `~/ari-assistant/agente`, y corre con PM2
(`ari-agente`). Para que lo que hagas le llegue sin que Javi tenga que traducirlo
a mano, cumple esto:

1. **Deja el repo limpio y en una rama con nombre claro** (`ari/<tema>` o la que
   use Javi). Nada de cambios sueltos sin commitear.
2. **Apunta lo que cambias en `ARI.md`** (costumbres y notas del equipo) y en
   `docs/ARI_ESTADO.md` si tocas algo de Ari. Ari lee esos archivos al empezar
   cada tarea: es su única forma de enterarse.
3. **No toques `~/ari-assistant/agente` desde aquí.** Si necesitas un cambio en
   Ari, descríbelo en "Peticiones a Ari" y Javi decide.
4. **Deja los comandos de comprobación funcionando tal cual**: `npm test` y
   `~/bin/ari-web-check`. Si añades uno nuevo, documéntalo con la ruta completa.
5. **Nada de procesos en primer plano largos**: si lanzas Chromium o un servidor,
   que sea con `~/bin/ari-bg "descripción" comando...` y dejando la salida en
   `ari-bg.log`.
6. **No inventes datos del negocio** (precios, teléfonos, horarios): los
   confirma Javi.

## Peticiones a Ari (las escribe Claude, las decide Javi)

- **Actualizar `~/bin/ari-web-check` a la web nueva.** Hoy pide `styles.css`,
  `main.js`, `datos.js` y `logica.js` (ya no existen) y busca la regla
  `[hidden]` en `styles.css`. Propuesta: que compruebe `npm test` y que el
  servidor responda 200 en `/`, `/logo-escudo.png`, `/logo-completo.png`,
  `/favicon.png`, `/fuentes/inter-tight.woff2` y `/fuentes/jetbrains-mono.woff2`
  (la regla `[hidden]` ya la comprueba `npm test` dentro de `index.html`).
- Las peticiones anteriores sobre `DESIGN.md` y el inspector del rediseño del
  cazo quedan sin efecto: esa versión ya no está publicada.
