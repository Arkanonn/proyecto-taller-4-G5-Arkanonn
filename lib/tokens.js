import { randomBytes, createHash } from "node:crypto";
import pool from "@/lib/db";


export function generarToken() {
    return randomBytes(32).toString("hex");
}

export function generarHash(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

export async function verificarToken(eleccionId, token) {
    if (
        !Number.isSafeInteger(eleccionId) ||
        eleccionId <= 0 ||
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/i.test(token)
    ) {
        return false;
    }

    const hash = generarHash(token);

    const resultado = await pool.query(
        `SELECT id
         FROM TokensVotacion
         WHERE eleccionId = $1
           AND tokenHash = $2
           AND utilizado = FALSE`,
        [eleccionId, hash]
    );

    return resultado.rows.length > 0;
}



export async function consumirToken(eleccionId, token, db = pool) {
    if (
        !Number.isSafeInteger(eleccionId) ||
        eleccionId <= 0 ||
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/i.test(token)
    ) {
        return false;
    }

    const hash = generarHash(token);

    const resultado = await db.query(
        `UPDATE TokensVotacion
         SET utilizado = TRUE
         WHERE eleccionId = $1
           AND tokenHash = $2
           AND utilizado = FALSE
         RETURNING id`,
        [eleccionId, hash]
    );

    return resultado.rowCount === 1;
}
