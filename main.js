// Carnitas Michoacán El Rey — comportamiento mínimo.
// Sin dependencias: solo resalta el día de hoy en el horario.

(function () {
  "use strict";

  // getDay(): 0 = domingo … 6 = sábado. El horario empieza en lunes.
  var ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  function nombreDelDia(fecha) {
    var indice = (fecha.getDay() + 6) % 7;
    return ORDEN[indice];
  }

  function resaltarHoy() {
    var filas = document.querySelectorAll(".horario tr");
    if (!filas.length) return;

    var hoy = nombreDelDia(new Date());

    filas.forEach(function (fila) {
      var celda = fila.querySelector("th");
      if (!celda) return;
      if (celda.textContent.trim() === hoy) {
        fila.classList.add("horario__hoy");
        celda.setAttribute("aria-current", "date");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resaltarHoy);
  } else {
    resaltarHoy();
  }
})();
