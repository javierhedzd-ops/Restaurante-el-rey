# Editar precios y productos (admin.html)

La carta se edita desde el navegador, sin tocar código: abre
**https://javierhedzd-ops.github.io/Restaurante-el-rey/admin.html** (o
`/admin.html` donde esté publicada la web).

## Qué se puede hacer
- Cambiar nombre, precio y descripción de cada producto. Precio vacío = "Consultar".
- Cambiar su categoría y marcar "Más pedido", "Picante", "Para compartir" y
  "Elige proteína".
- Añadir productos (botón "Añadir a …" al final de cada categoría) y quitarlos.
- Los precios del kilo que la portada y las preguntas traen escritos se
  actualizan solos al publicar.
- Las fotos de los platos no se cambian aquí: ver `fotos/LEEME.md`.

## Publicar (una vez: crear la llave)
1. En GitHub: **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
   (https://github.com/settings/personal-access-tokens/new).
2. Nombre: "Carta El Rey". Caducidad: la que quieras (un año, por ejemplo).
3. **Repository access → Only select repositories → Restaurante-el-rey**.
4. **Permissions → Repository permissions → Contents: Read and write.** Nada más.
5. Genera la llave y cópiala (empieza por `github_pat_`). Guárdala en un lugar
   seguro; no se la pases a nadie ni la pegues en chats.
6. En admin.html, pégala en "Llave de GitHub". Si marcas "Recordar", se queda
   guardada solo en ese navegador.

Al pulsar **Publicar en la web** se guardan `datos.js` (y, si cambian los
precios del kilo, `index.html`) en la rama de la web; GitHub Pages la
actualiza en uno o dos minutos.

## Sin llave
**Descargar archivos** baja `datos.js` (y `index.html` si hace falta). Súbelos
al repositorio en GitHub: **Add file → Upload files**, en la rama
`ari/rediseno-cazo`.
