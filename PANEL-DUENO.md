# Panel del dueño: cambiar precios y fotos desde el teléfono

El dueño abre la página con `#dueno` al final, entra con su correo y contraseña,
toca un precio o "Cambiar foto", y el cambio lo ven todos los clientes al momento.
Nadie más puede cambiar nada: la regla la revisa el servidor, no la página.

Los precios y las fotos se guardan en **Supabase** (gratis para este tamaño).

**Quién tiene qué:** Javi es dueño del proyecto de Supabase (lo crea y lo
administra). El dueño del restaurante **no** entra a Supabase: solo recibe un
correo y contraseña para la página. Con eso puede cambiar precios y fotos y nada
más; no ve la base de datos ni puede borrarla.

## Montarlo (Javi, una sola vez, unos 15 minutos)

**Avance (7/11/2026):**
- [x] Paso 1: proyecto creado → `https://nnaecikpyqhhmvuxtlhz.supabase.co`
  (ya puesto en `index.html`, `NUBE.url`).
- [ ] Paso 2: correr `supabase/instalar.sql` con el correo del dueño.
- [ ] Paso 3: crear el usuario del dueño y apagar el registro.
- [ ] Paso 4: poner la Publishable key en `NUBE.llave`. Mientras esté vacía, el
  modo dueño sigue siendo solo demostración y nada se rompe.

Desde el celular, todo lo de Supabase está en el menú **☰** de arriba a la
derecha (SQL Editor, Authentication, Project Settings).

### 1. Crear el proyecto
1. Entra a https://supabase.com y crea una cuenta (con la de Google sirve).
2. **New project**. Nombre: `Carnitas-el-rey`. Región: la más cercana a México
   (por ejemplo *East US*). Pon una contraseña de base de datos y guárdala (casi
   no se usa). Espera a que termine de crearse.

### 2. Crear las tablas y la carpeta de fotos
1. Abre `supabase/instalar.sql` de este repositorio.
2. Cambia `CORREO-DEL-DUENO@ejemplo.com` por el correo con el que va a entrar el
   dueño (aparece una sola vez).
3. En Supabase: **☰ → SQL Editor → New query** → pega todo el archivo →
   **Run**. Debe decir *Success. No rows returned*.

### 3. Crear la cuenta del dueño y cerrar el registro
1. **Authentication → Users → Add user → Create new user**: el mismo correo del
   paso anterior y una contraseña. Marca **Auto Confirm User**.
2. **Authentication → Sign In / Providers**: apaga **Allow new users to sign up**.
   Así nadie más puede crearse cuenta.

### 4. Conectar la página
1. **Project Settings → API Keys**: copia la **Publishable key**
   (empieza con `sb_publishable_`). Es pública, no pasa nada si se ve.
   **Nunca** uses la *secret key* en la página.
2. **Project Settings → Data API**: copia la **Project URL**
   (`https://xxxx.supabase.co`).
3. En `index.html`, sección CONFIGURACIÓN, llena la llave (la URL ya está):
   ```js
   const NUBE = { url: 'https://nnaecikpyqhhmvuxtlhz.supabase.co', llave: 'sb_publishable_...' };
   ```
   O mándasela a Claude o a Ari y ellos la ponen.
4. Sube el cambio a GitHub (Claude o Ari lo hacen) y espera 1–2 minutos.

## Darle el acceso al dueño
Mándale la dirección `…/Restaurante-el-rey/#dueno`, su correo y la contraseña
que le creaste en el paso 3. Si la olvida, la cambias en Authentication → Users.

## Usarlo desde el teléfono del dueño
1. Abrir https://javierhedzd-ops.github.io/Restaurante-el-rey/#dueno
2. Escribir correo y contraseña → **Entrar**. El teléfono recuerda la sesión.
3. Para no escribir la dirección cada vez: en el navegador, **Compartir →
   Agregar a pantalla de inicio** (iPhone) o **⋮ → Agregar a pantalla principal**
   (Android). Queda un ícono "El Rey" que abre directo el modo dueño.
4. **Precios**: tocar el número, escribir el nuevo y tocar fuera. Sale
   "Precio publicado". Dejarlo vacío = "precio por confirmar".
5. **Fotos**: tocar **Cambiar foto** en la portada, el restaurante, el carrusel
   o la galería → tomar una foto o elegirla. Se reduce sola y sale
   "Foto publicada".
6. **Cerrar sesión** si el teléfono lo usa alguien más.

## Lo que el panel no cambia
Nombres y descripciones de platillos, platillos nuevos, el horario, el teléfono y
las notas de cada sección (por ejemplo "Tacos de $35 c/u") se cambian en
`index.html` (CONFIGURACIÓN). Si suben los tacos, conviene actualizar también esa
nota.

## Si algo falla
- "Correo o contraseña incorrectos": revisar el usuario en Authentication → Users.
  Ahí mismo se puede cambiar la contraseña.
- "No se guardó" con internet bien: revisar que el correo de `instalar.sql` sea
  exactamente el del usuario, y volver a correrlo.
- Para deshacer un precio: escribir el de antes. Para quitar una foto subida:
  Supabase → Table Editor → `fotos` → borrar la fila.
