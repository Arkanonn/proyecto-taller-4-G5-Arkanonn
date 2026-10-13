
import { obtenerSpreadsheet } from "@/lib/google/drive";

import {
  obtenerDatosPestana,
  convertirFilasAObjetos
} from "@/lib/google/sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Buscar el spreadsheet de la plantilla
    const spreadsheetId = await obtenerSpreadsheet("plantilla");

    // Leer la pestaña General
    const filas = await obtenerDatosPestana(
      spreadsheetId,
      "General"
    );

    // Convertir las filas en objetos
    const datos = convertirFilasAObjetos(filas);

    // Devolver un único objeto
    return Response.json(datos ?? null);

  } catch (error) {
    console.error("Error:", error);

    return Response.json(
      { error: "No se pudo obtener la votación" },
      { status: 500 }
    );
  }
}
