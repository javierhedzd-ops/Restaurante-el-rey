# restaurante-el-rey

Web de Carnitas Michoacán El Rey (Chuminópolis, Mérida). HTML, CSS y JS a mano,
sin frameworks ni CDN. Menú, horario, carrito y pedido por WhatsApp.

## Cómo se ejecuta
- Servir: `cd ~/restaurante-el-rey && python3 -m http.server 8092 --bind 0.0.0.0`
  (en segundo plano: `ari-bg "web" python3 -m http.server 8092 --bind 0.0.0.0`)
- Abrir: `http://192.168.1.156:8092/` (desde el teléfono o la red local; la IP
  cambia, comprobarla con `ifconfig`).
  Ojo: con `--bind 127.0.0.1` no se ve desde el navegador del teléfono.
- Maqueta (rediseño en `maqueta/`): `cd maqueta && python3 -m http.server 8094 --bind 0.0.0.0`
  → `http://192.168.1.156:8094/`. El 8093 es del guardián de Ari: no usarlo.

## Cómo se comprueba
- `npm test` — 49 pruebas: lógica pura (`pruebas/logica.test.js`), interfaz en
  jsdom (`pruebas/interfaz.test.js`) y CSS (`pruebas/estilos.test.js`).
- `~/bin/ari-web-check` — todo en uno: pruebas + que el servidor responda 200
  en `/`, `styles.css`, `main.js`, `datos.js`, `logica.js` + que el CSS servido
  lleve la regla `[hidden]`. Sale con código 0 si todo está bien.
  Uso: `ari-web-check [url]` (por defecto `http://127.0.0.1:8092/`).

después de editar: npm test

## Qué no tocar
- Los valores esperados de `pruebas/logica.test.js` para "hacer pasar" un
  cambio: si un cambio los rompe, se avisa y se decide si era el correcto.
- `node_modules/` ni `servidor.log` en el repo.

## Costumbres
- Textos en español, tono directo.
- Lógica de negocio en `logica.js` (pura, testeable); DOM solo en `main.js`.
- CSS con `@layer` (reset, base, componentes, utilidades).
- Commits en español, en imperativo.

## Notas de este equipo (Termux aarch64)
- jsdom no calcula CSS: las pruebas de interfaz comprueban el atributo `hidden`
  y el contenido, no si algo se ve. Para el CSS está `pruebas/estilos.test.js`,
  que lee `styles.css` como texto.
- En el arnés (`pruebas/arnes.js`) los tres archivos se ejecutan dentro de una
  `new Function`: con `window.eval` las `const` de nivel superior no quedan como
  propiedades de `window` y `main.js` no veía `NEGOCIO`.
- Cada prueba cierra su ventana de jsdom en `afterEach`; si no, quedan
  temporizadores vivos y `node --test` no termina nunca.
- Playwright no está instalado (no hay navegador): los e2e de verdad quedan
  pendientes para CI.
