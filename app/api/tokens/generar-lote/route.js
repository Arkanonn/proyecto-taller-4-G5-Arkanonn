import pool from "@/lib/db";
import { generarToken, generarHash } from "@/lib/tokens";
import { obtenerSpreadsheet } from "@/lib/google/drive";
import { obtenerDatosPestana } from "@/lib/google/sheets";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(request) {
    // Temporal: disponible únicamente en desarrollo.
    // En producción debe reemplazarse por autenticación administrativa.
    if (process.env.NODE_ENV !== "development") {
        return Response.json(
            { error: "Operación no disponible" },
            { status: 403 }
        );
    }

    let cliente;

    try {
        const { eleccionId } = await request.json();
        const id = Number(eleccionId);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return Response.json(
                { error: "ID de elección inválido" },
                { status: 400 }
            );
        }

        // Buscar el archivo data de la elección
        const spreadsheetId = await obtenerSpreadsheet(`eleccion-${id}`);

        // si no lo encuentra
        if (!spreadsheetId) {
            return Response.json(
                { error: "No se encontró el archivo de la elección" },
                { status: 404 }
            );
        }

        // lee el General y comprueba el ID
        const general = await obtenerDatosPestana(spreadsheetId, "General");

        const encabezadosGeneral = general[0]?.map(
            valor => String(valor).trim().toLowerCase()
        ) || [];

        const indiceId = encabezadosGeneral.indexOf("id");
        const idEnHoja = general[1]?.[indiceId];

        if (indiceId === -1 || String(idEnHoja).trim() !== String(id)) {
            return Response.json(
                { error: "El ID de General no coincide con la elección" },
                { status: 400 }
            );
        }

        // 3. Obtener correos desde Votantes
        const filas = await obtenerDatosPestana(spreadsheetId, "Votantes");

        const encabezados = filas[0]?.map(
            valor => String(valor).trim().toLowerCase()
        ) || [];

        const indiceCorreo = encabezados.indexOf("correo");

        if (indiceCorreo === -1) {
            return Response.json(
                { error: "No existe la columna correo en Votantes" },
                { status: 400 }
            );
        }
        // obtenemos los correos de la columna de correos
        const correos = filas.slice(1)
            .map(fila => String(fila[indiceCorreo] || "").trim().toLowerCase())
            .filter(correo => correo !== "");

        // si no hay correos o alguno de los correos no es valido
        if (
            correos.length === 0 ||
            correos.some(correo => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) ||
            new Set(correos).size !== correos.length
        ) {
            return Response.json(
                { error: "No hay correos válidos o existen correos duplicados" },
                { status: 400 }
            );
        }

        // registrar tokens en una transacción
        cliente = await pool.connect();
        await cliente.query("BEGIN");
        
        // creamos una lista que guardara los enlaces
        const enlaces = [];
        let omitidos = 0;

        // varible que contiene el nombre de la URL
        const appUrl = (
            process.env.APP_URL || "http://localhost:3000"
        ).replace(/\/$/, "");

        // para cada correo en la lista de correos
        for (const correo of correos) {

            // generara un token y su respectivo hash
            const token = generarToken();
            const hash = generarHash(token);

            // insertara en la tabla el id de la eleccion el correo y el hash
            const resultado = await cliente.query(
                `INSERT INTO TokensVotacion
                 (eleccionId, correo, tokenHash)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (eleccionId, correo) DO NOTHING
                 RETURNING id`,
                [id, correo, hash]
            );

            if (resultado.rowCount === 0) {
                // El estudiante ya tenía un token
                omitidos++;
                continue;
            }

            // la varible URL y le agregara al URL el token
            const enlace = new URL(`/votacion/${id}`, appUrl);
            enlace.searchParams.set("token", token);

            enlaces.push(`${correo}\n${enlace.toString()}\n\n`);
        }

        // Confirmar los registros en PostgreSQL
        await cliente.query("COMMIT");
        cliente.release();
        cliente = null;

        // buscara la carpeta en la que dejaremos los datos
        const carpeta = path.join(process.cwd(), "datos-privados");

        // si no existe la crearemos
        await mkdir(carpeta, { recursive: true });
        
        // variable para la ruta del archivo
        const rutaArchivo = path.join(
            carpeta,
            `tokens-eleccion-${id}.txt`
        );
        // si la lista de enlaces es mayor a 0 los agrega al archivo
        if (enlaces.length > 0) {
            await appendFile(
                rutaArchivo,
                enlaces.join(""),
                "utf8"
            );
        }

        return Response.json({
            mensaje: "Proceso completado",
            generados: enlaces.length,
            existentes: omitidos,
            archivo: `tokens-eleccion-${id}.txt`
        });
    } catch (error) {
        if (cliente) {
            await cliente.query("ROLLBACK").catch(() => {});
            cliente.release();
        }
    
        console.error("Error al generar tokens:", error);
    
        return Response.json(
            { error: error.message || "No se pudieron generar los tokens" },
            { status: 500 }
        );
    }
}