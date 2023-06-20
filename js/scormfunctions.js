/**
 * Funciones SCORM para comunicarse con el LMS
 * Autor: Carlos Antonio Jacanamejoy
 */

// Variables globales
var scormAPI; // Objeto para acceder a la API de SCORM
var scormInitialized = false; // Indicador de inicialización de SCORM

// Función para inicializar la comunicación con el LMS
const initializeSCORM = () => {
  // Obtener la API de SCORM
  scormAPI = getSCORMAPI();

  if (scormAPI) {
    // Inicializar la comunicación con el LMS
    const result = scormAPI.LMSInitialize("");

    if (result === "true") {
      scormInitialized = true;
      console.log("Comunicación SCORM inicializada correctamente");
    } else {
      console.log("Error al inicializar la comunicación SCORM: " + result);
    }
  } else {
    console.log("API de SCORM no encontrada");
  }
}

// Función para finalizar la comunicación con el LMS
const terminateSCORM = () => {
  if (scormInitialized) {
    // Finalizar la comunicación con el LMS
    const result = scormAPI.LMSFinish("");

    if (result === "true") {
      console.log("Comunicación SCORM finalizada correctamente");
    } else {
      console.log("Error al finalizar la comunicación SCORM: " + result);
    }
  }
}

// Función auxiliar para obtener la API de SCORM
const getSCORMAPI = () => {
  let api = null;

  if (typeof window.API !== "undefined") {
    api = window.API;
  } else if (typeof window.parent.API !== "undefined") {
    api = window.parent.API;
  } else if ( window.opener !== null) {
    if (typeof window.opener.API !== "undefined") {
      api = window.opener.API;
    }
  }

  return api;
}

// Inicializar la comunicación con el LMS al cargar la página
window.addEventListener("load", function () {
  initializeSCORM();
});

// Finalizar la comunicación con el LMS al cerrar la página
window.addEventListener("beforeunload", function () {
  terminateSCORM();
});


//###########################################################
// Funciones para la gestión de datos
const muestraErrorAPI = (API) => {
  const errorNumber = API.LMSGetLastError();
  const errorString = API.LMSGetErrorString(errorNumber);
  const diagnostic = API.LMSGetDiagnostic(errorNumber);

  const errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
  console.log(errorDescription)
  //alert("Error - Could not terminate communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
  return errorDescription;
}





const registraNota = (GAME) => {
  // Nota va de 0 a 100
  if(scormInitialized){
    const API = scormAPI;
    const nameStudent = API.LMSGetValue("cmi.core.student_name");
    let vMin = API.LMSGetValue("cmi.core.score.min");
    let vMax = API.LMSGetValue("cmi.core.score.max");
    console.log("Vmin, vMax: "+vMin+", "+vMax);
    let notaMin = parseFloat(vMin);
    let notaMax = parseFloat(vMax);

    if (isNaN(notaMin) || isNaN(notaMax)) {
      notaMin = 0;
      notaMax = 100;
      rs = API.LMSSetValue("cmi.core.score.min", "0.00");
      console.log("Respuesta de fijar vmin:", rs)
      muestraErrorAPI(API);

      rs = API.LMSSetValue("cmi.core.score.max", "100.00");
      if(rs == "false")(muestraErrorAPI(API));
    }
    const nota = GAME.score.obtieneNotaMoodle( 400, notaMin, notaMax);


    console.log("Esta actividad tiene nota entre:" + notaMin + ", " + notaMax);
    console.log("Nombre del estudiante:", nameStudent)
    // Establecer la nota en la API de SCORM
    rs = API.LMSSetValue("cmi.core.score.raw", nota);
    console.log("Respuesta de agregar nota:", rs)
    muestraErrorAPI(API);
    // Enviar los datos actualizados a Moodle
    API.LMSCommit();
    console.log("Se reportó por medio de la API la nota:" + nota)


  }else{
    console.log("No se puede agregar la nota porque la API no está disponible");
  }

}

