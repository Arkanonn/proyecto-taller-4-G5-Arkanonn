import { google } from "googleapis";
import { auth } from "./auth";

const sheets = google.sheets({
  version: "v4",
  auth
});

/**
 * 
 * @param {*} spreadsheetId id del data de la eleeción
 * @returns un arreglo con las pestañas de data
 */
export async function obtenerPestanas(spreadsheetId) {
  const respuesta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title"
  });

  return respuesta.data.sheets.map(
    (hoja) => hoja.properties.title
  );
}

/**
 * 
 * @param {*} spreadsheetId id del data de la elección
 * @param {*} nombrePestana pestaña de la cual queremos obtener información
 * @returns arreglo de filas y columas que se obtienen de las filas y columnas del spreetsheet
 */
export async function obtenerDatosPestana(spreadsheetId, nombrePestana) {
  const respuesta = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${nombrePestana.replace(/'/g, "''")}'`
  });

  return respuesta.data.values || [];
}

/**
 * 
 * @param {*} filas arreglo de arreglos de los componentes del spreadsheet
 * @returns objeto tipo JSON
 */
export function convertirFilasAObjetos(filas) {
  if (filas.length === 0) {
    return [];
  }

  const encabezados = filas[0];
  const datos = filas.slice(1);

  return datos.map((fila) => {
    const objeto = {};

    encabezados.forEach((encabezado, indice) => {
      objeto[encabezado] = fila[indice] ?? "";
    });

    return objeto;
  });
}


export function convertirFilasAListas(filas) {

  // Si no hay datos, devolvemos un arreglo vacío
  if (filas.length <= 1) {
    return [];
  }

  // Eliminamos la primera fila (encabezados)
  const datos = filas.slice(1);

  // Convertimos cada fila en un objeto
  return datos
    .filter((fila) => fila[0]?.trim())
    .map((fila) => {

      return {
        id: fila[0],
        nombreLista: fila[1] ?? "",
        descripcion: fila[2] ?? "",

        integrantes: fila
          .slice(3)
          .filter((integrante) => integrante.trim() !== "")
      };

    });
}


/**
 * Convierte las filas de la pestaña Quiz en un arreglo de objetos.
 *
 * @param {*} filas Arreglo de filas obtenidas desde Google Sheets.
 * @returns Arreglo de preguntas con sus opciones y respuesta correcta.
 */
export function convertirFilasAQuiz(filas) {

    // Si no hay datos o solamente existen encabezados
    if (filas.length <= 1) {
        return [];
    }

    // Eliminamos la primera fila (encabezados)
    const datos = filas.slice(1);

    // Convertimos cada fila en una pregunta
    return datos
        .filter((fila) => fila[0]?.trim())
        .map((fila, indice) => {

            return {
                id: indice + 1,

                pregunta: fila[0],

                opciones: [
                    { letra: "A", texto: fila[1] ?? "" },
                    { letra: "B", texto: fila[2] ?? "" },
                    { letra: "C", texto: fila[3] ?? "" },
                    { letra: "D", texto: fila[4] ?? "" }
                ],

                opcionCorrecta: fila[5] ?? ""
            };

        });
}


export async function guardarRespuestasQuiz(spreadsheetId, tokenHash, respuestas) {
  // Leer los datos actuales de la pestaña
  const filas = await obtenerDatosPestana(
    spreadsheetId,
    "Respuestas"
  );

  // Buscar si el TokenHash ya está registrado
  const indice = filas.findIndex(
    (fila, index) => index > 0 && fila[0] === tokenHash
  );

  // Construir la fila que se guardará
  const valores = [tokenHash, ...respuestas];

  if (indice !== -1) {
    // Ya existe: actualizar su fila
    const numeroFila = indice + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'Respuestas'!A${numeroFila}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [valores]
      }
    });

  } else {
    // No existe: agregar una nueva fila
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Respuestas'!A:ZZ",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [valores]
      }
    });
  }
}


export async function registrarVoto(spreadsheetId, idVoto, listaId, fechaHora) {
    const respuesta = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Votos'!A:C",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values: [
                [idVoto, listaId, fechaHora]
            ]
        }
    });

    return respuesta.data;
}
