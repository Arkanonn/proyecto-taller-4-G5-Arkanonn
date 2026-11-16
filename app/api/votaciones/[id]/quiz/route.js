
import { NextResponse } from "next/server";

import { obtenerSpreadsheet } from "@/lib/google/drive";

import {
    obtenerDatosPestana,
    convertirFilasAQuiz
} from "@/lib/google/sheets";

export const runtime = "nodejs";

export async function GET(request, { params }) {

    try {

        // Obtenemos el ID de la elección
        const { id } = await params;

        // Identificamos la carpeta correspondiente
        const nombreCarpeta = id === "plantilla"
            ? "plantilla"
            : `eleccion-${id}`;

        // Obtenemos el ID del Spreadsheet
        const spreadsheetId = await obtenerSpreadsheet(nombreCarpeta);

        // Obtenemos las filas de la pestaña Quiz
        const filas = await obtenerDatosPestana(
            spreadsheetId,
            "Quiz"
        );

        // Convertimos las filas a objetos
        const quizCompleto = convertirFilasAQuiz(filas);

        // Eliminamos las respuestas correctas
        const quizPublico = quizCompleto.map(({ opcionCorrecta, ...pregunta }) => pregunta);

        // Enviamos los datos al frontend
        return NextResponse.json(quizPublico);

    } catch (error) {

        console.error("Error al obtener el Quiz:", error);

        return NextResponse.json(
            { error: "No se pudo obtener el Quiz" },
            { status: 500 }
        );

    }

}
