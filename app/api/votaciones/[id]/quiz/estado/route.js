import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generarHash } from "@/lib/tokens";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    const tokenHash = generarHash(token);

    const resultado = await pool.query(
      `UPDATE "tokensvotacion"
       SET quiz_respondido = TRUE
       WHERE "tokenhash" = $1
       AND "eleccionid" = $2
       RETURNING "tokenhash"`,
      [tokenHash, id]
    );

    if (resultado.rowCount === 0) {
      return NextResponse.json(
        { error: "Token no válido para esta elección" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      actualizado: true,
      quizRespondido: true
    });

  } catch (error) {
    console.error("Error al actualizar estado del quiz:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return Response.json(
                { error: "Token no proporcionado" },
                { status: 400 }
            );
        }

        const tokenHash = generarHash(token);

        // Buscar el estado del quiz correspondiente a la elección
        const resultado = await pool.query(
            `SELECT quiz_respondido
             FROM "tokensvotacion"
             WHERE "tokenhash" = $1
             AND "eleccionid" = $2`,
            [tokenHash, id]
        );

        if (resultado.rows.length === 0) {
            return Response.json(
                { error: "Token o elección inválidos" },
                { status: 401 }
            );
        }

        return Response.json({
            quizRespondido: resultado.rows[0].quiz_respondido
        });

    } catch (error) {
        console.error("ERROR EN API QUIZ:", error);

        return Response.json(
            {
                error: "Error al consultar el estado del quiz",
                detalle: error.message
            },

            { status: 500 }
        );
    }
}
