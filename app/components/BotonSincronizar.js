"use client";

import { useState } from "react";

/**
 * Esta función buscara sincronizar la lista de correos de la elección del spreadsheet con la de la base de datos
 * @param {*} eleccionId variable que contiene el id de la elección que queremos actualizar
 * @returns 
 */
export default function BotonSincronizar({ eleccionId }) {
    
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    async function sincronizar() {
        setCargando(true);
        setMensaje("");

        try {
            const respuesta = await fetch("/api/tokens/generar-lote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eleccionId: eleccionId
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.error || "Error al sincronizar");
            }

            setMensaje(
                `Sincronización completada. Nuevos: ${datos.generados}, existentes: ${datos.existentes}`
            );

        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div>
            <button onClick={sincronizar} disabled={cargando}>
                {cargando ? "Sincronizando..." : "Sincronizar votantes"}
            </button>

            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}
