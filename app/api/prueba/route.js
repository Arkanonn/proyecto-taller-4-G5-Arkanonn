import pool from "@/lib/db";
import { generarToken, generarHash } from "@/lib/tokens";

export async function POST() {
    try {
        const eleccionId = 1;
        const correo = "prueba@universidad.cl";

        const token = generarToken();
        const hash = generarHash(token);

        const resultado = await pool.query(
            `INSERT INTO TokensVotacion (eleccionId, correo, tokenHash)
             VALUES ($1, $2, $3)
             ON CONFLICT (eleccionId, correo)
             DO UPDATE SET
                tokenHash = EXCLUDED.tokenHash,
                utilizado = FALSE
             RETURNING id, eleccionId, correo, utilizado`,
            [eleccionId, correo, hash]
        );

        return Response.json({
            mensaje: "Token de prueba generado correctamente",
            registro: resultado.rows[0],
            token,
            enlace: `http://localhost:3000/votacion/${eleccionId}?token=${token}`
        });

    } catch (error) {
        console.error("Error al generar token:", error);

        return Response.json(
            { error: "No se pudo generar el token" },
            { status: 500 }
        );
    }
}