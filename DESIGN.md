# DESIGN.md — Carnitas Michoacán El Rey

Sistema de diseño de la web del restaurante. Sigue el patrón de los `DESIGN.md`
de Open Design: un archivo de texto que fija tokens, componentes y anti-patrones
para que cualquier cambio salga con la misma cara y no se improvise.

Si algo de aquí choca con lo que pide el dueño, se cambia **aquí primero** y
después en el CSS. El CSS no inventa valores sueltos.

---

## 1. Concepto

**"Carnicería de barrio, puesta en orden."** Cálido, de manteca y comal, pero
con la limpieza de una carta bien impresa. Nada de plantilla genérica de
restaurante: ni fotos de stock, ni degradados morados, ni iconos de Font Awesome.

La página tiene que oler a cazo abierto y a las 13:00 de un domingo en Mérida.

**Dirección visual:** *editorial cálida*. Titulares en serif con carácter,
cuerpo en sans legible, mucho aire, filetes finos en vez de cajas por todas
partes, y el rojo chile usado como acento quirúrgico — no como fondo de todo.

---

## 2. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--carbon` | `#140b07` | Texto principal, cabecera, sección oscura, botón "Añadir" |
| `--carbon-suave` | `#241610` | Pie, superficies oscuras secundarias |
| `--crema` | `#fdf6ec` | Fondo de página, texto sobre oscuro |
| `--crema-oscura` | `#efe0c9` | Bordes, filetes, separadores |
| `--tinta` | `#2a1d16` | Texto de cuerpo |
| `--tinta-suave` | `#6b5748` | Texto secundario, descripciones, notas |
| `--rojo` | `#b3261e` | Acento: precios, enlaces, etiqueta del hero, foco de marca |
| `--rojo-oscuro` | `#7d1a15` | Hover del rojo |
| `--dorado` | `#d9a441` | Sello, globo del carrito, foco visible |
| `--verde` | `#2f7d4f` | Etiqueta "para compartir" |
| `--whatsapp` | `#1a7a43` | Solo el botón de enviar pedido (hover `#146034`) |

**Reglas de color**
- El rojo nunca ocupa más del 10 % de una pantalla. Es acento, no ambiente.
- El dorado es decorativo: no se usa para texto pequeño sobre crema (contraste bajo).
- Sobre oscuro, el texto es `--crema`; el secundario, `--crema-oscura` al 85 %.
- **Contraste mínimo AA (4.5:1)** en todo texto. Ya verificado con cálculo real:
  blanco sobre `--rojo` = 6.54, blanco sobre `--whatsapp` = 5.37 (hover 7.63),
  `--tinta-suave` sobre `--crema` = 6.35, `--rojo` sobre `--crema` = 6.09,
  `--verde` sobre `--crema` = 4.70, `--crema` sobre `--carbon` = 18.11.
  **`--dorado` sobre `--crema` = 2.10: nunca como texto.**

---

## 3. Tipografía

- **Titulares:** serif del sistema — `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`.
  Sin fuentes externas: la página carga sin red.
- **Cuerpo y UI:** sans del sistema — `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.
- **Escala** (fluida con `clamp`):
  - `h1`: `clamp(2.2rem, 6.5vw, 4.2rem)`, peso 600, `letter-spacing: -0.02em`
  - `h2`: `clamp(1.7rem, 4vw, 2.6rem)`
  - `h3`: `1.05rem`
  - cuerpo: `1rem` / `1.6`
  - secundario: `0.88rem`
  - etiquetas y microtexto: `0.8125rem` (13 px, token `--texto-min`), mayúsculas, `letter-spacing: 0.12em`.
    **Nada que se lea va por debajo de 13 px** (pedido de Javi, 24/10/2026; antes era 0.68–0.78rem).
- **Sin cursiva ni cambio de letra dentro de un titular** (pedido de Javi, 24/10/2026). El titular
  del hero va en dos líneas de la misma serif: "Carnitas del cazo," / "estilo Michoacán".
- **Cifras** (precios, totales): en la letra del texto con `font-variant-numeric: tabular-nums`.
  Nada de monoespaciada.
- `text-wrap: balance` en `h1` y `h2`. Nada de titulares de una sola palabra huérfana.

---

## 4. Espaciado y forma

- Escala de 4: `0.25 · 0.5 · 0.75 · 1 · 1.25 · 1.5 · 2 · 3 · 5rem`.
- Secciones: `padding: clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 2.5rem)`.
- Ancho de contenido: `--ancho: 1140px`, centrado con `margin-inline: auto`.
- Radios: `999px` en píldoras (botones, filtros, etiquetas), `16px` en tarjetas,
  `8px` en controles pequeños. **Nada de esquinas a 0** salvo filetes.
- Sombras: una sola, suave y cálida — `0 12px 32px rgb(20 11 7 / 10%)`.
  En hover, `0 16px 36px rgb(20 11 7 / 16%)`. Sin sombras de colores (por eso los
  botones rojos van planos, sin sombra roja).

---

## 5. Componentes

### Botones
- **Primario** (`--rojo`, texto blanco, píldora): la acción principal de cada pantalla. Una sola por bloque.
- **Secundario** (borde 2px `--carbon`, fondo transparente): la alternativa. En hover se invierte.
- **WhatsApp** (`--whatsapp`, ancho completo): solo dentro del carrito.
- **Añadir** (`--carbon`, píldora pequeña): en cada tarjeta de plato. En hover pasa a `--rojo`.
- Todos: `transition` de 0.15 s en color y `translateY(-1px)` en hover. Nunca escalar.

### Tarjeta de plato
- Fondo blanco, borde `--crema-oscura`, radio 16, sombra suave.
- Estructura fija: nombre + precio arriba (precio en `--rojo`, negrita, tabular),
  descripción, etiquetas, y pie separado por un filete **punteado**.
- En hover: borde rojizo al 45 % y sombra más alta. **Sin `transform`** (choca con la animación de scroll).

### Etiquetas
- Píldoras de 0.68rem, mayúsculas, peso 700. Fondo al 12–22 % del color, texto en su tono oscuro.
- Solo tres: `Más pedido` (dorado), `Picante` (rojo), `Para compartir` (verde).

### Carrito
- Panel lateral de `min(400px, 100vw)`, fondo `--crema`, borde izquierdo fino.
- Velo `rgb(20 11 7 / 45%)` detrás, que cierra al tocarlo.
- `z-index`: velo 35, carrito 40, aviso flotante 30 (nunca tapa el botón de enviar).
- Foco atrapado dentro mientras está abierto; al cerrar vuelve al botón "Mi pedido".

### Horario
- Tabla de dos columnas, cifras tabulares, filetes punteados.
- El día de hoy va en `--rojo` y negrita, con `aria-current="date"`.
- El día cerrado, en `--rojo` con la palabra "Cerrado".

---

## 6. Movimiento

- Duraciones cortas: 0.15 s (color), 0.22 s (panel), 0.25 s (aviso).
- Aparición al hacer scroll con `animation-timeline: view()`, solo si el navegador lo soporta.
- **Todo respeta `prefers-reduced-motion`**: sin animaciones ni scroll suave.
- Nada de parallax, ni de elementos que se muevan solos, ni de contadores animados.

---

## 7. Accesibilidad (no negociable)

- Contraste AA mínimo en todo texto.
- Foco visible: `outline: 3px solid var(--dorado)` con `offset: 3px`.
- Enlace "Saltar al menú" como primer elemento enfocable.
- El carrito es `role="dialog"` con `aria-modal="true"` y `aria-labelledby`.
- Todo cambio de estado se anuncia: `aria-live="polite"` en horario, contador y aviso.
- Áreas táctiles de 44×44 px como mínimo en móvil.
- El HTML se lee sin JS: el menú y el horario están en el documento, no solo pintados.

---

## 8. Anti-patrones (prohibido)

- ❌ CDN, Google Fonts, Font Awesome, jQuery, frameworks de UI.
- ❌ Fotos de stock de tacos genéricos. Si no hay foto real del plato, no hay foto.
- ❌ Degradados morados/azules "de startup", glassmorphism, neón.
- ❌ Emojis como iconos de interfaz más allá del carrito y la corona de la marca.
- ❌ Texto gris claro sobre crema (falla contraste).
- ❌ Carruseles automáticos, pop-ups de "suscríbete", cookies falsas.
- ❌ Precios inventados: salen de `datos.js` y de ningún otro sitio.
- ❌ Cualquier cosa que impida que la página cargue sin internet.

---

## 9. Voz y textos

- Español de México, directo, de mostrador: "Arma tu pedido", "Recién salidas del cazo".
- Nada de "¡Deléitate con nuestra exquisita selección!".
- Los precios siempre con `$` y sin decimales cuando son enteros.
- Se dice "carnitas", no "carne de cerdo preparada".
- El tuteo es la norma; el usted, solo en el aviso de horario.

---

## 10. Cómo se comprueba un cambio

1. `npm test` en verde (52 pruebas: lógica, interfaz, estilos y coherencia).
2. `node --check main.js` y `node --check logica.js`.
3. Llaves del CSS equilibradas.
4. Las 6 rutas responden 200: `/`, `styles.css`, `main.js`, `datos.js`, `logica.js`, `favicon.svg`.
5. Contraste de cualquier color nuevo, calculado a mano antes de meterlo.
