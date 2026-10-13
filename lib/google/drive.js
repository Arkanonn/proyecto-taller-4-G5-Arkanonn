import { google } from "googleapis";
import { auth } from "./auth";

const drive = google.drive({
  version: "v3",
  auth
});

export async function obtenerElecciones() {
  const rootId = process.env.GOOGLE_ROOT_FOLDER_ID;

  const respuesta = await drive.files.list({
    q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "nextPageToken, files(id, name)",
    pageSize: 100
  });

  return respuesta.data.files || [];
}

/**
 * 
 * @param {*} nombreCarpeta es el nombre de la carpeta de la cual queremos extraer su Spreedsheet
 * @returns el id del Spreadsheet que buscamos
 */
export async function obtenerSpreadsheet(nombreCarpeta) {
  const rootId = process.env.GOOGLE_ROOT_FOLDER_ID;

  // Buscar la carpeta dentro de root
  const carpetas = await drive.files.list({
    q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "nextPageToken, files(id, name)",
    pageSize: 100
  });

  const carpeta = carpetas.data.files?.find(
    (archivo) => archivo.name === nombreCarpeta
  );

  if (!carpeta) {
    throw new Error("No se encontró la carpeta");
  }

  // Buscar el spreadsheet data dentro de esa carpeta
  const archivos = await drive.files.list({
    q: `'${carpeta.id}' in parents and name = 'data' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 100
  });

  const spreadsheet = archivos.data.files?.[0];

  if (!spreadsheet) {
    throw new Error("No se encontró el spreadsheet data");
  }

  return spreadsheet.id;
}
