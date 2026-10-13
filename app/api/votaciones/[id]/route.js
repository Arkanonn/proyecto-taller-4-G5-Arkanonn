import { obtenerEstadoVotacion } from "@/lib/votaciones";
import { obtenerSpreadsheet } from "@/lib/google/drive";

import {
  obtenerDatosPestana,
  convertirFilasAObjetos,
  convertirFilasAListas
} from "@/lib/google/sheets";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Determinar qué carpeta queremos consultar
    const nombreCarpeta =
      id === "plantilla" ? "plantilla" : `eleccion-${id}`;

    // Obtener el spreadsheet de esa elección
    const spreadsheetId = await obtenerSpreadsheet(nombreCarpeta);

    // |==== General ====|
    // Leer la pestaña General
    const filasGeneral = await obtenerDatosPestana(
      spreadsheetId,
      "General"
    );
    // Convertir general a objetos
    const general = convertirFilasAObjetos(filasGeneral)[0];
    

    // |==== Info ====|
    // Leer la pestaña Info
    const filasInfo = await obtenerDatosPestana(
      spreadsheetId,
      "Info"
    ); 
    // Convertir info a Listas
    const listas = convertirFilasAListas(filasInfo)

    // Ver el estado de la votacion
    const estado = obtenerEstadoVotacion(
      general.FechaInicio,
      general.FechaTermino
    );
  

    return Response.json(
      {
        ...general,
        estado,
        listas
      }
    );

  } catch (error) {
    console.error("Error:", error);

    return Response.json(
      { error: "No se pudo obtener la elección" },
      { status: 500 }
    );
  }
}
