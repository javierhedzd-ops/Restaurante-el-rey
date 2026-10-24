// Carnitas Michoacán El Rey — datos del negocio.
// Todo lo que cambia con el tiempo vive aquí: precios, horario, teléfonos.
// Si el dueño cambia un precio, se toca este archivo y nada más.

export const NEGOCIO = {
  nombre: "Carnitas Michoacán El Rey",
  sucursal: "Chuminópolis",
  desde: 1974,
  telefonoPedidos: "529991190662", // formato internacional, sin + ni espacios (para wa.me)
  telefonoVisible: "999 119 0662",
  telefonoFijo: "999 221 2040",
  direccion: "Calle 14, 93-F, Chuminópolis, 97158, Mérida, Yucatán",
  maps: "https://www.google.com/maps/search/?api=1&query=Carnitas+Michoac%C3%A1n+El+Rey+Chumin%C3%B3polis+M%C3%A9rida",
  instagram: "https://www.instagram.com/carnitasmichoacanaselrey/",
  facebook: "https://www.facebook.com/p/Carnitas-Michoac%C3%A1n-EL-REY-Suc-Canek-100063511536074/",
  // Zona horaria del restaurante: el "abierto ahora" se calcula con esta, no con la del visitante.
  zonaHoraria: "America/Merida",
  // 0 = domingo … 6 = sábado. null = cerrado.
  horario: {
    0: [13, 22],
    1: [13, 22],
    2: null,
    3: [13, 22],
    4: [13, 22],
    5: [13, 22],
    6: [13, 22],
  },
};

// Categorías del menú. El orden aquí es el orden de los filtros.
export const CATEGORIAS = [
  { id: "tacos", nombre: "Tacos" },
  { id: "tortas", nombre: "Tortas" },
  { id: "kilos", nombre: "Kilos" },
  { id: "entradas", nombre: "Entradas" },
  { id: "especialidades", nombre: "Especialidades" },
  { id: "bebidas", nombre: "Bebidas" },
];

// Proteínas disponibles para los platos "al gusto".
export const PROTEINAS = [
  "Maciza",
  "Surtida",
  "Costilla",
  "Buche",
  "Oreja",
  "Nana",
  "Cuerito",
  "Trompa",
  "Hígado",
  "Corazón",
];

// id, nombre, precio (MXN), categoría, descripción, etiquetas.
// etiquetas: "popular" (los más pedidos), "picante", "para-compartir".
// foto (opcional): { src, alt, credito }. Los créditos completos están en fotos/CREDITOS.md.
export const PLATOS = [
  // Tacos
  { id: "taco-maciza", nombre: "Taco de maciza", precio: 49, categoria: "tacos", desc: "Doble tortilla de maíz nixtamalizado, cilantro y cebolla.", etiquetas: ["popular"], foto: { src: "fotos/taco-carnitas.jpg", alt: "Taco de carnitas en tortilla hecha a mano", credito: "Missvain · CC0" } },
  { id: "taco-surtida", nombre: "Taco de surtida", precio: 49, categoria: "tacos", desc: "Doble tortilla con la mezcla de la casa.", etiquetas: [], foto: { src: "fotos/tacos-mano.jpg", alt: "Dos tacos de carnitas en tortilla hecha a mano", credito: "Missvain · CC0" } },
  { id: "taco-gusto", nombre: "Taco al gusto", precio: 49, categoria: "tacos", desc: "Elige tu proteína: maciza, costilla, buche, oreja, nana y más.", etiquetas: [], opciones: "proteina", foto: { src: "fotos/tacos.jpg", alt: "Tacos de carnitas con cilantro y cebolla", credito: "Jj saezdeo · CC BY-SA 4.0" } },

  // Tortas
  { id: "torta-maciza", nombre: "Torta de maciza", precio: 105, categoria: "tortas", desc: "En pan francés, con cilantro y cebolla.", etiquetas: ["popular"], foto: { src: "fotos/torta.jpg", alt: "Torta de carnitas en pan francés", credito: "Jj saezdeo · CC BY-SA 4.0" } },
  { id: "torta-surtida", nombre: "Torta de surtida", precio: 105, categoria: "tortas", desc: "En pan francés, con la mezcla de la casa.", etiquetas: [] },
  { id: "torta-gusto", nombre: "Torta al gusto", precio: 105, categoria: "tortas", desc: "Elige tu proteína.", etiquetas: [], opciones: "proteina" },

  // Kilos
  { id: "kg-gusto", nombre: "1 kg al gusto", precio: 273, categoria: "kilos", desc: "Con tortillas de maíz, cebolla, cilantro, limones, aguacate y salsas de la casa.", etiquetas: ["para-compartir"], opciones: "proteina", foto: { src: "fotos/kilo.jpg", alt: "Kilo de carnitas con tortillas y acompañamientos", credito: "ProtoplasmaKid · CC BY 4.0" } },
  { id: "kg-surtida", nombre: "1 kg surtida", precio: 238, categoria: "kilos", desc: "Maciza y surtido, con todo lo de acompañamiento.", etiquetas: ["para-compartir"], foto: { src: "fotos/carnitas-michoacan.jpg", alt: "Carnitas servidas en Michoacán", credito: "AlejandroLinaresGarcia · CC BY-SA 4.0" } },
  { id: "medio-maciza", nombre: "½ kg maciza", precio: 260, categoria: "kilos", desc: "Con tortillas, cebolla, cilantro, limones y salsas.", etiquetas: [], foto: { src: "fotos/mercado.jpg", alt: "Carnitas en el mercado", credito: "DaliaMonge · CC BY-SA 4.0" } },
  { id: "medio-surtido", nombre: "½ kg surtido", precio: 240, categoria: "kilos", desc: "Con tortillas, cebolla, cilantro, limones y salsas.", etiquetas: [], foto: { src: "fotos/puesto.jpg", alt: "Puesto de carnitas", credito: "Koffermejia · CC0" } },
  { id: "medio-parrilla", nombre: "½ kg maciza, costilla, buche, oreja y cuero", precio: 280, categoria: "kilos", desc: "Surtido de la casa para armar tacos.", etiquetas: ["para-compartir"], foto: { src: "fotos/cazo.jpg", alt: "Cazo de carnitas", credito: "Ferfive · CC BY 4.0" } },

  // Entradas
  { id: "quesadillas", nombre: "Quesadillas (2 pz)", precio: 133, categoria: "entradas", desc: "Tortilla de maíz rellena de queso oaxaca.", etiquetas: [] },
  { id: "guacamole", nombre: "Guacamole tradicional", precio: 119, categoria: "entradas", desc: "Aguacate hass machacado, pico de gallo y tostadas de la casa.", etiquetas: [], foto: { src: "fotos/salsas.jpg", alt: "Salsas y complementos del taco", credito: "Salazar Lira Hanna Elizabeth · CC BY-SA 4.0" } },
  { id: "guacamole-chicharron", nombre: "Guacamole con chicharrón", precio: 133, categoria: "entradas", desc: "Con trozos de chicharrón de cerdo de la casa.", etiquetas: [] },
  { id: "guacamole-rey", nombre: "Guacamole El Rey", precio: 210, categoria: "entradas", desc: "Con cama de costilla asada 100 g y chistorra 50 g.", etiquetas: ["popular"] },
  { id: "chicharreada", nombre: "Chicharreada", precio: 224, categoria: "entradas", desc: "Costilla natural 200 g, oreja, buche 250 g, chicharrón, pico de gallo, habanero y tortillas.", etiquetas: ["picante", "para-compartir"] },
  { id: "molletes", nombre: "2 molletes", precio: 70, categoria: "entradas", desc: "Pan francés de horno de leña, frijoles negros, queso oaxaca, pico de gallo y crema.", etiquetas: [], foto: { src: "fotos/tortillas.jpg", alt: "Tortillas de maíz en comal de barro", credito: "German matus · CC BY-SA 4.0" } },
  { id: "molletes-rey", nombre: "2 molletes El Rey", precio: 105, categoria: "entradas", desc: "Como los de siempre, con proteína a elegir.", etiquetas: [], opciones: "proteina" },

  // Especialidades
  { id: "sopes", nombre: "Sopes de carnitas (2 pz)", precio: 133, categoria: "especialidades", desc: "Tortillas artesanales en comal, frijol, proteína, lechuga, crema y queso.", etiquetas: [], opciones: "proteina" },
  { id: "quesadilla-carnitas", nombre: "Quesadilla de carnitas (2 pz)", precio: 133, categoria: "especialidades", desc: "Tortilla artesanal de sabor chipotle jalapeño, queso oaxaca y proteína.", etiquetas: ["picante"], opciones: "proteina" },
  { id: "chilaquiles", nombre: "Chilaquiles de carnitas", precio: 168, categoria: "especialidades", desc: "Tostadas caseras en salsa cremosa de chipotle, queso manchego y crema.", etiquetas: ["picante", "popular"], opciones: "proteina" },
  { id: "molletes-carnitas", nombre: "2 molletes con carnitas", precio: 91, categoria: "especialidades", desc: "Pan con frijoles, carnitas, cebolla, cilantro y limón.", etiquetas: [] },
  { id: "tostada-pierna", nombre: "Tostada de pierna", precio: 77, categoria: "especialidades", desc: "Frijol refrito, lechuga, pierna desmenuzada 70 g, crema y queso.", etiquetas: [] },

  // Bebidas
  { id: "michelitro", nombre: "Michelitro", precio: 89, categoria: "bebidas", desc: "Promoción de miércoles.", etiquetas: ["popular"], foto: { src: "fotos/michelada.jpg", alt: "Michelada", credito: "Popo le Chien · CC BY-SA 3.0" } },
  { id: "cervezas", nombre: "Cervezas y coctelería", precio: null, categoria: "bebidas", desc: "Pregunta por la selección del día.", etiquetas: [] },
];

// Preguntas que llegan por WhatsApp todos los días. Las respuestas salen de
// NEGOCIO y de PLATOS: si cambia un precio o el horario, cambia aquí solo.
export const PREGUNTAS = [
  {
    pregunta: "¿Hasta qué hora atienden?",
    respuesta: "De 13:00 a 22:00, de lunes a domingo. Los martes cerramos.",
  },
  {
    pregunta: "¿Cuánto cuesta un kilo?",
    respuesta: "El kilo surtido cuesta $238 y el kilo al gusto $273, con tortillas, cebolla, cilantro, limones, aguacate y salsas. Medio kilo desde $240.",
  },
  {
    pregunta: "¿Hacen servicio a domicilio?",
    respuesta: "Sí, servicio a domicilio y para llevar. Pide al 999 119 0662 o al 999 221 2040.",
  },
  {
    pregunta: "¿Se puede reservar?",
    respuesta: "Sí. Llena el formulario de reservas de esta página y te llega el resumen por WhatsApp para confirmar.",
  },
  {
    pregunta: "¿Qué proteínas tienen?",
    respuesta: "Maciza, surtida, costilla, buche, oreja, nana, cuerito, trompa, hígado y corazón.",
  },
  {
    pregunta: "¿Dónde están?",
    respuesta: "Calle 14, 93-F, Chuminópolis, 97158, Mérida, Yucatán. Hay mapa en la sección Visítanos.",
  },
];

// Fotos de la página: cada una tiene un hueco con nombre fijo en fotos/sitio/.
// Para cambiar una: pon la nueva imagen con el mismo nombre de archivo (o cambia
// "src"), corrige alt, pie y credito aquí y corre `npm run fotos`, que deja
// index.html al día (medidas, textos y créditos del pie). Guía: fotos/LEEME.md.
//   alt: qué se ve, para quien no ve la imagen.
//   pie: el texto debajo de la foto ("" = sin pie).
//   credito: "Autor · Licencia" para el pie de página; null si la foto es propia.
export const FOTOS = {
  portada: { src: "fotos/sitio/portada.jpg", alt: "Cazo de cobre lleno de carnitas dorándose en su manteca", pie: "Foto: Ferfive · CC BY 4.0 · Wikimedia Commons", credito: "Ferfive · CC BY 4.0" },
  "arma-tu-kilo": { src: "fotos/sitio/arma-tu-kilo.jpg", alt: "Kilo de carnitas servido con tortillas y salsa", pie: "Foto: ProtoplasmaKid · CC BY 4.0 · Wikimedia Commons", credito: "ProtoplasmaKid · CC BY 4.0" },
  nosotros: { src: "fotos/sitio/nosotros.jpg", alt: "Plato de carnitas servidas en un mercado de Michoacán", pie: "Carnitas en Uruapan, Michoacán · AlejandroLinaresGarcia · CC BY-SA 4.0", credito: "AlejandroLinaresGarcia · CC BY-SA 4.0" },
  "galeria-1": { src: "fotos/sitio/galeria-1.jpg", alt: "Cazo de cobre lleno de carnitas dorándose en su manteca", pie: "Cazo de cobre · Ferfive · CC BY 4.0", credito: "Ferfive · CC BY 4.0" },
  "galeria-2": { src: "fotos/sitio/galeria-2.jpg", alt: "Taco de carnitas en tortilla hecha a mano", pie: "Taco de carnitas · Missvain · CC0", credito: "Missvain · CC0" },
  "galeria-3": { src: "fotos/sitio/galeria-3.jpg", alt: "Carnitas en el mercado", pie: "En el mercado · DaliaMonge · CC BY-SA 4.0", credito: "DaliaMonge · CC BY-SA 4.0" },
  "galeria-4": { src: "fotos/sitio/galeria-4.jpg", alt: "Tortillas de maíz en comal de barro", pie: "Tortillas de nixtamal · German matus · CC BY-SA 4.0", credito: "German matus · CC BY-SA 4.0" },
  "galeria-5": { src: "fotos/sitio/galeria-5.jpg", alt: "Salsas y complementos del taco", pie: "Salsas de la casa · Salazar Lira H. E. · CC BY-SA 4.0", credito: "Salazar Lira Hanna Elizabeth · CC BY-SA 4.0" },
  "galeria-6": { src: "fotos/sitio/galeria-6.jpg", alt: "Michelada servida en vaso escarchado", pie: "Michelada · Popo le Chien · CC BY-SA 3.0", credito: "Popo le Chien · CC BY-SA 3.0" },
  reservas: { src: "fotos/sitio/reservas.jpg", alt: "Cebolla, cilantro, limones y salsas listos para la mesa", pie: "Complementos del taco · Salazar Lira Hanna Elizabeth · CC BY-SA 4.0", credito: "Salazar Lira Hanna Elizabeth · CC BY-SA 4.0" },
};
