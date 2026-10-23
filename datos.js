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
export const PLATOS = [
  // Tacos
  { id: "taco-maciza", nombre: "Taco de maciza", precio: 49, categoria: "tacos", desc: "Doble tortilla de maíz nixtamalizado, cilantro y cebolla.", etiquetas: ["popular"] },
  { id: "taco-surtida", nombre: "Taco de surtida", precio: 49, categoria: "tacos", desc: "Doble tortilla con la mezcla de la casa.", etiquetas: [] },
  { id: "taco-gusto", nombre: "Taco al gusto", precio: 49, categoria: "tacos", desc: "Elige tu proteína: maciza, costilla, buche, oreja, nana y más.", etiquetas: [], opciones: "proteina" },

  // Tortas
  { id: "torta-maciza", nombre: "Torta de maciza", precio: 105, categoria: "tortas", desc: "En pan francés, con cilantro y cebolla.", etiquetas: ["popular"] },
  { id: "torta-surtida", nombre: "Torta de surtida", precio: 105, categoria: "tortas", desc: "En pan francés, con la mezcla de la casa.", etiquetas: [] },
  { id: "torta-gusto", nombre: "Torta al gusto", precio: 105, categoria: "tortas", desc: "Elige tu proteína.", etiquetas: [], opciones: "proteina" },

  // Kilos
  { id: "kg-gusto", nombre: "1 kg al gusto", precio: 273, categoria: "kilos", desc: "Con tortillas de maíz, cebolla, cilantro, limones, aguacate y salsas de la casa.", etiquetas: ["para-compartir"], opciones: "proteina" },
  { id: "kg-surtida", nombre: "1 kg surtida", precio: 238, categoria: "kilos", desc: "Maciza y surtido, con todo lo de acompañamiento.", etiquetas: ["para-compartir"] },
  { id: "medio-maciza", nombre: "½ kg maciza", precio: 280, categoria: "kilos", desc: "Con tortillas, cebolla, cilantro, limones y salsas.", etiquetas: [] },
  { id: "medio-surtido", nombre: "½ kg surtido", precio: 260, categoria: "kilos", desc: "Con tortillas, cebolla, cilantro, limones y salsas.", etiquetas: [] },
  { id: "medio-parrilla", nombre: "½ kg maciza, costilla, buche, oreja y cuero", precio: 280, categoria: "kilos", desc: "Surtido de la casa para armar tacos.", etiquetas: ["para-compartir"] },

  // Entradas
  { id: "quesadillas", nombre: "Quesadillas (2 pz)", precio: 133, categoria: "entradas", desc: "Tortilla de maíz rellena de queso oaxaca.", etiquetas: [] },
  { id: "guacamole", nombre: "Guacamole tradicional", precio: 119, categoria: "entradas", desc: "Aguacate hass machacado, pico de gallo y tostadas de la casa.", etiquetas: [] },
  { id: "guacamole-chicharron", nombre: "Guacamole con chicharrón", precio: 133, categoria: "entradas", desc: "Con trozos de chicharrón de cerdo de la casa.", etiquetas: [] },
  { id: "guacamole-rey", nombre: "Guacamole El Rey", precio: 210, categoria: "entradas", desc: "Con cama de costilla asada 100 g y chistorra 50 g.", etiquetas: ["popular"] },
  { id: "chicharreada", nombre: "Chicharreada", precio: 224, categoria: "entradas", desc: "Costilla natural 200 g, oreja, buche 250 g, chicharrón, pico de gallo, habanero y tortillas.", etiquetas: ["picante", "para-compartir"] },
  { id: "molletes", nombre: "2 molletes", precio: 70, categoria: "entradas", desc: "Pan francés de horno de leña, frijoles negros, queso oaxaca, pico de gallo y crema.", etiquetas: [] },
  { id: "molletes-rey", nombre: "2 molletes El Rey", precio: 105, categoria: "entradas", desc: "Como los de siempre, con proteína a elegir.", etiquetas: [], opciones: "proteina" },

  // Especialidades
  { id: "sopes", nombre: "Sopes de carnitas (2 pz)", precio: 133, categoria: "especialidades", desc: "Tortillas artesanales en comal, frijol, proteína, lechuga, crema y queso.", etiquetas: [], opciones: "proteina" },
  { id: "quesadilla-carnitas", nombre: "Quesadilla de carnitas (2 pz)", precio: 133, categoria: "especialidades", desc: "Tortilla artesanal de sabor chipotle jalapeño, queso oaxaca y proteína.", etiquetas: ["picante"], opciones: "proteina" },
  { id: "chilaquiles", nombre: "Chilaquiles de carnitas", precio: 168, categoria: "especialidades", desc: "Tostadas caseras en salsa cremosa de chipotle, queso manchego y crema.", etiquetas: ["picante", "popular"], opciones: "proteina" },
  { id: "molletes-carnitas", nombre: "2 molletes con carnitas", precio: 91, categoria: "especialidades", desc: "Pan con frijoles, carnitas, cebolla, cilantro y limón.", etiquetas: [] },
  { id: "tostada-pierna", nombre: "Tostada de pierna", precio: 77, categoria: "especialidades", desc: "Frijol refrito, lechuga, pierna desmenuzada 70 g, crema y queso.", etiquetas: [] },

  // Bebidas
  { id: "michelitro", nombre: "Michelitro", precio: 89, categoria: "bebidas", desc: "Promoción de miércoles.", etiquetas: ["popular"] },
  { id: "cervezas", nombre: "Cervezas y coctelería", precio: null, categoria: "bebidas", desc: "Pregunta por la selección del día.", etiquetas: [] },
];
