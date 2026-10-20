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
