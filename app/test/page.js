
"use client";

import { useEffect, useState } from "react";

export default function Votacion() {
  const [id, setId] = useState("1");
  const [votacion, setVotacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarVotacion() {
      setCargando(true);
      setError("");
      setVotacion(null);

      try {
        const respuesta = await fetch(
          `/api/votaciones/${encodeURIComponent(id)}`
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo obtener la elección");
        }

        const datos = await respuesta.json();
        setVotacion(datos);

      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarVotacion();
  }, [id]);

  return (
    <div>
      <h1>Página de votación</h1>

      <label htmlFor="eleccion">Seleccionar elección:</label>

      <select
        id="eleccion"
        value={id}
        onChange={(e) => setId(e.target.value)}
      >
        <option value="plantilla">Plantilla</option>
        <option value="1">Elección 1</option>
        <option value="2">Elección 2</option>
      </select>

      {cargando && <p>Cargando votación...</p>}

      {error && <p>{error}</p>}

      {!cargando && votacion && (
        <div>
          <h2>{votacion.nombre}</h2>
          <p>ID: {votacion.id}</p>
          <p>Tipo: {votacion.tipo}</p>
        </div>
      )}
    </div>
  );
}
