// 1. Referencias al Modelo de Objetos del Documento, conocido como DOM
const formularioTareas = document.getElementById('formulario-tareas');
const tituloTarea = document.getElementById('titulo-tarea');
const descripcionTarea = document.getElementById('descripcion-tarea');
const listaTareas = document.getElementById('lista-tareas');
const btnExportarJson = document.getElementById('btn-exportar-json');
const btnExportarXml = document.getElementById('btn-exportar-xml');

// 2. Estado de la aplicación
// Se cargan datos previos desde LocalStorage o se inicia con un arreglo vacío
let coleccionTareas = JSON.parse(localStorage.getItem('tareasGuardadas')) || [];

// 3. Función para pintar las tareas en el HTML
function redibujarInterfaz() {
  listaTareas.innerHTML = '';

  if (coleccionTareas.length === 0) {
    listaTareas.innerHTML = `
      <li class="mensaje-vacio">
        No existen tareas registradas todavía.
      </li>
    `;
    return;
  }

  coleccionTareas.forEach((tarea, indice) => {
    const elementoLista = document.createElement('li');
    elementoLista.className = 'elemento-tarea';

    elementoLista.innerHTML = `
      <div>
        <h3>${tarea.titulo}</h3>
        <p>${tarea.descripcion}</p>
        <small>Código: ${tarea.codigo} | Registro: ${tarea.fecha}</small>
      </div>

      <button class="btn-eliminar" onclick="removerTarea(${indice})">
        Eliminar
      </button>
    `;

    listaTareas.appendChild(elementoLista);
  });
}

// 4. Guardar datos en LocalStorage convirtiéndolos a texto JSON
function actualizarAlmacenamientoLocal() {
  localStorage.setItem('tareasGuardadas', JSON.stringify(coleccionTareas));
}

// 5. Captura del evento de envío del formulario
formularioTareas.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nuevaTarea = {
    codigo: Date.now().toString(),
    titulo: tituloTarea.value.trim(),
    descripcion: descripcionTarea.value.trim(),
    fecha: new Date().toLocaleDateString()
  };

  coleccionTareas.push(nuevaTarea);

  actualizarAlmacenamientoLocal();
  redibujarInterfaz();

  formularioTareas.reset();
});

// 6. Eliminar una tarea por su índice
window.removerTarea = function(indice) {
  const confirmar = confirm('¿Estás seguro de eliminar esta tarea?');

  if (!confirmar) {
    return;
  }

  coleccionTareas.splice(indice, 1);

  actualizarAlmacenamientoLocal();
  redibujarInterfaz();
};

// =======================================================
// PROCESAMIENTO DE FORMATOS SEMIESTRUCTURADOS: JSON y XML
// =======================================================

// 7. Exportación nativa a formato JSON
btnExportarJson.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  // Serialización: de objeto JavaScript en memoria a cadena JSON
  const textoJson = JSON.stringify(coleccionTareas, null, 2);

  console.log('--- FLUJO DE DATOS: JSON GENERADO ---');
  console.log(textoJson);

  generarDescarga(textoJson, 'tareas_academicas.json', 'application/json');
});

// 8. Exportación estructurada a formato XML mediante marcado manual
btnExportarXml.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  let textoXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  textoXml += `<tareas>\n`;

  coleccionTareas.forEach((tarea) => {
    textoXml += `  <tarea codigo="${tarea.codigo}">\n`;
    textoXml += `    <titulo>${sanitizarTextoXml(tarea.titulo)}</titulo>\n`;
    textoXml += `    <descripcion>${sanitizarTextoXml(tarea.descripcion)}</descripcion>\n`;
    textoXml += `    <fecha>${tarea.fecha}</fecha>\n`;
    textoXml += `  </tarea>\n`;
  });

  textoXml += `</tareas>`;

  console.log('--- FLUJO DE DATOS: XML GENERADO ---');
  console.log(textoXml);

  generarDescarga(textoXml, 'tareas_academicas.xml', 'application/xml');
});

// 9. Función para generar la descarga de archivos en el navegador
function generarDescarga(contenidoTexto, nombreArchivo, tipoMime) {
  const bloqueDatos = new Blob([contenidoTexto], { type: tipoMime });
  const urlDescarga = URL.createObjectURL(bloqueDatos);
  const enlaceDescarga = document.createElement('a');

  enlaceDescarga.href = urlDescarga;
  enlaceDescarga.download = nombreArchivo;
  enlaceDescarga.click();

  URL.revokeObjectURL(urlDescarga);
}

// 10. Sanitización para evitar errores si el usuario escribe caracteres especiales de XML
function sanitizarTextoXml(textoInseguro) {
  return textoInseguro.replace(/[<>&'"]/g, (caracter) => {
    switch (caracter) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return caracter;
    }
  });
}

// 11. Renderizado inicial al cargar la página
redibujarInterfaz();