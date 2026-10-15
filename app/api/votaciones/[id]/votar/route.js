
import { randomUUID } from "node:crypto";
import pool from "@/lib/db";
import { generarHash } from "@/lib/tokens";
import { obtenerSpreadsheet } from "@/lib/google/drive";
import {
    obtenerDatosPestana,
    convertirFilasAObjetos,
    convertirFilasAListas,
    registrarVoto
} from "@/lib/google/sheets";
import { obtenerEstadoVotacion } from "@/lib/votaciones";

export const runtime = "nodejs";

export async function POST(request, { params }) {
    let cliente;
    let votoAgregado = false;

    try {
        const { id } = await params;
        const eleccionId = Number(id);
        const datos = await request.json().catch(() => null);
        const token = datos?.token;
        const listaId = datos?.listaId;

        // 1. Validar los datos recibidos
        if (
            !/^[1-9]\d*$/.test(id) ||
            !Number.isSafeInteger(eleccionId) ||
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/i.test(token) ||
            !["string", "number"].includes(typeof listaId) ||
            String(listaId).trim() === ""
        ) {
            return Response.json(
                { error: "Datos de votación inválidos" },
                { status: 400 }
            );
        }

        // 2. Buscar la elección en Google Drive
        const spreadsheetId = await obtenerSpreadsheet(
            `eleccion-${eleccionId}`
        );

        // 3. Leer la elección y las listas disponibles
        const [filasGeneral, filasInfo] = await Promise.all([
            obtenerDatosPestana(spreadsheetId, "General"),
            obtenerDatosPestana(spreadsheetId, "Info")
        ]);

        const general = convertirFilasAObjetos(filasGeneral)
            .find((eleccion) => Number(eleccion.id) === eleccionId);

        if (!general) {
            return Response.json(
                { error: "Elección no encontrada" },
                { status: 404 }
            );
        }

        // 4. Comprobar que la elección esté activa
        const estado = obtenerEstadoVotacion(
            general.FechaInicio,
            general.FechaTermino
        );

        if (estado !== "activa") {
            return Response.json(
                { error: "La elección no está activa" },
                { status: 409 }
            );
        }

        // 5. Comprobar que la lista seleccionada exista
        const listas = convertirFilasAListas(filasInfo);

        const lista = listas.find(
            (item) => String(item.id).trim() ===
                String(listaId).trim()
        );

        if (!lista) {
            return Response.json(
                { error: "La lista seleccionada no existe" },
                { status: 400 }
            );
        }

        // 6. Iniciar una transacción en Neon
        cliente = await pool.connect();
        await cliente.query("BEGIN");

        // Bloquear el token mientras se procesa el voto
        const resultado = await cliente.query(
            `SELECT id
             FROM TokensVotacion
             WHERE eleccionId = $1
               AND tokenHash = $2
               AND utilizado = FALSE
             FOR UPDATE`,
            [eleccionId, generarHash(token)]
        );

        if (resultado.rowCount !== 1) {
            await cliente.query("ROLLBACK");

            return Response.json(
                { error: "Token inválido o utilizado" },
                { status: 403 }
            );
        }

        // 7. Registrar el voto anónimo en Google Sheets
        const idVoto = randomUUID();
        const fechaHora = new Date().toISOString();

        await registrarVoto(
            spreadsheetId,
            idVoto,
            lista.id,
            fechaHora
        );

        votoAgregado = true;

        // 8. Marcar el token como utilizado en Neon
        const actualizacion = await cliente.query(
            `UPDATE TokensVotacion
             SET utilizado = TRUE
             WHERE id = $1
               AND utilizado = FALSE
             RETURNING id`,
            [resultado.rows[0].id]
        );

        if (actualizacion.rowCount !== 1) {
            throw new Error("No se pudo consumir el token");
        }

        await cliente.query("COMMIT");

        // 9. Responder al cliente
        return Response.json(
            {
                mensaje: "Voto registrado correctamente",
                idVoto
            },
            { status: 201 }
        );

    } catch (error) {
        if (cliente) {
            await cliente.query("ROLLBACK").catch(() => {});
        }

        console.error("Error al registrar voto:", error);

        return Response.json(
            {
                error: votoAgregado
                    ? "Voto agregado a Sheets, pero no confirmado en Neon. Requiere revisión manual."
                    : "No se pudo confirmar el voto. No reintentes sin revisar si quedó registrado."
            },
            { status: 503 }
        );
    } finally {
        cliente?.release();
    }
}
