import { NextResponse } from "next/server";

import pool from "@/lib/db";
import { generarHash } from "@/lib/tokens";
import { obtenerSpreadsheet } from "@/lib/google/drive";
import { guardarRespuestasQuiz } from "@/lib/google/sheets";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { token, respuestas } = await request.json();

    if (!token || !Array.isArray(respuestas)) {
      return NextResponse.json(
        { error: "Faltan datos o las respuestas no son válidas" },
        { status: 400 }
      );
    }

    // Generar hash del token
    const tokenHash = generarHash(token);

    // Comprobar que el token pertenece a esta elección
    const validacion = await pool.query(
      `SELECT "tokenhash"
       FROM "tokensvotacion"
       WHERE "tokenhash" = $1
       AND "eleccionid" = $2`,
      [tokenHash, id]
    );

    if (validacion.rowCount === 0) {
      return NextResponse.json(
        { error: "Token no válido para esta elección" },
        { status: 401 }
      );
    }

    // Obtener el spreadsheet de la elección
    const spreadsheetId = await obtenerSpreadsheet(`eleccion-${id}`);

    // Guardar o actualizar las respuestas
    await guardarRespuestasQuiz(
      spreadsheetId,
      tokenHash,
      respuestas
    );

    return NextResponse.json({
      guardado: true
    });

  } catch (error) {
    console.error("Error al guardar respuestas:", error);

    return NextResponse.json(
      { error: "No se pudieron guardar las respuestas" },
      { status: 500 }
    );
  }
}